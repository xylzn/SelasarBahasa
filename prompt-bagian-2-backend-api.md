# PROMPT BAGIAN 2/4 — Backend API, Auth, Middleware, Caching

> **Cara pakai:** Paste isi di dalam code block ke Trae SETELAH bagian 1 selesai dikerjakan dan kamu sudah verifikasi tabel & seed data sukses. Trae sudah punya konteks project dari sesi sebelumnya (struktur folder, schema Prisma sudah ada).

```
Lanjutkan project "Selasar Bahasa" yang sudah kamu mulai di sesi sebelumnya (Next.js + TypeScript + Prisma + Supabase + Upstash Redis sudah terkoneksi, schema database sudah di-migrate, seed data sudah ada). SESI 2 dari 4 ini fokus membangun: autentikasi, middleware proteksi route, helper caching, dan SEMUA API routes. Jangan bangun halaman/komponen frontend dulu — itu di sesi 3 dan 4.

=====================================================================
1. AUTENTIKASI (NextAuth.js)
=====================================================================

Buat `src/lib/auth.ts`:
- Konfigurasi NextAuth dengan CredentialsProvider (email + password).
- Saat authorize: cari User by email di Prisma, bandingkan password dengan `bcrypt.compare` terhadap `passwordHash`.
- Session strategy: JWT, simpan `id`, `role`, `nama` di token dan di session.
- `pages: { signIn: '/login' }` untuk redirect custom.

Buat `src/app/api/auth/[...nextauth]/route.ts` yang mengexport handler GET dan POST dari konfigurasi auth.ts.

Buat `src/middleware.ts`:
- Cek token/session NextAuth di edge sebelum request masuk ke route yang diawali `/dashboard` atau `/admin`.
- Kalau belum login dan akses `/dashboard/*` atau `/admin/*` → redirect ke `/login`.
- Kalau sudah login tapi role bukan ADMIN dan akses `/admin/*` → redirect ke `/dashboard`.
- Route group `(public)` (landing page `/`, `/artikel/*`, `/login`, `/register`) TIDAK terkena middleware ini sama sekali — harus selalu bisa diakses tanpa login.
- Gunakan `config.matcher` untuk membatasi middleware hanya jalan di path yang relevan, supaya tidak ada overhead di setiap request halaman publik/statis.

Buat helper `src/lib/validations/auth.ts` dengan Zod schema:
- `registerSchema`: nama (min 3 char), email (format email valid), password (min 8 char, harus ada huruf besar, angka, dan simbol — sama seperti project lama tapi dipakai shared client+server).
- `loginSchema`: email + password (required saja, tidak perlu validasi strength ulang).

=====================================================================
2. RATE LIMITING HELPER
=====================================================================

Buat `src/lib/rate-limit.ts`:
- Fungsi `checkRateLimit(key: string, limit: number, windowSeconds: number)` yang pakai Upstash Redis (`INCR` key, set TTL kalau baru, bandingkan ke limit).
- Return `{ allowed: boolean, remaining: number }`.
- Key rate limit dibuat dari kombinasi IP address request + nama endpoint (misal `ratelimit:login:${ip}`).
- Ambil IP dari header `x-forwarded-for` (fallback ke 'unknown' kalau tidak ada, untuk dev lokal).

=====================================================================
3. CACHING HELPER
=====================================================================

Buat `src/lib/cache-keys.ts` — konstanta key cache supaya konsisten dipakai di semua API route:
```ts
export const CACHE_KEYS = {
  materiList: (page: number) => `materi:list:page:${page}`,
  materiDetail: (slug: string) => `materi:detail:${slug}`,
  quizList: (page: number) => `quiz:list:page:${page}`,
  quizDetail: (id: string) => `quiz:detail:${id}`,
  packageList: () => `package:list`,
  adminStats: () => `admin:stats`,
};
```

Buat `src/lib/cache.ts` dengan helper generic cache-aside:
```ts
export async function getCached<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
  // cek redis dulu, kalau ada return parsed JSON
  // kalau tidak ada, jalankan fetchFn(), simpan ke redis dengan TTL, lalu return
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  // hapus semua key yang diberikan dari redis
}
```

=====================================================================
4. API ROUTES — IMPLEMENTASIKAN SEMUA INI
=====================================================================

### `/api/auth/register` (POST, public)
- Validasi body dengan `registerSchema`.
- Cek email belum terdaftar (return 409 kalau sudah ada).
- Hash password dengan bcrypt cost factor 12.
- Buat User baru dengan role default USER.
- Return user (TANPA passwordHash) — pakai `select` eksplisit.

### `/api/materi` (GET, auth required)
- Cursor-based pagination (query param `cursor`, `limit` default 20).
- Filter: kalau `req.user.role` bukan ADMIN dan bukan PREMIUM, hanya tampilkan `isPremium: false`.
- Hanya tampilkan `published: true`.
- WAJIB pakai cache-aside Redis (`CACHE_KEYS.materiList`, TTL 600 detik / 10 menit), tapi cache key harus beda untuk varian free vs premium (tambahkan suffix role ke cache key).
- `select` eksplisit: id, judul, slug, tipe, isPremium, urutan — JANGAN select kontenTeks penuh di list.
- `orderBy: { urutan: 'asc' }`.

### `/api/materi/[slug]` (GET, auth required)
- Ambil 1 materi by slug, published true.
- Kalau `isPremium: true` dan user bukan ADMIN/PREMIUM → return 403 dengan pesan jelas (frontend nanti akan render locked-state berdasarkan ini).
- Cache-aside per-slug, TTL 1800 detik (30 menit).

### `/api/materi` (POST, PUT, DELETE — admin only)
- POST: buat materi baru, validasi Zod (judul, slug auto-generate dari judul kalau tidak diisi manual, tipe, kontenTeks/videoUrl sesuai tipe, isPremium, urutan).
- Kalau tipe VIDEO/CAMPURAN, parse `videoUrl` untuk deteksi provider (regex `youtube.com|youtu.be` → YOUTUBE, `vimeo.com` → VIMEO), simpan ke field `videoProvider`.
- PUT `/api/materi/[id]`: update, validasi sama.
- DELETE `/api/materi/[id]`: hapus.
- SETIAP operasi tulis (POST/PUT/DELETE) WAJIB invalidate cache terkait (`materi:list:*` semua page & varian role, dan `materi:detail:${slug}` kalau update/delete spesifik) SEBELUM response dikirim.

### `/api/quiz` (GET, auth required)
- Sama pola pagination & filter premium seperti materi.
- **PENTING — KEAMANAN**: response TIDAK BOLEH menyertakan field `isCorrect` di QuizOption manapun. Pakai `select` nested yang eksplisit mengecualikan field itu:
```ts
select: {
  id: true, judul: true, deskripsi: true, isPremium: true,
  questions: {
    select: {
      id: true, pertanyaan: true, urutan: true,
      options: { select: { id: true, teks: true } } // TIDAK ada isCorrect di sini
    }
  }
}
```
- Cache-aside Redis, TTL 1800 detik.

### `/api/quiz/[id]` (GET, auth required)
- Sama, satu quiz detail lengkap dengan soal+opsi TANPA isCorrect.

### `/api/quiz` (POST — admin only)
- Buat quiz baru dengan nested create questions+options (options termasuk isCorrect karena ini sisi admin).
- Validasi: setiap question harus punya minimal 2 options dan TEPAT SATU yang isCorrect true (validasi ini wajib, reject request kalau tidak terpenuhi).
- Invalidate cache quiz list.

### `/api/quiz/[id]/submit` (POST, auth required, RATE LIMITED)
- Rate limit: max 10 request/menit per user (pakai `checkRateLimit` dengan key `ratelimit:quiz-submit:${userId}`).
- Body: `{ jawaban: { [questionId]: optionId } }`.
- Ambil quiz LENGKAP dari database (termasuk isCorrect, ini di server jadi aman) — JANGAN percaya skor dari client manapun.
- Hitung score: untuk setiap question, cek apakah optionId yang dipilih user match dengan option yang isCorrect true. score = (jumlah benar / total questions) * 100, dibulatkan.
- Simpan `QuizAttempt` dengan `jawaban` sebagai snapshot JSON dari body request.
- Return: `{ score, breakdown: [{ questionId, pertanyaan, jawabanUser, isCorrect, jawabanBenar }] }` supaya frontend bisa render review jawaban benar/salah.

### `/api/artikel` (GET, public, NO AUTH)
- List artikel published, paginated, filter optional by `kategori`.
- Select eksplisit, exclude `konten` penuh di list (cuma judul, slug, ringkasan, thumbnailUrl, kategori, publishedAt).
- Ini endpoint fallback/untuk kebutuhan client-side fetch kalau dibutuhkan — rendering utama Article nanti pakai Server Component langsung query Prisma (di sesi 3), bukan fetch ke endpoint ini.

### `/api/artikel` (POST, PUT, DELETE — admin only)
- CRUD lengkap, validasi Zod termasuk field SEO (metaTitle, metaDescription max 160 char, ogImageUrl).
- Auto-generate slug dari judul kalau tidak diisi (slugify + cek uniqueness, kalau sudah ada tambahkan suffix angka).
- Saat `published` diubah jadi true dan `publishedAt` masih null, set `publishedAt` ke waktu sekarang otomatis.

### `/api/contact` (POST, public, RATE LIMITED)
- Rate limit: max 5 request/menit per IP (key `ratelimit:contact:${ip}`).
- Validasi Zod (nama, email, pesan).
- Simpan ke `ContactMessage`.

### `/api/contact` (GET, DELETE, PATCH — admin only)
- GET: list pesan, paginated.
- PATCH `/api/contact/[id]`: toggle `isRead`.
- DELETE `/api/contact/[id]`: hapus.

### `/api/admin/users` (GET, POST, PUT, DELETE — admin only)
- GET: list user dengan pagination & search by nama/email, select TANPA passwordHash.
- POST: buat user baru (admin bisa langsung set role apapun), hash password.
- PUT `/api/admin/users/[id]`: update nama/email/role (TIDAK update password lewat endpoint ini).
- DELETE: hapus user.

### `/api/admin/packages` (GET, POST, PUT, DELETE — admin only untuk write, GET public)
- CRUD Package, invalidate cache `CACHE_KEYS.packageList()` setiap write.

### `/api/admin/stats` (GET — admin only)
- Hitung total: User, Materi, Quiz, Article, ContactMessage yang belum dibaca.
- WAJIB cache-aside, TTL 120 detik (2 menit) — endpoint ini agregat berat kalau query langsung tiap request.

=====================================================================
5. MIDDLEWARE AUTH UNTUK API ROUTES
=====================================================================

Buat helper `src/lib/api-auth.ts`:
- Fungsi `getAuthSession()` untuk ambil session NextAuth di server (Route Handler).
- Fungsi `requireAuth()` yang throw/return 401 response kalau tidak ada session.
- Fungsi `requireAdmin()` yang throw/return 403 response kalau session ada tapi role bukan ADMIN.
- Pakai helper ini di SETIAP API route yang butuh proteksi, supaya tidak duplikasi logic cek auth di setiap file.

Setelah semua API routes di atas selesai dibuat dan tidak ada error TypeScript, test dengan `curl` atau cara apapun yang kamu anggap perlu untuk memastikan minimal endpoint `/api/materi`, `/api/quiz`, `/api/artikel` bisa diakses dan endpoint quiz benar-benar TIDAK mengembalikan field isCorrect. Laporkan hasil testing dan ringkasan API yang sudah jadi. JANGAN lanjut membangun halaman frontend — itu di sesi 3.
```

# PROMPT BAGIAN 4/4 — Admin Panel, Deployment, Dokumentasi

> **Cara pakai:** Paste isi di dalam code block ke Trae SETELAH bagian 3 (frontend publik & dashboard user) selesai dan sudah ditest. Ini sesi terakhir — setelah ini project sudah lengkap end-to-end.

```
Lanjutkan project "Selasar Bahasa" (Next.js + TypeScript + Prisma + NextAuth + Upstash Redis, schema database, semua API routes, landing page, modul Article, dan dashboard user sudah jadi di sesi-sesi sebelumnya). SESI 4 dari 4 ini adalah sesi TERAKHIR — fokus membangun admin panel lengkap, finalisasi rate limiting, lalu dokumentasi & persiapan deployment.

ATURAN YANG SAMA TETAP BERLAKU: Server Components default, Client Component hanya untuk bagian interaktif (form, table dengan search/sort), `react-hook-form` + Zod untuk semua form, desain UI bersih dan konsisten dengan halaman yang sudah dibuat di sesi 3 (reuse warna/font/style yang sama, JANGAN buat desain admin yang berbeda gaya dari sisi user).

=====================================================================
1. KOMPONEN ADMIN REUSABLE
=====================================================================

### `components/admin/DataTable.tsx`
Komponen generic (terima props: columns, data, onEdit, onDelete, searchable, pagination info) dipakai di SEMUA halaman admin supaya tidak menulis ulang logic tabel:
- Search input dengan debounce 300ms sebelum trigger query/filter.
- Pagination (Previous/Next atau numbered, sesuaikan dengan cursor pagination dari API).
- Sort kolom (opsional kalau memungkinkan, minimal sort by createdAt).
- Setiap baris ada tombol Edit (buka modal/dialog form) dan Delete (dengan confirm dialog dari shadcn/ui, BUKAN `window.confirm` browser native).
- Loading skeleton saat data masih fetch, empty state yang jelas kalau data kosong.

### `components/admin/forms/` — buat form components terpisah per entity:
- `ArticleForm.tsx`, `MateriForm.tsx`, `QuizForm.tsx`, `PackageForm.tsx`, `UserForm.tsx`
- Semua pakai `react-hook-form` + `zodResolver`, dipakai di dalam Dialog/Modal shadcn untuk mode create DAN edit (terima prop `defaultValues` optional untuk mode edit).
- Submit button menunjukkan loading spinner saat pending, disabled untuk cegah double-submit.

=====================================================================
2. HALAMAN ADMIN — BANGUN SEMUA INI
=====================================================================

### `(admin)/layout.tsx`
- Server Component, cek session DAN role ADMIN (defensive check, walau middleware sudah handle).
- Sidebar admin: Dashboard, Artikel, Materi, Quiz, Packages, Pesan Masuk, Users, Logout.
- Tampilkan badge jumlah pesan kontak belum dibaca di sidebar (kecil, merah) kalau ada.

### `admin/page.tsx` (Dashboard Stats)
- Server Component, fetch dari `/api/admin/stats` (yang sudah cache-aside 2 menit dari sesi 2) atau panggil langsung fungsi query yang dipakai endpoint itu.
- Tampilkan card angka besar: Total User, Total Materi, Total Quiz, Total Artikel, Pesan Belum Dibaca — grid responsive.

### `admin/artikel/page.tsx`
- DataTable: kolom judul, kategori, status (Published/Draft badge), tanggal publish, aksi.
- Tombol "Tambah Artikel" buka `ArticleForm` dalam Dialog.
- `ArticleForm` fields: judul, slug (auto-generate dari judul tapi bisa override manual, tampilkan preview slug live), ringkasan (textarea, character counter ke 300), konten (textarea besar atau rich text editor sederhana kalau memungkinkan — minimal textarea dengan dukungan markdown dan tombol preview), thumbnailUrl, kategori (select atau input bebas), toggle published.
- **Bagian SEO** dalam form (bisa collapsible/accordion terpisah): metaTitle (dengan counter karakter, ideal ≤60), metaDescription (textarea, counter ≤160), ogImageUrl. Tampilkan preview kecil "begini tampilan di Google Search" dan "begini tampilan saat di-share" memakai nilai-nilai ini.

### `admin/materi/page.tsx`
- DataTable: kolom judul, tipe (badge), premium (Ya/Tidak), urutan, aksi.
- `MateriForm` fields: judul, slug (auto-generate + override), tipe (select Teks/Video/Campuran yang MENGUBAH field lain secara dinamis — kalau Teks sembunyikan field video, kalau Video sembunyikan kontenTeks, kalau Campuran tampilkan keduanya), kontenTeks (textarea/markdown), videoUrl (input dengan validasi format YouTube/Vimeo dan preview thumbnail kecil setelah URL valid dimasukkan), toggle isPremium, urutan (number input).

### `admin/quiz/page.tsx`
- DataTable: kolom judul, jumlah soal, premium, aksi.
- `QuizForm` — INI FORM BUILDER DINAMIS, bukan textarea JSON:
  - Field judul, deskripsi, toggle isPremium di atas.
  - Section "Pertanyaan" dengan tombol "+ Tambah Pertanyaan" yang menambah blok baru.
  - Setiap blok pertanyaan: textarea pertanyaan, lalu list opsi jawaban dengan tombol "+ Tambah Opsi" (minimal 2 opsi), setiap opsi punya: input teks jawaban + radio button untuk menandai SATU opsi yang benar (radio group per-pertanyaan, jadi cuma 1 opsi benar per soal) + tombol hapus opsi (disable kalau cuma sisa 2 opsi).
  - Tombol hapus untuk seluruh blok pertanyaan.
  - Validasi sebelum submit: setiap pertanyaan harus punya minimal 2 opsi dan tepat 1 yang ditandai benar — tampilkan error jelas kalau tidak terpenuhi, JANGAN biarkan submit kalau invalid.

### `admin/packages/page.tsx`
- DataTable: kolom nama, harga (format Rupiah), badge Populer, urutan, aksi.
- `PackageForm` fields: nama, deskripsi, harga (number, auto-format display Rupiah), fiturList (UI tambah/hapus baris fitur dinamis, disimpan sebagai array string ke field Json), toggle isPopuler, urutan.

### `admin/messages/page.tsx`
- DataTable read-mostly: kolom nama, email, pesan (truncate, klik untuk expand/lihat penuh di dialog), status (Sudah/Belum dibaca, klik untuk toggle), tanggal, tombol hapus.

### `admin/users/page.tsx`
- DataTable: kolom nama, email, role (badge warna beda per role), tanggal daftar, aksi.
- `UserForm`: mode create ada field password, mode edit field password disembunyikan (tidak bisa ubah password lewat sini, sesuai desain API sesi 2). Role pakai select (USER/PREMIUM/ADMIN).
- Tombol delete dengan confirm dialog yang jelas (peringatan kalau user punya quiz attempts, data terkait akan ikut terhapus karena cascade).

=====================================================================
3. FINALISASI RATE LIMITING
=====================================================================

Pastikan rate limiting (`checkRateLimit` dari sesi 2) sudah benar-benar dipasang dan ditest di:
- `/api/auth/register` dan endpoint login NextAuth (kalau NextAuth credentials provider sulit di-rate-limit langsung, tambahkan rate limit check di level `authorize()` callback dalam `lib/auth.ts`).
- `/api/quiz/[id]/submit`.
- `/api/contact`.
Test manual: kirim request berkali-kali cepat ke salah satu endpoint ini, pastikan setelah limit terlampaui dapat response 429 dengan pesan jelas (bukan 500 error mentah).

=====================================================================
4. FILE ENV & DOKUMENTASI
=====================================================================

Buat `.env.example` lengkap dengan SEMUA variabel yang dipakai project ini, masing-masing dengan komentar penjelasan:
```env
# Database (Supabase) — pooled untuk aplikasi, direct untuk migration
DATABASE_URL=""
DIRECT_URL=""

# Redis (Upstash) — caching & rate limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

Tulis ulang `README.md` project dengan struktur:
- Deskripsi singkat project (platform belajar bahasa: landing+article untuk marketing, dashboard materi+video+quiz untuk peserta, admin panel).
- Struktur folder (ringkas, poin-poin saja).
- Cara setup lokal: clone, `npm install`, isi `.env` dari `.env.example`, `npx prisma migrate dev`, `npx prisma db seed` (atau command seed yang sudah dibuat), `npm run dev`.
- Daftar API routes (ringkas, method + path + auth requirement + deskripsi singkat, mirip format dokumentasi API biasa).
- Penjelasan singkat strategi caching yang dipakai (Redis cache-aside untuk Materi/Quiz/Package/Stats, ISR untuk landing+Article) — supaya siapapun yang baca README paham kenapa ada dua pendekatan beda.
- Catatan deployment: rekomendasi Vercel untuk hosting, environment variables yang harus diisi di Vercel dashboard, catatan bahwa build command default Next.js sudah cukup tanpa konfigurasi tambahan.

=====================================================================
5. CEK AKHIR SEBELUM SELESAI
=====================================================================

Jalankan checklist berikut dan laporkan hasilnya satu-satu:
1. `npm run build` berhasil tanpa error TypeScript atau error build lainnya.
2. Login sebagai admin (pakai akun dari seed sesi 1) bisa akses semua halaman `/admin/*`.
3. Login sebagai user biasa TIDAK bisa akses `/admin/*` (harus redirect).
4. Buat 1 artikel baru lewat admin panel, published, lalu cek artikel itu muncul di `/artikel` dan punya meta tags benar (cek lewat View Page Source atau dev tools, cari `<meta property="og:title">` dst).
5. Buat 1 quiz baru lewat admin panel dengan minimal 2 pertanyaan, lalu coba kerjakan dari sisi dashboard user, submit, dan pastikan skor yang muncul sesuai dengan jawaban yang benar-benar dipilih.
6. Cek Network tab browser saat membuka halaman quiz (sebelum submit) — pastikan response API benar-benar TIDAK mengandung field `isCorrect` di manapun.
7. Cek `/sitemap.xml` dan `/robots.txt` bisa diakses dan isinya sesuai (artikel published muncul, draft tidak muncul).

Setelah checklist ini semua lolos, project dianggap selesai untuk versi awal. Laporkan ke saya ringkasan akhir: fitur apa yang sudah 100% jalan, dan kalau ada yang masih perlu diperbaiki/belum sempurna, sebutkan dengan jelas supaya saya tahu apa yang perlu ditindaklanjuti.
```

# PROMPT BAGIAN 1/4 — Setup Project, Stack, Struktur Folder, Schema Database

> **Cara pakai:** Paste isi di dalam code block (mulai dari "Kamu adalah..." sampai akhir) ke Trae. Ini bagian 1 dari 4 — tunggu AI selesai mengerjakan bagian ini dulu sebelum lanjut paste bagian 2. Setiap bagian dipotong supaya di bawah limit 20.000 karakter.

```
Kamu adalah seorang senior full-stack engineer. Tugasmu adalah membangun dari NOL sebuah platform belajar online (semi-LMS) bernama "Selasar Bahasa". Project ini akan dibangun bertahap dalam 4 sesi instruksi — ini adalah SESI 1 dari 4, fokus ke setup project, stack, struktur folder, dan schema database saja. Sesi berikutnya akan membangun backend API, frontend, dan admin panel di atas fondasi yang kamu buat di sesi ini.

GAMBARAN BESAR PROJECT (supaya kamu paham konteks walau baru membangun fondasinya):
Platform ini terdiri dari DUA LAYER:
- LAYER A (publik, tanpa login): Landing page (Hero, About, Packages/paket harga, Contact), dan Article (blog untuk SEO & marketing).
- LAYER B (wajib login, semi-LMS): Materi (teks/video pembelajaran), Quiz (dengan skor otomatis).
Plus admin panel untuk kelola semua konten. Tidak ada payment gateway — Packages cuma informasi, CTA-nya ke WhatsApp/Contact. Prioritas mutlak: kecepatan, skalabilitas untuk banyak user, SEO kuat di Layer A, UI bersih, UX minim friksi.

PERBEDAAN PENTING Article (Layer A) vs Materi (Layer B): Article itu publik, dioptimasi SEO, untuk menarik calon peserta baru. Materi itu terkunci di balik login (sebagian premium), untuk peserta terdaftar. Keduanya punya model data, route, dan tujuan render berbeda — Article harus SSG/ISR demi SEO, Materi boleh fully dynamic/auth-gated.

TUGAS SESI INI (lakukan SEMUA langkah berikut, berurutan):

=====================================================================
1. STACK TEKNOLOGI (WAJIB DIIKUTI)
=====================================================================

- Framework: Next.js 14+ (App Router) — satu codebase untuk frontend (React Server Components) DAN backend (Route Handlers/API).
- Bahasa: TypeScript di seluruh project, tanpa kecuali.
- Database: PostgreSQL, sudah disediakan via Supabase (kredensial sudah ada di .env, JANGAN buat ulang).
- ORM: Prisma — generate client strongly-typed, pakai `select` (bukan default semua kolom) di setiap query.
- Styling: Tailwind CSS + shadcn/ui untuk komponen dasar (button, dialog/modal, tabs, form).
- State management client: TanStack Query (React Query) untuk semua data-fetching di client.
- Autentikasi: NextAuth.js (Auth.js) strategi JWT + httpOnly cookie, credentials provider (email/password).
- Validasi: Zod — schema yang sama dipakai di client dan server.
- Caching layer: Redis via Upstash (kredensial sudah ada di .env, JANGAN buat ulang), gunakan REST client (@upstash/redis), BUKAN ioredis/node-redis biasa karena Upstash diakses lewat REST API.
- Hosting: Vercel (untuk nanti, tidak perlu disetup di sesi ini).

JANGAN gunakan: Express terpisah dari Next.js, multiple HTML statis per halaman, vanilla JS DOM manipulation, atau MySQL.

PENTING soal koneksi database: project ini pakai Supabase dengan DUA connection string terpisah di .env — `DATABASE_URL` (pooled, port 6543, untuk query aplikasi sehari-hari) dan `DIRECT_URL` (direct, port 5432, khusus untuk migration). Schema Prisma datasource HARUS memakai keduanya:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

=====================================================================
2. STRUKTUR FOLDER (WAJIB DIBUAT SEPERTI INI)
=====================================================================

```
selasar-bahasa/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      # seed admin + contoh materi/quiz/article/package
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx           # navbar + footer publik
│   │   │   ├── page.tsx             # landing page: Hero, About, Packages preview, Contact
│   │   │   ├── artikel/
│   │   │   │   ├── page.tsx         # list article (SSG/ISR, paginated)
│   │   │   │   └── [slug]/page.tsx  # detail article (SSG/ISR, generateMetadata utk SEO)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/             # route group, perlu auth
│   │   │   ├── layout.tsx           # sidebar + cek sesi sekali di server
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── materi/
│   │   │   │   ├── page.tsx         # list materi (server component, paginated)
│   │   │   │   └── [slug]/page.tsx  # detail materi (teks/video)
│   │   │   └── quiz/
│   │   │       ├── page.tsx         # list quiz
│   │   │       └── [id]/page.tsx    # ambil quiz (client component utk interaktif)
│   │   ├── (admin)/
│   │   │   ├── layout.tsx           # cek role admin di server, redirect kalau bukan
│   │   │   ├── admin/page.tsx       # stats dashboard
│   │   │   ├── admin/artikel/page.tsx
│   │   │   ├── admin/materi/page.tsx
│   │   │   ├── admin/quiz/page.tsx
│   │   │   ├── admin/packages/page.tsx
│   │   │   ├── admin/messages/page.tsx
│   │   │   └── admin/users/page.tsx
│   │   ├── sitemap.ts               # auto-generate sitemap.xml dari Article + halaman statis
│   │   ├── robots.ts                # auto-generate robots.txt
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── artikel/route.ts
│   │       ├── materi/route.ts
│   │       ├── materi/[slug]/route.ts
│   │       ├── quiz/route.ts
│   │       ├── quiz/[id]/route.ts
│   │       ├── quiz/[id]/submit/route.ts
│   │       ├── contact/route.ts
│   │       └── admin/stats/route.ts
│   ├── components/
│   │   ├── ui/                      # shadcn components
│   │   ├── public/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── ArticleCard.tsx
│   │   ├── materi/
│   │   │   ├── MateriCard.tsx
│   │   │   ├── MateriContent.tsx
│   │   │   └── VideoEmbed.tsx
│   │   ├── quiz/
│   │   │   ├── QuizRunner.tsx
│   │   │   └── QuizResult.tsx
│   │   └── admin/
│   │       ├── DataTable.tsx
│   │       └── forms/
│   ├── lib/
│   │   ├── prisma.ts                # singleton PrismaClient
│   │   ├── redis.ts                 # singleton Upstash Redis client
│   │   ├── auth.ts                  # config NextAuth
│   │   ├── seo.ts                   # helper generateMetadata, JSON-LD
│   │   ├── validations/             # Zod schemas
│   │   └── cache-keys.ts            # konstanta key cache
│   ├── hooks/
│   └── types/
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

Catatan: file API routes di atas akan diisi lengkap di sesi 2, tapi buat dulu file kosong/placeholder-nya sekarang sesuai struktur ini supaya foldernya sudah benar.

=====================================================================
3. SKEMA DATABASE (Prisma) — BUAT PERSIS SEPERTI INI
=====================================================================

```prisma
model User {
  id            String      @id @default(cuid())
  nama          String
  email         String      @unique
  passwordHash  String
  role          Role        @default(USER)
  createdAt     DateTime    @default(now())
  quizAttempts  QuizAttempt[]

  @@index([role])
}

enum Role {
  USER
  PREMIUM
  ADMIN
}

// ===== LAYER A: KONTEN PUBLIK (SEO & MARKETING) =====

model Article {
  id              String    @id @default(cuid())
  judul           String
  slug            String    @unique
  ringkasan       String    @db.VarChar(300)
  konten          String    @db.Text
  thumbnailUrl    String?
  metaTitle       String?
  metaDescription String?   @db.VarChar(160)
  ogImageUrl      String?
  kategori        String?
  published       Boolean   @default(false)
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([published, publishedAt])
  @@index([kategori])
}

model Package {
  id          String    @id @default(cuid())
  nama        String
  deskripsi   String    @db.Text
  harga       Int
  fiturList   Json
  isPopuler   Boolean   @default(false)
  urutan      Int       @default(0)
  published   Boolean   @default(true)
  createdAt   DateTime  @default(now())

  @@index([published, urutan])
}

model ContactMessage {
  id        String    @id @default(cuid())
  nama      String
  email     String
  pesan     String    @db.Text
  isRead    Boolean   @default(false)
  createdAt DateTime  @default(now())

  @@index([isRead])
}

// ===== LAYER B: KONTEN BELAJAR (SEMI-LMS, AUTH-GATED) =====

model Materi {
  id            String       @id @default(cuid())
  judul         String
  slug          String       @unique
  tipe          MateriTipe   @default(TEKS)
  kontenTeks    String?      @db.Text
  videoUrl      String?
  videoProvider VideoProvider?
  isPremium     Boolean      @default(false)
  urutan        Int          @default(0)
  published     Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([isPremium, published])
  @@index([urutan])
}

enum MateriTipe {
  TEKS
  VIDEO
  CAMPURAN
}

enum VideoProvider {
  YOUTUBE
  VIMEO
}

model Quiz {
  id          String        @id @default(cuid())
  judul       String
  deskripsi   String        @db.Text
  isPremium   Boolean       @default(false)
  published   Boolean       @default(true)
  createdAt   DateTime      @default(now())
  questions   QuizQuestion[]
  attempts    QuizAttempt[]

  @@index([isPremium, published])
}

model QuizQuestion {
  id          String        @id @default(cuid())
  quizId      String
  pertanyaan  String        @db.Text
  urutan      Int           @default(0)
  quiz        Quiz          @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options     QuizOption[]

  @@index([quizId])
}

model QuizOption {
  id          String        @id @default(cuid())
  questionId  String
  teks        String        @db.Text
  isCorrect   Boolean       @default(false)
  question    QuizQuestion  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
}

model QuizAttempt {
  id          String        @id @default(cuid())
  userId      String
  quizId      String
  score       Int
  jawaban     Json
  completedAt DateTime      @default(now())
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  quiz        Quiz          @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@index([userId, quizId])
  @@index([quizId])
}
```

Catatan penting yang HARUS diimplementasikan (relevan untuk sesi-sesi berikutnya, tapi catat sekarang):
- Field `isCorrect` pada `QuizOption` TIDAK PERNAH dikirim ke client sebelum attempt selesai.
- Validasi skor HARUS dihitung di server, bukan dipercaya dari client.
- `QuizAttempt` TIDAK unique per user+quiz (boleh attempt berkali-kali), tampilkan skor terbaik di UI nanti.

=====================================================================
4. LANGKAH EKSEKUSI SESI INI (lakukan persis urutan ini)
=====================================================================

1. Inisialisasi project Next.js 14+ dengan TypeScript, Tailwind, App Router, src directory (`npx create-next-app@latest`).
2. Install dependencies: prisma, @prisma/client, next-auth, zod, @upstash/redis, @tanstack/react-query, bcryptjs, react-hook-form, @hookform/resolvers.
3. Setup shadcn/ui (`npx shadcn@latest init`), tambahkan komponen dasar: button, dialog, tabs, form, input, textarea, table, badge, card, dropdown-menu.
4. Buat struktur folder sesuai bagian 2 di atas (file-file route boleh placeholder kosong dulu untuk yang belum diisi).
5. Buat `prisma/schema.prisma` sesuai bagian 3 di atas, dengan datasource memakai `url` dan `directUrl` seperti dicontohkan.
6. Jalankan `npx prisma migrate dev --name init` untuk membuat semua tabel di database Supabase yang sudah terkoneksi via .env.
7. Buat `src/lib/prisma.ts` sebagai singleton PrismaClient (cegah multiple instance saat hot-reload dev).
8. Buat `src/lib/redis.ts` sebagai singleton Upstash Redis client memakai `@upstash/redis`, baca `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` dari env.
9. Buat `prisma/seed.ts` yang seed: 1 user admin (email+password sederhana untuk testing), 2-3 Materi contoh (campur tipe TEKS dan VIDEO dengan videoUrl YouTube valid), 1 Quiz contoh dengan 3 pertanyaan masing-masing 4 opsi, 2 Article contoh (1 published dengan metaTitle/metaDescription terisi, 1 draft), 2 Package contoh. Tambahkan script `"prisma:seed"` di package.json dan jalankan.
10. Verifikasi: jalankan `npx prisma studio` sebentar untuk memastikan semua tabel dan data seed sudah masuk dengan benar, lalu beritahu saya hasilnya.

Setelah semua langkah di atas selesai dan berhasil, BERHENTI dan laporkan ringkasan apa yang sudah dibuat serta apakah ada error yang perlu saya ketahui. JANGAN lanjut membangun API routes atau halaman frontend dulu — itu akan saya berikan di sesi instruksi berikutnya.
```

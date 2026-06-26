# PROMPT BAGIAN 3/4 — Frontend Publik & Dashboard User

> **Cara pakai:** Paste isi di dalam code block ke Trae SETELAH bagian 2 (backend API) selesai dan sudah ditest. Sesi ini fokus membangun semua halaman yang dilihat pengunjung & peserta (BUKAN admin panel — itu di bagian 4).

```
Lanjutkan project "Selasar Bahasa" (Next.js + TypeScript + Prisma + NextAuth + Upstash Redis, schema database dan SEMUA API routes sudah jadi di sesi sebelumnya). SESI 3 dari 4 ini fokus membangun: landing page publik, modul Article dengan SEO, halaman login/register, dan dashboard user (materi + quiz). Admin panel akan dibangun di sesi 4, JANGAN dikerjakan sekarang.

ATURAN EFISIENSI & UX YANG WAJIB DIIKUTI DI SELURUH SESI INI:

a. Server Components by default. Halaman list/detail yang menampilkan data (materi, quiz, artikel, packages) di-render sebagai React Server Component yang langsung query Prisma di server (lewat fungsi helper di lib/, panggil prisma langsung, BUKAN fetch ke API route sendiri). Ini menghilangkan satu round-trip dibanding fetch client-side.

b. Client Component HANYA untuk bagian interaktif: QuizRunner (pengisian quiz), form (login, register, contact), search/filter input. Gunakan `"use client"` seminimal mungkin.

c. Streaming & Suspense: bungkus komponen yang fetch data dengan `<Suspense fallback={<Skeleton />}>` supaya halaman terasa instan, bukan blank screen.

d. Image & video: pakai `next/image` untuk semua gambar. Untuk video, JANGAN embed iframe penuh langsung saat halaman load — buat komponen `VideoEmbed` dengan facade/thumbnail dulu (gambar thumbnail + tombol play di tengah), iframe asli (YouTube/Vimeo embed) baru di-mount ke DOM setelah user klik. Ini penting karena iframe YouTube berat (ratusan KB JS pihak ketiga per video) kalau langsung di-load semua.

e. Desain UI: bersih, modern, whitespace cukup, palet warna konsisten (maksimal 2 warna aksen), font Google Fonts ringan (Inter atau sejenis), komponen card dengan indikator visual jelas (badge "Premium", progress indicator, ikon tipe konten). Sidebar dashboard collapse di mobile pakai komponen React terkontrol state (bukan manipulasi class manual).

f. Form pakai `react-hook-form` + Zod resolver (schema dari `lib/validations/` yang sudah dibuat sesi 2), validasi instan di client, error message jelas per-field, submit button disable otomatis saat pending (cegah double submit).

=====================================================================
1. LANDING PAGE PUBLIK (route group (public), file page.tsx di root)
=====================================================================

Bangun sebagai Server Component, statically generated/ISR dengan `export const revalidate = 3600` (1 jam):

- **Navbar** (`components/public/Navbar.tsx`, bagian client kecil untuk hamburger menu mobile): logo "Selasar Bahasa", link anchor (Beranda #home, Tentang #about, Artikel /artikel, Paket #packages), tombol "Masuk" ke /login dan "Daftar" ke /register, hamburger menu di mobile dengan slide-in panel.
- **HeroSection**: headline kuat, sub-headline, CTA utama ke /register, tampilkan jumlah total user terdaftar sebagai social proof (query `prisma.user.count()` tapi WAJIB pakai cache-aside Redis TTL 600 detik — jangan query langsung).
- **AboutSection**: 3-4 poin value proposition dengan ikon (pakai lucide-react), grid layout responsive.
- **ArticleSection** (preview 3 artikel terbaru di landing page): query 3 Article published terbaru, render sebagai card kecil dengan link "Lihat Semua Artikel" ke /artikel.
- **PackagesSection**: render dari model Package (published true, orderBy urutan), card per paket dengan badge "Paling Diminati" untuk yang isPopuler, list fitur dari fiturList (JSON array), tombol CTA mengarah ke WhatsApp (format link `https://wa.me/62xxx?text=...`) atau ke #contact anchor — JANGAN buat checkout/payment apapun.
- **ContactSection**: form (nama, email, pesan) sebagai client component kecil yang submit ke `/api/contact`, tampilkan notifikasi sukses/error tanpa reload halaman, validasi Zod sebelum submit.
- **Footer**: navigasi, copyright, link sosial media (placeholder href cukup).

=====================================================================
2. MODUL ARTICLE PUBLIK — SEO HARUS LENGKAP
=====================================================================

### `/artikel` (list, Server Component)
- `export const revalidate = 3600`.
- Query Article published, paginated (pakai query param `?page=`), filter optional `?kategori=`.
- Card menampilkan thumbnailUrl/ogImageUrl, judul, ringkasan, kategori badge, tanggal publish (format Indonesia).
- Beri `generateMetadata` untuk halaman list ini juga (title "Artikel - Selasar Bahasa", description umum).

### `/artikel/[slug]` (detail, Server Component)
- Implementasikan `generateStaticParams()` yang return semua slug Article published, untuk SSG penuh.
- `export const revalidate = 3600`.
- Kalau artikel tidak ditemukan atau `published: false`, panggil `notFound()` dari next/navigation (return 404).
- Render `konten` (markdown/HTML) dengan sanitasi pakai `rehype-sanitize` atau library sejenis untuk cegah XSS — JANGAN render dengan `dangerouslySetInnerHTML` tanpa sanitasi.
- **`generateMetadata` WAJIB lengkap:**
  - `title`: dari `metaTitle` fallback ke `judul`.
  - `description`: dari `metaDescription` fallback ke `ringkasan` (potong ke 160 char kalau lebih panjang).
  - `openGraph`: title, description, images (dari ogImageUrl fallback thumbnailUrl), type: 'article', publishedTime dari publishedAt.
  - `twitter`: card 'summary_large_image', title, description, images.
  - `alternates.canonical`: URL absolut ke halaman ini.
- Buat helper `src/lib/seo.ts` berisi fungsi `generateArticleJsonLd(article)` yang return objek JSON-LD schema.org type "Article"/"BlogPosting" (headline, image, datePublished, author organization "Selasar Bahasa"), lalu inject sebagai `<script type="application/ld+json">` di halaman detail artikel.

### `src/app/sitemap.ts`
- Implementasikan `MetadataRoute.Sitemap` Next.js: query semua Article published, generate entry per artikel (`url`, `lastModified` dari updatedAt) ditambah halaman statis (`/`, `/artikel`, `/login`, `/register`).

### `src/app/robots.ts`
- Implementasikan `MetadataRoute.Robots`: allow semua user-agent ke `/`, disallow ke `/dashboard`, `/admin`, `/api`. Sertakan link ke sitemap.

=====================================================================
3. HALAMAN LOGIN & REGISTER
=====================================================================

### `/login`
- Form client component: email, password, pakai `signIn('credentials', ...)` dari next-auth/react.
- Validasi Zod (loginSchema dari sesi 2), tampilkan error dari NextAuth kalau kredensial salah.
- Setelah sukses, redirect ke `/dashboard` (atau `/admin` kalau role ADMIN — cek session setelah login berhasil).
- Link ke /register dan ke /forgot-password (boleh dibuat sederhana atau placeholder, tidak prioritas tinggi).

### `/register`
- Form client component: nama, email, password, konfirmasi password.
- Validasi Zod (registerSchema dari sesi 2) termasuk live feedback kekuatan password (checklist visual: minimal 8 karakter ✓, ada huruf besar ✓, ada angka ✓, ada simbol ✓).
- Submit ke `/api/auth/register`, setelah sukses langsung `signIn` otomatis dan redirect ke `/dashboard`.

=====================================================================
4. DASHBOARD USER (route group (dashboard), WAJIB AUTH)
=====================================================================

### `(dashboard)/layout.tsx`
- Server Component, cek session sekali di sini (kalau tidak ada session, middleware sudah redirect sebelumnya, tapi tetap defensive check).
- Sidebar navigasi: Dashboard, Materi, Quiz, Logout. Collapse jadi hamburger di mobile (client component kecil untuk toggle state, terpisah dari layout server).
- Tampilkan nama user dari session di header/sidebar.

### `(dashboard)/dashboard/page.tsx`
- Ringkasan: jumlah materi tersedia, jumlah quiz tersedia, jumlah quiz yang sudah dikerjakan beserta skor terbaik (query QuizAttempt milik user, group by quiz, ambil score tertinggi).
- Render sebagai Server Component yang query Prisma langsung.

### `(dashboard)/materi/page.tsx`
- List materi, Server Component, query Prisma langsung (BUKAN fetch ke /api/materi) dengan filter sesuai role user dari session, paginated.
- Card materi (`MateriCard`): judul, badge tipe (Teks/Video/Campuran dengan ikon berbeda), badge Premium kalau isPremium, link ke detail.

### `(dashboard)/materi/[slug]/page.tsx`
- Detail materi, Server Component.
- Kalau materi isPremium dan user bukan PREMIUM/ADMIN: tampilkan UI locked-state (blur konten + overlay CTA "Upgrade untuk akses materi ini") — JANGAN langsung 403 polos atau redirect.
- Kalau tipe TEKS: render `kontenTeks` (sanitized).
- Kalau tipe VIDEO: render komponen `VideoEmbed` dengan facade thumbnail+play button.
- Kalau tipe CAMPURAN: render keduanya.

### `(dashboard)/quiz/page.tsx`
- List quiz, Server Component, query Prisma langsung dengan filter role, paginated.
- Card quiz: judul, deskripsi singkat, badge Premium, badge skor terbaik kalau user sudah pernah attempt, tombol "Mulai Quiz"/"Coba Lagi".

### `(dashboard)/quiz/[id]/page.tsx`
- Ambil data quiz (TANPA isCorrect, query langsung di server tapi tetap exclude field itu di select) untuk initial render, lalu serahkan ke client component `QuizRunner` untuk interaksi.
- `QuizRunner` (client component): tampilkan progress "X dari Y soal terjawab", radio button per opsi, navigasi antar soal atau scroll semua soal sekaligus (pilih salah satu pendekatan, yang penting ada indikator progress jelas). Tombol submit disabled sampai semua soal terjawab (atau beri konfirmasi kalau ada yang belum dijawab).
- Saat submit: POST ke `/api/quiz/[id]/submit`, tampilkan hasil di komponen `QuizResult` — skor besar di tengah, breakdown per soal (jawaban user vs jawaban benar, dengan warna hijau/merah), tombol "Coba Lagi" dan "Kembali ke Daftar Quiz".

Setelah semua halaman di atas selesai dibuat tanpa error, jalankan `npm run dev` dan pastikan bisa diakses: landing page di `/`, artikel di `/artikel`, register+login berfungsi, dashboard materi & quiz bisa diakses setelah login dan quiz bisa disubmit dengan skor yang muncul benar. Laporkan hasil testing manual ini ke saya. JANGAN bangun admin panel dulu — itu di sesi 4.
```

# Rencana Perubahan Dashboard Admin untuk Materi, Tugas, Quiz

## Ringkasan
Perubahan ini bertujuan untuk mengupdate dashboard admin agar sesuai dengan struktur schema baru yang menggunakan **tipeKelas** (REGULER/PRIVAT/ANAK_REMAJA) dan **tingkatBIPA** (BIPA_1 sampai BIPA_6), bukan lagi "kelas" (DASAR/MENENGAH/LANJUTAN) dan "isPremium".

## Perubahan yang Dibutuhkan

### 1. Update Form Admin
- **MateriForm.tsx**: Ganti dropdown "Kelas" menjadi dua dropdown: "Tipe Kelas" dan "Tingkat BIPA", hapus checkbox "Materi Premium"
- **TugasForm.tsx**: Sama seperti MateriForm
- **QuizForm.tsx**: Sama seperti MateriForm

### 2. Update API Routes
- **/api/materi**: Update untuk menerima dan menyimpan tipeKelas dan tingkatBIPA, bukan kelas dan isPremium
- **/api/tugas**: Sama seperti /api/materi
- **/api/quiz**: Sama seperti /api/materi

### 3. Update Tabel Admin (Opsional)
- **MateriTableClient.tsx** (jika ada): Update untuk menampilkan tipeKelas dan tingkatBIPA
- **TugasTableClient.tsx**: Sama seperti MateriTableClient
- **QuizTableClient.tsx**: Sudah ada error, bisa diperbaiki juga

## Catatan Penting
- Struktur schema Prisma sudah sesuai: model Materi, Tugas, Quiz sudah punya tipeKelas dan tingkatBIPA
- Logic access control untuk user (di `src/lib/access.ts`) sudah sesuai dengan aturan:
  - User PRIVAT bisa akses materi REGULER di tingkat yang sama
  - User PRIVAT bisa akses materi PRIVAT di tingkat yang sama
  - User ANAK_REMAJA hanya bisa akses materi ANAK_REMAJA di tingkat yang sama

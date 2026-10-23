# Al-Mawaddah by RGM — Biro Jodoh Syar'i

Next.js 16.3.1 (App Router, Tailwind v4) + Google Apps Script (Sheets sebagai database, Drive untuk foto).

## 1. Backend (Google Apps Script) dan migrasi data Google Form
Data lama tidak perlu disalin. Backend langsung memakai spreadsheet jawaban Google Form yang sudah ada,
dengan mengenali kolom dari teks header-nya (urutan kolom bebas, data lama tidak diubah). Google Form lama
tetap bisa dipakai berdampingan: jawaban barunya otomatis muncul di panel admin dengan status Menunggu.

1. Buka Google Form > tab **Responses** > ikon spreadsheet hijau. Dari situ buka spreadsheet jawaban dan
   salin ID-nya (bagian panjang di URL: `docs.google.com/spreadsheets/d/<ID>/edit`).
   Bila form ikhwan dan akhwat punya spreadsheet sendiri-sendiri, salin kedua ID. Catat nama tab jawabannya
   (biasanya `Form Responses 1`).
2. Buka script.google.com, proyek baru, tempel isi `gas/Code.gs`.
3. Project Settings > Script properties, tambahkan:
   - `SS_ID`: ID spreadsheet utama. Boleh sama dengan spreadsheet jawaban ikhwan.
   - `SS_ID_IKHWAN` / `SS_ID_AKHWAT`: hanya bila spreadsheet jawabannya terpisah
   - `SHEET_IKHWAN` / `SHEET_AKHWAT`: nama tab jawaban (default `Ikhwan` dan `Akhwat`)
   - `API_KEY`: acak, panjang
   - `ADMIN_PASSWORD`: kata sandi panel admin
   **Bila spreadsheet jawaban Form terpisah dari spreadsheet GAS**: isi `SS_SUMBER` (ID spreadsheet Form) dan
   `SHEET_SUMBER_IKHWAN` / `SHEET_SUMBER_AKHWAT` (nama tab jawabannya). Baris baru disalin otomatis ke tab
   Ikhwan/Akhwat di `SS_ID` (dicocokkan lewat nomor WA, jadi tidak dobel). Jalankan `sinkronSekarang()` untuk uji,
   dan `pasangPemicu()` sekali agar penyalinan berjalan otomatis (saat Form dikirim dan tiap 10 menit).
4. Jalankan `setup()` sekali (setujui izin Sheets). Fungsi ini menambah 3 kolom admin di ujung kanan tiap tab jawaban
   (`Kode`, `Status Verifikasi`, `Catatan Admin`) dan membuat tab `Taaruf`. Jika muncul galat
   "Header sheet ... tidak ditemukan untuk: ...", teks header di sheet berbeda dari yang ada di `Code.gs`
   (konstanta `HEADER`). Samakan salah satunya.
5. Jalankan `migrasi()` sekali. Semua jawaban lama diberi `Kode` (mis. IK-001, AK-005) dan status.
   Default-nya **Disetujui** (langsung tampil di situs). Ubah `STATUS_DATA_LAMA` di atas `Code.gs`
   menjadi `'Menunggu'` bila semua data lama ingin diperiksa dulu di panel admin.
6. Deploy > New deployment > **Web app**: Execute as **Me**, Who has access **Anyone**. Salin URL `/exec`.
   Setiap mengubah Code.gs, buat **New version** pada deployment.

## 2. Frontend
```bash
cp .env.example .env.local   # isi GAS_URL dan GAS_API_KEY
npm install
npm run dev
```
Deploy ke Vercel dan isi kedua environment variable yang sama.

## Kustomisasi
- Nama biro, tagline, nomor WhatsApp admin: `lib/site.js`
- Warna dan font: `app/globals.css` dan `app/layout.jsx`
- Pilihan isian form (status, salaf, izin, dll): `lib/site.js`. Samakan dengan jawaban di spreadsheet.
- Susunan bidang form dan tampilan profil: `lib/profil.js`

## Keamanan
- URL GAS dan API key hanya ada di server (route `/api/gas`), tidak terlihat di browser.
- Profil publik hanya memuat info yang ditampilkan di halaman peserta. Nama lengkap, nomor WhatsApp, tanggal lahir, domisili asal, dan izin wali tidak pernah dikirim ke publik.
- Login admin dibatasi 5 percobaan gagal per 15 menit; sesi 6 jam.

## SPA dan mobile-first
- **Perilaku SPA**: header, tab bar, dan tema berada di `app/layout.jsx`, sehingga tidak pernah dimuat ulang saat pindah halaman. Transisi halaman ada di `app/template.jsx`.
- **Cache data bersama**: `lib/cache.js`. Daftar peserta dimuat sekali, halaman detail langsung tampil dari cache, dan data diperbarui di latar belakang. Masa segar data 60 detik (ubah lewat opsi `ttl`). Data admin hanya di memori.
- **Draf formulir**: isian pendaftaran disimpan di `sessionStorage` dan dihapus setelah terkirim atau saat tab ditutup.
- **Tab bar bawah** (`components/TabBar.jsx`) tampil di layar kecil, kecuali di `/daftar` dan `/admin`.
- **PWA**: `app/manifest.js` dan ikon di `public/icons/`. Situs bisa dipasang ke layar utama.
- Route `/api/gas` tetap dipakai agar URL GAS dan API key tidak bocor ke browser, jadi situs ini bukan ekspor statis.

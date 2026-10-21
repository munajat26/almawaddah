# Mawaddah — Biro Jodoh Syar'i

Next.js 16.3.1 (App Router, Tailwind v4) + Google Apps Script (Sheets sebagai database, Drive untuk foto).

## 1. Backend (Google Apps Script)
1. Buat **Google Spreadsheet** kosong, salin ID dari URL-nya.
2. Buat **folder Google Drive** (biarkan privat), salin ID folder.
3. Buka script.google.com, proyek baru, tempel isi `gas/Code.gs`.
4. Project Settings > Script properties, tambahkan: `SS_ID`, `FOLDER_ID`, `API_KEY` (acak, panjang), `ADMIN_PASSWORD`.
5. Jalankan fungsi `setup()` sekali (setujui izin Sheets dan Drive). Sheet `Peserta` dan `Taaruf` terbuat otomatis.
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

## Keamanan
- URL GAS dan API key hanya ada di server (route `/api/gas`), tidak terlihat di browser.
- Profil publik tidak memuat nama lengkap, foto, kontak, maupun data wali.
- Foto tersimpan privat di Drive; admin melihatnya lewat endpoint terautentikasi.
- Login admin dibatasi 5 percobaan gagal per 15 menit; sesi 6 jam.

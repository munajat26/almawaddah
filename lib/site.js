// Ubah identitas biro di satu tempat ini.
export const SITE = {
  nama: 'Al-Mawaddah',
  judul: 'Al-Mawaddah by RGM', // judul tab browser, hasil share, dan nama PWA
  tagline: 'Biro Jodoh Syar’i',
  deskripsi: 'Biro jodoh syar’i untuk ikhwan dan akhwat. Proses ta’aruf didampingi admin dan wali, dengan privasi yang dijaga.',
  waAdmin: '6287846948010', // nomor WhatsApp admin, format internasional tanpa +
};

// Pilihan isian form. Teksnya disamakan persis dengan Google Form Ikhwan dan Akhwat
// (jawaban masuk ke spreadsheet yang sama), jadi ubah di sini bila Google Form berubah.
const PENDIDIKAN_DASAR = ['SD/MI sederajat', 'SMP/MTs sederajat', 'SMA/MA sederajat'];
export const PILIHAN = {
  untuk: ['Mendaftar untuk diri sendiri', 'Mendaftar untuk orang lain'],
  statusIkhwan: [
    'Single (Belum pernah menikah)',
    'Duda (Belum memiliki anak)',
    'Duda (memiliki 1 anak)',
    'Duda (memiliki 2 anak)',
    'Duda (memiliki 3 anak)',
    'Duda (memiliki anak diatas 3)',
  ],
  statusAkhwat: [
    'Belum pernah menikah',
    'Janda (memiliki 1 anak)',
    'Janda (memiliki 2 anak)',
    'Janda (memiliki 3 anak)',
    'Janda (memiliki anak diatas 3)',
  ],
  pendidikanIkhwan: [...PENDIDIKAN_DASAR, 'Sarjana', 'Pascasarjana'],
  pendidikanAkhwat: [...PENDIDIKAN_DASAR, 'Diploma', 'Sarjana', 'Pascasarjana'],
  izin: ['Diizinkan', 'Belum diizinkan'],
  bersedia: ['Bersedia', 'Tidak Bersedia'],
  pasanganIkhwan: [
    'Harus single dan belum pernah menikah',
    'Boleh janda tapi belum memiliki anak dari pernikahan sebelumnya',
    'Boleh janda dan sudah memiliki anak dari pernikahan sebelumnya',
  ],
  pasanganAkhwat: [
    'Harus single dan belum pernah menikah',
    'Boleh Duda tapi belum memiliki anak dari istri sebelumnya',
    'Boleh duda dan sudah memiliki anak dari istri sebelumnya',
    'Boleh sudah menikah dan tidak berstatus single',
  ],
};
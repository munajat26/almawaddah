/**
 * Backend Biro Jodoh Syar'i — Google Apps Script
 *
 * Membaca dan menulis langsung ke sheet jawaban yang sudah ada (Ikhwan dan Akhwat),
 * dikenali dari teks header kolomnya. Kolom lama tidak diubah. Hanya 3 kolom admin
 * ditambahkan di ujung kanan: "Kode", "Status Verifikasi", "Catatan Admin".
 *
 * Script Properties (Project Settings > Script properties):
 *   SS_ID           : ID Google Spreadsheet utama (tab Taaruf dibuat di sini; juga dipakai
 *                     untuk tab Ikhwan/Akhwat bila tidak diisi ID terpisah di bawah)
 *   SS_ID_IKHWAN    : (opsional) ID spreadsheet jawaban Google Form ikhwan, bila terpisah
 *   SS_ID_AKHWAT    : (opsional) ID spreadsheet jawaban Google Form akhwat, bila terpisah
 *   SHEET_IKHWAN    : nama tab data ikhwan   (default: Ikhwan)
 *   SHEET_AKHWAT    : nama tab data akhwat   (default: Akhwat)
 *   API_KEY         : kunci acak panjang, sama dengan GAS_API_KEY di Next.js
 *   ADMIN_PASSWORD  : kata sandi panel admin
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me | Who has access: Anyone
 * Langkah awal: jalankan setup(), lalu migrasi() sekali.
 */

// Status untuk data lama saat migrasi() dijalankan. Ganti ke 'Menunggu'
// bila semua data lama ingin diperiksa ulang oleh admin sebelum tampil.
const STATUS_DATA_LAMA = 'Disetujui';

// Teks header kolom persis seperti di spreadsheet jawaban.
const H_CIRI = 'Ciri fisik (sebatas yang diizinkan diketahui oleh panitia dan kandidat jodoh nantinya)';
const H_UNGGUL = 'Ceritakan tentang keunggulan diri anda (sebatas yang diizinkan diketahui oleh panitia dan kandidat jodoh nantinya)';
const H_KURANG = 'Ceritakan tentang kekurangan diri anda (sebatas yang diizinkan diketahui oleh panitia dan kandidat jodoh nantinya)';
const H_UMUM = {
  untuk: 'Mendaftar untuk sendiri atau orang lain?',
  wa: 'Nomor Whatsapp yang bisa dihubungi',
  tglLahir: 'Tanggal Lahir',
  berat: 'Berat badan',
  tinggi: 'Tinggi badan',
  suku: 'Suku',
  status: 'Status',
  domAsal: 'Domisili asal',
  domSekarang: 'Domisili sekarang',
  pendidikan: 'Pendidikan',
  pekerjaan: 'Pekerjaan/kegiatan',
  izin: 'Izin menikah dari orangtua/wali',
  ciri: H_CIRI,
  unggul: H_UNGGUL,
  kurang: H_KURANG,
  kegiatan: 'Dimanakah anda sering mengikuti kegiatan keagamaan (pengajian dan lainnya)?',
  ormas: 'Apakah anda mengikuti ormas tertentu?',
  ustadz: 'Sebutkan nama-nama ustadz favorit atau yang sering anda ikuti ceramah atau kajiannya!',
};
const HEADER = {
  Ikhwan: Object.assign({}, H_UMUM, {
    salaf: 'Salaf/Mengaji?',
    penghasilan: 'Income/Pemasukan Bulanan',
    bedaPulau: 'Bersedia menikah beda pulau/provinsi/kabupaten?',
    tinggal: 'Setelah menikah apakah bersedia ikut tinggal bersama istri?',
    pasangan: 'Apakah kandidat calon istri harus lajang (belum menikah)? boleh dicentang lebih dari satu',
    kriteria: 'Kriteria istri yang anda perlukan (ciri fisik, keagamaan, ekonomi, dll)',
    nama: 'Nama Lengkap Sesuai KTP bukan kunyah (Untuk Ikhwan)',
  }),
  Akhwat: Object.assign({}, H_UMUM, {
    nomor: 'Nomor',
    salaf: 'Salaf/Sudah Mengaji',
    penghasilan: 'Berapa perkiraan kebutuhan nafkah anda (rupiah)?',
    bedaPulau: 'Bersedia menikah beda pulau?',
    bedaProv: 'Bersedia menikah beda provinsi?',
    bedaKab: 'Bersedia menikah beda kabupaten?',
    tinggal: 'Setelah menikah apakah bersedia ikut tinggal bersama suami?',
    pasangan: 'Apakah kandidat calon suami harus lajang (belum menikah)? boleh dicentang lebih dari satu',
    kriteria: 'Kriteria suami yang anda perlukan (ciri fisik, keagamaan, pendidikan, ekonomi, dll)',
    nama: 'Nama Lengkap Sesuai KTP bukan kunyah (Untuk Akhwat)',
  }),
};
const KOLOM_ADMIN = { kode: 'Kode', verif: 'Status Verifikasi', catatan: 'Catatan Admin' };
const PREFIX = { Ikhwan: 'IK', Akhwat: 'AK' };

const TAARUF_HDR = ['id', 'createdAt', 'dari', 'kepada', 'pesan', 'status', 'catatanAdmin'];
const STATUS_PESERTA = ['Menunggu', 'Disetujui', 'Ditolak', 'Menikah'];
const STATUS_TAARUF = ['Menunggu', 'Diproses', 'Diterima', 'Ditolak'];

/* ---------- util ---------- */
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function cl_(v, n) { return String(v == null ? '' : v).trim().slice(0, n || 200); }
function digits_(v) { return String(v || '').replace(/\D/g, ''); }
function norm_(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function withLock_(fn) {
  const l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
function ss_(g) { // g opsional: tiap tab boleh berada di spreadsheet berbeda (SS_ID_IKHWAN / SS_ID_AKHWAT)
  const id = (g === 'Ikhwan' && prop_('SS_ID_IKHWAN')) || (g === 'Akhwat' && prop_('SS_ID_AKHWAT')) || prop_('SS_ID');
  if (!id) throw new Error('Script property SS_ID belum diisi.');
  return SpreadsheetApp.openById(id);
}

// Cari kolom berdasarkan teks header (abaikan huruf besar/kecil, spasi, tanda baca).
function cari_(headers, target) {
  const t = norm_(target);
  const hn = headers.map(norm_);
  let i = hn.indexOf(t);
  if (i >= 0) return i;
  if (t.length >= 25) { // toleran bila teks header diubah sedikit di bagian akhir
    const p = t.slice(0, 25);
    for (i = 0; i < hn.length; i++) if (hn[i].length >= 25 && hn[i].indexOf(p) === 0) return i;
  }
  return -1;
}

// Info sheet: objek sheet, daftar header, dan peta kunci -> indeks kolom (mulai 0).
const INFO_ = {};
function info_(g) {
  if (INFO_[g]) return INFO_[g];
  const nama = prop_(g === 'Ikhwan' ? 'SHEET_IKHWAN' : 'SHEET_AKHWAT') || g;
  const ss = ss_(g);
  let sh = ss.getSheetByName(nama);
  if (!sh) { // sheet belum ada: buat dengan header yang sama seperti form
    sh = ss.insertSheet(nama);
    sh.appendRow(['Timestamp'].concat(Object.keys(HEADER[g]).map(function (k) { return HEADER[g][k]; })));
    sh.setFrozenRows(1);
  }
  const headers = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  Object.keys(KOLOM_ADMIN).forEach(function (k) { // tambah kolom admin bila belum ada
    if (cari_(headers, KOLOM_ADMIN[k]) < 0) {
      headers.push(KOLOM_ADMIN[k]);
      sh.getRange(1, headers.length).setValue(KOLOM_ADMIN[k]);
    }
  });
  const col = {};
  Object.keys(HEADER[g]).forEach(function (k) { col[k] = cari_(headers, HEADER[g][k]); });
  Object.keys(KOLOM_ADMIN).forEach(function (k) { col[k] = cari_(headers, KOLOM_ADMIN[k]); });
  // Semua kolom yang berawalan "Nama Lengkap": form lama / form gabungan kadang menaruh nama di kolom lain
  // (mis. "(Untuk Ikhwan)" untuk baris akhwat). Dipakai sebagai cadangan agar baris tidak terbuang.
  col.namaAlt = [];
  headers.forEach(function (h, i) { if (norm_(h).indexOf('namalengkap') === 0 && i !== col.nama) col.namaAlt.push(i); });
  col.waktu = headers.map(norm_).indexOf('timestamp');
  if (col.waktu < 0) col.waktu = headers.map(norm_).indexOf('capwaktu');
  const hilang = Object.keys(HEADER[g]).filter(function (k) { return col[k] < 0 && k !== 'nomor' && k !== 'salaf'; });
  if (hilang.length) throw new Error('Header sheet ' + nama + ' tidak ditemukan untuk: ' + hilang.join(', '));
  return (INFO_[g] = { sh: sh, headers: headers, col: col });
}

// Nama baris: kolom nama utama, bila kosong coba kolom "Nama Lengkap ..." lain.
function namaBaris_(I, r) {
  let n = I.col.nama >= 0 ? String(r[I.col.nama] || '').trim() : '';
  for (let k = 0; !n && k < I.col.namaAlt.length; k++) n = String(r[I.col.namaAlt[k]] || '').trim();
  return n;
}
// Baris dianggap data peserta bila ada nama, atau (nama kosong) ada nomor WA / tanggal lahir.
function barisIsi_(I, r) {
  if (namaBaris_(I, r)) return true;
  return (I.col.wa >= 0 && String(r[I.col.wa] || '').trim() !== '') || (I.col.tglLahir >= 0 && String(r[I.col.tglLahir] || '').trim() !== '');
}

function parseDate_(v) {
  if (v instanceof Date) return isNaN(v) ? null : v;
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
  if (m) { // Google Form menampilkan MM/DD/YYYY; bila angka pertama > 12 pasti DD/MM/YYYY
    const a = +m[1], c = +m[2];
    return a > 12 ? new Date(+m[3], c - 1, a) : new Date(+m[3], a - 1, c);
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
// Usia dengan satu angka desimal, misalnya 31.7
function usia_(v) {
  const d = parseDate_(v);
  if (!d) return '';
  const y = (new Date().getTime() - d.getTime()) / (365.25 * 86400000);
  return y < 0 || y > 120 ? '' : Math.round(y * 10) / 10;
}

// Semua baris sebuah sheet sebagai objek dengan kunci baku (nama, wa, tglLahir, ...).
function rows_(g) {
  const I = info_(g);
  const v = I.sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < v.length; i++) {
    const r = v[i];
    if (!barisIsi_(I, r)) continue; // baris benar-benar kosong
    const o = { gender: g, _row: i + 1 };
    Object.keys(I.col).forEach(function (k) {
      if (typeof I.col[k] === 'number' && I.col[k] >= 0) o[k] = r[I.col[k]];
    });
    o.nama = namaBaris_(I, r) || '(tanpa nama)';
    Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string') o[k] = o[k].trim(); });
    o.kode = String(o.kode || '');
    o.verif = String(o.verif || '');
    out.push(o);
  }
  return out;
}
function semua_() { return rows_('Ikhwan').concat(rows_('Akhwat')); }

function setCell_(p, key, val) {
  const I = info_(p.gender);
  I.sh.getRange(p._row, I.col[key] + 1).setValue(val);
}

// Beri Kode dan Status Verifikasi pada baris yang belum punya (data lama atau kiriman Google Form).
function lengkapi_(g, statusAwal) {
  const I = info_(g);
  const last = I.sh.getLastRow();
  if (last < 2) return 0;
  const n = last - 1;
  const rg = function (k) { return I.sh.getRange(2, I.col[k] + 1, n, 1); };
  const isi = I.sh.getRange(2, 1, n, I.headers.length).getValues();
  const kode = rg('kode').getValues(), verif = rg('verif').getValues();
  const nomor = I.col.nomor >= 0 ? rg('nomor').getValues() : null;
  const dipakai = {}; let maks = 0;
  kode.forEach(function (r) {
    const m = String(r[0]).match(/(\d+)$/);
    if (m) { dipakai[+m[1]] = true; maks = Math.max(maks, +m[1]); }
  });
  let ubah = 0;
  for (let i = 0; i < n; i++) {
    if (!barisIsi_(I, isi[i])) continue;
    if (!String(kode[i][0]).trim()) {
      let no = nomor && /^\d+$/.test(String(nomor[i][0]).trim()) ? +nomor[i][0] : i + 1;
      if (dipakai[no]) no = ++maks;
      dipakai[no] = true; maks = Math.max(maks, no);
      kode[i][0] = PREFIX[g] + '-' + ('000' + no).slice(-3);
      ubah++;
    }
    if (!String(verif[i][0]).trim()) { verif[i][0] = statusAwal; ubah++; }
  }
  if (ubah) { rg('kode').setValues(kode); rg('verif').setValues(verif); }
  return ubah;
}

// Profil publik: hanya info yang boleh tampil. Tanpa nama, WhatsApp, tanggal lahir,
// domisili asal, izin wali, dan keterangan pendaftar.
function publik_(p) {
  return {
    id: p.kode, gender: p.gender, status: p.status, usia: usia_(p.tglLahir), suku: p.suku,
    domSekarang: p.domSekarang, tinggi: p.tinggi, berat: p.berat, pendidikan: p.pendidikan,
    ciri: p.ciri, pekerjaan: p.pekerjaan, penghasilan: p.penghasilan,
    bedaPulau: p.bedaPulau, bedaProv: p.bedaProv || '', bedaKab: p.bedaKab || '',
    unggul: p.unggul, kurang: p.kurang, kegiatan: p.kegiatan, ustadz: p.ustadz, ormas: p.ormas,
    pasangan: p.pasangan, kriteria: p.kriteria,
  };
}
function aktif_(p) { return !!p.kode && String(p.verif).trim().toLowerCase() === 'disetujui'; }
function cekAdmin_(token) {
  if (!token || !CacheService.getScriptCache().get('adm_' + token)) throw new Error('Sesi admin berakhir. Silakan masuk lagi.');
}

/* ---------- entry point ---------- */
function doGet() { return json_({ ok: true, data: 'Biro Jodoh API aktif' }); }

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.apiKey !== prop_('API_KEY')) return json_({ ok: false, error: 'Tidak diizinkan.' });
    const fn = ROUTES[b.action];
    if (!fn) return json_({ ok: false, error: 'Aksi tidak dikenal.' });
    return json_({ ok: true, data: fn(b) });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

const ROUTES = {
  list: list, get: get, register: register, taaruf: taaruf,
  adminLogin: adminLogin, adminList: adminList, adminUpdate: adminUpdate, adminTaaruf: adminTaaruf,
};

/* ---------- inisialisasi (jalankan sekali dari editor) ---------- */
function setup() {
  info_('Ikhwan'); info_('Akhwat'); // pastikan kolom admin ada
  taarufSheet_();
}
// Diagnosa: jalankan dari editor lalu lihat View > Logs. Menjelaskan kenapa jumlah peserta di situs
// berbeda dengan jumlah baris di sheet (baris kosong, belum ada Kode, status bukan Disetujui, kode ganda).
function diagnosa() {
  ['Ikhwan', 'Akhwat'].forEach(function (g) {
    const I = info_(g);
    const v = I.sh.getDataRange().getValues(); v.shift();
    const rows = rows_(g);
    const stat = {}, kodeCt = {};
    rows.forEach(function (p) {
      const k = p.verif || '(kosong)'; stat[k] = (stat[k] || 0) + 1;
      if (p.kode) kodeCt[p.kode] = (kodeCt[p.kode] || 0) + 1;
    });
    const ganda = Object.keys(kodeCt).filter(function (k) { return kodeCt[k] > 1; });
    Logger.log(g + ': baris di sheet ' + v.length + ' | terbaca ' + rows.length + ' | tanpa Kode ' +
      rows.filter(function (p) { return !p.kode; }).length + ' | tampil di situs ' + rows.filter(aktif_).length);
    Logger.log(g + ': status verifikasi ' + JSON.stringify(stat) + ' | kode ganda ' + JSON.stringify(ganda));
  });
}
// Beri Kode dan status pada semua data lama.
function migrasi() {
  withLock_(function () {
    const a = lengkapi_('Ikhwan', STATUS_DATA_LAMA), b = lengkapi_('Akhwat', STATUS_DATA_LAMA);
    Logger.log('Sel diperbarui: Ikhwan ' + a + ', Akhwat ' + b + ' (status ' + STATUS_DATA_LAMA + ')');
  });
}

function taarufSheet_() {
  const ss = ss_();
  let sh = ss.getSheetByName('Taaruf');
  if (!sh) {
    sh = ss.insertSheet('Taaruf');
    sh.appendRow(TAARUF_HDR);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), TAARUF_HDR.length).setNumberFormat('@');
  }
  return sh;
}
function taarufRows_() {
  const v = taarufSheet_().getDataRange().getValues();
  v.shift();
  return v.map(function (r, i) {
    const o = { _row: i + 2 };
    TAARUF_HDR.forEach(function (k, j) { o[k] = r[j]; });
    return o;
  });
}

/* ---------- publik ---------- */
function list(b) {
  const g = b.gender;
  const src = g === 'Ikhwan' || g === 'Akhwat' ? rows_(g) : semua_();
  return src.filter(aktif_).map(publik_);
}

function get(b) {
  const p = semua_().filter(function (x) { return x.kode === cl_(b.id).toUpperCase() && aktif_(x); })[0];
  if (!p) throw new Error('Profil tidak ditemukan.');
  return publik_(p);
}

function register(b) {
  if (b.website) throw new Error('Permintaan ditolak.'); // honeypot
  if (['Ikhwan', 'Akhwat'].indexOf(b.gender) < 0) throw new Error('Jenis kelamin tidak valid.');
  const g = b.gender;
  const wajib = ['untuk', 'nama', 'wa', 'tglLahir', 'status', 'tinggi', 'berat', 'suku', 'domAsal', 'domSekarang',
    'pendidikan', 'pekerjaan', 'penghasilan', 'izin', 'ciri', 'unggul', 'kegiatan', 'ustadz', 'tinggal', 'kriteria', 'bedaPulau']
    // Mengikuti Google Form: ikhwan wajib mengisi ormas (kekurangan opsional); akhwat sebaliknya.
    .concat(g === 'Akhwat' ? ['kurang', 'bedaProv', 'bedaKab'] : ['ormas']);
  wajib.forEach(function (k) { if (!cl_(b[k])) throw new Error('Data belum lengkap: ' + k); });
  const pasangan = (Array.isArray(b.pasangan) ? b.pasangan : [b.pasangan]).map(function (x) { return cl_(x, 100); }).filter(String);
  if (!pasangan.length) throw new Error('Data belum lengkap: pasangan');
  const usia = usia_(b.tglLahir);
  if (usia === '' || usia < 18 || usia > 80) throw new Error('Usia minimal 18 tahun.');
  const tinggi = Number(b.tinggi), berat = Number(b.berat);
  if (!(tinggi >= 120 && tinggi <= 220)) throw new Error('Tinggi badan tidak wajar.');
  if (!(berat >= 25 && berat <= 250)) throw new Error('Berat badan tidak wajar.');
  if (digits_(b.wa).length < 9) throw new Error('Nomor WhatsApp tidak valid.');
  if (!b.setuju) throw new Error('Anda harus menyetujui ketentuan.');

  const nilai = {
    untuk: cl_(b.untuk, 40), nama: cl_(b.nama, 80), wa: digits_(b.wa), tglLahir: cl_(b.tglLahir, 10),
    status: cl_(b.status, 60), tinggi: String(tinggi), berat: String(berat), suku: cl_(b.suku, 40),
    domAsal: cl_(b.domAsal, 80), domSekarang: cl_(b.domSekarang, 80), salaf: cl_(b.salaf, 60),
    pendidikan: cl_(b.pendidikan, 60), pekerjaan: cl_(b.pekerjaan, 100), penghasilan: cl_(b.penghasilan, 60),
    izin: cl_(b.izin, 60), ciri: cl_(b.ciri, 500), unggul: cl_(b.unggul, 800), kurang: cl_(b.kurang, 800),
    kegiatan: cl_(b.kegiatan, 300), ormas: cl_(b.ormas, 100), ustadz: cl_(b.ustadz, 400),
    bedaPulau: cl_(b.bedaPulau, 40), bedaProv: cl_(b.bedaProv, 40), bedaKab: cl_(b.bedaKab, 40),
    tinggal: cl_(b.tinggal, 200), pasangan: pasangan.join(', '), kriteria: cl_(b.kriteria, 800),
  };

  return withLock_(function () {
    if (semua_().some(function (p) { return digits_(p.wa) === nilai.wa; })) throw new Error('Nomor WhatsApp ini sudah terdaftar.');
    lengkapi_(g, 'Menunggu'); // pastikan baris lain dari Google Form sudah punya kode
    const I = info_(g);
    const ada = rows_(g);
    let maks = 0;
    ada.forEach(function (p) { const m = p.kode.match(/(\d+)$/); if (m) maks = Math.max(maks, +m[1]); });
    const kode = PREFIX[g] + '-' + ('000' + (maks + 1)).slice(-3);

    const baris = new Array(I.headers.length).fill('');
    Object.keys(nilai).forEach(function (k) { if (I.col[k] >= 0) baris[I.col[k]] = nilai[k]; });
    if (I.col.nomor >= 0) baris[I.col.nomor] = String(maks + 1);
    if (I.col.waktu >= 0) baris[I.col.waktu] = new Date();
    baris[I.col.kode] = kode;
    baris[I.col.verif] = 'Menunggu';
    const r = I.sh.getLastRow() + 1;
    const rg = I.sh.getRange(r, 1, 1, baris.length);
    rg.setNumberFormat('@'); // teks polos: nomor WA tidak kehilangan angka 0 di depan
    rg.setValues([baris]);
    if (I.col.waktu >= 0) I.sh.getRange(r, I.col.waktu + 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    return { id: kode };
  });
}

function taaruf(b) {
  const pesan = cl_(b.pesan, 500);
  if (pesan.length < 10) throw new Error('Pesan minimal 10 karakter.');
  return withLock_(function () {
    const semuaP = semua_();
    const dari = semuaP.filter(function (p) { return p.kode === cl_(b.dari).toUpperCase() && aktif_(p); })[0];
    if (!dari) throw new Error('Kode peserta Anda tidak ditemukan atau belum disetujui.');
    const ke = semuaP.filter(function (p) { return p.kode === cl_(b.kepada).toUpperCase() && aktif_(p); })[0];
    if (!ke) throw new Error('Profil tujuan tidak tersedia.');
    if (dari.gender === ke.gender) throw new Error('Ta’aruf hanya antara ikhwan dan akhwat.');
    const ada = taarufRows_().some(function (t) {
      return t.dari === dari.kode && t.kepada === ke.kode && (t.status === 'Menunggu' || t.status === 'Diproses');
    });
    if (ada) throw new Error('Pengajuan Anda ke profil ini masih diproses.');
    const id = 'TA-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    const rec = { id: id, createdAt: new Date().toISOString(), dari: dari.kode, kepada: ke.kode, pesan: pesan, status: 'Menunggu', catatanAdmin: '' };
    taarufSheet_().appendRow(TAARUF_HDR.map(function (k) { return rec[k]; }));
    return { id: id };
  });
}

/* ---------- admin ---------- */
function adminLogin(b) {
  const cache = CacheService.getScriptCache();
  const gagal = Number(cache.get('adm_gagal') || 0);
  if (gagal >= 5) throw new Error('Terlalu banyak percobaan. Coba lagi 15 menit lagi.');
  if (!b.password || b.password !== prop_('ADMIN_PASSWORD')) {
    cache.put('adm_gagal', String(gagal + 1), 900);
    throw new Error('Kata sandi salah.');
  }
  const token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('adm_' + token, '1', 21600); // 6 jam
  return { token: token };
}

function adminList(b) {
  cekAdmin_(b.token);
  withLock_(function () { lengkapi_('Ikhwan', 'Menunggu'); lengkapi_('Akhwat', 'Menunggu'); }); // kiriman Google Form baru
  const peserta = semua_().map(function (p) {
    const o = Object.assign({}, p);
    o.id = p.kode;
    o.usia = usia_(p.tglLahir);
    o.tglLahir = p.tglLahir instanceof Date ? Utilities.formatDate(p.tglLahir, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(p.tglLahir);
    delete o._row; delete o.kode; delete o.waktu; delete o.nomor;
    return o;
  });
  const taaruf = taarufRows_().map(function (t) { delete t._row; return t; });
  return { peserta: peserta, taaruf: taaruf };
}

function adminUpdate(b) {
  cekAdmin_(b.token);
  if (STATUS_PESERTA.indexOf(b.status) < 0) throw new Error('Status tidak valid.');
  return withLock_(function () {
    const p = semua_().filter(function (x) { return x.kode === cl_(b.id).toUpperCase(); })[0];
    if (!p) throw new Error('Peserta tidak ditemukan.');
    setCell_(p, 'verif', b.status);
    if (b.catatan != null) setCell_(p, 'catatan', cl_(b.catatan, 500));
    return { ok: true };
  });
}

function adminTaaruf(b) {
  cekAdmin_(b.token);
  if (STATUS_TAARUF.indexOf(b.status) < 0) throw new Error('Status tidak valid.');
  return withLock_(function () {
    const t = taarufRows_().filter(function (x) { return x.id === cl_(b.id); })[0];
    if (!t) throw new Error('Pengajuan tidak ditemukan.');
    const sh = taarufSheet_();
    sh.getRange(t._row, TAARUF_HDR.indexOf('status') + 1).setValue(b.status);
    if (b.catatan != null) sh.getRange(t._row, TAARUF_HDR.indexOf('catatanAdmin') + 1).setValue(cl_(b.catatan, 500));
    return { ok: true };
  });
}

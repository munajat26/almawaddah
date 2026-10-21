/**
 * Backend Biro Jodoh Syar'i — Google Apps Script
 *
 * Script Properties (Project Settings > Script properties):
 *   SS_ID           : ID Google Spreadsheet
 *   FOLDER_ID       : ID folder Google Drive untuk foto (biarkan privat)
 *   API_KEY         : kunci acak panjang, sama dengan GAS_API_KEY di Next.js
 *   ADMIN_PASSWORD  : kata sandi panel admin
 *
 * Deploy: Deploy > New deployment > Web app
 *   Execute as: Me | Who has access: Anyone
 * Jalankan fungsi setup() sekali untuk membuat sheet.
 */

const SHEETS = {
  Peserta: ['id', 'createdAt', 'status', 'nama', 'gender', 'tglLahir', 'tinggi', 'pendidikan', 'pekerjaan', 'domisili',
    'statusNikah', 'jmlAnak', 'hafalan', 'pemahaman', 'visi', 'kriteria', 'wali', 'waliWa', 'wa', 'email', 'fotoId', 'catatanAdmin'],
  Taaruf: ['id', 'createdAt', 'dari', 'kepada', 'pesan', 'status', 'catatanAdmin'],
};
const STATUS_PESERTA = ['Menunggu', 'Disetujui', 'Ditolak', 'Menikah'];
const STATUS_TAARUF = ['Menunggu', 'Diproses', 'Diterima', 'Ditolak'];

/* ---------- util ---------- */
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function cl_(v, n) { return String(v == null ? '' : v).trim().slice(0, n || 200); }
function digits_(v) { return String(v || '').replace(/\D/g, ''); }
function withLock_(fn) {
  const l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
function sheet_(name) {
  const ss = SpreadsheetApp.openById(prop_('SS_ID'));
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), SHEETS[name].length).setNumberFormat('@'); // teks polos
  }
  return sh;
}
function rows_(name) {
  const v = sheet_(name).getDataRange().getValues();
  const h = v.shift();
  return v.map(function (r, i) {
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[k] = r[j]; });
    return o;
  });
}
function setCell_(name, row, key, val) {
  sheet_(name).getRange(row, SHEETS[name].indexOf(key) + 1).setValue(val);
}
function age_(s) {
  const d = new Date(s);
  if (isNaN(d)) return '';
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  const m = n.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
  return a;
}
function inisial_(nama) {
  return String(nama).trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('.') + '.';
}
// Profil publik: tanpa nama lengkap, kontak, wali, dan foto.
function publik_(p) {
  return {
    id: p.id, inisial: inisial_(p.nama), gender: p.gender, usia: age_(p.tglLahir), tinggi: p.tinggi,
    pendidikan: p.pendidikan, pekerjaan: p.pekerjaan, domisili: p.domisili, statusNikah: p.statusNikah,
    jmlAnak: p.jmlAnak, hafalan: p.hafalan, pemahaman: p.pemahaman, visi: p.visi, kriteria: p.kriteria,
  };
}
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
  adminLogin: adminLogin, adminList: adminList, adminUpdate: adminUpdate, adminTaaruf: adminTaaruf, adminPhoto: adminPhoto,
};

function setup() { Object.keys(SHEETS).forEach(sheet_); }

/* ---------- publik ---------- */
function list(b) {
  return rows_('Peserta')
    .filter(function (p) { return p.status === 'Disetujui' && (!b.gender || p.gender === b.gender); })
    .map(publik_);
}

function get(b) {
  const p = rows_('Peserta').filter(function (x) { return x.id === cl_(b.id) && x.status === 'Disetujui'; })[0];
  if (!p) throw new Error('Profil tidak ditemukan.');
  return publik_(p);
}

function register(b) {
  if (b.website) throw new Error('Permintaan ditolak.'); // honeypot
  const wajib = ['nama', 'gender', 'tglLahir', 'tinggi', 'domisili', 'pendidikan', 'pekerjaan', 'pemahaman', 'visi', 'kriteria', 'wali', 'waliWa', 'wa'];
  wajib.forEach(function (k) { if (!cl_(b[k])) throw new Error('Data belum lengkap: ' + k); });
  if (['Ikhwan', 'Akhwat'].indexOf(b.gender) < 0) throw new Error('Jenis kelamin tidak valid.');
  if (STATUS_NIKAH_OK.indexOf(b.statusNikah) < 0) throw new Error('Status pernikahan tidak valid.');
  const usia = age_(b.tglLahir);
  if (usia === '' || usia < 18 || usia > 70) throw new Error('Usia minimal 18 tahun.');
  if (!b.setuju) throw new Error('Anda harus menyetujui ketentuan.');
  if (!b.foto || !b.foto.data) throw new Error('Foto wajib diunggah untuk verifikasi.');
  if (b.foto.data.length > 2800000) throw new Error('Ukuran foto terlalu besar.');

  return withLock_(function () {
    const wa = digits_(b.wa);
    if (rows_('Peserta').some(function (p) { return digits_(p.wa) === wa; })) throw new Error('Nomor WhatsApp ini sudah terdaftar.');
    const id = 'BJ-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    const blob = Utilities.newBlob(Utilities.base64Decode(b.foto.data), 'image/jpeg', id + '.jpg');
    const file = DriveApp.getFolderById(prop_('FOLDER_ID')).createFile(blob); // privat, hanya pemilik script
    const rec = {
      id: id, createdAt: new Date().toISOString(), status: 'Menunggu',
      nama: cl_(b.nama, 80), gender: b.gender, tglLahir: cl_(b.tglLahir, 10), tinggi: cl_(b.tinggi, 3),
      pendidikan: cl_(b.pendidikan, 40), pekerjaan: cl_(b.pekerjaan, 80), domisili: cl_(b.domisili, 80),
      statusNikah: b.statusNikah, jmlAnak: cl_(b.jmlAnak || '0', 2), hafalan: cl_(b.hafalan, 80),
      pemahaman: cl_(b.pemahaman, 600), visi: cl_(b.visi, 800), kriteria: cl_(b.kriteria, 800),
      wali: cl_(b.wali, 80), waliWa: digits_(b.waliWa), wa: wa, email: cl_(b.email, 100),
      fotoId: file.getId(), catatanAdmin: '',
    };
    sheet_('Peserta').appendRow(SHEETS.Peserta.map(function (k) { return rec[k]; }));
    return { id: id };
  });
}
const STATUS_NIKAH_OK = ['Lajang', 'Duda', 'Janda'];

function taaruf(b) {
  const pesan = cl_(b.pesan, 500);
  if (pesan.length < 10) throw new Error('Pesan minimal 10 karakter.');
  return withLock_(function () {
    const semua = rows_('Peserta');
    const dari = semua.filter(function (p) { return p.id === cl_(b.dari).toUpperCase() && p.status === 'Disetujui'; })[0];
    if (!dari) throw new Error('Kode peserta Anda tidak ditemukan atau belum disetujui.');
    const ke = semua.filter(function (p) { return p.id === cl_(b.kepada) && p.status === 'Disetujui'; })[0];
    if (!ke) throw new Error('Profil tujuan tidak tersedia.');
    if (dari.gender === ke.gender) throw new Error('Ta’aruf hanya antara ikhwan dan akhwat.');
    const ada = rows_('Taaruf').some(function (t) {
      return t.dari === dari.id && t.kepada === ke.id && (t.status === 'Menunggu' || t.status === 'Diproses');
    });
    if (ada) throw new Error('Pengajuan Anda ke profil ini masih diproses.');
    const id = 'TA-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    const rec = { id: id, createdAt: new Date().toISOString(), dari: dari.id, kepada: ke.id, pesan: pesan, status: 'Menunggu', catatanAdmin: '' };
    sheet_('Taaruf').appendRow(SHEETS.Taaruf.map(function (k) { return rec[k]; }));
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
  const peserta = rows_('Peserta').map(function (p) {
    const o = Object.assign({}, p);
    o.usia = age_(p.tglLahir);
    o.adaFoto = !!p.fotoId;
    delete o.fotoId; delete o._row;
    return o;
  });
  const taaruf = rows_('Taaruf').map(function (t) { delete t._row; return t; });
  return { peserta: peserta, taaruf: taaruf };
}

function adminUpdate(b) {
  cekAdmin_(b.token);
  if (STATUS_PESERTA.indexOf(b.status) < 0) throw new Error('Status tidak valid.');
  return withLock_(function () {
    const p = rows_('Peserta').filter(function (x) { return x.id === cl_(b.id); })[0];
    if (!p) throw new Error('Peserta tidak ditemukan.');
    setCell_('Peserta', p._row, 'status', b.status);
    if (b.catatan != null) setCell_('Peserta', p._row, 'catatanAdmin', cl_(b.catatan, 500));
    return { ok: true };
  });
}

function adminTaaruf(b) {
  cekAdmin_(b.token);
  if (STATUS_TAARUF.indexOf(b.status) < 0) throw new Error('Status tidak valid.');
  return withLock_(function () {
    const t = rows_('Taaruf').filter(function (x) { return x.id === cl_(b.id); })[0];
    if (!t) throw new Error('Pengajuan tidak ditemukan.');
    setCell_('Taaruf', t._row, 'status', b.status);
    if (b.catatan != null) setCell_('Taaruf', t._row, 'catatanAdmin', cl_(b.catatan, 500));
    return { ok: true };
  });
}

function adminPhoto(b) {
  cekAdmin_(b.token);
  const p = rows_('Peserta').filter(function (x) { return x.id === cl_(b.id); })[0];
  if (!p || !p.fotoId) throw new Error('Foto tidak ada.');
  const blob = DriveApp.getFileById(p.fotoId).getBlob();
  return { src: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
}

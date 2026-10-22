import { PILIHAN } from './site';

const ik = (g) => g === 'Ikhwan';

// Bidang form pendaftaran, per langkah. Kuncinya sama dengan yang dibaca backend (gas/Code.gs).
// t: text | number | date | tel | select | area | check
export function langkahForm(g) {
  const istri = ik(g) ? 'istri' : 'suami';
  const bersedia = (k, label) => ({ k, label, t: 'select', opsi: PILIHAN.bersedia });
  const hintDiri = 'Sebatas yang diizinkan diketahui oleh panitia dan kandidat jodoh nantinya.';
  const penghasilan = ik(g)
    ? { k: 'penghasilan', label: 'Income/pemasukan bulanan (rupiah)', t: 'number' }
    : { k: 'penghasilan', label: 'Perkiraan kebutuhan nafkah Anda (rupiah)', t: 'number' };
  // Urutan dan wajib-tidaknya pertanyaan mengikuti Google Form masing-masing, dibagi tiga langkah.
  // Ikhwan: income setelah pekerjaan, ormas wajib, kekurangan opsional.
  // Akhwat: kebutuhan nafkah setelah "tinggal bersama suami", ormas opsional, kekurangan wajib.
  return [
    {
      judul: 'Data diri', desk: 'Informasi dasar yang menjadi inti CV Anda.',
      bidang: [
        { k: 'untuk', label: 'Mendaftar untuk sendiri atau orang lain?', t: 'select', opsi: PILIHAN.untuk },
        { k: 'nama', label: 'Nama lengkap sesuai KTP, bukan kunyah', t: 'text', hint: 'Hanya dilihat admin.' },
        { k: 'wa', label: 'Nomor WhatsApp yang bisa dihubungi', t: 'tel', hint: 'Hanya dilihat admin.' },
        { k: 'tglLahir', label: 'Tanggal lahir', t: 'date', half: true },
        { k: 'berat', label: 'Berat badan (kg)', t: 'number', half: true },
        { k: 'tinggi', label: 'Tinggi badan (cm)', t: 'number', half: true },
        { k: 'suku', label: 'Suku', t: 'text', half: true },
        { k: 'status', label: 'Status', t: 'select', opsi: ik(g) ? PILIHAN.statusIkhwan : PILIHAN.statusAkhwat },
        { k: 'domAsal', label: 'Domisili asal', t: 'text', half: true },
        { k: 'domSekarang', label: 'Domisili sekarang', t: 'text', half: true },
      ],
    },
    {
      judul: 'Pendidikan dan tentang diri', desk: 'Pendidikan, pekerjaan, dan gambaran diri. Tulis sebatas yang boleh diketahui panitia dan kandidat jodoh.',
      bidang: [
        { k: 'pendidikan', label: 'Pendidikan', t: 'select', opsi: ik(g) ? PILIHAN.pendidikanIkhwan : PILIHAN.pendidikanAkhwat, half: true },
        { k: 'pekerjaan', label: 'Pekerjaan/kegiatan', t: 'text', half: true },
        ...(ik(g) ? [penghasilan] : []),
        { k: 'izin', label: 'Izin menikah dari orangtua/wali', t: 'select', opsi: PILIHAN.izin },
        { k: 'ciri', label: 'Ciri fisik', t: 'area', hint: hintDiri },
        { k: 'unggul', label: 'Keunggulan diri Anda', t: 'area', hint: hintDiri },
        { k: 'kurang', label: 'Kekurangan diri Anda', t: 'area', optional: ik(g), hint: hintDiri },
      ],
    },
    {
      judul: 'Keagamaan dan kriteria', desk: 'Kegiatan keagamaan, kesediaan, dan kriteria pasangan.',
      bidang: [
        { k: 'kegiatan', label: 'Dimanakah Anda sering mengikuti kegiatan keagamaan (pengajian dan lainnya)?', t: 'text' },
        { k: 'ormas', label: 'Apakah Anda mengikuti ormas tertentu?', t: 'text', optional: !ik(g) },
        { k: 'ustadz', label: 'Nama ustadz favorit atau yang sering Anda ikuti ceramah/kajiannya', t: 'area' },
        ...(ik(g)
          ? [bersedia('bedaPulau', 'Bersedia menikah beda pulau/provinsi/kabupaten?')]
          : [bersedia('bedaPulau', 'Bersedia menikah beda pulau?'), bersedia('bedaProv', 'Bersedia menikah beda provinsi?'), bersedia('bedaKab', 'Bersedia menikah beda kabupaten?')]),
        { k: 'tinggal', label: `Setelah menikah, apakah bersedia ikut tinggal bersama ${istri}?`, t: 'text' },
        ...(ik(g) ? [] : [penghasilan]),
        { k: 'pasangan', label: `Apakah kandidat calon ${istri} harus lajang (belum menikah)?`, t: 'check', opsi: ik(g) ? PILIHAN.pasanganIkhwan : PILIHAN.pasanganAkhwat, lainnya: true, hint: 'Boleh dipilih lebih dari satu.' },
        { k: 'kriteria', label: `Kriteria ${istri} yang Anda perlukan`, t: 'area', hint: ik(g) ? 'Ciri fisik, keagamaan, ekonomi, dan lainnya.' : 'Ciri fisik, keagamaan, pendidikan, ekonomi, dan lainnya.' },
      ],
    },
  ];
}

// Baris profil publik, urutan sama dengan tampilan yang diminta.
// Hanya informasi ini yang dikirim backend ke halaman publik.
export function barisProfil(p) {
  const ik_ = ik(p.gender);
  const istri = ik_ ? 'Istri' : 'Suami';
  const rp = (v) => (/^\d+$/.test(String(v).trim()) ? 'Rp ' + Number(v).toLocaleString('id-ID') : v);
  const beda = ik_
    ? [['Bersedia menikah beda pulau/provinsi/kabupaten', p.bedaPulau]]
    : [['Bersedia menikah beda pulau', p.bedaPulau], ['Bersedia menikah beda provinsi', p.bedaProv], ['Bersedia menikah beda kabupaten', p.bedaKab]];
  const r = [
    ['No ID', p.id],
    ['Status pernikahan', p.status],
    ['Usia', p.usia === '' ? '' : `${p.usia}`.replace('.', ',') + ' tahun'],
    ['Suku', p.suku],
    ['Domisili sekarang', p.domSekarang],
    ['Tinggi badan', p.tinggi && `${p.tinggi} cm`],
    ['Berat badan', p.berat && `${p.berat} kg`],
    ['Pendidikan', p.pendidikan],
    ['Ciri fisik', p.ciri],
    ['Pekerjaan', p.pekerjaan],
    [ik_ ? 'Income' : 'Kebutuhan nafkah', rp(p.penghasilan)],
    ...beda,
    ['Keunggulan', p.unggul],
    ['Kekurangan', p.kurang],
    ['Kegiatan keagamaan', p.kegiatan],
    ['Ustadz favorit', p.ustadz],
    ['Ormas', p.ormas],
    ['Status kandidat pasangan', p.pasangan],
    [`Kriteria calon ${istri.toLowerCase()}`, p.kriteria],
  ];
  return r.filter(([, v]) => v !== '' && v != null && v !== false);
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { PENDIDIKAN, STATUS_NIKAH, SITE } from '../../lib/site';
import { Field, Alert } from '../../components/ui';
import { Upload, Check } from '../../components/Icons';

const LANGKAH = [
  ['Data diri', 'Informasi dasar yang menjadi inti CV Anda.'],
  ['Pendidikan dan agama', 'Gambaran ilmu, pekerjaan, dan pemahaman agama Anda.'],
  ['Wali dan kriteria', 'Wali mendampingi proses. Kontak hanya dilihat admin.'],
];
const WAJIB = [
  ['nama', 'gender', 'tglLahir', 'tinggi', 'domisili'],
  ['pendidikan', 'pekerjaan', 'pemahaman', 'visi'],
  ['kriteria', 'wali', 'waliWa', 'wa'],
];
const AWAL = {
  nama: '', gender: '', tglLahir: '', tinggi: '', domisili: '', statusNikah: 'Lajang', jmlAnak: '0',
  pendidikan: '', pekerjaan: '', hafalan: '', pemahaman: '', visi: '',
  kriteria: '', wali: '', waliWa: '', wa: '', email: '', website: '', setuju: false,
};

// Perkecil foto di browser agar upload ringan di koneksi lambat.
async function kompres(file) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8).split(',')[1];
}

export default function Daftar() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(AWAL);
  const [foto, setFoto] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [kode, setKode] = useState('');
  const [salin, setSalin] = useState(false);

  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  function lanjut() {
    if (WAJIB[step].some((k) => !String(f[k]).trim())) return setErr('Lengkapi semua kolom yang bertanda bintang (*).');
    setErr(''); setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function pilihFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('File harus berupa gambar.');
    try { setFoto({ data: await kompres(file), nama: file.name }); setErr(''); }
    catch { setErr('Foto tidak dapat dibaca. Coba foto lain.'); }
  }

  async function kirim() {
    if (WAJIB[2].some((k) => !String(f[k]).trim())) return setErr('Lengkapi semua kolom yang bertanda bintang (*).');
    if (!foto) return setErr('Unggah foto untuk verifikasi admin.');
    if (!f.setuju) return setErr('Centang persetujuan sebelum mengirim.');
    setBusy(true); setErr('');
    try { setKode((await api('register', { ...f, foto: { data: foto.data } })).id); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function salinKode() {
    try { await navigator.clipboard.writeText(kode); setSalin(true); setTimeout(() => setSalin(false), 2000); } catch {}
  }

  if (kode) {
    return (
      <div className="mx-auto max-w-lg px-5 pb-24 pt-36 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-linear-to-b from-gold-200 to-gold-400 text-jade-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"><Check className="h-8 w-8" /></span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.035em]">Pendaftaran terkirim</h1>
        <p className="mt-3 text-muted">Simpan kode peserta Anda. Kode ini diperlukan saat mengajukan ta’aruf.</p>
        <div className="panel mx-auto mt-8 px-8 py-7 ring-1 ring-gold-400/40">
          <p className="text-4xl font-semibold tracking-[0.08em] text-jade-900">{kode}</p>
          <button onClick={salinKode} className="btn-ghost mt-5 !h-10">{salin ? 'Tersalin' : 'Salin kode'}</button>
        </div>
        <p className="mt-8 text-sm leading-relaxed text-muted">
          Admin akan memverifikasi data Anda dalam 1 sampai 3 hari kerja. Pertanyaan? Hubungi admin lewat{' '}
          <a className="font-semibold text-jade-800 underline underline-offset-2" href={`https://wa.me/${SITE.waAdmin}?text=${encodeURIComponent('Assalamualaikum, kode peserta saya ' + kode)}`}>WhatsApp</a>.
        </p>
        <Link href="/" className="btn-primary mt-8">Kembali ke beranda</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">CV ta’aruf</h1>
      <p className="mt-3 text-lg text-muted">Isi dengan jujur. Nama lengkap, foto, dan kontak tidak ditampilkan ke publik.</p>

      <ol className="mt-10 grid grid-cols-3 gap-2" aria-label="Langkah pendaftaran">
        {LANGKAH.map(([l], i) => (
          <li key={l}>
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-linear-to-r from-gold-400 to-gold-300' : 'bg-black/10'}`} />
            <p className={`mt-2 text-xs sm:text-sm ${i === step ? 'font-semibold text-ink' : 'text-muted'}`}>{l}</p>
          </li>
        ))}
      </ol>

      <div className="panel mt-6 p-6 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{LANGKAH[step][0]}</h2>
        <p className="mt-1 text-[15px] text-muted">{LANGKAH[step][1]}</p>

        <div className="mt-8 space-y-6">
          {step === 0 && (<>
            <Field label="Nama lengkap *"><input className="field" autoComplete="name" {...bind('nama')} /></Field>
            <div>
              <span className="mb-2 block text-[13px] font-medium text-ink/80">Jenis kelamin *</span>
              <div className="grid grid-cols-2 gap-3">
                {['Ikhwan', 'Akhwat'].map((g) => (
                  <button type="button" key={g} onClick={() => setF({ ...f, gender: g })} aria-pressed={f.gender === g}
                    className={`h-14 rounded-2xl text-[15px] font-medium transition-all ${f.gender === g ? 'bg-linear-to-b from-jade-700 to-jade-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_8px_20px_-8px_rgba(7,58,51,.7)]' : 'bg-white ring-1 ring-black/10 hover:ring-jade-700'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Tanggal lahir *"><input type="date" className="field" {...bind('tglLahir')} /></Field>
              <Field label="Tinggi badan (cm) *"><input type="number" inputMode="numeric" min="120" max="220" className="field" {...bind('tinggi')} /></Field>
            </div>
            <Field label="Domisili (kota) *"><input className="field" placeholder="Contoh: Balikpapan" {...bind('domisili')} /></Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Status pernikahan *"><select className="field" {...bind('statusNikah')}>{STATUS_NIKAH.map((s) => <option key={s}>{s}</option>)}</select></Field>
              {f.statusNikah !== 'Lajang' && <Field label="Jumlah anak"><input type="number" min="0" max="20" className="field" {...bind('jmlAnak')} /></Field>}
            </div>
          </>)}

          {step === 1 && (<>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Pendidikan terakhir *"><select className="field" {...bind('pendidikan')}><option value="">Pilih</option>{PENDIDIKAN.map((p) => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Pekerjaan *"><input className="field" {...bind('pekerjaan')} /></Field>
            </div>
            <Field label="Hafalan Al-Qur’an"><input className="field" placeholder="Contoh: 3 juz" {...bind('hafalan')} /></Field>
            <Field label="Pemahaman dan kajian agama *" hint="Kajian yang diikuti, ustaz rujukan, dan pengamalan ibadah harian."><textarea rows={4} maxLength={600} className="field-area" {...bind('pemahaman')} /></Field>
            <Field label="Visi pernikahan *" hint="Gambaran rumah tangga yang Anda cita-citakan."><textarea rows={4} maxLength={800} className="field-area" {...bind('visi')} /></Field>
          </>)}

          {step === 2 && (<>
            <Field label="Kriteria pasangan *"><textarea rows={4} maxLength={800} className="field-area" {...bind('kriteria')} /></Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nama wali *"><input className="field" {...bind('wali')} /></Field>
              <Field label="WhatsApp wali *"><input type="tel" inputMode="tel" className="field" {...bind('waliWa')} /></Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="WhatsApp Anda *"><input type="tel" inputMode="tel" className="field" autoComplete="tel" {...bind('wa')} /></Field>
              <Field label="Email"><input type="email" className="field" autoComplete="email" {...bind('email')} /></Field>
            </div>

            <div>
              <span className="mb-2 block text-[13px] font-medium text-ink/80">Foto untuk verifikasi *</span>
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-gold-500/50 bg-gold-200/20 p-5 transition-colors hover:bg-gold-200/40">
                {foto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`data:image/jpeg;base64,${foto.data}`} alt="Pratinjau foto" className="h-16 w-16 rounded-full object-cover ring-2 ring-gold-400" />
                  : <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-gold-700 ring-1 ring-gold-400/40"><Upload className="h-6 w-6" /></span>}
                <span className="text-sm">
                  <span className="block font-medium">{foto ? 'Foto siap diunggah. Ketuk untuk mengganti.' : 'Pilih foto'}</span>
                  <span className="mt-0.5 block text-muted">Hanya dilihat admin. Wajah jelas, berpakaian syar’i.</span>
                </span>
                <input type="file" accept="image/*" onChange={pilihFoto} className="sr-only" />
              </label>
            </div>

            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...bind('website')} />
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={f.setuju} onChange={(e) => setF({ ...f, setuju: e.target.checked })} className="mt-1 h-4 w-4 accent-jade-800" />
              <span>Data yang saya isi benar, dan saya bersedia menjalani proses ta’aruf melalui admin dan didampingi wali.</span>
            </label>
          </>)}

          {err && <Alert>{err}</Alert>}

          <div className="flex items-center justify-between pt-2">
            {step > 0 ? <button type="button" className="btn-ghost" onClick={() => { setErr(''); setStep(step - 1); }}>Kembali</button> : <span />}
            {step < 2
              ? <button type="button" className="btn-primary" onClick={lanjut}>Lanjut</button>
              : <button type="button" className="btn-gold" disabled={busy} onClick={kirim}>{busy ? 'Mengirim…' : 'Kirim pendaftaran'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

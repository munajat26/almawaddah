'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { langkahForm } from '../../lib/profil';
import { SITE } from '../../lib/site';
import { Field, Alert } from '../../components/ui';
import { Check } from '../../components/Icons';

const AWAL = { gender: '', pasangan: [], website: '', setuju: false };
const DRAFT = 'bj_draft';

// Satu bidang isian sesuai tipenya (lihat lib/profil.js).
function Isian({ b, f, setF, bind }) {
  const label = b.label + (b.optional ? '' : ' *');
  if (b.t === 'select') {
    return (
      <Field label={label} hint={b.hint}>
        <select className="field" {...bind(b.k)}><option value="">Pilih</option>{b.opsi.map((o) => <option key={o}>{o}</option>)}</select>
      </Field>
    );
  }
  if (b.t === 'area') return <Field label={label} hint={b.hint}><textarea rows={3} maxLength={800} className="field-area" {...bind(b.k)} /></Field>;
  if (b.t === 'check') {
    const v = f[b.k] || [];
    const toggle = (o) => setF({ ...f, [b.k]: v.includes(o) ? v.filter((x) => x !== o) : [...v, o] });
    return (
      <fieldset>
        <legend className="mb-2 block text-[13px] font-medium text-ink/80">{label}</legend>
        <div className="space-y-2.5">
          {b.opsi.map((o) => (
            <label key={o} className="flex min-h-11 items-center gap-3 text-[15px]">
              <input type="checkbox" checked={v.includes(o)} onChange={() => toggle(o)} className="h-5 w-5 shrink-0 accent-jade-800" />{o}
            </label>
          ))}
        </div>
        {b.lainnya && (
          <input type="text" maxLength={100} className="field mt-3" placeholder="Lainnya (isi sendiri, opsional)" aria-label="Lainnya"
            value={f[b.k + 'Lain'] ?? ''} onChange={(e) => setF({ ...f, [b.k + 'Lain']: e.target.value })} />
        )}
        {b.hint && <span className="mt-2 block text-xs text-muted">{b.hint}</span>}
      </fieldset>
    );
  }
  const tipe = { number: 'number', date: 'date', tel: 'tel' }[b.t] || 'text';
  return (
    <Field label={label} hint={b.hint}>
      <input type={tipe} inputMode={b.t === 'number' ? 'numeric' : b.t === 'tel' ? 'tel' : undefined} min={b.t === 'number' ? 0 : undefined} className="field" {...bind(b.k)} />
    </Field>
  );
}

export default function Daftar() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(AWAL);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [kode, setKode] = useState('');
  const [salin, setSalin] = useState(false);
  const [siap, setSiap] = useState(false);

  // Draf formulir disimpan di sessionStorage: pindah halaman atau menekan Kembali
  // di tengah pengisian tidak menghapus isian. Draf hilang saat tab ditutup atau setelah terkirim.
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT) || 'null');
      if (d?.f) { setF({ ...AWAL, ...d.f, website: '' }); setStep(Math.min(Number(d.step) || 0, 2)); }
    } catch {}
    setSiap(true);
  }, []);
  useEffect(() => {
    if (!siap || kode) return;
    try { sessionStorage.setItem(DRAFT, JSON.stringify({ f, step })); } catch {}
  }, [f, step, siap, kode]);

  const LANGKAH = langkahForm(f.gender || 'Ikhwan');
  const jumlah = LANGKAH.length;
  const bind = (k) => ({ value: f[k] ?? '', onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  // Kolom yang belum diisi pada langkah tertentu (kecuali yang opsional).
  const kurang = (i) => LANGKAH[i].bidang.filter((b) => !b.optional && (b.t === 'check' ? !(f[b.k] || []).length && !String(f[b.k + 'Lain'] ?? '').trim() : !String(f[b.k] ?? '').trim()));
  const pesanKurang = (i) => `Lengkapi: ${kurang(i).map((b) => b.label.replace(/\?$/, '')).slice(0, 3).join(', ')}${kurang(i).length > 3 ? ', dan lainnya' : ''}.`;

  function lanjut() {
    if (step === 0 && !f.gender) return setErr('Pilih jenis kelamin terlebih dahulu.');
    if (kurang(step).length) return setErr(pesanKurang(step));
    setErr(''); setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function kirim() {
    for (let i = 0; i < jumlah; i++) if (kurang(i).length) { setStep(i); return setErr(pesanKurang(i)); }
    if (!f.setuju) return setErr('Centang persetujuan sebelum mengirim.');
    setBusy(true); setErr('');
    try { setKode((await api('register', { ...f, pasangan: [...(f.pasangan || []), (f.pasanganLain || '').trim()].filter(Boolean) })).id); try { sessionStorage.removeItem(DRAFT); } catch {} }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function salinKode() {
    try { await navigator.clipboard.writeText(kode); setSalin(true); setTimeout(() => setSalin(false), 2000); } catch {}
  }

  if (kode) {
    return (
      <div className="mx-auto max-w-lg px-5 pb-16 pt-28 text-center md:pb-24 md:pt-36">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-linear-to-b from-gold-200 to-gold-400 text-jade-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"><Check className="h-8 w-8" /></span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Pendaftaran terkirim</h1>
        <p className="mt-3 text-muted">Simpan kode peserta Anda. Kode ini diperlukan saat mengajukan ta’aruf.</p>
        <div className="panel mx-auto mt-8 px-6 py-7 ring-1 ring-gold-400/40 sm:px-8">
          <p className="text-3xl font-semibold tracking-[0.08em] text-brand-strong">{kode}</p>
          <button onClick={salinKode} className="btn-ghost mt-5 !h-10">{salin ? 'Tersalin' : 'Salin kode'}</button>
        </div>
        <p className="mt-8 text-sm leading-relaxed text-muted">
          Admin akan memverifikasi data Anda dalam 1 sampai 3 hari kerja. Pertanyaan? Hubungi admin lewat{' '}
          <a className="font-semibold text-brand underline underline-offset-2" href={`https://wa.me/${SITE.waAdmin}?text=${encodeURIComponent('Assalamualaikum, kode peserta saya ' + kode)}`}>WhatsApp</a>.
        </p>
        <Link href="/" className="btn-primary mt-8">Kembali ke beranda</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-36 pt-24 md:pb-24 md:pt-32">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">CV ta’aruf</h1>
      <p className="mt-3 text-base text-muted sm:text-lg">Isi dengan jujur. Nama lengkap dan nomor WhatsApp tidak ditampilkan ke publik.</p>

      <ol className="mt-8 grid grid-cols-3 gap-2 md:mt-10" aria-label="Langkah pendaftaran">
        {LANGKAH.map(({ judul: l }, i) => (
          <li key={l}>
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-linear-to-r from-gold-400 to-gold-300' : 'bg-ink/10'}`} />
            <p className={`mt-2 text-xs sm:text-sm ${i === step ? 'font-semibold text-ink' : 'text-muted'}`}>{l}</p>
          </li>
        ))}
      </ol>

      <div className="panel mt-6 p-5 sm:p-10">
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{LANGKAH[step].judul}</h2>
        <p className="mt-1 text-[15px] text-muted">{LANGKAH[step].desk}</p>

        <div className="mt-6 space-y-6 sm:mt-8">
          {step === 0 && (
            <div>
              <span className="mb-2 block text-[13px] font-medium text-ink/80">Jenis kelamin *</span>
              <div className="grid grid-cols-2 gap-3">
                {['Ikhwan', 'Akhwat'].map((g) => (
                  <button type="button" key={g} onClick={() => g !== f.gender && setF({ ...AWAL, gender: g })} aria-pressed={f.gender === g}
                    className={`h-14 rounded-2xl text-base sm:text-[15px] font-medium transition-all ${f.gender === g ? 'bg-linear-to-b from-jade-700 to-jade-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_8px_20px_-8px_rgba(7,58,51,.7)]' : 'bg-surface ring-1 ring-ink/15 hover:ring-jade-700'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(step > 0 || f.gender) && (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              {LANGKAH[step].bidang.map((b) => (
                <div key={b.k} className={b.half ? '' : 'sm:col-span-2'}>
                  <Isian b={b} f={f} setF={setF} bind={bind} />
                </div>
              ))}
            </div>
          )}

          {step === jumlah - 1 && (<>
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...bind('website')} />
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={f.setuju} onChange={(e) => setF({ ...f, setuju: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-jade-800" />
              <span>Data yang saya isi benar, dan saya bersedia menjalani proses ta’aruf melalui admin dan didampingi wali.</span>
            </label>
          </>)}

          {err && <Alert>{err}</Alert>}

          {/* Bilah aksi menempel di dasar layar pada ponsel agar tombol selalu terjangkau ibu jari */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-hair bg-surface/90 px-5 pt-3 backdrop-blur-xl md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:pt-2 md:backdrop-blur-none"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
            {step > 0 ? <button type="button" className="btn-ghost" onClick={() => { setErr(''); setStep(step - 1); window.scrollTo({ top: 0 }); }}>Kembali</button> : <span />}
            {step < jumlah - 1
              ? <button type="button" className="btn-primary flex-1 md:flex-none" onClick={lanjut}>Lanjut</button>
              : <button type="button" className="btn-gold flex-1 md:flex-none" disabled={busy} onClick={kirim}>{busy ? 'Mengirim…' : 'Kirim pendaftaran'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

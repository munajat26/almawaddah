'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Alert, Field, Monogram } from '../../../components/ui';

function Blok({ judul, children }) {
  return (
    <section className="border-t border-hair py-7">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-jade-900">{judul}</h2>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{children}</p>
    </section>
  );
}

export default function Detail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [dari, setDari] = useState('');
  const [pesan, setPesan] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [fErr, setFErr] = useState('');

  useEffect(() => { api('get', { id }).then(setP).catch((e) => setErr(e.message)); }, [id]);

  async function ajukan(e) {
    e.preventDefault();
    setBusy(true); setFErr('');
    try { await api('taaruf', { dari, kepada: id, pesan }); setOk(true); }
    catch (x) { setFErr(x.message); }
    finally { setBusy(false); }
  }

  if (err) return <div className="mx-auto max-w-xl px-5 pb-24 pt-36"><Alert>{err}</Alert><Link href="/peserta" className="btn-ghost mt-6">Kembali ke daftar</Link></div>;
  if (!p) return <div className="mx-auto max-w-5xl px-5 pb-24 pt-36"><div className="h-96 animate-pulse rounded-[28px] bg-black/[0.05]" /></div>;

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 pb-24 pt-32 lg:grid-cols-[1.4fr_1fr]">
      <article>
        <Link href="/peserta" className="text-sm font-medium text-jade-800 hover:underline">Kembali ke daftar</Link>
        <div className="mt-6 flex items-center gap-5">
          <Monogram text={p.inisial} className="h-20 w-20 text-2xl" />
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">{p.inisial}, {p.usia} tahun</h1>
            <p className="mt-1 text-muted">{p.gender}, {p.domisili}</p>
          </div>
        </div>

        <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 text-sm sm:grid-cols-3">
          {[['Tinggi', `${p.tinggi} cm`], ['Pendidikan', p.pendidikan], ['Pekerjaan', p.pekerjaan], ['Status', p.statusNikah + (p.statusNikah !== 'Lajang' ? `, ${p.jmlAnak} anak` : '')], ['Hafalan', p.hafalan || 'Belum diisi']].map(([k, v]) => (
            <div key={k}><dt className="text-muted">{k}</dt><dd className="mt-1 text-[15px] font-medium">{v}</dd></div>
          ))}
        </dl>

        <div className="mt-9">
          <Blok judul="Pemahaman dan kajian agama">{p.pemahaman}</Blok>
          <Blok judul="Visi pernikahan">{p.visi}</Blok>
          <Blok judul="Kriteria pasangan">{p.kriteria}</Blok>
        </div>
      </article>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="glass rounded-[32px] p-7">
          {ok ? (
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Pengajuan terkirim</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">Admin akan menghubungi wali kedua pihak. Mohon bersabar menunggu kabar.</p>
            </div>
          ) : (
            <form onSubmit={ajukan} className="space-y-5">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Ajukan ta’aruf</h2>
              <p className="text-sm leading-relaxed text-muted">Hanya untuk peserta yang sudah disetujui. Pengajuan diteruskan oleh admin.</p>
              <Field label="Kode peserta Anda"><input required className="field uppercase" placeholder="BJ-XXXXXX" value={dari} onChange={(e) => setDari(e.target.value)} /></Field>
              <Field label="Pesan singkat" hint="Perkenalan diri dan alasan Anda tertarik. Maksimal 500 karakter.">
                <textarea required minLength={10} maxLength={500} rows={4} className="field-area" value={pesan} onChange={(e) => setPesan(e.target.value)} />
              </Field>
              {fErr && <Alert>{fErr}</Alert>}
              <button className="btn-primary w-full" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim pengajuan'}</button>
              <p className="text-center text-xs text-muted">Belum punya kode? <Link href="/daftar" className="font-semibold text-jade-800 underline underline-offset-2">Daftar dulu</Link></p>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

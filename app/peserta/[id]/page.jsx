'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { peekEntry, useQuery } from '../../../lib/cache';
import { Alert, Field, Siluet } from '../../../components/ui';
import { barisProfil } from '../../../lib/profil';

export default function Detail() {
  const { id } = useParams();
  // Bila daftar peserta sudah dimuat, profil langsung tampil dari cache tanpa menunggu jaringan.
  const { data: p, error, refresh } = useQuery(`p:${id}`, () => api('get', { id }), {
    ttl: 60000,
    seed: () => {
      const l = peekEntry('list');
      const hit = l?.data?.find((x) => x.id === id);
      return hit ? { data: hit, t: l.t } : null;
    },
  });
  const [dari, setDari] = useState('');
  const [pesan, setPesan] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [fErr, setFErr] = useState('');
  const [formTampak, setFormTampak] = useState(false);
  const formRef = useRef(null);

  // Tombol ajukan melayang di layar kecil sampai formulirnya sendiri terlihat.
  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setFormTampak(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [p]);

  async function ajukan(e) {
    e.preventDefault();
    setBusy(true); setFErr('');
    try { await api('taaruf', { dari, kepada: id, pesan }); setOk(true); }
    catch (x) { setFErr(x.message); }
    finally { setBusy(false); }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-16 pt-28 md:pt-36">
        <Alert>{error}</Alert>
        <div className="mt-6 flex gap-3">
          <button className="btn-ghost" onClick={refresh}>Coba lagi</button>
          <Link href="/peserta" className="btn-ghost">Kembali ke daftar</Link>
        </div>
      </div>
    );
  }
  if (!p) return <div className="mx-auto max-w-5xl px-5 pb-16 pt-28 md:pt-36"><div className="h-96 animate-pulse rounded-[28px] bg-ink/[0.05]" /></div>;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-24 md:pb-24 md:pt-32">
      {/* Header profil: menempel selama halaman digulir (induknya setinggi seluruh halaman, bukan hanya
          kolom artikel). Latarnya diperpanjang ke atas sampai ke tepi layar, jadi teks yang terangkat
          ke belakang navbar kaca ikut ter-blur dan tidak merusak tampilannya. */}
      <div className="sticky z-30 -mx-5 flex items-center justify-between gap-3 bg-pearl/70 px-5 pb-3 backdrop-blur-2xl"
        style={{
          top: 0,
          marginTop: 'calc(-4.25rem - env(safe-area-inset-top))',
          paddingTop: 'calc(4.25rem + env(safe-area-inset-top) + 0.75rem)',
        }}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Siluet gender={p.gender} className="h-12 w-12 sm:h-16 sm:w-16" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-[-0.03em] sm:text-3xl">{p.gender}</h1>
            <p className="font-mono text-xs text-muted sm:text-sm">No ID {p.id}</p>
          </div>
        </div>
        <Link href="/peserta" className="btn-ghost !h-11 shrink-0 !px-4 sm:!px-5" aria-label="Kembali ke daftar peserta">
          <span aria-hidden="true">←</span><span className="ml-1.5">Kembali<span className="hidden sm:inline"> ke daftar</span></span>
        </Link>
      </div>

      <div className="mt-4 grid gap-8 md:mt-5 md:gap-12 lg:grid-cols-[1.4fr_1fr]">
        <article>
          <dl className="panel divide-y divide-hair px-5 text-[15px] sm:px-8">
            {barisProfil(p).filter(([k]) => k !== 'No ID').map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <dt className="text-sm text-muted sm:text-[15px]">{k}</dt>
                <dd className="whitespace-pre-line font-medium leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </article>

        <aside id="ajukan" ref={formRef} className="scroll-mt-40 lg:sticky lg:top-44 lg:self-start">
          <div className="glass rounded-[28px] p-6 sm:rounded-[32px] sm:p-7">
            {ok ? (
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Pengajuan terkirim</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">Admin akan menghubungi wali kedua pihak. Mohon bersabar menunggu kabar.</p>
              </div>
            ) : (
              <form onSubmit={ajukan} className="space-y-5">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Ajukan ta’aruf</h2>
                <p className="text-sm leading-relaxed text-muted">Hanya untuk peserta yang sudah disetujui. Pengajuan diteruskan oleh admin.</p>
                <Field label="Kode peserta Anda"><input required autoCapitalize="characters" autoComplete="off" className="field uppercase" placeholder="IK-001 / AK-001" value={dari} onChange={(e) => setDari(e.target.value)} /></Field>
                <Field label="Pesan singkat" hint="Perkenalan diri dan alasan Anda tertarik. Maksimal 500 karakter.">
                  <textarea required minLength={10} maxLength={500} rows={4} className="field-area" value={pesan} onChange={(e) => setPesan(e.target.value)} />
                </Field>
                {fErr && <Alert>{fErr}</Alert>}
                <button className="btn-primary w-full" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim pengajuan'}</button>
                <p className="text-center text-xs text-muted">Belum punya kode? <Link href="/daftar" className="font-semibold text-brand underline underline-offset-2">Daftar dulu</Link></p>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* Tombol melayang di atas tab bar, hanya di layar kecil */}
      {!ok && !formTampak && (
        <div className="fade-in fixed inset-x-0 z-30 px-5 lg:hidden" style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}>
          <a href="#ajukan" className="btn-gold mx-auto w-full max-w-md !h-12 shadow-lift">Ajukan ta’aruf</a>
        </div>
      )}
    </div>
  );
}

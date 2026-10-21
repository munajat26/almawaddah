'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Alert, Monogram, Segmented } from '../../components/ui';
import { Search } from '../../components/Icons';

const TAB = [['', 'Semua'], ['Ikhwan', 'Ikhwan'], ['Akhwat', 'Akhwat']];

export default function Peserta() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [gender, setGender] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { api('list', {}).then(setData).catch((e) => setErr(e.message)); }, []);

  const tampil = useMemo(() => {
    if (!data) return [];
    const k = q.trim().toLowerCase();
    return data.filter((p) => (!gender || p.gender === gender) &&
      (!k || `${p.domisili} ${p.pekerjaan} ${p.pendidikan}`.toLowerCase().includes(k)));
  }, [data, gender, q]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Peserta ta’aruf</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Hanya profil yang sudah diverifikasi admin. Identitas lengkap dibuka setelah kedua pihak sepakat.</p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Segmented value={gender} onChange={setGender} options={TAB} />
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="field !pl-11" placeholder="Cari kota, pekerjaan, pendidikan" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari peserta" />
        </div>
      </div>

      <div className="mt-8">
        {err && <Alert>{err}</Alert>}
        {!data && !err && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-60 animate-pulse rounded-[28px] bg-ink/[0.05]" />)}
          </div>
        )}
        {data && tampil.length === 0 && (
          <div className="panel p-12 text-center">
            <p className="text-2xl font-semibold tracking-[-0.03em]">Belum ada profil yang cocok</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Ubah pencarian, atau daftarkan diri Anda agar profil Anda tampil di sini.</p>
            <Link href="/daftar" className="btn-primary mt-6">Daftar sebagai peserta</Link>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tampil.map((p) => (
            <Link key={p.id} href={`/peserta/${p.id}`} className="panel group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-4">
                <Monogram text={p.inisial} className="h-14 w-14 text-base" />
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em]">{p.inisial}, {p.usia} tahun</p>
                  <p className="text-sm text-muted">{p.gender}, {p.domisili}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-2.5 border-t border-hair pt-5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted">Pendidikan</dt><dd className="text-right font-medium">{p.pendidikan}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">Pekerjaan</dt><dd className="text-right font-medium">{p.pekerjaan}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">Status</dt><dd className="text-right font-medium">{p.statusNikah}</dd></div>
              </dl>
              <p className="mt-6 text-sm font-semibold text-gold-ink group-hover:underline">Baca selengkapnya</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

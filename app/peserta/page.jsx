'use client';
import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useQuery } from '../../lib/cache';
import { Alert, Segmented } from '../../components/ui';
import KartuPeserta from '../../components/KartuPeserta';
import Pagination from '../../components/Pagination';
import { Search } from '../../components/Icons';

const TAB = [['', 'Semua'], ['Ikhwan', 'Ikhwan'], ['Akhwat', 'Akhwat']];

// Layar sm (640px) ke atas = 10 peserta/halaman, di bawahnya 5 peserta/halaman.
const MQ = '(min-width: 640px)';
const langgan = (cb) => { const m = window.matchMedia(MQ); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); };
const layarLebar = () => window.matchMedia(MQ).matches;

// Filter dan halaman terakhir diingat selama sesi, supaya kembali dari halaman
// detail tidak melempar pengguna ke halaman 1 lagi.
let ingat = { gender: '', q: '', page: 1 };

export default function Peserta() {
  // Daftar disimpan di cache bersama: kembali dari halaman detail tampil seketika.
  const { data, error, refresh } = useQuery('list', () => api('list', {}), { ttl: 60000 });
  const [gender, setGenderState] = useState(ingat.gender);
  const [q, setQState] = useState(ingat.q);
  const [page, setPageState] = useState(ingat.page);
  const listRef = useRef(null);
  const perHal = useSyncExternalStore(langgan, layarLebar, () => false) ? 10 : 5;

  const setGender = (v) => { ingat = { ...ingat, gender: v, page: 1 }; setGenderState(v); setPageState(1); };
  const setQ = (v) => { ingat = { ...ingat, q: v, page: 1 }; setQState(v); setPageState(1); };
  const pindahHal = (n) => {
    ingat = { ...ingat, page: n }; setPageState(n);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tampil = useMemo(() => {
    if (!data) return [];
    const k = q.trim().toLowerCase();
    return data.filter((p) => (!gender || p.gender === gender) &&
      (!k || `${p.id} ${p.suku} ${p.domSekarang} ${p.pekerjaan} ${p.pendidikan} ${p.status}`.toLowerCase().includes(k)));
  }, [data, gender, q]);

  const totalHal = Math.max(1, Math.ceil(tampil.length / perHal));
  const hal = Math.min(page, totalHal); // aman bila ukuran layar/filter berubah
  const awal = (hal - 1) * perHal;
  const potong = tampil.slice(awal, awal + perHal);

  return (
    <div className="mx-auto max-w-none px-5 sm:px-8 lg:px-12 2xl:px-16 pb-16 pt-24 md:pb-24 md:pt-32">
      <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Peserta ta’aruf</h1>
      <p className="mb-6 mt-3 max-w-xl text-base text-muted sm:text-lg md:mb-8">Hanya profil yang sudah diverifikasi admin. Identitas lengkap dibuka setelah kedua pihak sepakat.</p>

      {/* Filter menempel selama daftar digulir. Latarnya diperpanjang ke atas sampai tepi layar, jadi teks yang
          terangkat ke belakang navbar kaca ikut ter-blur dan tidak merusak tampilannya. Margin atas negatif
          menggeser latar ke atas; jarak ke paragraf di atasnya dijaga oleh mb pada paragraf (margin menyatu). */}
      <div className="sticky z-30 -mx-5 sm:-mx-8 lg:-mx-12 2xl:-mx-16 flex flex-col gap-3 bg-pearl/70 px-5 sm:px-8 lg:px-12 2xl:px-16 pb-3 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between"
        style={{
          top: 0,
          marginTop: 'calc(-4.25rem - env(safe-area-inset-top))',
          paddingTop: 'calc(4.25rem + env(safe-area-inset-top) + 0.75rem)',
        }}>
        <Segmented value={gender} onChange={setGender} options={TAB} />
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" enterKeyHint="search" className="field !pl-11" placeholder="Cari kota, suku, pekerjaan" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari peserta" />
        </div>
      </div>

      <div ref={listRef} className="mt-4 scroll-mt-52 sm:scroll-mt-40">
        {error && (
          <div className="space-y-4">
            <Alert>{error}</Alert>
            <button className="btn-ghost" onClick={refresh}>Coba lagi</button>
          </div>
        )}
        {!data && !error && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4 min-[2400px]:grid-cols-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-60 animate-pulse rounded-[28px] bg-ink/[0.05]" />)}
          </div>
        )}
        {data && tampil.length === 0 && (
          <div className="panel p-8 text-center sm:p-12">
            <p className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Belum ada profil yang cocok</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Ubah pencarian, atau daftarkan diri Anda agar profil Anda tampil di sini.</p>
            <Link href="/daftar" className="btn-primary mt-6">Daftar sebagai peserta</Link>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4 min-[2400px]:grid-cols-5">
          {potong.map((p) => <KartuPeserta key={p.id} p={p} href={`/peserta/${p.id}`} />)}
        </div>
        {tampil.length > 0 && (
          <p className="mt-6 text-center text-sm text-muted">Menampilkan {awal + 1} sampai {awal + potong.length} dari {tampil.length} peserta</p>
        )}
        <Pagination page={hal} total={totalHal} onChange={pindahHal} />
      </div>
    </div>
  );
}

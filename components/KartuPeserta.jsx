import Link from 'next/link';
import { Siluet } from './ui';

// Kartu ringkas profil publik. Dipakai di daftar peserta (dengan href) dan
// sebagai contoh di beranda (tanpa href), supaya tampilannya selalu sama.
export function barisKartu(p) {
  return [
    ['Status', p.status],
    ['Usia', p.usia === '' ? '' : `${p.usia}`.replace('.', ',') + ' tahun'],
    ['Suku', p.suku],
    ['Domisili', p.domSekarang],
    ['Tinggi/berat', p.tinggi && p.berat ? `${p.tinggi} cm / ${p.berat} kg` : ''],
    ['Pendidikan', p.pendidikan],
    ['Pekerjaan', p.pekerjaan],
  ].filter(([, v]) => v);
}

export default function KartuPeserta({ p, href }) {
  const isi = (
    <>
      <div className="flex items-center gap-4">
        <Siluet gender={p.gender} className="h-14 w-14" />
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em]">{p.gender}</p>
          <p className="font-mono text-xs text-muted">No ID {p.id}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-2.5 border-t border-hair pt-5 text-sm">
        {barisKartu(p).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><dt className="shrink-0 text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-5 text-sm font-semibold text-gold-ink group-hover:underline">Lihat profil lengkap</p>
    </>
  );
  const cls = 'panel group block p-6 sm:p-7';
  return href
    ? <Link href={href} className={`${cls} transition-all duration-300 active:scale-[0.99] md:hover:-translate-y-1 md:hover:shadow-lift`}>{isi}</Link>
    : <div className={cls}>{isi}</div>;
}

import Link from 'next/link';
import Logo from './Logo';
import { SITE } from '../lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-hair bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-lg font-semibold tracking-[-0.02em] text-brand-strong">{SITE.nama}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{SITE.deskripsi}</p>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm md:flex md:gap-12">
          <ul className="space-y-2.5">
            <li className="font-semibold text-ink">Jelajahi</li>
            <li><Link href="/peserta" className="inline-block py-1 text-muted hover:text-ink">Peserta</Link></li>
            <li><Link href="/daftar" className="inline-block py-1 text-muted hover:text-ink">Daftar</Link></li>
          </ul>
          <ul className="space-y-2.5">
            <li className="font-semibold text-ink">Bantuan</li>
            <li><a href={`https://wa.me/${SITE.waAdmin}`} className="inline-block py-1 text-muted hover:text-ink">WhatsApp admin</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-hair px-5 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.nama}. Data peserta hanya dibagikan atas persetujuan kedua pihak dan wali.
      </div>
    </footer>
  );
}

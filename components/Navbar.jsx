import Link from 'next/link';
import Logo from './Logo';
import { SITE } from '../lib/site';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3">
      <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pl-3 pr-2">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-jade-950">{SITE.nama}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/peserta" className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 hover:bg-black/5">Peserta</Link>
          <Link href="/daftar" className="btn-primary !h-10 !px-5">Daftar</Link>
        </nav>
      </div>
    </header>
  );
}

import Link from 'next/link';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { Lock } from './Icons';
import { SITE } from '../lib/site';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 z-40 px-3" style={{ top: 'calc(0.5rem + env(safe-area-inset-top))' }}>
      <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full pl-3 pr-2">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-brand-strong">{SITE.nama}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/admin" aria-label="Panel admin" title="Panel admin" className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink/80 hover:bg-ink/5">
            <Lock className="h-4 w-4" /><span className="hidden md:inline">Admin</span>
          </Link>
          <Link href="/peserta" className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink/80 hover:bg-ink/5 md:block">Peserta</Link>
          <Link href="/daftar" className="btn-primary hidden !h-10 !px-5 md:inline-flex">Daftar</Link>
        </nav>
      </div>
    </header>
  );
}

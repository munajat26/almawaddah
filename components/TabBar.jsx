'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Plus, Chat } from './Icons';
import { SITE } from '../lib/site';

const TAB = [
  { href: '/', label: 'Beranda', Icon: Home, cocok: (p) => p === '/' },
  { href: '/peserta', label: 'Peserta', Icon: Users, cocok: (p) => p.startsWith('/peserta') },
  { href: '/daftar', label: 'Daftar', Icon: Plus, cocok: (p) => p.startsWith('/daftar') },
];

// Navigasi bawah ala aplikasi, hanya di layar kecil. Disembunyikan di halaman
// yang punya bilah aksi sendiri (formulir pendaftaran) dan panel admin.
export default function TabBar() {
  const path = usePathname() || '/';
  if (path.startsWith('/daftar') || path.startsWith('/admin')) return null;

  const cls = (aktif) => `flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${aktif ? 'text-brand' : 'text-muted'}`;
  return (
    <>
      <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-surface/85 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex h-16 max-w-md items-stretch">
          {TAB.map(({ href, label, Icon, cocok }) => {
            const aktif = cocok(path);
            return (
              <Link key={href} href={href} aria-current={aktif ? 'page' : undefined} className={cls(aktif)}>
                <Icon className={`h-6 w-6 ${aktif ? 'stroke-[2]' : ''}`} />
                {label}
              </Link>
            );
          })}
          <a href={`https://wa.me/${SITE.waAdmin}`} className={cls(false)}>
            <Chat className="h-6 w-6" />
            Admin
          </a>
        </div>
      </nav>
    </>
  );
}

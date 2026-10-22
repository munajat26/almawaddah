'use client';
import { useEffect, useState } from 'react';

// Ganti tema terang/gelap. Pilihan disimpan di localStorage; tanpa pilihan, mengikuti pengaturan perangkat.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      try { if (localStorage.getItem('theme')) return; } catch {}
      apply(e.matches, false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  function apply(next, save) {
    document.documentElement.classList.toggle('dark', next);
    const m = document.querySelector('meta[name="theme-color"]:not([media])') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    m.setAttribute('content', next ? '#150a0d' : '#e8edf4');
    if (save) { try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {} }
    setDark(next);
  }

  return (
    <button type="button" onClick={() => apply(!dark, true)} aria-label={dark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'} title={dark ? 'Mode terang' : 'Mode gelap'}
      className="grid h-11 w-11 place-items-center rounded-full text-ink/80 transition-colors hover:bg-ink/5">
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
}

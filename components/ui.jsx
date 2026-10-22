export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-relaxed text-muted">{hint}</span>}
    </label>
  );
}

export function Alert({ children, tone = 'error' }) {
  const c = tone === 'error' ? 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25' : 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25';
  return <div role="alert" className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${c}`}>{children}</div>;
}

// Avatar inisial dengan cincin emas
export function Monogram({ text, className = '' }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-ruby-700 to-ruby-950 font-semibold tracking-tight text-gold-200 ring-2 ring-gold-400/70 ring-offset-2 ring-offset-surface ${className}`}>
      {text}
    </div>
  );
}

// Avatar tanpa wajah, agar identitas peserta tetap terjaga.
// Gambar ada di public/avatar/ (ikhwan.jpg dan akhwat.jpg), bisa diganti kapan saja.
export function Siluet({ gender, className = '' }) {
  const ikhwan = gender === 'Ikhwan';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/avatar/${ikhwan ? 'ikhwan' : 'akhwat'}.jpg`}
      alt={`Avatar ${ikhwan ? 'ikhwan' : 'akhwat'}`}
      width={320} height={320} loading="lazy" draggable={false}
      className={`shrink-0 rounded-full bg-white object-cover ring-2 ring-gold-400/70 ring-offset-2 ring-offset-surface ${className}`}
    />
  );
}

// Kontrol segmen ala iOS/macOS
export function Segmented({ value, onChange, options }) {
  return (
    <div role="tablist" className="inline-flex max-w-full overflow-x-auto rounded-full bg-ink/[0.06] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map(([v, l]) => (
        <button key={l} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium md:py-1.5 transition-all ${value === v ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,.14)] dark:bg-white/15 dark:shadow-none' : 'text-muted hover:text-ink'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

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
  const c = tone === 'error' ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-jade-50 text-jade-900 ring-jade-100';
  return <div role="alert" className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${c}`}>{children}</div>;
}

// Avatar inisial dengan cincin emas
export function Monogram({ text, className = '' }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-linear-to-br from-jade-700 to-jade-950 font-semibold tracking-tight text-gold-200 ring-2 ring-gold-400/70 ring-offset-2 ring-offset-white ${className}`}>
      {text}
    </div>
  );
}

// Kontrol segmen ala iOS/macOS
export function Segmented({ value, onChange, options }) {
  return (
    <div role="tablist" className="inline-flex max-w-full overflow-x-auto rounded-full bg-black/[0.06] p-1">
      {options.map(([v, l]) => (
        <button key={l} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`shrink-0 rounded-full px-5 py-1.5 text-sm font-medium transition-all ${value === v ? 'bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,.14)]' : 'text-muted hover:text-ink'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

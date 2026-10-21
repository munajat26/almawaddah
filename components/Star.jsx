// Bintang delapan sudut (khatam): dua persegi bersilang ditambah lingkaran tengah.
export default function Star({ className = '', sw = 0.6 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" aria-hidden="true">
      <path d="M26 26H74V74H26Z" />
      <path d="M50 16.06L83.94 50L50 83.94L16.06 50Z" />
      <circle cx="50" cy="50" r="10" />
    </svg>
  );
}

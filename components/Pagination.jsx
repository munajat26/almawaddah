// Navigasi halaman. Di layar kecil: Sebelumnya / "Hal x dari y" / Berikutnya.
// Mulai layar sm ke atas: tombol angka dengan titik-titik (…) untuk rentang panjang.
function daftarHalaman(hal, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const s = new Set([1, total, hal - 1, hal, hal + 1]);
  if (hal <= 3) { s.add(2); s.add(3); s.add(4); }
  if (hal >= total - 2) { s.add(total - 1); s.add(total - 2); s.add(total - 3); }
  const urut = [...s].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  urut.forEach((n, i) => { if (i && n - urut[i - 1] > 1) out.push('…'); out.push(n); });
  return out;
}

export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  const nav = 'btn-ghost !h-11 !px-5';
  return (
    <nav aria-label="Halaman daftar peserta" className="mt-8 flex items-center justify-between gap-3 sm:justify-center">
      <button className={nav} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya">
        <span aria-hidden="true">←</span><span className="ml-1.5 sm:hidden">Sebelumnya</span>
      </button>

      <p className="text-sm font-medium text-muted sm:hidden" aria-live="polite">Hal {page} dari {total}</p>

      <ul className="hidden items-center gap-1.5 sm:flex">
        {daftarHalaman(page, total).map((n, i) => (
          <li key={`${n}-${i}`}>
            {n === '…' ? (
              <span className="grid h-10 w-8 place-items-center text-muted" aria-hidden="true">…</span>
            ) : (
              <button onClick={() => onChange(n)} aria-label={`Halaman ${n}`} aria-current={n === page ? 'page' : undefined}
                className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium transition-colors ${n === page ? 'bg-jade-800 text-white' : 'text-ink/80 hover:bg-ink/5'}`}>
                {n}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button className={nav} disabled={page >= total} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya">
        <span className="mr-1.5 sm:hidden">Berikutnya</span><span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

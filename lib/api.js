// Semua panggilan ke backend lewat route handler /api/gas
// supaya URL GAS dan API key tidak terlihat di browser.
export async function api(action, payload = {}) {
  const res = await fetch('/api/gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  let json;
  try { json = await res.json(); } catch { throw new Error('Server tidak merespons. Coba lagi sebentar.'); }
  if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan.');
  return json.data;
}

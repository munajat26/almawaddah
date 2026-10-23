export const maxDuration = 30;

const ACTIONS = new Set(['list', 'get', 'register', 'taaruf', 'adminLogin', 'adminList', 'adminUpdate', 'adminTaaruf', 'adminEdit', 'adminDelete']);

export async function POST(req) {
  const { GAS_URL, GAS_API_KEY } = process.env;
  if (!GAS_URL || !GAS_API_KEY) {
    return Response.json({ ok: false, error: 'Server belum dikonfigurasi (GAS_URL / GAS_API_KEY).' }, { status: 500 });
  }
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'Permintaan tidak valid.' }, { status: 400 }); }
  if (!ACTIONS.has(body.action)) {
    return Response.json({ ok: false, error: 'Aksi tidak dikenal.' }, { status: 400 });
  }
  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain agar GAS tidak memicu preflight
      body: JSON.stringify({ ...body, apiKey: GAS_API_KEY }),
      redirect: 'follow',
      cache: 'no-store',
    });
    const text = await r.text();
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json({ ok: false, error: 'Backend tidak dapat dihubungi. Coba lagi.' }, { status: 502 });
  }
}

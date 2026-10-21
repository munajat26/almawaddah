'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Alert, Segmented } from '../../components/ui';
import Logo from '../../components/Logo';

const ST_P = ['Menunggu', 'Disetujui', 'Ditolak', 'Menikah'];
const ST_T = ['Menunggu', 'Diproses', 'Diterima', 'Ditolak'];
const WARNA = {
  Menunggu: 'bg-amber-50 text-amber-800 ring-amber-200',
  Disetujui: 'bg-jade-50 text-jade-800 ring-jade-100',
  Diproses: 'bg-sky-50 text-sky-800 ring-sky-200',
  Diterima: 'bg-jade-50 text-jade-800 ring-jade-100',
  Ditolak: 'bg-rose-50 text-rose-800 ring-rose-200',
  Menikah: 'bg-gold-200/60 text-gold-700 ring-gold-400/40',
};
const Badge = ({ s }) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${WARNA[s] || ''}`}>{s}</span>;

export default function Admin() {
  const [token, setToken] = useState(null);
  const [pw, setPw] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('peserta');
  const [filter, setFilter] = useState('Menunggu');
  const [sel, setSel] = useState(null);
  const [foto, setFoto] = useState('');
  const [catatan, setCatatan] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const keluar = useCallback(() => { sessionStorage.removeItem('bj_token'); setToken(null); setData(null); }, []);
  const muat = useCallback(async (t) => {
    try { setData(await api('adminList', { token: t })); setErr(''); }
    catch (e) { setErr(e.message); if (/sesi/i.test(e.message)) keluar(); }
  }, [keluar]);

  useEffect(() => {
    const t = sessionStorage.getItem('bj_token');
    if (t) { setToken(t); muat(t); }
  }, [muat]);

  async function masuk(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await api('adminLogin', { password: pw });
      sessionStorage.setItem('bj_token', r.token); setToken(r.token); setPw(''); await muat(r.token);
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  async function ubah(action, id, status, cat) {
    setBusy(true);
    try { await api(action, { token, id, status, catatan: cat }); await muat(token); setSel(null); setFoto(''); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  async function buka(p) {
    setSel(p); setCatatan(p.catatanAdmin || ''); setFoto('');
    if (p.adaFoto) { try { setFoto((await api('adminPhoto', { token, id: p.id })).src); } catch (e) { setErr(e.message); } }
  }

  if (!token) {
    return (
      <div className="relative flex min-h-[80dvh] items-center justify-center px-5 pb-16 pt-28">
        <div className="pattern-gold fade-radial pointer-events-none absolute inset-0 opacity-[0.18]" />
        <form onSubmit={masuk} className="glass relative w-full max-w-sm rounded-[32px] p-8 text-center">
          <div className="flex justify-center"><Logo size={52} /></div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Panel admin</h1>
          <p className="mt-1 text-sm text-muted">Masukkan kata sandi untuk melanjutkan.</p>
          <input type="password" autoFocus placeholder="Kata sandi" aria-label="Kata sandi" className="field mt-6 text-center" value={pw} onChange={(e) => setPw(e.target.value)} />
          {err && <div className="mt-4 text-left"><Alert>{err}</Alert></div>}
          <button className="btn-primary mt-5 w-full" disabled={busy || !pw}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
        </form>
      </div>
    );
  }

  const peserta = data?.peserta || [];
  const taaruf = data?.taaruf || [];
  const nama = (id) => peserta.find((p) => p.id === id)?.nama || id;
  const hitung = (s) => peserta.filter((p) => p.status === s).length;
  const rows = peserta.filter((p) => !filter || p.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-[-0.04em]">Panel admin</h1>
        <div className="flex gap-2">
          <button className="btn-ghost !h-10" onClick={() => muat(token)}>Segarkan</button>
          <button className="btn-ghost !h-10" onClick={keluar}>Keluar</button>
        </div>
      </div>
      {err && <div className="mt-4"><Alert>{err}</Alert></div>}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[['Menunggu verifikasi', hitung('Menunggu')], ['Peserta aktif', hitung('Disetujui')], ['Ta’aruf berjalan', taaruf.filter((t) => t.status === 'Menunggu' || t.status === 'Diproses').length], ['Menikah', hitung('Menikah')]].map(([k, v]) => (
          <div key={k} className="panel p-6">
            <p className="text-4xl font-semibold tracking-[-0.04em] text-jade-900">{v}</p>
            <p className="mt-1 text-sm text-muted">{k}</p>
          </div>
        ))}
      </div>

      <div className="mt-10"><Segmented value={tab} onChange={setTab} options={[['peserta', 'Peserta'], ['taaruf', 'Pengajuan ta’aruf']]} /></div>

      {tab === 'peserta' && (<>
        <div className="mt-5"><Segmented value={filter} onChange={setFilter} options={[['', 'Semua'], ...ST_P.map((s) => [s, s])]} /></div>
        <div className="panel mt-5 overflow-x-auto">
          <table className="w-full min-w-[660px] text-left text-sm">
            <thead className="text-muted"><tr className="border-b border-hair">
              <th className="px-6 py-4 font-medium">Kode</th><th className="px-6 py-4 font-medium">Nama</th><th className="px-6 py-4 font-medium">Usia, kota</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4" />
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-hair last:border-0 hover:bg-jade-50/50">
                  <td className="px-6 py-4 font-mono text-xs text-muted">{p.id}</td>
                  <td className="px-6 py-4 font-medium">{p.nama} <span className="font-normal text-muted">({p.gender})</span></td>
                  <td className="px-6 py-4">{p.usia}, {p.domisili}</td>
                  <td className="px-6 py-4"><Badge s={p.status} /></td>
                  <td className="px-6 py-4 text-right"><button className="font-semibold text-jade-800 hover:underline" onClick={() => buka(p)}>Periksa</button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="p-10 text-center text-muted">Tidak ada data pada status ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </>)}

      {tab === 'taaruf' && (
        <div className="mt-5 space-y-4">
          {taaruf.length === 0 && <div className="panel p-10 text-center text-muted">Belum ada pengajuan ta’aruf.</div>}
          {[...taaruf].reverse().map((t) => (
            <div key={t.id} className="panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{nama(t.dari)} <span className="font-normal text-muted">mengajukan ke</span> {nama(t.kepada)}</p>
                <Badge s={t.status} />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{t.pesan}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {ST_T.filter((s) => s !== t.status).map((s) => (
                  <button key={s} disabled={busy} onClick={() => ubah('adminTaaruf', t.id, s)} className="btn-ghost !h-9 !px-4 !text-sm">{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-jade-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSel(null)}>
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-lift" onClick={(e) => e.stopPropagation()}>
            {/* Bilah jendela ala macOS: titik merah menutup jendela */}
            <div className="flex items-center gap-2 border-b border-hair px-5 py-3.5">
              <button onClick={() => setSel(null)} aria-label="Tutup" className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" aria-hidden="true" />
              <span className="ml-3 text-sm font-medium text-muted">{sel.id}</span>
            </div>
            <div className="p-7">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{sel.nama}</h2>
              <p className="text-sm text-muted">{sel.gender}, {sel.usia} tahun</p>
              {foto && <img src={foto} alt={`Foto ${sel.nama}`} className="mt-5 max-h-64 rounded-2xl object-cover" />}
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                {[['Domisili', sel.domisili], ['Tinggi', `${sel.tinggi} cm`], ['Pendidikan', sel.pendidikan], ['Pekerjaan', sel.pekerjaan], ['Status', sel.statusNikah], ['Hafalan', sel.hafalan || '-'], ['WhatsApp', sel.wa], ['Wali', `${sel.wali} (${sel.waliWa})`]].map(([k, v]) => (
                  <div key={k}><dt className="text-muted">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
                ))}
              </dl>
              {[['Pemahaman agama', sel.pemahaman], ['Visi pernikahan', sel.visi], ['Kriteria', sel.kriteria]].map(([k, v]) => (
                <div key={k} className="mt-5"><p className="text-sm text-muted">{k}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{v}</p></div>
              ))}
              <label className="mt-6 block"><span className="mb-2 block text-[13px] font-medium text-ink/80">Catatan admin</span>
                <textarea rows={2} className="field-area" value={catatan} onChange={(e) => setCatatan(e.target.value)} /></label>
              <div className="mt-6 flex flex-wrap gap-2">
                {ST_P.map((s) => (
                  <button key={s} disabled={busy || s === sel.status} onClick={() => ubah('adminUpdate', sel.id, s, catatan)}
                    className={s === 'Disetujui' ? 'btn-primary !h-10' : 'btn-ghost !h-10'}>
                    {s === 'Disetujui' ? 'Setujui' : s === 'Ditolak' ? 'Tolak' : s === 'Menikah' ? 'Tandai menikah' : 'Kembalikan ke menunggu'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

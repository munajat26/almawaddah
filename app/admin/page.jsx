'use client';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { invalidate, peek, setCache } from '../../lib/cache';
import { Alert, Segmented } from '../../components/ui';
import Logo from '../../components/Logo';
import Pagination from '../../components/Pagination';
import { Search } from '../../components/Icons';
import { barisProfil, langkahForm } from '../../lib/profil';
import { SITE } from '../../lib/site';

const ST_P = ['Menunggu', 'Disetujui', 'Ditolak', 'Menikah'];
const ST_T = ['Menunggu', 'Diproses', 'Diterima', 'Ditolak'];
const WARNA = {
  Menunggu: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25',
  Disetujui: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  Diproses: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25',
  Diterima: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25',
  Ditolak: 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25',
  Menikah: 'bg-gold-200/60 text-gold-ink ring-gold-400/40 dark:bg-gold-400/15',
};
const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${WARNA[s] || ''}`}>{s}</span>;

export default function Admin() {
  const [token, setToken] = useState(null);
  const [pw, setPw] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('peserta');
  const [filter, setFilter] = useState('Menunggu');
  const [sel, setSel] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [gen, setGen] = useState('');
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null); // salinan data peserta yang sedang diedit
  const [hapus, setHapus] = useState(false); // tahap konfirmasi hapus

  const keluar = useCallback(() => { sessionStorage.removeItem('bj_token'); invalidate('admin'); setToken(null); setData(null); }, []);
  const muat = useCallback(async (t) => {
    try { const d = await api('adminList', { token: t }); setCache('admin', d); setData(d); setErr(''); }
    catch (e) { setErr(e.message); if (/sesi/i.test(e.message)) keluar(); }
  }, [keluar]);

  useEffect(() => {
    const t = sessionStorage.getItem('bj_token');
    if (t) { setToken(t); const c = peek('admin'); if (c) setData(c); muat(t); } // data di memori tampil dulu, lalu disegarkan
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
    try { await api(action, { token, id, status, catatan: cat }); await muat(token); tutup(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  function buka(p) { setSel(p); setCatatan(p.catatan || ''); setEdit(null); setHapus(false); }
  function tutup() { setSel(null); setEdit(null); setHapus(false); }
  // Daftar bidang yang bisa diedit: sama dengan form pendaftaran, ditambah "salaf/mengaji".
  const bidangEdit = (g) => [...langkahForm(g).flatMap((l) => l.bidang), { k: 'salaf', label: 'Salaf/mengaji', t: 'text', half: true }];

  async function simpanEdit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const data = {};
      bidangEdit(sel.gender).forEach(({ k }) => { data[k] = edit[k] ?? ''; });
      await api('adminEdit', { token, id: sel.id, data });
      if (catatan !== (sel.catatan || '')) await api('adminUpdate', { token, id: sel.id, status: sel.verif, catatan });
      invalidate('list'); invalidate('p:');
      await muat(token); tutup();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  async function hapusPeserta() {
    setBusy(true); setErr('');
    try {
      await api('adminDelete', { token, id: sel.id });
      invalidate('list'); invalidate('p:');
      await muat(token); tutup();
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  const peserta = data?.peserta || [];
  const taaruf = data?.taaruf || [];
  const PER_HAL = 10;
  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    return peserta.filter((p) => (!filter || p.verif === filter) && (!gen || p.gender === gen) &&
      (!k || `${p.id} ${p.nama} ${p.wa} ${p.domSekarang} ${p.domAsal} ${p.suku} ${p.pekerjaan} ${p.pendidikan}`.toLowerCase().includes(k)));
  }, [peserta, filter, gen, q]);
  const totalHal = Math.max(1, Math.ceil(rows.length / PER_HAL));
  const hal = Math.min(page, totalHal);
  const awal = (hal - 1) * PER_HAL;
  const potong = rows.slice(awal, awal + PER_HAL);
  const ganti = (set) => (v) => { set(v); setPage(1); };

  if (!token) {
    return (
      <div className="relative flex min-h-[80dvh] items-center justify-center px-5 pb-16 pt-24 md:pt-28">
        <div className="pattern-gold fade-radial pointer-events-none absolute inset-0 opacity-[0.18]" />
        <form onSubmit={masuk} className="glass relative w-full max-w-sm rounded-[32px] p-6 text-center sm:p-8">
          <div className="flex justify-center"><Logo size={52} /></div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Panel admin</h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-ink">{SITE.nama} by {SITE.oleh}</p>
          <p className="mt-3 text-sm text-muted">Masukkan kata sandi untuk melanjutkan.</p>
          <input type="password" autoComplete="current-password" placeholder="Kata sandi" aria-label="Kata sandi" className="field mt-6 text-center" value={pw} onChange={(e) => setPw(e.target.value)} />
          {err && <div className="mt-4 text-left"><Alert>{err}</Alert></div>}
          <button className="btn-primary mt-5 w-full" disabled={busy || !pw}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
        </form>
      </div>
    );
  }

  const nama = (id) => peserta.find((p) => p.id === id)?.nama || id;
  const hitung = (s) => peserta.filter((p) => p.verif === s).length;

  return (
    <div className="mx-auto max-w-none px-4 pb-16 pt-20 sm:px-8 lg:px-12 2xl:px-16 md:pb-20 md:pt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Panel admin</h1>
          <span className="hidden text-sm text-muted sm:inline">{peserta.length} peserta terdata</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost !h-9 !px-4 !text-sm" onClick={() => muat(token)}>Segarkan</button>
          <button className="btn-ghost !h-9 !px-4 !text-sm" onClick={keluar}>Keluar</button>
        </div>
      </div>
      {err && !sel && <div className="mt-3"><Alert>{err}</Alert></div>}

      {/* Ringkasan: kartu bisa diklik untuk memfilter */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {[['Menunggu verifikasi', hitung('Menunggu'), 'Menunggu'], ['Peserta aktif', hitung('Disetujui'), 'Disetujui'], ['Ta’aruf berjalan', taaruf.filter((t) => t.status === 'Menunggu' || t.status === 'Diproses').length, null], ['Menikah', hitung('Menikah'), 'Menikah']].map(([k, v, f]) => (
          <button key={k} type="button" disabled={!f} onClick={() => { setTab('peserta'); ganti(setFilter)(f); }}
            className={`panel flex items-baseline justify-between gap-2 !rounded-2xl px-4 py-3 text-left ${f ? 'transition-transform active:scale-[0.99] md:hover:-translate-y-0.5' : 'cursor-default'} ${f && f === filter && tab === 'peserta' ? 'ring-2 ring-brand/50' : ''}`}>
            <span className="text-sm text-muted">{k}</span>
            <span className="text-2xl font-semibold tracking-[-0.03em] text-brand-strong">{v}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-hair pb-4">
        <Segmented value={tab} onChange={setTab} options={[['peserta', 'Peserta'], ['taaruf', 'Pengajuan ta’aruf']]} />
        {tab === 'peserta' && (
          <div className="relative min-w-[14rem] flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input type="search" enterKeyHint="search" className="field !h-10 !pl-10 !text-sm" placeholder="Cari kode, nama, WA, kota, suku" aria-label="Cari peserta"
              value={q} onChange={(e) => ganti(setQ)(e.target.value)} />
          </div>
        )}
      </div>

      {tab === 'peserta' && (<>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented value={filter} onChange={ganti(setFilter)} options={[['', `Semua ${peserta.length}`], ...ST_P.map((s) => [s, `${s} ${hitung(s)}`])]} />
          <Segmented value={gen} onChange={ganti(setGen)} options={[['', 'Semua'], ['Ikhwan', 'Ikhwan'], ['Akhwat', 'Akhwat']]} />
          {(q || filter !== 'Menunggu' || gen) && (
            <button className="text-sm font-semibold text-brand hover:underline" onClick={() => { setQ(''); setGen(''); setFilter('Menunggu'); setPage(1); }}>Atur ulang filter</button>
          )}
        </div>

        {/* Layar kecil: kartu ringkas */}
        <div className="mt-3 space-y-2 md:hidden">
          {potong.map((p) => (
            <button key={p.id} onClick={() => buka(p)} className="panel flex w-full items-center justify-between gap-3 !rounded-2xl px-4 py-3 text-left active:scale-[0.99]">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{p.nama} <span className="font-normal text-muted">({p.gender})</span></p>
                <p className="mt-0.5 truncate text-xs text-muted"><span className="font-mono">{p.id}</span> · {p.usia === '' ? '-' : p.usia} th · {p.domSekarang || '-'}</p>
              </div>
              <Badge s={p.verif} />
            </button>
          ))}
          {!rows.length && <div className="panel p-8 text-center text-muted">Tidak ada peserta yang cocok.</div>}
        </div>

        {/* Layar lebar: tabel padat */}
        <div className="panel mt-3 hidden overflow-x-auto !rounded-2xl md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted"><tr className="border-b border-hair">
              <th className="px-4 py-2.5 font-medium">Kode</th><th className="px-4 py-2.5 font-medium">Nama</th><th className="px-4 py-2.5 font-medium">Usia</th>
              <th className="px-4 py-2.5 font-medium">Domisili</th><th className="px-4 py-2.5 font-medium">WhatsApp</th><th className="px-4 py-2.5 font-medium">Verifikasi</th><th className="px-4 py-2.5" />
            </tr></thead>
            <tbody>
              {potong.map((p) => (
                <tr key={p.id} className="cursor-pointer border-b border-hair last:border-0 hover:bg-brand-soft" onClick={() => buka(p)}>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{p.id}</td>
                  <td className="px-4 py-2 font-medium">{p.nama} <span className="font-normal text-muted">({p.gender === 'Ikhwan' ? 'I' : 'A'})</span></td>
                  <td className="px-4 py-2">{p.usia === '' ? '-' : p.usia}</td>
                  <td className="px-4 py-2">{p.domSekarang || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{p.wa || '-'}</td>
                  <td className="px-4 py-2"><Badge s={p.verif} /></td>
                  <td className="px-4 py-2 text-right"><button className="font-semibold text-brand hover:underline" onClick={(e) => { e.stopPropagation(); buka(p); }}>Periksa</button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={7} className="p-10 text-center text-muted">Tidak ada peserta yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>
        {rows.length > 0 && <p className="mt-3 text-center text-xs text-muted">Menampilkan {awal + 1} sampai {awal + potong.length} dari {rows.length} peserta</p>}
        <div className="-mt-4"><Pagination page={hal} total={totalHal} onChange={setPage} /></div>
      </>)}

      {tab === 'taaruf' && (
        <div className="mt-5 space-y-4">
          {taaruf.length === 0 && <div className="panel p-10 text-center text-muted">Belum ada pengajuan ta’aruf.</div>}
          {[...taaruf].reverse().map((t) => (
            <div key={t.id} className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{nama(t.dari)} <span className="font-normal text-muted">mengajukan ke</span> {nama(t.kepada)}</p>
                <Badge s={t.status} />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{t.pesan}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {ST_T.filter((s) => s !== t.status).map((s) => (
                  <button key={s} disabled={busy} onClick={() => ubah('adminTaaruf', t.id, s)} className="btn-ghost !h-11 !px-4 !text-sm md:!h-9">{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && createPortal(
        <div className="fade-in fixed inset-0 z-[60] flex items-end justify-center bg-ruby-950/40 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal="true" onClick={tutup}>
          <div className="sheet-up max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface shadow-lift md:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
            {/* Bilah jendela ala macOS: titik merah menutup jendela */}
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-hair bg-surface px-5 py-3.5">
              <button onClick={tutup} aria-label="Tutup" className="hidden h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10 md:block" />
              <span className="hidden h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10 md:block" aria-hidden="true" />
              <span className="hidden h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10 md:block" aria-hidden="true" />
              <span className="text-sm font-medium text-muted md:ml-3">{sel.id}</span>
              <button onClick={tutup} className="ml-auto h-9 px-2 text-sm font-semibold text-brand md:hidden">Tutup</button>
            </div>
            <div className="p-5 sm:p-7" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              {err && <div className="mb-4"><Alert>{err}</Alert></div>}
              {edit ? (
                <form onSubmit={simpanEdit}>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em]">Edit data peserta</h2>
                  <p className="text-sm text-muted">{sel.gender}, kode {sel.id}</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {bidangEdit(sel.gender).map((f) => {
                      const v = edit[f.k] ?? '';
                      const set = (x) => setEdit({ ...edit, [f.k]: x });
                      const lebar = f.t === 'area' || f.t === 'check' || (!f.half && f.t !== 'select') ? 'sm:col-span-2' : f.half ? '' : 'sm:col-span-2';
                      let input;
                      if (f.t === 'area' || f.t === 'check') input = <textarea rows={f.t === 'check' ? 2 : 3} className="field-area" value={v} onChange={(e) => set(e.target.value)} />;
                      else if (f.t === 'select') {
                        const opsi = f.opsi.includes(v) || !v ? f.opsi : [...f.opsi, v]; // nilai lama dari form tetap bisa dipilih
                        input = <select className="field" value={v} onChange={(e) => set(e.target.value)}><option value="">-</option>{opsi.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
                      } else input = <input className="field" type={f.t === 'date' ? 'date' : f.t === 'tel' ? 'tel' : 'text'} inputMode={f.t === 'number' ? 'numeric' : undefined} value={v} onChange={(e) => set(e.target.value)} />;
                      return <label key={f.k} className={`block ${lebar}`}><span className="mb-2 block text-[13px] font-medium text-ink/80">{f.label}</span>{input}</label>;
                    })}
                  </div>
                  <label className="mt-4 block"><span className="mb-2 block text-[13px] font-medium text-ink/80">Catatan admin</span>
                    <textarea rows={2} className="field-area" value={catatan} onChange={(e) => setCatatan(e.target.value)} /></label>
                  <div className="mt-6 grid gap-2 sm:flex">
                    <button className="btn-primary !h-11 md:!h-10" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan perubahan'}</button>
                    <button type="button" className="btn-ghost !h-11 md:!h-10" disabled={busy} onClick={() => setEdit(null)}>Batal</button>
                  </div>
                </form>
              ) : (<>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{sel.nama}</h2>
              <p className="text-sm text-muted">{sel.gender}, mendaftar untuk: {sel.untuk || '-'}</p>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                {[['WhatsApp', sel.wa], ['Tanggal lahir', sel.tglLahir], ['Domisili asal', sel.domAsal], ['Salaf/mengaji', sel.salaf], ['Izin orangtua/wali', sel.izin],
                  ['Bersedia tinggal bersama ' + (sel.gender === 'Ikhwan' ? 'istri' : 'suami'), sel.tinggal]].map(([k, v]) => (
                  <div key={k}><dt className="text-muted">{k}</dt><dd className="mt-0.5 font-medium">{v || '-'}</dd></div>
                ))}
              </dl>
              <p className="mt-7 text-sm font-semibold text-brand-strong">Tampilan publik</p>
              <dl className="mt-3 divide-y divide-hair text-sm">
                {barisProfil({ ...sel, id: sel.id }).map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4"><dt className="text-muted">{k}</dt><dd className="whitespace-pre-line font-medium">{v}</dd></div>
                ))}
              </dl>
              <label className="mt-6 block"><span className="mb-2 block text-[13px] font-medium text-ink/80">Catatan admin</span>
                <textarea rows={2} className="field-area" value={catatan} onChange={(e) => setCatatan(e.target.value)} /></label>
              <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
                {ST_P.map((s) => (
                  <button key={s} disabled={busy || s === sel.verif} onClick={() => ubah('adminUpdate', sel.id, s, catatan)}
                    className={s === 'Disetujui' ? 'btn-primary !h-11 md:!h-10' : 'btn-ghost !h-11 md:!h-10'}>
                    {s === 'Disetujui' ? 'Setujui' : s === 'Ditolak' ? 'Tolak' : s === 'Menikah' ? 'Tandai menikah' : 'Kembalikan ke menunggu'}
                  </button>
                ))}
              </div>
              <div className="mt-8 border-t border-hair pt-5">
                {!hapus ? (
                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    <button className="btn-ghost !h-11 md:!h-10" disabled={busy} onClick={() => { setEdit({ ...sel }); setErr(''); }}>Edit data</button>
                    <button className="btn-ghost !h-11 !text-rose-700 md:!h-10 dark:!text-rose-300" disabled={busy} onClick={() => setHapus(true)}>Hapus peserta</button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/25">
                    <p className="font-semibold">Hapus {sel.nama} ({sel.id}) secara permanen?</p>
                    <p className="mt-1">Baris di Google Sheet dan pengajuan ta’aruf yang terkait ikut terhapus. Tindakan ini tidak bisa dibatalkan.</p>
                    <div className="mt-4 grid gap-2 sm:flex">
                      <button className="btn !h-11 bg-rose-700 text-white hover:bg-rose-800 md:!h-10" disabled={busy} onClick={hapusPeserta}>{busy ? 'Menghapus…' : 'Ya, hapus'}</button>
                      <button className="btn-ghost !h-11 md:!h-10" disabled={busy} onClick={() => setHapus(false)}>Batal</button>
                    </div>
                  </div>
                )}
              </div>
              </>)}
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}

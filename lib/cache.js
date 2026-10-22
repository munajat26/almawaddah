'use client';
import { useEffect, useReducer, useRef, useState } from 'react';

// Cache data di sisi klien yang dipakai bersama antar halaman (inti perilaku SPA):
// pindah halaman tidak memuat ulang data yang masih segar, dan data lama tampil
// langsung sementara data baru diambil di latar belakang (stale-while-revalidate).
//
// Hanya kunci publik ('list', 'p:<id>') yang disalin ke sessionStorage agar tetap ada
// setelah refresh. Data admin hanya disimpan di memori dan hilang saat tab ditutup.

const store = new Map(); // key -> { data, t }
const subs = new Map(); // key -> Set<fn>
const inflight = new Map(); // key -> Promise
const SS = 'bj_cache:';
const publik = (k) => k === 'list' || k.startsWith('p:');

function emit(key) { subs.get(key)?.forEach((f) => f()); }

function bacaSS(key) {
  if (!publik(key)) return null;
  try { const s = sessionStorage.getItem(SS + key); return s ? JSON.parse(s) : null; } catch { return null; }
}
function tulisSS(key, e) {
  if (!publik(key)) return;
  try { sessionStorage.setItem(SS + key, JSON.stringify(e)); } catch {}
}

export function peek(key) {
  const e = store.get(key);
  return e ? e.data : undefined;
}
export function peekEntry(key) { return store.get(key); }

export function setCache(key, data, t = Date.now()) {
  const e = { data, t };
  store.set(key, e);
  tulisSS(key, e);
  emit(key);
}

// Hapus semua entri yang kuncinya diawali prefix (atau semuanya bila prefix kosong).
export function invalidate(prefix = '') {
  for (const k of [...store.keys()]) {
    if (k.startsWith(prefix)) { store.delete(k); try { sessionStorage.removeItem(SS + k); } catch {} emit(k); }
  }
}

function ambil(key, fetcher) {
  if (inflight.has(key)) return inflight.get(key);
  const p = fetcher().then((d) => { setCache(key, d); return d; }).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// useQuery(key, fetcher, { ttl, seed })
//  - ttl: lama data dianggap segar (ms)
//  - seed: fungsi yang mengembalikan { data, t } dari cache lain untuk tampilan instan
// Mengembalikan { data, error, loading, refresh }.
export function useQuery(key, fetcher, { ttl = 60000, seed } = {}) {
  const [, tick] = useReducer((x) => x + 1, 0);
  const [error, setError] = useState('');
  const fRef = useRef(fetcher);
  fRef.current = fetcher;

  // Render pertama di klien: isi dari memori atau dari seed (tanpa menyentuh sessionStorage
  // supaya hasil render server dan klien tetap sama).
  if (key && !store.has(key) && seed) {
    const s = seed();
    if (s) store.set(key, { data: s.data, t: s.t });
  }

  useEffect(() => {
    if (!key) return undefined;
    let batal = false;
    const on = () => tick();
    if (!subs.has(key)) subs.set(key, new Set());
    subs.get(key).add(on);

    if (!store.has(key)) {
      const s = bacaSS(key);
      if (s) { store.set(key, s); tick(); }
    }
    const e = store.get(key);
    if (!e || Date.now() - e.t > ttl) {
      setError('');
      ambil(key, () => fRef.current()).catch((x) => { if (!batal) setError(x.message || 'Terjadi kesalahan.'); });
    }
    return () => { batal = true; subs.get(key)?.delete(on); };
  }, [key, ttl]);

  const e = key ? store.get(key) : undefined;
  const refresh = () => {
    setError('');
    return ambil(key, () => fRef.current()).catch((x) => { setError(x.message || 'Terjadi kesalahan.'); });
  };
  return { data: e?.data, error: e ? '' : error, loading: !e && !error, refresh };
}

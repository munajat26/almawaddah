import { SITE } from '../lib/site';

// Manifest PWA: situs bisa dipasang ke layar utama dan dibuka layar penuh seperti aplikasi.
export default function manifest() {
  return {
    name: SITE.pwa,
    short_name: SITE.pwa,
    description: SITE.deskripsi,
    lang: 'id',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f5f4',
    theme_color: '#0b4f45',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Lihat peserta', url: '/peserta' },
      { name: 'Daftar', url: '/daftar' },
    ],
  };
}

import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SITE } from '../lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-amiri' });

// Alamat situs untuk gambar pratinjau (WhatsApp, dll). Isi NEXT_PUBLIC_SITE_URL dengan domain Anda.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE.nama} — ${SITE.tagline}`, template: `%s — ${SITE.nama}` },
  description: SITE.deskripsi,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE.nama,
    title: `${SITE.nama} — ${SITE.tagline}`,
    description: SITE.deskripsi,
  },
  twitter: { card: 'summary_large_image', title: `${SITE.nama} — ${SITE.tagline}`, description: SITE.deskripsi },
};
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1110' },
  ],
};

// Terapkan tema sebelum render pertama agar tidak berkedip.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${amiri.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

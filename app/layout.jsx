import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TabBar from '../components/TabBar';
import { SITE } from '../lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-amiri' });

// Alamat situs untuk gambar pratinjau (WhatsApp, dll). Isi NEXT_PUBLIC_SITE_URL dengan domain Anda.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.judul, template: `%s | ${SITE.judul}` },
  description: SITE.deskripsi,
  applicationName: SITE.pwa,
  appleWebApp: { title: SITE.pwa, capable: true, statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE.judul,
    title: SITE.judul,
    description: SITE.deskripsi,
  },
  twitter: { card: 'summary', title: SITE.judul, description: SITE.deskripsi },
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8edf4' },
    { media: '(prefers-color-scheme: dark)', color: '#150a0d' },
  ],
};

// Terapkan tema sebelum render pertama agar tidak berkedip.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${amiri.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}

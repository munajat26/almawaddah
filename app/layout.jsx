import { Inter, Amiri } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SITE } from '../lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const amiri = Amiri({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-amiri' });

export const metadata = {
  title: { default: `${SITE.nama} — ${SITE.tagline}`, template: `%s — ${SITE.nama}` },
  description: SITE.deskripsi,
};
export const viewport = { themeColor: '#f4f5f4' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${amiri.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

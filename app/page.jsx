import Link from 'next/link';
import KartuPeserta from '../components/KartuPeserta';
import { Shield, Users, Chat, Badge, Plus } from '../components/Icons';
import { SITE } from '../lib/site';

// Contoh data dalam bentuk yang sama dengan profil publik dari backend.
const CONTOH = [
  { id: 'IK-001', gender: 'Ikhwan', status: 'Lajang', usia: 30, suku: 'Banjar', domSekarang: 'Samarinda', tinggi: 172, berat: 68, pendidikan: 'S1', pekerjaan: 'Insinyur' },
  { id: 'AK-001', gender: 'Akhwat', status: 'Lajang', usia: 27, suku: 'Jawa', domSekarang: 'Balikpapan', tinggi: 158, berat: 52, pendidikan: 'S1', pekerjaan: 'Guru' },
  { id: 'AK-002', gender: 'Akhwat', status: 'Lajang', usia: 25, suku: 'Banjar', domSekarang: 'Banjarmasin', tinggi: 155, berat: 50, pendidikan: 'D3', pekerjaan: 'Bidan' },
];

const ALUR = [
  ['Daftar dan isi CV', 'Data diri, pendidikan, kegiatan keagamaan, keunggulan dan kekurangan, serta kriteria pasangan.'],
  ['Verifikasi admin', 'Admin memeriksa data Anda. Profil yang lolos tampil tanpa nama dan kontak.'],
  ['Ajukan ta’aruf', 'Pilih profil yang cocok dan kirim pengajuan. Admin yang meneruskannya.'],
  ['Bertemu bersama wali', 'Jika kedua pihak setuju, admin mengatur pertukaran CV dan pertemuan.'],
];

const FAQ = [
  ['Siapa yang bisa melihat nama dan nomor WhatsApp saya?', 'Hanya admin. Nama lengkap dan nomor WhatsApp tidak pernah tampil di profil publik, dan baru dibagikan jika kedua pihak sudah sepakat melanjutkan.'],
  ['Siapa yang boleh mendaftar?', 'Ikhwan dan akhwat berusia 18 tahun ke atas yang serius menuju pernikahan, berstatus lajang, duda, atau janda.'],
  ['Bagaimana jika saya tidak punya wali?', 'Hubungi admin lewat WhatsApp. Kami bantu mencarikan solusi sesuai kondisi Anda.'],
  ['Berapa lama proses verifikasi?', 'Umumnya 1 sampai 3 hari kerja. Anda bisa menanyakan statusnya ke admin dengan menyebut kode peserta.'],
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-28 text-center sm:pb-24 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgb(70_110_180/0.20),transparent_72%),radial-gradient(35%_30%_at_88%_8%,rgb(212_24_46/0.10),transparent_70%)]" />
        <div className="pattern-gold fade-radial pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-4xl px-5">
          <p lang="ar" dir="rtl" className="font-arabic text-3xl text-gold-500 sm:text-4xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-7xl">
            Ta’aruf yang tertata, dijalani dengan tenang.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {SITE.nama} by {SITE.oleh} mempertemukan ikhwan dan akhwat dengan data yang terverifikasi, identitas yang terlindungi, dan wali yang mendampingi di setiap langkah.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/daftar" className="btn-primary !h-12 !px-7">Daftar sebagai peserta</Link>
            <Link href="/peserta" className="btn-ghost !h-12 !px-7">Lihat peserta</Link>
          </div>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-none sm:mt-20 items-center gap-5 px-5 sm:px-8 lg:px-12 2xl:px-16 md:grid-cols-3">
          {CONTOH.map((c, idx) => (
            <div key={c.id} style={{ animationDelay: `${idx * 140}ms` }}
              className={`rise ${idx === 1 ? 'md:-translate-y-8 md:scale-[1.06]' : 'hidden md:block'}`}>
              <KartuPeserta p={c} />
            </div>
          ))}
        </div>
        <p className="relative mt-10 text-sm text-muted">Contoh tampilan profil publik.</p>
      </section>

      {/* Bento */}
      <section className="mx-auto max-w-none px-5 sm:px-8 lg:px-12 2xl:px-16 py-16 sm:py-24">
        <h2 className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Dirancang untuk menjaga adab dan privasi.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <div className="relative overflow-hidden rounded-[32px] bg-ruby-950 p-8 text-white md:col-span-4 md:p-10 dark:ring-1 dark:ring-white/10">
            <div className="pattern-gold absolute inset-0 opacity-[0.12]" />
            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-300/15 text-gold-300 ring-1 ring-gold-300/30"><Shield /></span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Identitas tidak pernah tampil di publik.</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-white/70">Pengunjung hanya melihat ringkasan CV. Data pribadi disimpan admin dan dibuka bertahap, setelah kedua pihak sepakat.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-gold-200">Terlihat publik</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Nomor ID, status, usia, suku, domisili, tinggi dan berat badan, pendidikan, pekerjaan, ciri fisik, penghasilan, keunggulan, kekurangan, kegiatan keagamaan, dan kriteria pasangan.</p>
                </div>
                <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-gold-200">Hanya admin</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Nama lengkap, nomor WhatsApp, tanggal lahir, domisili asal, dan izin orangtua/wali.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-8 md:col-span-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Users /></span>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Wali ikut mendampingi.</h3>
            <p className="mt-2 leading-relaxed text-muted">Setiap peserta mengisi izin menikah dari orangtua atau wali, dan proses ta’aruf didampingi wali sesuai adab.</p>
          </div>

          <div className="panel p-8 md:col-span-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Chat /></span>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Admin sebagai perantara.</h3>
            <p className="mt-2 leading-relaxed text-muted">Tidak ada pesan langsung antar peserta. Semua pengajuan melalui admin.</p>
          </div>

          <div className="rounded-[32px] bg-linear-to-br from-gold-200/70 via-gold-200/30 to-surface p-8 ring-1 ring-gold-400/30 dark:from-gold-400/20 dark:via-gold-400/[0.07] md:col-span-4 md:p-10">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface/80 text-gold-ink ring-1 ring-gold-400/30"><Badge /></span>
            <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Setiap profil diverifikasi.</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-ink/70">Admin memeriksa kelengkapan data sebelum profil ditayangkan, agar yang Anda temui adalah peserta yang serius.</p>
          </div>
        </div>
      </section>

      {/* Alur: urutan nyata, jadi bernomor */}
      <section className="mx-auto max-w-none px-5 sm:px-8 lg:px-12 2xl:px-16 pb-16 sm:pb-24">
        <h2 className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Empat langkah menuju pertemuan.</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {ALUR.map(([j, d], i) => (
            <li key={j} className="panel p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-gold-200 to-gold-400 text-base font-semibold text-ruby-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{j}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ayat */}
      <section className="relative overflow-hidden bg-ruby-950 py-16 text-center sm:py-24 dark:border-y dark:border-white/10">
        <div className="pattern-gold fade-radial absolute inset-0 opacity-[0.16]" />
        <div className="relative mx-auto max-w-3xl px-5">
          <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-[1.9] text-gold-300 sm:text-5xl">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/75">
            “Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.”
          </p>
          <p className="mt-4 text-sm text-gold-300/80">QS. Ar-Rum: 21</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Pertanyaan yang sering diajukan.</h2>
        <div className="panel mt-8 divide-y divide-hair px-5 sm:mt-10 sm:px-7">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 text-base sm:text-[17px] font-medium tracking-[-0.01em]">
                {q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-transform group-open:rotate-45"><Plus className="h-4 w-4" /></span>
              </summary>
              <p className="mt-3 max-w-xl leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Ajakan */}
      <section className="mx-auto max-w-none px-5 sm:px-8 lg:px-12 2xl:px-16 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-linear-to-br from-ruby-800 to-ruby-950 px-6 py-16 text-center text-white sm:py-20">
          <div className="pattern-gold fade-radial absolute inset-0 opacity-[0.18]" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Siap memulai ta’aruf?</h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">Pendaftaran memakan waktu sekitar 10 menit.</p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link href="/daftar" className="btn-gold !h-12 !px-8">Isi CV ta’aruf</Link>
              <a href={`https://wa.me/${SITE.waAdmin}`} className="btn-glass !h-12 !px-8">Tanya admin</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

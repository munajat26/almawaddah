import Link from 'next/link';
import { Monogram } from '../components/ui';
import { Shield, Users, Chat, Badge, Lock, Plus } from '../components/Icons';
import { SITE } from '../lib/site';

const CONTOH = [
  { i: 'R.F.', u: '30 tahun', k: 'Ikhwan, Samarinda', r: [['Pendidikan', 'S1 Teknik'], ['Pekerjaan', 'Insinyur'], ['Hafalan', '5 juz']] },
  { i: 'M.A.', u: '27 tahun', k: 'Akhwat, Balikpapan', r: [['Pendidikan', 'S1 Pendidikan'], ['Pekerjaan', 'Guru'], ['Hafalan', '3 juz']] },
  { i: 'S.N.', u: '25 tahun', k: 'Akhwat, Banjarmasin', r: [['Pendidikan', 'D3 Kebidanan'], ['Pekerjaan', 'Bidan'], ['Hafalan', '2 juz']] },
];

const ALUR = [
  ['Daftar dan isi CV', 'Data diri, pemahaman agama, visi pernikahan, kriteria, dan wali Anda.'],
  ['Verifikasi admin', 'Admin memeriksa data dan foto. Profil yang lolos tampil tanpa identitas.'],
  ['Ajukan ta’aruf', 'Pilih profil yang cocok dan kirim pengajuan. Admin yang meneruskannya.'],
  ['Bertemu bersama wali', 'Jika kedua pihak setuju, admin mengatur pertukaran CV dan pertemuan.'],
];

const FAQ = [
  ['Apakah foto saya akan dilihat orang lain?', 'Tidak. Foto hanya dilihat admin untuk verifikasi, dan baru dibagikan jika kedua pihak sudah sepakat melanjutkan.'],
  ['Siapa yang boleh mendaftar?', 'Ikhwan dan akhwat berusia 18 tahun ke atas yang serius menuju pernikahan, berstatus lajang, duda, atau janda.'],
  ['Bagaimana jika saya tidak punya wali?', 'Hubungi admin lewat WhatsApp. Kami bantu mencarikan solusi sesuai kondisi Anda.'],
  ['Berapa lama proses verifikasi?', 'Umumnya 1 sampai 3 hari kerja. Anda bisa menanyakan statusnya ke admin dengan menyebut kode peserta.'],
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-24 pt-32 text-center sm:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgb(17_104_91/0.2),transparent_72%),radial-gradient(35%_30%_at_88%_8%,rgb(207_174_101/0.22),transparent_70%)]" />
        <div className="pattern-gold fade-radial pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-4xl px-5">
          <p lang="ar" dir="rtl" className="font-arabic text-3xl text-gold-500 sm:text-4xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-7xl">
            Ta’aruf yang tertata, dijalani dengan tenang.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {SITE.nama} mempertemukan ikhwan dan akhwat dengan data yang terverifikasi, identitas yang terlindungi, dan wali yang mendampingi di setiap langkah.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/daftar" className="btn-primary !h-12 !px-7">Daftar sebagai peserta</Link>
            <Link href="/peserta" className="btn-ghost !h-12 !px-7">Lihat peserta</Link>
          </div>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-5xl items-center gap-5 px-5 md:grid-cols-3">
          {CONTOH.map((c, idx) => (
            <div key={c.i} style={{ animationDelay: `${idx * 140}ms` }}
              className={`rise glass rounded-[32px] p-6 text-left ${idx === 1 ? 'md:-translate-y-8 md:scale-[1.06]' : 'hidden md:block'}`}>
              <div className="flex items-center gap-4">
                <Monogram text={c.i} className="h-14 w-14 text-base" />
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em]">{c.i}, {c.u}</p>
                  <p className="text-sm text-muted">{c.k}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 border-t border-hair pt-4 text-sm">
                {c.r.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-jade-900/[0.06] px-3 py-2 text-xs text-jade-800">
                <Lock className="h-3.5 w-3.5" /> Nama, foto, dan kontak dijaga admin
              </p>
            </div>
          ))}
        </div>
        <p className="relative mt-10 text-sm text-muted">Contoh tampilan profil publik.</p>
      </section>

      {/* Bento */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Dirancang untuk menjaga adab dan privasi.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <div className="relative overflow-hidden rounded-[32px] bg-jade-950 p-8 text-white md:col-span-4 md:p-10">
            <div className="pattern-gold absolute inset-0 opacity-[0.12]" />
            <div className="relative">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-300/15 text-gold-300 ring-1 ring-gold-300/30"><Shield /></span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Identitas tidak pernah tampil di publik.</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-white/70">Pengunjung hanya melihat ringkasan CV. Data pribadi disimpan admin dan dibuka bertahap, setelah kedua pihak sepakat.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-gold-200">Terlihat publik</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Inisial, usia, kota, pendidikan, pekerjaan, hafalan, visi, dan kriteria.</p>
                </div>
                <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <p className="text-sm font-semibold text-gold-200">Hanya admin</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Nama lengkap, foto, WhatsApp, dan data wali.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-8 md:col-span-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-jade-50 text-jade-800"><Users /></span>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Wali ikut mendampingi.</h3>
            <p className="mt-2 leading-relaxed text-muted">Setiap peserta wajib mencantumkan wali, sehingga proses berjalan sesuai adab.</p>
          </div>

          <div className="panel p-8 md:col-span-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-jade-50 text-jade-800"><Chat /></span>
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Admin sebagai perantara.</h3>
            <p className="mt-2 leading-relaxed text-muted">Tidak ada pesan langsung antar peserta. Semua pengajuan melalui admin.</p>
          </div>

          <div className="rounded-[32px] bg-linear-to-br from-gold-200/70 via-gold-200/30 to-white p-8 ring-1 ring-gold-400/30 md:col-span-4 md:p-10">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-gold-700 ring-1 ring-gold-400/30"><Badge /></span>
            <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">Setiap profil diverifikasi.</h3>
            <p className="mt-3 max-w-lg leading-relaxed text-ink/70">Admin memeriksa kelengkapan data dan foto sebelum profil ditayangkan, agar yang Anda temui adalah peserta yang serius.</p>
          </div>
        </div>
      </section>

      {/* Alur: urutan nyata, jadi bernomor */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Empat langkah menuju pertemuan.</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {ALUR.map(([j, d], i) => (
            <li key={j} className="panel p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-gold-200 to-gold-400 text-base font-semibold text-jade-950 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{j}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ayat */}
      <section className="relative overflow-hidden bg-jade-950 py-24 text-center">
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
      <section className="mx-auto max-w-3xl px-5 py-24">
        <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Pertanyaan yang sering diajukan.</h2>
        <div className="panel mt-10 divide-y divide-hair px-7">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-medium tracking-[-0.01em]">
                {q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-jade-50 text-jade-800 transition-transform group-open:rotate-45"><Plus className="h-4 w-4" /></span>
              </summary>
              <p className="mt-3 max-w-xl leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Ajakan */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-jade-800 to-jade-950 px-6 py-16 text-center text-white sm:py-20">
          <div className="pattern-gold fade-radial absolute inset-0 opacity-[0.18]" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Siap memulai ta’aruf?</h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">Pendaftaran memakan waktu sekitar 10 menit.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/daftar" className="btn-gold !h-12 !px-8">Isi CV ta’aruf</Link>
              <a href={`https://wa.me/${SITE.waAdmin}`} className="btn-glass !h-12 !px-8">Tanya admin</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import Image from 'next/image';
import { SITE } from '../lib/site';

// Logo RGM (cincin emas + tulisan RGM). Sumbernya sama dengan ikon PWA/favicon: public/logo-rgm.png.
// PNG-nya sudah bersudut membulat dan transparan, jadi cukup ditampilkan apa adanya.
export default function Logo({ size = 34 }) {
  return (
    <Image
      src="/logo-rgm.png"
      alt={`Logo ${SITE.nama}`}
      width={size}
      height={size}
      sizes={`${size}px`}
      className="shrink-0 rounded-[24%] shadow-[0_4px_10px_-3px_rgba(25,45,85,.35)]"
      style={{ width: size, height: size }}
      priority
    />
  );
}

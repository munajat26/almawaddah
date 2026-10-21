import Star from './Star';

// Logo berbentuk ikon aplikasi (squircle) dengan bintang emas.
export default function Logo({ size = 34 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-[28%] bg-linear-to-br from-jade-700 to-jade-950 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_4px_10px_-3px_rgba(4,32,28,.6)]"
    >
      <Star className="h-[64%] w-[64%] text-gold-300" sw={4.5} />
    </span>
  );
}

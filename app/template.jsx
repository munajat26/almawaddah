// Template dibuat ulang di setiap pindah halaman, jadi animasi masuk berjalan tiap navigasi
// sementara header, tab bar, dan tema tetap berdiri di layout (tanpa muat ulang).
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}

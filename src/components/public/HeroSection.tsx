import Link from 'next/link';

export default function HeroSection({ totalUsers }: { totalUsers: number }) {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Belajar Bahasa dengan Mudah dan Menyenangkan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Akses materi berkualitas, quiz interaktif, dan komunitas belajar yang mendukung. Mulai perjalanan belajarmu hari ini!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/artikel"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border border-blue-200 hover:border-blue-400 transition"
          >
            Baca Artikel
          </Link>
        </div>
        <div className="mt-10">
          <p className="text-gray-500">
            Sudah <span className="font-bold text-blue-600">{totalUsers.toLocaleString()}</span> orang bergabung!
          </p>
        </div>
      </div>
    </section>
  );
}

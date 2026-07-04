import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-6xl font-bold text-blue-600 mb-4">404</h2>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Halaman tidak ditemukan</h3>
        <p className="text-gray-600 mb-6">
          Halaman yang Anda cari tidak ada atau sudah dihapus.
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium inline-block"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

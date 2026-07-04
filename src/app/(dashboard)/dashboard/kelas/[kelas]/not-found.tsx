import Link from 'next/link';

export default function KelasNotFound() {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">404</h2>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Kelas tidak ditemukan</h3>
        <p className="text-gray-600 mb-6">
          Kelas yang Anda cari tidak ada.
        </p>
        <Link
          href="/dashboard/kelas"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium inline-block"
        >
          Pilih Kelas Lain
        </Link>
      </div>
    </div>
  );
}

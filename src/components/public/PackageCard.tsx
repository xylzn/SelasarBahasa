import { CheckCircle2 } from 'lucide-react';

interface Package {
  id: string;
  nama: string;
  deskripsi: string;
  harga: any; // Since it's a Decimal from Prisma
  fiturList: string[];
  isPopuler: boolean;
}

export default function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition ${
        pkg.isPopuler ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'
      }`}
    >
      {pkg.isPopuler && (
        <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium">
          Paling Diminati
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.nama}</h3>
        <p className="text-gray-600 mb-4">{pkg.deskripsi}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">
            Rp {pkg.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </span>
        </div>
        <ul className="space-y-3 mb-8">
          {pkg.fiturList.map((fitur, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
              {fitur}
            </li>
          ))}
        </ul>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-3 rounded-lg font-medium transition ${
            pkg.isPopuler
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Hubungi Kami
        </a>
      </div>
    </div>
  );
}

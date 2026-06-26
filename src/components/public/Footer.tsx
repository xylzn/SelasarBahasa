export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-4">SelasarBahasa</h3>
            <p className="text-gray-600">
              Platform belajar bahasa online terbaik dengan materi berkualitas dan quiz interaktif.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Menu</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/" className="hover:text-blue-600">Beranda</a></li>
              <li><a href="/artikel" className="hover:text-blue-600">Artikel</a></li>
              <li><a href="/#packages" className="hover:text-blue-600">Paket</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Kontak</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Email: info@selasarbahasa.com</li>
              <li>WhatsApp: +62 812 3456 7890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-500">
          © {new Date().getFullYear()} SelasarBahasa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

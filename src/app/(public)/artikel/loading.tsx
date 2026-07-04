export default function ArtikelListLoading() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-12 w-48 bg-gray-200 rounded-md animate-pulse mx-auto mb-4"></div>
          <div className="h-5 w-96 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-48 w-full bg-gray-200"></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="h-6 w-full bg-gray-200 rounded-md animate-pulse mb-3"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

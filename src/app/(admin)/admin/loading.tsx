export default function AdminHomeLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TugasListLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse mb-4 inline-block"></div>
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="h-6 w-full bg-gray-200 rounded-md animate-pulse mb-3"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

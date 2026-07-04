export default function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="h-8 w-12 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                <div className="h-3 w-10 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

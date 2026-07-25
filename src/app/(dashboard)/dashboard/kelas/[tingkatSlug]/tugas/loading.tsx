export default function TugasListLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse mb-4 inline-block"></div>
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VideoDetailLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-5 w-56 bg-gray-200 rounded-md animate-pulse mb-4 inline-block"></div>
        <div className="h-8 w-96 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export const PractitionerDetailsSkeleton = () => {
  return (
    <div className="font-sans min-h-screen bg-gray-50 pt-[120px] animate-pulse">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6">
          <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
            {/* Left Side - Video Skeleton */}
            <div className="lg:col-span-1 h-full">
              <div className="relative w-full h-full rounded-2xl bg-gray-200"></div>
            </div>

            {/* Middle Side - Info Skeleton */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>

                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="h-12 bg-gray-200 rounded-full w-48"></div>
              </div>
            </div>

            {/* Right Side - Map Skeleton */}
            <div className="lg:col-span-1">
              <div className="w-full h-[300px] lg:h-full bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex-1 p-4">
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

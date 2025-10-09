export const UserCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 w-full animate-pulse">
      {/* Mobile Layout (below xs) */}
      <div className="xs:hidden space-y-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-full aspect-square p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Specialty */}
          <div className="text-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>

          {/* Name */}
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>

          {/* Degrees */}
          <div className="text-center">
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Address */}
          <div className="flex items-start justify-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Clinic */}
          <div className="flex items-start justify-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          </div>
          <div className="w-full h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Medium Layout (xs to md) */}
      <div className="hidden xs:flex md:hidden items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[180px] p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-[180px]">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex xs:flex-col sm:flex-row items-center justify-between">
              <div className='flex space-x-4'>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="w-full sm:w-20 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[250px] p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Main Info */}
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex flex-row justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center sm:justify-between lg:justify-start xl:justify-between space-y-3 sm:space-y-0 lg:space-y-3 xl:space-y-0">
              <div className='flex space-x-6'>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded-full w-36"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

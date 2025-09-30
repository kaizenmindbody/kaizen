'use client'
import UserCard from "@/components/user-card";
import { FeaturedUsersProps } from "@/types/homepage";
import { useRouter } from "next/navigation";

// Skeleton Loading Component for UserCard
const UserCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-dark animate-pulse">
      {/* Video Container Skeleton */}
      <div className="relative aspect-[9/16] bg-gray-200 dark:bg-gray-700">
        <div className="h-full w-full rounded-t-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-6">
        {/* User Info Skeleton */}
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Location & Rating Skeleton */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Specialties Skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded w-3/5"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="space-y-3">
          <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

const FeaturedUsers = ({ title, users, loading }: FeaturedUsersProps & { loading?: boolean }) => {
  const router = useRouter();

  const handleTellMeMore = (userId: string) => {
    // Navigate to practitioner details page
    router.push(`/practitioner-details/${userId}`);
  };

  const handleBookAppointment = (userId: string) => {
    // Navigate to practitioner details page (where booking can be done)
    router.push(`/practitioner-details/${userId}`);
  };

  const handleNameClick = (userId: string) => {
    // Navigate to practitioner details page when name is clicked
    router.push(`/practitioner-details/${userId}`);
  };

  return (
    <section className="bg-white py-16 dark:bg-bg-color-dark md:py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto ">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl text-primary md:text-4xl">
              {title}
            </h2>
          </div>

          {/* Loading State or Users Grid */}
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <UserCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {users?.map((user) => (
                <UserCard
                  key={user.id}
                  name={user.name}
                  role={user.role}
                  url={user.url}
                  location={user.location}
                  rating={user.rating}
                  reviewCount={user.reviewCount}
                  specialties={user.specialties}
                  onTellMeMore={() => handleTellMeMore(user.id)}
                  onBookAppointment={() => handleBookAppointment(user.id)}
                  onNameClick={() => handleNameClick(user.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedUsers;
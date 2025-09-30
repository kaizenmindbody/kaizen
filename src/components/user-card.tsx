import { UserCardProps } from "@/types/homepage";

const UserCard = ({
  name,
  role,
  url,
  location,
  rating,
  reviewCount,
  specialties,
  onTellMeMore,
  onBookAppointment,
  onNameClick,
  isOwnProfile = false
}: UserCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-dark hover:shadow-xl transition-shadow duration-300">
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-gray-100 dark:bg-gray-800">
        <iframe
          src={url}
          title={`${name} introduction video`}
          className="h-full w-full rounded-t-lg"
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* User Info */}
        <div className="mb-4">
          {onNameClick ? (
            <h3
              onClick={onNameClick}
              className="text-lg font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors duration-200"
            >
              {name}
            </h3>
          ) : (
            <h3 className="text-lg font-bold text-black dark:text-white">
              {name}
            </h3>
          )}
          <p className="font-sans text-base text-black dark:text-gray-300">
            {role}
          </p>
        </div>

        {/* Location & Rating */}
        <div className="font-sans mb-4 space-y-1">
          <div className="flex items-center text-base text-black dark:text-gray-300">
            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {location}
          </div>
          <div className="flex items-center">
            <span className="mr-1 text-yellow-400">⭐</span>
            <span className="text-base font-medium text-black dark:text-white">
              {rating} ({reviewCount} Reviews)
            </span>
          </div>
        </div>

        {/* Specialties */}
        <div className="font-sans mb-6">
          <h4 className="mb-2 text-base font-bold text-[#000000] dark:text-white">
            Specialties
          </h4>
          <div className="space-y-1">
            {specialties.split(',').map((specialty, index) => (
              <div key={index} className="text-sm">
                {specialty.trim()}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="font-sans space-y-3">
          <button
            onClick={onTellMeMore}
            className="w-full rounded-lg bg-primary px-4 py-2 text-base text-white transition-colors hover:bg-primary/90"
          >
            Tell Me More
          </button>
          <button
            onClick={isOwnProfile ? undefined : onBookAppointment}
            disabled={isOwnProfile}
            className={`w-full rounded-lg border px-4 py-2 text-base transition-colors ${
              isOwnProfile
                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'border-primary text-primary hover:bg-primary/10 dark:hover:bg-orange-500/10'
            }`}
          >
            {isOwnProfile ? "This is You" : "Book An Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
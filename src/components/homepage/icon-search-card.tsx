import Icon from "@/components/icon";
import { IconSearchCardProps } from "@/types/homepage";
import { useRouter } from "next/navigation";

// Skeleton Loading Component for Icon
const IconSkeleton = ({ iconBgColor = 'white' }) => {
  return (
    <div
      className="font-sans flex flex-col justify-between group rounded-[10px] border border-[#AEAEAE] p-6 text-center animate-pulse"
      style={{ backgroundColor: iconBgColor }}
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center mb-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Condition Name */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
    </div>
  );
};

const IconSearchCard = ({
  title,
  data,
  bgColor,
  loading
}: IconSearchCardProps & { loading?: boolean }) => {
  const router = useRouter();

  const handleIconClick = (itemName: string) => {
    if (title === "Search By Condition" || title === "Search By Modality") {
      const cleanTerm = itemName.trim();
      router.push(`/find-practitioner?specialty=${encodeURIComponent(cleanTerm)}`);
    } else {
      router.push(`/find-practitioner?search=${encodeURIComponent(itemName)}`);
    }
  };
  return (
    <>
      <section
        id="home"
        className="relative z-10 overflow-hidden bg-white dark:bg-gray-dark py-12"
      >
        <div className="container">
          {/* Search by Condition Section */}
          <div className="mx-auto">
            <h2 className="mb-12 text-left text-[32px] text-secondary">
              {title}
            </h2>

            {/* Icons Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:gap-6">
              {loading ? (
                // Show skeleton loaders when loading
                Array.from({ length: 6 }, (_, index) => (
                  <IconSkeleton
                    key={`skeleton-${index}`}
                    iconBgColor={bgColor}
                  />
                ))
              ) : (
                data?.map((condition, index) => (
                  <Icon
                    key={index}
                    src={condition.icon}
                    name={condition.name}
                    iconBgColor={bgColor}
                    onClick={() => handleIconClick(condition.name)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default IconSearchCard;
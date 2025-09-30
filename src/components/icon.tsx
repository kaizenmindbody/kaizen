import Image from "next/image";
import { IconCardProps } from "@/types/homepage";

const Icon = ({
  src,
  name,
  iconBgColor = 'white',
  width = 80,
  height = 80,
  className = "",
  priority = false,
  onClick,
  loading = false
}: IconCardProps) => {

  return (
    <div
      className={`font-sans flex flex-col justify-between group cursor-pointer rounded-[10px] border border-[#AEAEAE] p-6 text-center transition-all duration-300 hover:border-primary hover:shadow-md dark:border-stroke-dark dark:bg-gray-dark ${className}`}
      style={{ backgroundColor: iconBgColor }}
      onClick={onClick}
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center" style={{ width, height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Image
            src={src}
            width={width}
            height={height}
            alt={`${name} icon`}
            priority={priority}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Condition Name */}
      <h3 className="text-[14px] font-medium text-black dark:text-white md:text-[16px]">
        {loading ? "Loading..." : name}
      </h3>
    </div>
  );
};

export default Icon;
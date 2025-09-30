import { FAQSectionProps } from "@/types/homepage";

// Skeleton Loading Component for FAQ Item
const FAQItemSkeleton = () => {
  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg animate-pulse">
      {/* Video Container Skeleton */}
      <div className="relative aspect-video bg-gray-200"></div>

      {/* Title Skeleton */}
      <div className="p-4 md:p-6">
        <div className="h-4 md:h-5 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  );
};

const TcmFaqSection = ({title, faqItems, loading}: FAQSectionProps & { loading?: boolean }) => {

  return (
    <section className="relative bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[24px] md:text-[32px] text-[#3D375F] mb-4">
            {title}
          </h2>
        </div>

        {/* Loading State or FAQ Grid */}
        {loading ? (
          <div className="font-sans grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {Array.from({ length: 3 }, (_, index) => (
              <FAQItemSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="font-sans grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {faqItems?.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-gray-200">
                  <iframe
                    src={item.url}
                    title={item.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                {/* Title */}
                <div className="p-4 md:p-6">
                  <h3 className="text-[14px] md:text-[16px] lg:text-[18px] text-[#000000] leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TcmFaqSection;
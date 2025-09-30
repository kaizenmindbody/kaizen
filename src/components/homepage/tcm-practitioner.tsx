import React from 'react';

const TcmPractitioner = () => {
  return (
    <section className="relative bg-white z-10 py-12 md:py-16">
      <div className="container">
        <div className="mx-auto ">
          {/* Spotlight Header */}
          <div className="mb-8">
            <h2 className="mb-2 text-[24px] md:text-[32px] font-[700] text-primary">
              Spotlight: Dr. Venessa Lee, DACM, L.Ac.
            </h2>
            <p className="font-sans text-[16px] md:text-[20px] text-[#000000] dark:text-gray-300">
              61 Irving Place, LLD, New York, NY 10003
            </p>
          </div>
          
          {/* Main Content Grid - Custom column sizing */}
          <div className="flex flex-col lg:items-stretch gap-8 lg:flex-row lg:gap-12">
            {/* Left Column - Video Player */}
            <div className="order-2 lg:order-1 lg:w-[68%] lg:flex lg:flex-col">
              <div className="relative aspect-video lg:aspect-auto lg:flex-1 overflow-hidden rounded-2xl bg-gray-200 shadow-lg dark:bg-gray-700">
                {/* Iframe Video Player */}
                <iframe
                  src="https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/video/sample-video.mp4"
                  title="Dr. Venessa Lee spotlight video"
                  className="absolute inset-0 h-full w-full rounded-2xl"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* Right Column - Article Content */}
            <div className="order-1 lg:order-2 lg:w-[32%]">
              <article className="space-y-6">
                <header>
                  <h3 className="text-3xl md:text-4xl text-black dark:text-white">
                    The Benefits of Facial Acupuncture to Reduce Fine Lines and Build Collagen
                  </h3>
                </header>
                
                <div className="font-sans prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-[14px] md:text-[16px] leading-relaxed text-black dark:text-gray-300">
                    Facial acupuncture is a natural, non-invasive therapy that promotes skin health and overall well-being by improving circulation, stimulating collagen production, and relaxing facial muscles. Unlike cosmetic procedures that focus only on the surface, facial acupuncture works holistically to address underlying imbalances that may contribute to premature aging, puffiness, or tension.
                  </p>
                  
                  <p className="text-[14px] md:text-[16px] leading-relaxed text-black dark:text-gray-300">
                    Many people find it helps soften fine lines, improve skin tone, and give a brighter, more lifted appearance, while also supporting stress reduction and overall energy balance in the body.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TcmPractitioner;
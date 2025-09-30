import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { FAQProps } from '@/types/homepage';

// Skeleton Loading Component for FAQ Section
const FAQSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start animate-pulse">
      {/* Left Side - Image Skeleton */}
      <div className="relative">
        <div className="relative shadow-lg">
          <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-3xl"></div>
        </div>
      </div>

      {/* Right Side - FAQ Items Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="font-sans border rounded-2xl bg-gray-100 p-6"
          >
            <div className="w-full flex items-center justify-between">
              {/* Question Skeleton */}
              <div className="flex-1 pr-4">
                <div className="h-5 bg-gray-200 rounded w-4/5 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-3/5"></div>
              </div>

              {/* Plus/Minus Icon Skeleton */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQSection = ({title, faqs, loading}: FAQProps & { loading?: boolean }) => {
  const [openFAQ, setOpenFAQ] = useState(0);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? -1 : index);
  };

  return (
    <section className="bg-gray-50 py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="text-orange-500 text-[16px] md:text-[18px] font-[700] mb-2">
            Get Your Answer
          </p>
          <h2 className="text-[28px] md:text-[32px] text-orange-500 leading-tight">
            {title}
          </h2>
        </div>

        {/* Loading State or Content Grid */}
        {loading ? (
          <FAQSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="relative shadow-lg">
                <Image
                  src="/images/home/surgery.png"
                  width={400}
                  height={400}
                  alt="Acupuncture treatment session"
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl"
                />
              </div>
            </div>

            {/* Right Side - FAQ */}
            <div className="space-y-4">
              {faqs?.map((faq) => (
                <div
                  key={faq.id}
                  className={`font-sans border rounded-2xl transition-all duration-300 ${
                    openFAQ === faq.id
                      ? 'bg-white shadow-[0px_4px_14px_0px_rgba(226,237,255,0.25)]'
                      : 'bg-[#EA7D0066] border-orange-100 hover:bg-orange-100'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 pr-4 leading-tight">
                      {faq.question}
                    </h3>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      ${openFAQ === faq.id ? 'bg-primary' : 'bg-white'}
                      `}>
                      {openFAQ === faq.id ? (
                        <Minus className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-black" />
                      )}
                    </div>
                  </button>

                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6">
                      <div>
                        <p className="text-[14px] md:text-[16px] text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
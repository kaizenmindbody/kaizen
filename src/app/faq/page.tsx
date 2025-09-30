"use client";

import { useState } from "react";
import Breadcrumb from "@/components/commons/breadcrumb";
import { useFaq } from "@/hooks/useFaq";

// Skeleton Loading Component for FAQ Page
const FAQPageSkeleton = () => {
  return (
    <>
      <Breadcrumb pageName="FAQ" />
      <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px] animate-pulse">
        <div className="container">
          {/* Header Skeleton */}
          <div className="mb-12 text-center">
            <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
          </div>

          {/* FAQ Items Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden self-start"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="h-6 bg-gray-200 rounded w-4/5 mb-1"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/5"></div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-gray-200 rounded border-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const FAQPage = () => {
  const { faqs, loading, error } = useFaq();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Handle error state
  if (error) {
    return (
      <>
        <Breadcrumb pageName="FAQ" />
        <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px]">
          <div className="container max-w-4xl">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-red-500 text-center">
                <h3 className="text-lg font-semibold mb-2">Error loading FAQs</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Handle loading state
  if (loading) {
    return <FAQPageSkeleton />;
  }

  return (
    <>
      <Breadcrumb pageName="FAQ" />
      
      <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px]">
        <div className="container">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl lg:text-5xl">
              Frequently Asked Questions
            </h1>
          </div>

          {/* FAQ Items */}
          {faqs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {faqs.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-dark rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden self-start"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-white pr-4">
                      {item.question}
                    </h3>
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded border-2 border-secondary flex items-center justify-center transition-all duration-300 ${
                        activeIndex === index ? 'bg-secondary' : ''
                      }`}>
                        {activeIndex === index ? (
                          <svg
                            className="w-3 h-3 text-white transition-all duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 text-secondary transition-all duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-body-color leading-relaxed mt-4">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                No FAQs available
              </h3>
              <p className="text-body-color">
                We&apos;re working on adding frequently asked questions. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FAQPage;
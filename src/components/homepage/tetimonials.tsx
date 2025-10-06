'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TestimonialsSectionProps } from '@/types/homepage';

// Skeleton Loading Component
const TestimonialSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-pulse">
      {/* Left side - Profile Image Skeleton */}
      <div className="flex-shrink-0">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Right side - Content Skeleton */}
      <div className="flex-1 pt-4 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
};

const TestimonialsSection = ({ testimonials, loading }: TestimonialsSectionProps & { loading?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials]);

  const currentTestimonial = testimonials?.[currentIndex];

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden"
      style={{
        backgroundImage: `url('/images/home/testimonial-bg.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {loading ? (
          <TestimonialSkeleton />
        ) : currentTestimonial ? (
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Left side - Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-gray-100 shadow-lg">
                  <Image
                    src={currentTestimonial.image}
                    width={250}
                    height={250}
                    alt={currentTestimonial.client}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right side - Content */}
              <div className="flex-1 pt-4">
                {/* Header */}
                <div className="mb-2">
                  <p className="text-primary text-[16px] md:text-[18px] font-bold mb-1">
                    Testimonials
                  </p>
                  <h2 className="text-[28px] md:text-[32px] text-primary leading-tight">
                    What Our Client Says
                  </h2>
                </div>

                {/* Testimonial Text */}
                <p className="font-sans text-[16px] md:text-[18px] text-[#465D7C] leading-relaxed mb-4">
                  {currentTestimonial.description}
                </p>

                {/* Client Info */}
                <div className="font-sans">
                  <h4 className="text-[20px] md:text-[24px] font-[500] text-[#465D7C]">
                    {currentTestimonial.client}
                  </h4>
                  <p className="text-[14px] text-[#465D7C]">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TestimonialsSection;
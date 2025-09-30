import React from 'react';
import Image from 'next/image';
import { PersonEventProps } from '@/types/homepage';

// Skeleton Loading Component for Event Card
const EventCardSkeleton = () => {
  return (
    <div className="font-sans flex flex-col justify-between bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div>
        {/* Event Image Skeleton */}
        <div className="aspect-[4/3] bg-gray-200"></div>

        {/* Event Content Skeleton */}
        <div className="p-6">
          {/* Title Skeleton */}
          <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>

          {/* Date and Price Skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>

          {/* Instructor and Location Skeleton */}
          <div className="mb-4 space-y-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="space-y-3 p-6">
        <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

const PersonEvent = ({title, events, loading}: PersonEventProps & { loading?: boolean }) => {

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-[28px] md:text-[32px] text-primary leading-tight">
            {title}
          </h2>
        </div>

        {/* Loading State or Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }, (_, index) => (
              <EventCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.map((event) => (
              <div
                key={event.id}
                className="font-sans flex flex-col justify-between bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Event Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={event.image}
                      width={350}
                      height={350}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-[16px] md:text-[18px] font-bold text-black mb-2 leading-tight">
                      {event.title}
                    </h3>

                    {/* Date and Price */}
                    <div className="mb-4">
                      <p className="text-[14px] text-black font-bold">{event.date}</p>
                      <p className="text-[14px] text-black font-medium">{event.price} $</p>
                    </div>

                    {/* Instructor and Location */}
                    <div className="mb-4 text-[16px] text-gray-600">
                      <p className="font-medium">{event.instructor}</p>
                      {event.clinic && <p>{event.clinic}</p>}
                      {event.address && <p>{event.address}</p>}
                      {event.location && <p>{event.location}</p>}
                    </div>

                    {/* Description */}
                    <p className="text-[16px] text-gray-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 p-6">
                  <button className="text-base w-full bg-secondary hover:bg-green-800 text-white py-2 px-6 rounded-lg transition-colors duration-300">
                    Tell Me More
                  </button>
                  <button className="text-base w-full border-2 border-secondary hover:border-gray-400 text-secondary hover:text-gray-900 font-medium py-2 px-6 rounded-lg transition-colors duration-300">
                    Reserve My Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonEvent;
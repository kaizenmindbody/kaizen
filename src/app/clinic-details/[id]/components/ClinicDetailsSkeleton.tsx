"use client";

import React from 'react';

export const ClinicDetailsSkeleton = () => {
  return (
    <div className="font-sans min-h-screen bg-gray-50 pt-[120px] animate-pulse">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
            {/* Video/Logo Section */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="w-full h-full bg-gray-200 rounded-2xl"></div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Logo */}
                <div className="lg:col-span-1 flex justify-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Clinic Info */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections Skeleton */}
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className="bg-white rounded-xl shadow-sm p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

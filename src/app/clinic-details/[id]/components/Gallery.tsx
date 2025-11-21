"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ImageIcon, Film } from 'lucide-react';

interface GalleryProps {
  clinic: any;
}

export const Gallery = ({ clinic }: GalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrev = () => {
    if (selectedIndex === null || !clinic.clinic_images) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : clinic.clinic_images.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null || !clinic.clinic_images) return;
    setSelectedIndex(selectedIndex < clinic.clinic_images.length - 1 ? selectedIndex + 1 : 0);
  };

  if (!clinic.clinic_images || clinic.clinic_images.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Gallery Coming Soon
        </h3>
        <p className="text-gray-600">
          Photos and videos of our clinic will be available shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#35375F' }}>
            Clinic Gallery
          </h2>

          {/* Videos Section */}
          {clinic.clinic_videos && clinic.clinic_videos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <Film className="w-5 h-5 mr-2 text-rose-600" />
                Clinic Videos ({clinic.clinic_videos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clinic.clinic_videos.map((videoUrl: string, index: number) => (
                  <div key={index} className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover rounded-xl"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images Grid */}
          {clinic.clinic_images && clinic.clinic_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                Clinic Photos ({clinic.clinic_images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clinic.clinic_images.map((imageUrl: string, index: number) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setSelectedIndex(index)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${clinic.clinic_name} - Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && clinic.clinic_images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={clinic.clinic_images[selectedIndex]}
              alt={`${clinic.clinic_name} - Gallery image ${selectedIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-black" />
            </button>
            {/* Navigation arrows */}
            {clinic.clinic_images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {clinic.clinic_images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

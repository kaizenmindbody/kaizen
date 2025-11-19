"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ImageIcon, Film } from 'lucide-react';

interface GalleryProps {
  clinic: any;
}

export const Gallery = ({ clinic }: GalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allMedia = [
    ...(clinic.clinic_video ? [{ type: 'video', url: clinic.clinic_video }] : []),
    ...(clinic.clinic_images || []).map((img: string) => ({ type: 'image', url: img }))
  ];

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : allMedia.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex < allMedia.length - 1 ? selectedIndex + 1 : 0);
  };

  if (allMedia.length === 0) {
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

          {/* Video Section */}
          {clinic.clinic_video && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <Film className="w-5 h-5 mr-2 text-rose-600" />
                Clinic Tour Video
              </h3>
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <video
                  src={clinic.clinic_video}
                  controls
                  className="w-full max-w-3xl mx-auto rounded-xl"
                >
                  Your browser does not support the video tag.
                </video>
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
                {clinic.clinic_images.map((imageUrl: string, index: number) => {
                  // Adjust index for video offset
                  const mediaIndex = clinic.clinic_video ? index + 1 : index;

                  return (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setSelectedIndex(mediaIndex)}
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full p-2"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full p-2"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {allMedia[selectedIndex].type === 'video' ? (
              <video
                src={allMedia[selectedIndex].url}
                controls
                className="max-w-full max-h-full rounded-lg"
                autoPlay
              />
            ) : (
              <Image
                src={allMedia[selectedIndex].url}
                alt={`${clinic.clinic_name} - Gallery image ${selectedIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
            {selectedIndex + 1} / {allMedia.length}
          </div>
        </div>
      )}
    </>
  );
};

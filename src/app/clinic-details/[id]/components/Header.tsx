"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  X,
  Globe,
  Phone,
  Mail,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatters';

interface HeaderProps {
  clinic: any;
  user: any;
}

export const Header = ({ clinic, user }: HeaderProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showAllMediaModal, setShowAllMediaModal] = useState(false);

  const handlePrevImage = () => {
    if (selectedImageIndex === null || !clinic.clinic_images) return;
    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : clinic.clinic_images.length - 1);
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null || !clinic.clinic_images) return;
    setSelectedImageIndex(selectedImageIndex < clinic.clinic_images.length - 1 ? selectedImageIndex + 1 : 0);
  };

  return (
    <>
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6">
        <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
          {/* Left Side - Video (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 lg:h-full">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              {clinic.clinic_video ? (
                <video
                  src={clinic.clinic_video}
                  controls
                  className="w-full h-full rounded-2xl object-cover"
                  title={`${clinic.clinic_name} video`}
                />
              ) : (
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No Video Available</p>
                    <p className="text-sm mt-1">This clinic hasn&apos;t uploaded a video yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Clinic Info */}
          <div className="lg:col-span-2 h-full">
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {/* Clinic Logo */}
                <div className="lg:col-span-1 flex flex-col">
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
                      {clinic.clinic_logo ? (
                        <Image
                          src={clinic.clinic_logo}
                          alt={clinic.clinic_name}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Building2 className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinic Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-3" style={{ color: '#35375F' }}>
                      {clinic.clinic_name}
                    </h1>
                    <div className="flex items-start mb-3">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Healthcare Clinic
                      </span>
                    </div>

                    {/* Practitioner Info */}
                    {clinic.practitioner && (
                      <div className="mb-4">
                        <Link
                          href={`/practitioner-details/${clinic.practitioner.id}`}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Image
                            src={clinic.practitioner.avatar}
                            alt={clinic.practitioner.full_name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {clinic.practitioner.full_name}
                            </p>
                            <p className="text-xs text-gray-500">Primary Practitioner</p>
                          </div>
                        </Link>
                      </div>
                    )}

                    <div className="mb-4">
                      {/* Contact Information */}
                      <div className="space-y-3 text-sm text-gray-600">
                        {clinic.clinic_address && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span>{clinic.clinic_address}</span>
                          </div>
                        )}
                        {clinic.clinic_phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <a
                              href={`tel:${clinic.clinic_phone}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {formatPhoneNumber(clinic.clinic_phone)}
                            </a>
                          </div>
                        )}
                        {clinic.clinic_email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <a
                              href={`mailto:${clinic.clinic_email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {clinic.clinic_email}
                            </a>
                          </div>
                        )}
                        {clinic.clinic_website && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <a
                              href={clinic.clinic_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {clinic.clinic_website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Gallery Section - Under Right Side */}
              <div className="gap-8 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Photos & Videos</h3>

                  {/* Video Section (Mobile Only) */}
                  {clinic.clinic_video && (
                    <div className="lg:hidden mb-4">
                      <div className="relative w-full h-72 rounded-2xl overflow-hidden">
                        <video
                          src={clinic.clinic_video}
                          controls
                          className="w-full h-full rounded-2xl object-cover"
                          title={`${clinic.clinic_name} video`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery Grid - Real Images from Database */}
                  {clinic.clinic_images && clinic.clinic_images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {clinic.clinic_images.length} image{clinic.clinic_images.length !== 1 ? 's' : ''}
                            {clinic.clinic_video && ' • 1 video'}
                          </span>
                        </div>
                        {clinic.clinic_images.length > 5 && (
                          <button
                            onClick={() => setShowAllMediaModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            +{clinic.clinic_images.length - 5} More
                          </button>
                        )}
                      </div>

                      {/* Flexible Image Layout based on count */}
                      {(() => {
                        const totalImages = clinic.clinic_images.length;

                        // Layout for 1 image
                        if (totalImages === 1) {
                          return (
                            <div
                              className="h-48 md:h-64 overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImageIndex(0)}
                            >
                              <Image
                                src={clinic.clinic_images[0]}
                                alt={`${clinic.clinic_name} photo`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          );
                        }

                        // Layout for 2 images
                        if (totalImages === 2) {
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-48 md:h-48">
                              {clinic.clinic_images.slice(0, 2).map((imageUrl: string, index: number) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(index)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`${clinic.clinic_name} photo ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Layout for 3 images
                        if (totalImages === 3) {
                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-48">
                              {clinic.clinic_images.slice(0, 3).map((imageUrl: string, index: number) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(index)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`${clinic.clinic_name} photo ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Layout for 4+ images - Responsive grid
                        return (
                          <div className="w-full">
                            {/* Mobile: Single column stack */}
                            <div className="block md:hidden space-y-3">
                              <div
                                className="aspect-video overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImageIndex(0)}
                              >
                                <Image
                                  src={clinic.clinic_images[0]}
                                  alt={`${clinic.clinic_name} main photo`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {clinic.clinic_images.slice(1, 4).map((imageUrl: string, index: number) => (
                                  <div
                                    key={index + 1}
                                    className="aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImageIndex(index + 1)}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`${clinic.clinic_name} photo ${index + 2}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Desktop: 5-column grid with large image */}
                            <div className="hidden md:block">
                              <div className="grid grid-cols-5 gap-3 h-48">
                                {/* Large Image - 2 columns */}
                                <div
                                  className="col-span-2 h-full overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(0)}
                                >
                                  <Image
                                    src={clinic.clinic_images[0]}
                                    alt={`${clinic.clinic_name} main photo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>

                                {/* Small Images Grid - 3 columns, 2 rows */}
                                <div className="col-span-3 grid grid-cols-2 gap-2 h-full">
                                  {clinic.clinic_images.slice(1, 5).map((imageUrl: string, index: number) => (
                                    <div
                                      key={index + 1}
                                      className="w-full h-full relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => setSelectedImageIndex(index + 1)}
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt={`${clinic.clinic_name} photo ${index + 2}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No media available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && clinic.clinic_images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={clinic.clinic_images[selectedImageIndex]}
              alt={`${clinic.clinic_name} image ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImageIndex(null)}
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
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {clinic.clinic_images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

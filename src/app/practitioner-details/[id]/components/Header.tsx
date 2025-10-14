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
  Languages,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatters';
import { BookAppointmentButton } from './BookAppointmentButton';

interface HeaderProps {
  practitioner: any;
  user: any;
  descriptionsData: any;
}

export const Header = ({ practitioner, user, descriptionsData }: HeaderProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showAllMediaModal, setShowAllMediaModal] = useState(false);

  return (
    <>
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6">
        <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
          {/* Left Side - Video (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 lg:h-full">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              {practitioner.video ? (
                <video
                  src={practitioner.video}
                  controls
                  className="w-full h-full rounded-2xl object-cover"
                  title={`${practitioner.full_name} spotlight video`}
                />
              ) : (
                <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No Video Available</p>
                    <p className="text-sm mt-1">This practitioner hasn&apos;t uploaded a video yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Profile Info */}
          <div className="lg:col-span-2 h-full">
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {/* Profile Image */}
                <div className="lg:col-span-1 flex flex-col">
                  <div className="flex justify-center">
                    <Image
                      src={practitioner.avatar.url}
                      alt={practitioner.avatar.alt}
                      width={300}
                      height={300}
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-green-700 mb-3">
                      {practitioner.title ? `${practitioner.title} ` : ''}{practitioner.full_name}
                    </h1>
                    <div className="flex items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        {practitioner.specialties && practitioner.specialties.length > 0 ? (
                          practitioner.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20"
                            >
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                            {practitioner.specialty || 'General Practice'}
                          </span>
                        )}
                      </div>
                    </div>
                    {practitioner.degree && (
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500">{practitioner.degree}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      {/* Contact Information */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="space-y-3 text-sm text-gray-600 mb-4 md:mb-0">
                          {/* Languages - from Descriptions table */}
                          {descriptionsData?.language && descriptionsData.language.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <Languages className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-700 text-sm">Languages:</span>
                              </div>
                              <div className="flex flex-wrap gap-2 ml-6">
                                {(Array.isArray(descriptionsData.language)
                                  ? descriptionsData.language
                                  : [descriptionsData.language]).map((lang, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {lang.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {practitioner.address && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{practitioner.address}</span>
                            </div>
                          )}
                          {practitioner.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <a
                                href={`tel:${practitioner.phone}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {formatPhoneNumber(practitioner.phone)}
                              </a>
                            </div>
                          )}
                          {practitioner.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <a
                                href={`mailto:${practitioner.email}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {practitioner.email}
                              </a>
                            </div>
                          )}
                          {practitioner.website && (
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 text-gray-400 mr-2" />
                              <a
                                href={practitioner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {practitioner.website}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Social Media Icons and Button - Desktop Only */}
                        <div className="hidden lg:flex flex-col space-y-3">
                          {/* Dynamic Social Media Icons */}
                          {(() => {
                            const socialLinks = [];

                            // Facebook
                            if (practitioner.facebook) {
                              socialLinks.push(
                                <Link
                                  key="facebook"
                                  href={practitioner.facebook.startsWith('http') ? practitioner.facebook : `https://${practitioner.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/facebook.png"
                                    width={32}
                                    height={32}
                                    alt="Facebook"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // Instagram
                            if (practitioner.instagram) {
                              socialLinks.push(
                                <Link
                                  key="instagram"
                                  href={practitioner.instagram.startsWith('http') ? practitioner.instagram : `https://${practitioner.instagram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/instagram.png"
                                    width={32}
                                    height={32}
                                    alt="Instagram"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // YouTube
                            if (practitioner.youtube) {
                              socialLinks.push(
                                <Link
                                  key="youtube"
                                  href={practitioner.youtube.startsWith('http') ? practitioner.youtube : `https://${practitioner.youtube}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/youtube.png"
                                    width={32}
                                    height={32}
                                    alt="YouTube"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // Twitter/X
                            if (practitioner.twitter) {
                              socialLinks.push(
                                <Link
                                  key="twitter"
                                  href={practitioner.twitter.startsWith('http') ? practitioner.twitter : `https://${practitioner.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/twitter.png"
                                    width={32}
                                    height={32}
                                    alt="Twitter"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // LinkedIn
                            if (practitioner.linkedin) {
                              socialLinks.push(
                                <Link
                                  key="linkedin"
                                  href={practitioner.linkedin.startsWith('http') ? practitioner.linkedin : `https://${practitioner.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/linkedin.png"
                                    width={32}
                                    height={32}
                                    alt="LinkedIn"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            return socialLinks.length > 0 ? (
                              <div className="flex space-x-2">
                                {socialLinks}
                              </div>
                            ) : null;
                          })()}
                          <BookAppointmentButton
                            practitionerId={practitioner.id}
                            user={user}
                          />
                        </div>
                      </div>

                      {/* Social Media Icons and Button - Mobile Only */}
                      <div className="lg:hidden mt-4 space-y-3">
                        {/* Dynamic Social Media Icons - Mobile */}
                        {(() => {
                          const socialLinks = [];

                          // Facebook
                          if (practitioner.facebook) {
                            socialLinks.push(
                              <Link
                                key="facebook"
                                href={practitioner.facebook.startsWith('http') ? practitioner.facebook : `https://${practitioner.facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <Image
                                  src="/images/social/facebook.png"
                                  width={32}
                                  height={32}
                                  alt="Facebook"
                                  className="w-6 h-6 object-contain"
                                />
                              </Link>
                            );
                          }

                          // Instagram
                          if (practitioner.instagram) {
                            socialLinks.push(
                              <Link
                                key="instagram"
                                href={practitioner.instagram.startsWith('http') ? practitioner.instagram : `https://${practitioner.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <Image
                                  src="/images/social/instagram.png"
                                  width={32}
                                  height={32}
                                  alt="Instagram"
                                  className="w-6 h-6 object-contain"
                                />
                              </Link>
                            );
                          }

                          // YouTube
                          if (practitioner.youtube) {
                            socialLinks.push(
                              <Link
                                key="youtube"
                                href={practitioner.youtube.startsWith('http') ? practitioner.youtube : `https://${practitioner.youtube}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <Image
                                  src="/images/social/youtube.png"
                                  width={32}
                                  height={32}
                                  alt="YouTube"
                                  className="w-6 h-6 object-contain"
                                />
                              </Link>
                            );
                          }

                          // Twitter/X
                          if (practitioner.twitter) {
                            socialLinks.push(
                              <Link
                                key="twitter"
                                href={practitioner.twitter.startsWith('http') ? practitioner.twitter : `https://${practitioner.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <Image
                                  src="/images/social/twitter.png"
                                  width={32}
                                  height={32}
                                  alt="Twitter"
                                  className="w-6 h-6 object-contain"
                                />
                              </Link>
                            );
                          }

                          // LinkedIn
                          if (practitioner.linkedin) {
                            socialLinks.push(
                              <Link
                                key="linkedin"
                                href={practitioner.linkedin.startsWith('http') ? practitioner.linkedin : `https://${practitioner.linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              >
                                <Image
                                  src="/images/social/linkedin.png"
                                  width={32}
                                  height={32}
                                  alt="LinkedIn"
                                  className="w-6 h-6 object-contain"
                                />
                              </Link>
                            );
                          }

                          return socialLinks.length > 0 ? (
                            <div className="flex justify-center space-x-2">
                              {socialLinks}
                            </div>
                          ) : null;
                        })()}
                        <div className="flex justify-start lg:justify-center">
                          <BookAppointmentButton
                            practitionerId={practitioner.id}
                            user={user}
                          />
                        </div>
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
                  {practitioner.video && (
                    <div className="lg:hidden mb-4">
                      <div className="relative w-full h-72 rounded-2xl overflow-hidden">
                        <video
                          src={practitioner.video}
                          controls
                          className="w-full h-full rounded-2xl object-cover"
                          title={`${practitioner.full_name} spotlight video`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery Grid - Real Images from Database */}
                  {practitioner?.images && practitioner.images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {practitioner.images.length} image{practitioner.images.length !== 1 ? 's' : ''}
                            {practitioner.video && ' • 1 video'}
                          </span>
                        </div>
                        {practitioner.images.length > 5 && (
                          <button
                            onClick={() => setShowAllMediaModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                          >
                            +{practitioner.images.length - 5} More
                          </button>
                        )}
                      </div>

                      {/* Flexible Image Layout based on count (images only) */}
                      {(() => {
                        const totalImages = practitioner.images.length;

                        // Layout for 1 image
                        if (totalImages === 1) {
                          return (
                            <div
                              className="h-48 md:h-64 overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImageIndex(0)}
                            >
                              <Image
                                src={practitioner.images[0]}
                                alt={`${practitioner.full_name} photo`}
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
                              {practitioner.images.slice(0, 2).map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(index)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`${practitioner.full_name} photo ${index + 1}`}
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
                              {practitioner.images.slice(0, 3).map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(index)}
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`${practitioner.full_name} photo ${index + 1}`}
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
                                  src={practitioner.images[0]}
                                  alt={`${practitioner.full_name} main photo`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {practitioner.images.slice(1, 4).map((imageUrl, index) => (
                                  <div
                                    key={index + 1}
                                    className="aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImageIndex(index + 1)}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`${practitioner.full_name} photo ${index + 2}`}
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
                                    src={practitioner.images[0]}
                                    alt={`${practitioner.full_name} main photo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>

                                {/* Small Images Grid - 3 columns, 2 rows (images only) */}
                                <div className="col-span-3 grid grid-cols-2 gap-2 h-full">
                                  {/* Show remaining images (max 5 total display) */}
                                  {practitioner.images.slice(1, 5).map((imageUrl, index) => (
                                    <div
                                      key={index + 1}
                                      className="w-full h-full relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => setSelectedImageIndex(index + 1)}
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt={`${practitioner.full_name} photo ${index + 2}`}
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
      {selectedImageIndex !== null && practitioner.images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={practitioner.images[selectedImageIndex]}
              alt={`${practitioner.full_name} practice image ${selectedImageIndex + 1}`}
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
            {practitioner.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : practitioner.images.length - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex < practitioner.images.length - 1 ? selectedImageIndex + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {practitioner.images.length}
            </div>
          </div>
        </div>
      )}

      {/* See All Media Modal */}
      {showAllMediaModal && practitioner && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllMediaModal(false)}
        >
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {practitioner.full_name}&apos;s Media Gallery
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {practitioner.images?.length || 0} image{(practitioner.images?.length || 0) !== 1 ? 's' : ''}
                  {practitioner.video && ' • 1 video'}
                </p>
              </div>
              <button
                onClick={() => setShowAllMediaModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Media Grid with Scroll */}
            <div className="p-4 overflow-y-auto" style={{ height: 'calc(90vh - 120px)' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Video first if available */}
                {practitioner.video && (
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-900">
                    <video
                      src={practitioner.video}
                      controls
                      className="w-full h-full object-cover"
                      poster={practitioner.images?.[0]}
                    />
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      VIDEO
                    </div>
                  </div>
                )}

                {/* All Images */}
                {practitioner.images?.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square relative cursor-pointer group overflow-hidden rounded-lg bg-gray-200"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowAllMediaModal(false);
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${practitioner.full_name} practice image ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {(!practitioner.images || practitioner.images.length === 0) && !practitioner.video && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No media available</p>
                  <p className="text-gray-400 text-sm mt-1">This practitioner hasn&apos;t uploaded any photos or videos yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

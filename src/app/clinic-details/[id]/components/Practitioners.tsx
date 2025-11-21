"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Phone, Mail, GraduationCap, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { formatPractitionerName } from '@/lib/formatters';
import { getAvatarUrl } from '@/lib/formatters';

interface PractitionersProps {
  clinic: any;
}

interface ClinicMember {
  id: string;
  practitioner_id: string;
  firstname: string | null;
  lastname: string | null;
  title: string | null;
  degree: string | null;
  specialty: string[] | null;
  ptype: string | null;
  video: string | null;
  image: string | null;
  avatar: string | null;
  website: string | null;
}

export const Practitioners = ({ clinic }: PractitionersProps) => {
  const practitioners = clinic.practitioners || [];
  const [clinicMembers, setClinicMembers] = useState<ClinicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const defaultAvatar = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';

  // Carousel responsive configuration
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      partialVisibilityGutter: 40
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      partialVisibilityGutter: 30
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      partialVisibilityGutter: 30
    }
  };

  useEffect(() => {
    const fetchClinicMembers = async () => {
      if (!clinic?.practitioner_id) {
        console.log('No practitioner_id in clinic data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use public API route to fetch clinic members (bypasses RLS)
        const response = await fetch(
          `/api/clinic-members/public?clinic_id=${encodeURIComponent(clinic.practitioner_id)}`
        );

        if (!response.ok) {
          console.error('Error fetching clinic members:', response.statusText);
          setClinicMembers([]);
          setLoading(false);
          return;
        }

        const result = await response.json();
        const members = result.data || [];

        if (members.length === 0) {
          console.log('No clinic members found for clinic_id:', clinic.practitioner_id);
          setClinicMembers([]);
          setLoading(false);
          return;
        }

        console.log('Found clinic members:', members.length);

        // Filter out the clinic owner from the members list
        const filteredMembers = members.filter(
          (member: ClinicMember) => member.id !== clinic.practitioner_id
        ) as ClinicMember[];

        setClinicMembers(filteredMembers);
      } catch (error) {
        console.error('Error fetching clinic members:', error);
        setClinicMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicMembers();
  }, [clinic?.practitioner_id, clinic?.practitioner]);

  const getDisplayMedia = (member: ClinicMember) => {
    // Priority: video > image > default avatar
    if (member.video) {
      return { type: 'video', url: member.video };
    }
    if (member.image) {
      return { type: 'image', url: member.image };
    }
    return { type: 'image', url: getAvatarUrl(member.avatar) || defaultAvatar };
  };

  const getSpecialties = (member: ClinicMember): string[] => {
    if (member.specialty && member.specialty.length > 0) {
      return member.specialty;
    }
    if (member.ptype) {
      return [member.ptype];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#35375F' }}>
          Our Practitioners
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 bg-white border-2 border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="w-32 h-32 rounded-lg bg-gray-200 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#35375F' }}>
          Our Practitioners
        </h2>

        {clinicMembers.length > 0 ? (
          <Carousel
            additionalTransfrom={0}
            arrows
            autoPlaySpeed={3000}
            centerMode={false}
            className=""
            containerClass="container"
            dotListClass=""
            draggable={false}
            focusOnSelect={false}
            infinite={false}
            itemClass=""
            keyBoardControl
            minimumTouchDrag={0}
            pauseOnHover
            renderArrowsWhenDisabled={false}
            renderButtonGroupOutside={false}
            renderDotsOutside={false}
            responsive={responsive}
            rewind={false}
            rewindWithAnimation={false}
            rtl={false}
            shouldResetAutoplay
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
            swipeable={false}
          >
            {clinicMembers.map((member) => {
              const displayMedia = getDisplayMedia(member);
              const formattedName = formatPractitionerName(
                member.firstname,
                member.lastname,
                member.title,
                member.degree
              );
              const specialties = getSpecialties(member);

              const hasWebsite = !!member.website;
              const websiteUrl = member.website && !member.website.startsWith('http://') && !member.website.startsWith('https://')
                ? `https://${member.website}`
                : member.website;

              return (
                <div
                  key={member.id}
                  className="px-3 h-full"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
                    {/* Media Display - Video, Image, or Default Avatar */}
                    <div className="w-full aspect-[9/16] bg-gray-100 rounded-t-xl overflow-hidden relative flex-shrink-0 group">
                      {displayMedia.type === 'video' ? (
                        <>
                          <video
                            src={displayMedia.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay
                            loop
                          >
                            Your browser does not support the video tag.
                          </video>
                          {/* Video Controls Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center pointer-events-auto">
                              <Film className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                const video = e.currentTarget.closest('div')?.querySelector('video') as HTMLVideoElement;
                                if (video) {
                                  video.requestFullscreen();
                                }
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </button>
                            <button
                              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                const video = e.currentTarget.closest('div')?.querySelector('video') as HTMLVideoElement;
                                if (video) {
                                  video.muted = !video.muted;
                                }
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={displayMedia.url}
                            alt={formattedName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Name with Dr. prefix */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                        {formattedName}
                      </h3>

                      {/* Specialties as text */}
                      {specialties.length > 0 && (
                        <div className="text-center mb-6">
                          <p className="text-gray-700 text-sm">
                            {specialties.join(' • ')}
                          </p>
                        </div>
                      )}

                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>

                      {/* Book An Appointment Button */}
                      <div className="relative group mt-auto">
                        <button
                          onClick={() => {
                            if (websiteUrl) {
                              window.open(websiteUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          disabled={!hasWebsite}
                          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                            hasWebsite
                              ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={hasWebsite ? 'Visit practitioner website to book an appointment' : 'Website not available'}
                        >
                          Book An Appointment
                        </button>
                        {!hasWebsite && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Website not available
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Practitioner Information Coming Soon
            </h3>
            <p className="text-gray-600">
              Details about our healthcare professionals will be available shortly.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Join Our Team
        </h3>
        <p className="text-gray-700 mb-4">
          Are you a healthcare professional interested in joining our team? We&apos;re always looking for talented practitioners who share our commitment to excellent patient care.
        </p>
        <a
          href={`mailto:${clinic.clinic_email || 'info@clinic.com'}`}
          className="inline-flex items-center text-primary font-medium hover:underline"
        >
          Contact us about opportunities →
        </a>
      </div>
    </div>
  );
};

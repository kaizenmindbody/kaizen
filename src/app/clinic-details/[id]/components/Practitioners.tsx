"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Phone, Mail, GraduationCap, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { supabase } from '@/lib/supabase';
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

        // Fetch clinic members from ClinicMembers table
        // clinic_id in ClinicMembers refers to the clinic owner's practitioner_id
        // Only show members with accepted invitation status
        const { data: membersData, error: membersError } = await supabase
          .from('ClinicMembers')
          .select('practitioner_id, firstname, lastname, degree')
          .eq('clinic_id', clinic.practitioner_id)
          .eq('invitation_status', 'accepted');

        if (membersError) {
          console.error('Error fetching clinic members:', membersError);
          setClinicMembers([]);
          setLoading(false);
          return;
        }

        if (!membersData || membersData.length === 0) {
          console.log('No clinic members found for clinic_id:', clinic.practitioner_id);
          setClinicMembers([]);
          setLoading(false);
          return;
        }

        console.log('Found clinic members:', membersData.length);

        // Fetch full practitioner data for each member
        const memberPromises = membersData.map(async (member) => {
          // Fetch user data
          const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('id, firstname, lastname, title, degree, ptype, avatar, website')
            .eq('id', member.practitioner_id)
            .single();

          if (userError) {
            console.error(`Error fetching user ${member.practitioner_id}:`, userError);
            return null;
          }

          if (!userData) {
            console.warn(`User not found for practitioner_id: ${member.practitioner_id}`);
            return null;
          }

          // Fetch media from UserMedia table
          const { data: mediaData } = await supabase
            .from('UserMedia')
            .select('file_url, file_type, display_order')
            .eq('user_id', member.practitioner_id)
            .order('display_order', { ascending: true });

          // Get video and first image
          const video = mediaData?.find(m => m.file_type === 'video')?.file_url || null;
          const image = mediaData?.find(m => m.file_type === 'image')?.file_url || null;

          // Use ptype as specialty (Users table doesn't have specialty column)
          let specialty: string[] = [];
          if (userData.ptype) {
            specialty = [userData.ptype];
          }

          return {
            id: userData.id,
            practitioner_id: member.practitioner_id,
            firstname: userData.firstname || member.firstname,
            lastname: userData.lastname || member.lastname,
            title: userData.title || null,
            degree: userData.degree || member.degree || null,
            specialty: specialty.length > 0 ? specialty : null,
            ptype: userData.ptype || null,
            video,
            image,
            avatar: userData.avatar || null,
            website: userData.website || null,
          };
        });

        const members = (await Promise.all(memberPromises)).filter(Boolean) as ClinicMember[];
        
        // Filter out the clinic owner from the members list
        const filteredMembers = members.filter(member => member.id !== clinic.practitioner_id);
        
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
          Our Practitioners {practitioners.length > 0 && `(${practitioners.length})`}
        </h2>

        {practitioners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practitioners.map((practitioner: any, index: number) => (
              <Link
                key={practitioner.id || index}
                href={`/practitioner-details/${practitioner.id}`}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100 group-hover:border-primary/30 transition-colors">
                    <Image
                      src={practitioner.avatar}
                      alt={practitioner.full_name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {practitioner.full_name}
                  </h3>

                  {/* Degree */}
                  {practitioner.degree && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <GraduationCap className="w-4 h-4" />
                      <span>{practitioner.degree}</span>
                    </div>
                  )}

                  {/* Specialties */}
                  {practitioner.specialties && practitioner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {practitioner.specialties.map((specialty: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1 mb-4 w-full">
                    {practitioner.phone && (
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{practitioner.phone}</span>
                      </div>
                    )}
                    {practitioner.email && (
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{practitioner.email}</span>
                      </div>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <span className="text-primary font-medium group-hover:underline">
                    View Profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Practitioners Listed Yet
            </h3>
            <p className="text-gray-600">
              This clinic hasn&apos;t added any practitioners to their team yet.
            </p>
          </div>
        )}
      </div>

      {/* Join Our Team Section */}
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

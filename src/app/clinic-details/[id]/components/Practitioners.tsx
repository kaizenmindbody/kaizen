"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Phone, Mail, GraduationCap } from 'lucide-react';

interface PractitionersProps {
  clinic: any;
}

export const Practitioners = ({ clinic }: PractitionersProps) => {
  const practitioners = clinic.practitioners || [];

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

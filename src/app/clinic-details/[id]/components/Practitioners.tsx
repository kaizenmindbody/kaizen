"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';

interface PractitionersProps {
  clinic: any;
}

export const Practitioners = ({ clinic }: PractitionersProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#35375F' }}>
          Our Practitioners
        </h2>

        {clinic.practitioner ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href={`/practitioner-details/${clinic.practitioner.id}`}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100">
                  <Image
                    src={clinic.practitioner.avatar}
                    alt={clinic.practitioner.full_name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {clinic.practitioner.full_name}
                </h3>

                {clinic.practitioner.specialty && clinic.practitioner.specialty.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {clinic.practitioner.specialty.map((spec: string, index: number) => (
                      <span
                        key={index}
                        className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-primary font-medium hover:underline">
                  View Profile →
                </span>
              </div>
            </Link>
          </div>
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

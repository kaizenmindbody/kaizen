"use client";

import React from 'react';

interface AboutProps {
  clinic: any;
}

export const About = ({ clinic }: AboutProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#35375F' }}>
          About {clinic.clinic_name}
        </h2>

        <div className="prose max-w-none text-gray-700">
          <p className="text-lg mb-4">
            Welcome to {clinic.clinic_name}, a premier healthcare facility dedicated to providing exceptional medical care and service to our community.
          </p>

          {clinic.practitioner && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Led by Experienced Professionals
              </h3>
              <p className="text-gray-700">
                {clinic.clinic_name} is led by {clinic.practitioner.full_name},
                {clinic.practitioner.specialty && clinic.practitioner.specialty.length > 0 && (
                  <> specializing in {clinic.practitioner.specialty.join(', ')}</>
                )}.
                Our team brings years of experience and expertise to provide you with the highest quality of care.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

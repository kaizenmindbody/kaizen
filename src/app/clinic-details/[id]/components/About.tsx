"use client";

import React from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

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

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Our Commitment
              </h3>
              <p className="text-gray-700">
                We are committed to delivering comprehensive healthcare services with compassion, integrity, and excellence. Our team of dedicated professionals works together to ensure the best possible outcomes for our patients.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border border-green-100">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Patient-Centered Care
              </h3>
              <p className="text-gray-700">
                At {clinic.clinic_name}, we believe in patient-centered care that focuses on your unique needs and preferences. We take the time to listen, understand, and develop personalized treatment plans.
              </p>
            </div>
          </div>

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

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Why Choose Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">Comprehensive healthcare services under one roof</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">State-of-the-art facilities and equipment</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">Experienced and compassionate healthcare professionals</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">Convenient location and flexible scheduling</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">Commitment to patient satisfaction and positive outcomes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

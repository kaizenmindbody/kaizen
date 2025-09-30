"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignupPage = () => {
  const [_selectedUserType, setSelectedUserType] = useState<'practitioner' | 'patient' | null>(null);
  const router = useRouter();

  const handleUserTypeSelection = (userType: 'practitioner' | 'patient') => {
    setSelectedUserType(userType);

    if (userType === 'practitioner') {
      router.push('/auth/signup/practitioner');
    } else if (userType === 'patient') {
      router.push('/auth/signup/patient');
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-left">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign Up
          </h2>
        </div>

        {/* User Type Selection Cards */}
        <div className="mt-8 space-y-4">
          {/* Practitioner Card */}
          <button
            onClick={() => handleUserTypeSelection('practitioner')}
            className="w-full flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <div className="flex items-center space-x-4">
              {/* Practitioner Icon */}
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">

                  <Image
                    src="/images/users/practitioner.png"
                    alt="author"
                    fill
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Practitioner
                </h3>
                <p className="text-sm text-gray-500">
                  Join Kaizen and Expand Your Practice
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Patient Card */}
          <button
            onClick={() => handleUserTypeSelection('patient')}
            className="w-full flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <div className="flex items-center space-x-4">
              {/* Patient Icon */}
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src="/images/users/patient.png"
                    alt="author"
                    fill
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Patient
                </h3>
                <p className="text-sm text-gray-500">
                  Join Kaizen and Take Control of Your Health
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
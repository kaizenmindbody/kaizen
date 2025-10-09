"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignupPage = () => {
  const [_selectedUserType, setSelectedUserType] = useState<'practitioner' | 'eventhost' | null>(null);
  const router = useRouter();

  const handleUserTypeSelection = (userType: 'practitioner' | 'eventhost') => {
    setSelectedUserType(userType);

    if (userType === 'practitioner') {
      router.push('/auth/signup/practitioner');
    } else if (userType === 'eventhost') {
      router.push('/auth/signup/eventhost');
    }
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
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
                    src="/images/users/practitioner.jpg"
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
                <Image
                  src="/images/users/p-arrow.jpg"
                  alt="author"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </button>

          {/* Event Host Card */}
          <button
            onClick={() => handleUserTypeSelection('eventhost')}
            className="w-full flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <div className="flex items-center space-x-4">
              {/* Event Host Icon */}
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src="/images/users/eventhost.jpg"
                    alt="author"
                    fill
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Event Host
                </h3>
                <p className="text-sm text-gray-500">
                  Join Kaizen and Spread The Word About Your Event
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Image
                  src="/images/users/e-arrow.jpg"
                  alt="author"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
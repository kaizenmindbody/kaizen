"use client";

import {
  User,
  GraduationCap,
  Stethoscope,
  ClipboardList,
  Shield,
  Calendar
} from 'lucide-react';

interface AboutProps {
  practitioner: any;
  descriptionsData?: any;
}

export const About = ({ practitioner, descriptionsData }: AboutProps) => {
  // Use the descriptions data passed from parent
  const descriptions = descriptionsData;
  const loading = false; // Data is already loaded by parent

  if (loading) {
    return (
      <div className=" mx-auto">
        <div className="space-y-6 animate-pulse">
          {/* Title Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-1 w-24 bg-gray-200 rounded-full"></div>
          </div>

          {/* Card Skeletons */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">About {practitioner.full_name}</h3>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
        </div>

        {/* Professional Background - Grey Area on Top */}
        {descriptions?.background && (
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Professional Background</h4>
                <p className="text-gray-700 leading-relaxed text-base">{descriptions.background}</p>
              </div>
            </div>
          </div>
        )}

        {/* Education & Credentials - Grey */}
        {descriptions?.education && (
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Education & Credentials</h4>
                <p className="text-gray-700 leading-relaxed text-base">{descriptions.education}</p>
              </div>
            </div>
          </div>
        )}

        {/* Treatment Approach - Grey */}
        {descriptions?.treatment && (
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Treatment Approach</h4>
                <p className="text-gray-700 leading-relaxed text-base">{descriptions.treatment}</p>
              </div>
            </div>
          </div>
        )}

        {/* What To Expect On Your First Visit */}
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-3">What To Expect On Your First Visit</h4>
              <p className="text-gray-700 leading-relaxed text-base">
                {descriptions?.firstVisit ||
                 'Your first visit will include a comprehensive consultation and treatment plan discussion.'}
              </p>
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Insurance</h4>
              <div className="space-y-2">
                {descriptions?.insurance ? (
                  <p className="text-gray-700 leading-relaxed text-base">{descriptions.insurance}</p>
                ) : practitioner.insurance_accepted && practitioner.insurance_accepted.length > 0 ? (
                  <div className="space-y-2">
                    {practitioner.insurance_accepted.map((insurance, index) => (
                      <div key={index} className="flex items-center gap-3 text-gray-700 text-base">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        {insurance}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-base">
                    Please contact the office for insurance information.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Cancellation Policy</h4>
              <p className="text-gray-700 leading-relaxed text-base">
                {descriptions?.cancellation ||
                 practitioner.cancellation_policy ||
                 'Please provide 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a fee.'}
              </p>
            </div>
          </div>
        </div>

        {/* Fallback: Show aboutme from Users table or computed about */}
        {!descriptions?.background &&
         !descriptions?.education &&
         !descriptions?.treatment && (
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-gray-700 leading-relaxed text-base">
              {practitioner.aboutme ? (
                <p>{practitioner.aboutme}</p>
              ) : practitioner.about ? (
                <div dangerouslySetInnerHTML={{ __html: practitioner.about }} />
              ) : (
                <p className="text-gray-500 text-center py-8">No about information provided.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

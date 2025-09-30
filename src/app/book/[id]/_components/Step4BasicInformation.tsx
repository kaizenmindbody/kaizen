import React from 'react';
import { FormData, Step4BasicInformationProps } from '@/types/booking';

const Step4BasicInformation: React.FC<Step4BasicInformationProps> = ({
  formData,
  consentAgreed,
  policyAgreed,
  onFormChange,
  onConsentChange,
  onPolicyChange
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Note about patient information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Patient Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your personal information will be automatically retrieved from your account profile. Please ensure your profile is up to date before booking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Forms */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentAgreed}
              onChange={(e) => onConsentChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              <span className="font-medium">Patient Consent Form*</span> - Please Read and Sign √
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="policy"
              checked={policyAgreed}
              onChange={(e) => onPolicyChange(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="policy" className="text-sm text-gray-700">
              <span className="font-medium">Cancellation and No Show Policy*</span> √
            </label>
          </div>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <textarea
            value={formData.reasonForVisit}
            onChange={(e) => onFormChange('reasonForVisit', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Please describe the reason for your visit (optional)"
          />
        </div>
      </div>
    </div>
  );
};

export default Step4BasicInformation;
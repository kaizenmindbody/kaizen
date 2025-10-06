"use client";

import { ProfileData } from '@/types/user';
import { useState } from 'react';

interface ManageDescriptionsProps {
  profile: ProfileData | null;
}

const ManageDescriptions: React.FC<ManageDescriptionsProps> = ({ profile }) => {
  const [about, setAbout] = useState(profile?.about || '');
  const [specialties, setSpecialties] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Descriptions</h2>
        <p className="text-gray-600">Edit your professional bio and practice descriptions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About You
              <span className="text-gray-500 font-normal ml-2">(Professional Bio)</span>
            </label>
            <textarea
              rows={6}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Tell patients about your background, experience, and approach to care..."
            />
            <p className="text-sm text-gray-500 mt-2">{about.length} / 1000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties & Expertise
            </label>
            <textarea
              rows={4}
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your areas of specialization and expertise..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Philosophy
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Explain your treatment approach and philosophy..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conditions Treated
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="List the conditions and symptoms you commonly treat..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">Writing Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Be authentic and personable in your bio</li>
              <li>• Highlight what makes your practice unique</li>
              <li>• Use clear, patient-friendly language</li>
              <li>• Include relevant certifications and training</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageDescriptions;

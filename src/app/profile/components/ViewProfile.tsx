"use client";

import { ProfileData } from '@/types/user';

interface ViewProfileProps {
  profile: ProfileData | null;
}

const ViewProfile: React.FC<ViewProfileProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">View Profile</h2>
        <p className="text-gray-600">View your public profile as others see it.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.full_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'User Name'}</h3>
            <p className="text-gray-600">{profile?.user_type === 'practitioner' ? 'Practitioner' : 'Patient'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Email</h4>
            <p className="text-gray-900">{profile?.email || 'N/A'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Phone</h4>
            <p className="text-gray-900">{profile?.phone || 'N/A'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Address</h4>
            <p className="text-gray-900">{profile?.address || 'N/A'}</p>
          </div>
          {profile?.website && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Website</h4>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {profile.website}
              </a>
            </div>
          )}
        </div>

        {profile?.about && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{profile.about}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;

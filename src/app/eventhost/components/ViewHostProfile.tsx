import { UserData, EventHost } from '@/types/user';
import Image from 'next/image';

interface ViewHostProfileProps {
  profile: UserData | null;
  hostProfile: EventHost | null;
  setActiveTab: (tab: string) => void;
}

export default function ViewHostProfile({ profile, hostProfile, setActiveTab }: ViewHostProfileProps) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Host Profile</h1>
        <p className="text-gray-600 mt-1">View your host profile information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary">
              {hostProfile?.avatar ? (
                <Image
                  src={hostProfile.avatar}
                  alt="Host Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">
                  {profile?.firstname?.[0]}{profile?.lastname?.[0]}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {profile?.firstname} {profile?.lastname}
              </h3>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Event Host
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Host or Business Name
                </label>
                <p className="text-gray-900">{hostProfile?.business_name || 'N/A'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                {hostProfile?.website ? (
                  <a
                    href={hostProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hostProfile.website}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{hostProfile?.bio || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                {hostProfile?.instagram ? (
                  <a
                    href={hostProfile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hostProfile.instagram}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                {hostProfile?.facebook ? (
                  <a
                    href={hostProfile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hostProfile.facebook}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TikTok
                </label>
                {hostProfile?.tiktok ? (
                  <a
                    href={hostProfile.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hostProfile.tiktok}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                {hostProfile?.linkedin ? (
                  <a
                    href={hostProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {hostProfile.linkedin}
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('Manage Host Profile')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

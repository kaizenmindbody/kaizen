import { useState, useRef } from 'react';
import { UserData, EventHost } from '@/types/user';
import Image from 'next/image';

interface ManageHostProfileProps {
  profile: UserData | null;
  hostProfile: EventHost | null;
  updateHostProfile: (data: Partial<EventHost>) => Promise<{ success: boolean; error?: string }>;
  setActiveTab: (tab: string) => void;
}

export default function ManageHostProfile({ profile, hostProfile, updateHostProfile, setActiveTab }: ManageHostProfileProps) {
  const [formData, setFormData] = useState({
    business_name: hostProfile?.business_name || '',
    website: hostProfile?.website || '',
    bio: hostProfile?.bio || '',
    instagram: hostProfile?.instagram || '',
    facebook: hostProfile?.facebook || '',
    tiktok: hostProfile?.tiktok || '',
    linkedin: hostProfile?.linkedin || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(hostProfile?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !profile?.id) return null;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('userId', profile.id);
      formData.append('avatar', avatarFile);
      if (hostProfile?.avatar) {
        formData.append('oldAvatarUrl', hostProfile.avatar);
      }

      const response = await fetch('/api/eventhost/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload avatar');
      }

      return result.avatarUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Upload avatar first if there's a new one
      let avatarUrl = hostProfile?.avatar;
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload();
      }

      // Update profile with all data including avatar URL
      const result = await updateHostProfile({
        id: profile?.id,
        user_id: profile?.id,
        ...formData,
        avatar: avatarUrl,
      });

      setIsSubmitting(false);

      if (result.success) {
        setMessage({ type: 'success', text: 'Host profile updated successfully!' });
        setTimeout(() => {
          setActiveTab('View Host Profile');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setIsSubmitting(false);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile'
      });
    }
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Host Profile</h1>
        <p className="text-gray-600 mt-1">Update your host profile information</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                Change Photo
              </button>
              {avatarFile && (
                <p className="text-xs text-gray-500 mt-1">
                  New photo selected: {avatarFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Host or Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your business or host name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us about yourself and your events"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://facebook.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </label>
              <input
                type="text"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://tiktok.com/@yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingAvatar}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {(isUploadingAvatar || isSubmitting) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isUploadingAvatar ? 'Uploading Photo...' : 'Saving...'}</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('View Host Profile')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { ProfileData } from '@/types/user';
import { useState } from 'react';
import Image from 'next/image';

interface ManageImagesVideoProps {
  profile: ProfileData | null;
}

const ManageImagesVideo: React.FC<ManageImagesVideoProps> = ({ profile }) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Images and Video</h2>
        <p className="text-gray-600">Upload and manage your profile images and video.</p>
      </div>

      {/* Profile Avatar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mb-2">
              Upload New Picture
            </button>
            <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
          </div>
        </div>
      </div>

      {/* Gallery Images */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gallery Images</h3>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Upload Images
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Upload up to 10 images to showcase your practice.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Video */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Video</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a video to introduce yourself. Max size 50MB, recommended length 1-2 minutes.</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">No video uploaded</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Media Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality, professional images</li>
          <li>• Ensure good lighting in photos and videos</li>
          <li>• Show your practice space and equipment</li>
          <li>• Keep videos concise and engaging</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageImagesVideo;

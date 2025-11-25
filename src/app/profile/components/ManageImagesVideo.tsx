"use client";

import { ProfileData } from '@/types/user';
import { useState, useRef, useEffect, useMemo } from 'react';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { useImageVideo } from '@/hooks/useImageVideo';

interface ManageImagesVideoProps {
  profile: ProfileData | null;
}

const ManageImagesVideo: React.FC<ManageImagesVideoProps> = ({ profile }) => {
  const {
    images: uploadedImages,
    videos: uploadedVideos,
    loading,
    saving,
    error,
    successMessage,
    uploadMedia,
    deleteImage,
    deleteVideo,
    clearError,
    clearSuccessMessage,
  } = useImageVideo(profile?.id);

  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingVideos, setPendingVideos] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [videosPreviews, setVideosPreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Show success/error toasts
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const filesArray = Array.from(files);

    // Validate all files first
    for (const file of filesArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.error(`${file.name} is not a valid image file`);
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast.error(`${file.name} is larger than 10MB`);
        return;
      }
    }

    // Process all files
    let processedCount = 0;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;

        if (previewUrl) {
          newFiles.push(file);
          newPreviews.push(previewUrl);
          processedCount++;

          // When all files are processed, update state
          if (processedCount === filesArray.length) {
            setPendingImages(prev => [...prev, ...newFiles]);
            setImagesPreviews(prev => [...prev, ...newPreviews]);
            showToast.success(`${filesArray.length} image${filesArray.length > 1 ? 's' : ''} added! Click "Save Changes" to upload.`);
          }
        }
      };

      reader.onerror = (error) => {
        showToast.error(`Failed to load preview for ${file.name}`);
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Convert FileList to Array
    const filesArray = Array.from(files);

    // Validate all files first
    for (const file of filesArray) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        showToast.error(`${file.name} is not a valid video file`);
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }

      // Validate file size (600MB)
      if (file.size > 600 * 1024 * 1024) {
        showToast.error(`${file.name} is larger than 600MB`);
        // Reset input
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
    }

    // Process all files
    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    filesArray.forEach((file) => {
      newFiles.push(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
    });

    console.log(`Adding ${newFiles.length} video(s) to pending uploads`);
    setPendingVideos(prev => {
      const updated = [...prev, ...newFiles];
      console.log(`Pending videos count: ${updated.length}`);
      return updated;
    });
    setVideosPreviews(prev => [...prev, ...newPreviews]);
    showToast.success(`${filesArray.length} video${filesArray.length > 1 ? 's' : ''} added! Click "Save Changes" to upload.`);

    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePendingVideo = (index: number) => {
    // Revoke the object URL to free memory
    if (videosPreviews[index]) {
      URL.revokeObjectURL(videosPreviews[index]);
    }
    setPendingVideos(prev => prev.filter((_, i) => i !== index));
    setVideosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUploadedImage = async (imageUrl: string) => {
    if (!profile?.id) return;

    const success = await deleteImage(profile.id, imageUrl);
    if (!success) {
      // Error toast will be shown by the useEffect hook
    }
  };

  const handleDeleteUploadedVideo = async (videoUrl: string) => {
    if (!profile?.id) return;

    const success = await deleteVideo(profile.id, videoUrl);
    if (!success) {
      // Error toast will be shown by the useEffect hook
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      showToast.error('Profile ID not found');
      return;
    }

    if (pendingImages.length === 0 && pendingVideos.length === 0) {
      showToast.error('No changes to save');
      return;
    }

    try {
      const success = await uploadMedia(profile.id, pendingImages, pendingVideos);

      if (success) {
        // Clear pending items and previews
        setPendingImages([]);
        setPendingVideos([]);
        setImagesPreviews([]);

        // Revoke all video preview URLs to free memory
        videosPreviews.forEach(previewUrl => URL.revokeObjectURL(previewUrl));
        setVideosPreviews([]);

        showToast.success('Media uploaded successfully!');
      }
    } catch (err: any) {
      console.error('Media upload error:', err);
      showToast.error(err.message || 'Failed to upload media. Please try again.');
    }
  };

  // Track if there are unsaved changes
  const hasChanges = pendingImages.length > 0 || pendingVideos.length > 0;

  // Memoize filtered images to prevent re-filtering on every render
  const validUploadedImages = useMemo(() => {
    const filtered = uploadedImages.filter(url => url && url.trim() !== '');
    return filtered;
  }, [uploadedImages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Images and Video</h2>
          <p className="text-gray-600 mt-1">Upload and manage your profile media</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <i className="pi pi-spin pi-spinner mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="pi pi-check mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {/* Images Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Images</h3>
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={saving}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="pi pi-plus mr-2"></i>
              Add Images
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {validUploadedImages.length > 0 || imagesPreviews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Uploaded Images */}
            {validUploadedImages.map((imageUrl, index) => {
              return (
                <div key={`uploaded-${index}-${imageUrl.substring(imageUrl.length - 20)}`} className="relative group">
                  <div className="relative w-full h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteUploadedImage(imageUrl)}
                      className="opacity-0 group-hover:opacity-100 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all z-10"
                    >
                      <i className="pi pi-trash mr-2"></i>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pending Images (Previews) */}
            {imagesPreviews.map((previewUrl, index) => {
              return (
                <div key={`preview-${index}`} className="relative group">
                  <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-blue-400 overflow-hidden bg-gray-100">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded z-10">
                    New
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleRemovePendingImage(index)}
                      className="opacity-0 group-hover:opacity-100 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all z-10"
                    >
                      <i className="pi pi-times mr-2"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">No images yet. Click &ldquo;Add Images&rdquo; to upload multiple images at once.</p>
          </div>
        )}
      </div>

      {/* Video Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Profile Videos</h3>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoSelect}
              className="hidden"
              disabled={saving}
            />
            <button
              onClick={() => {
                console.log('Add Videos button clicked');
                if (videoInputRef.current) {
                  videoInputRef.current.click();
                } else {
                  console.error('Video input ref is not available');
                  showToast.error('Video input not available. Please refresh the page.');
                }
              }}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="pi pi-video mr-2"></i>
              Add Videos
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {uploadedVideos.length > 0 || videosPreviews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Uploaded Videos */}
            {uploadedVideos.map((videoUrl, index) => (
              <div key={`uploaded-video-${index}-${videoUrl.substring(videoUrl.length - 20)}`} className="relative group">
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-gray-200">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleDeleteUploadedVideo(videoUrl)}
                  className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
                >
                  <i className="pi pi-trash mr-2"></i>
                  Remove Video
                </button>
              </div>
            ))}

            {/* Pending Videos (Previews) */}
            {videosPreviews.map((previewUrl, index) => (
              <div key={`preview-video-${index}`} className="relative">
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border-2 border-dashed border-blue-400">
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded z-10">
                    New
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePendingVideo(index)}
                  className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
                >
                  <i className="pi pi-times mr-2"></i>
                  Cancel Video
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">No videos yet. Click &ldquo;Add Videos&rdquo; to upload multiple videos at once.</p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Media Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality, professional images and videos</li>
          <li>• Ensure good lighting in photos and videos</li>
          <li>• Show your practice space and equipment</li>
          <li>• Keep videos concise and engaging (1-2 minutes recommended)</li>
          <li>• Avoid copyrighted music in videos</li>
          <li>• Images: Max 10MB each, upload multiple at once</li>
          <li>• Videos: Max 600MB each, upload multiple at once</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageImagesVideo;

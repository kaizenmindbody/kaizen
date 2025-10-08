"use client";

import { ProfileData } from '@/types/user';
import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface ManageImagesVideoProps {
  profile: ProfileData | null;
}

const ManageImagesVideo: React.FC<ManageImagesVideoProps> = ({ profile }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Debug state changes
  useEffect(() => {
    console.log('uploadedImages state changed:', uploadedImages);
  }, [uploadedImages]);

  const loadMediaItems = useCallback(async () => {
    if (!profile?.id) {
      console.log('No profile ID, skipping media load');
      return;
    }

    console.log('Loading media for user:', profile.id);

    try {
      // Load from UserMedia table
      const { data: mediaData, error } = await supabase
        .from('UserMedia')
        .select('*')
        .eq('user_id', profile.id)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading media:', error);
        return;
      }

      console.log('Media data loaded:', mediaData);
      console.log('Media data count:', mediaData?.length);

      if (mediaData && mediaData.length > 0) {
        console.log('First media item structure:', mediaData[0]);
        console.log('First media item keys:', Object.keys(mediaData[0]));

        // Separate images and video
        const images = mediaData
          .filter(item => {
            console.log('Checking item:', item, 'file_type:', item.file_type);
            return item.file_type === 'image';
          })
          .map(item => {
            console.log('Mapping image item to URL:', item.file_url);
            return item.file_url;
          })
          .filter(url => url && url.trim() !== ''); // Filter out empty URLs

        const videoItem = mediaData.find(item => item.file_type === 'video');

        console.log('Filtered images count:', images.length);
        console.log('Parsed images:', images);
        console.log('Parsed video:', videoItem?.file_url);

        console.log('Setting uploadedImages state to:', images);
        setUploadedImages(images);
        setUploadedVideo(videoItem?.file_url || null);
      } else {
        console.log('No media data found in UserMedia table - clearing state');
        console.log('Setting uploadedImages state to: []');
        setUploadedImages([]);
        setUploadedVideo(null);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    }
  }, [profile?.id]);

  // Load media items on mount and when profile ID changes
  useEffect(() => {
    if (profile?.id) {
      console.log('useEffect triggered, loading media for profile ID:', profile.id);
      loadMediaItems();
    }
  }, [profile?.id, loadMediaItems]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    console.log('Selected file:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Create preview using FileReader for better compatibility
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      console.log('FileReader completed');
      console.log('Preview URL length:', previewUrl?.length);
      console.log('Preview URL starts with:', previewUrl?.substring(0, 50));

      if (previewUrl) {
        // Add to pending images
        setPendingImages(prev => {
          const newPending = [...prev, file];
          console.log('Pending images count:', newPending.length);
          return newPending;
        });

        setImagesPreviews(prev => {
          const newPreviews = [...prev, previewUrl];
          console.log('Previews count:', newPreviews.length);
          console.log('All preview URLs:', newPreviews.map((url, i) => `${i}: ${url.substring(0, 30)}...`));
          return newPreviews;
        });

        toast.success('Image added! Click "Save Changes" to upload.');
      } else {
        console.error('Preview URL is empty');
        toast.error('Failed to create preview');
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Failed to load image preview');
    };

    console.log('Starting FileReader for:', file.name);
    reader.readAsDataURL(file);

    // Reset input
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    // Set pending video
    setPendingVideo(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Reset input
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePendingVideo = () => {
    setPendingVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const handleDeleteUploadedImage = async (imageUrl: string) => {
    if (!profile?.id) return;

    try {
      // Delete from storage
      const imagePath = imageUrl.split('/').slice(-2).join('/');
      const { error: storageError } = await supabase.storage
        .from('kaizen')
        .remove([imagePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }

      // Delete from UserMedia table
      const { error: dbError } = await supabase
        .from('UserMedia')
        .delete()
        .eq('user_id', profile.id)
        .eq('file_url', imageUrl);

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

      // Update local state
      setUploadedImages(prev => prev.filter(url => url !== imageUrl));
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      console.error('Delete image error:', error);
      toast.error(`Failed to delete image: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteUploadedVideo = async () => {
    if (!profile?.id || !uploadedVideo) return;

    try {
      // Delete from storage
      const videoPath = uploadedVideo.split('/').slice(-2).join('/');
      const { error: storageError } = await supabase.storage
        .from('kaizen')
        .remove([videoPath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        throw storageError;
      }

      // Delete from UserMedia table
      const { error: dbError } = await supabase
        .from('UserMedia')
        .delete()
        .eq('user_id', profile.id)
        .eq('file_type', 'video');

      if (dbError) {
        console.error('Database delete error:', dbError);
        throw dbError;
      }

      // Update local state
      setUploadedVideo(null);
      toast.success('Video deleted successfully!');
    } catch (error: any) {
      console.error('Delete video error:', error);
      toast.error(`Failed to delete video: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      toast.error('Profile ID not found');
      return;
    }

    console.log('Starting save with pending images:', pendingImages.length);

    setSaving(true);
    try {
      let finalImages = [...uploadedImages];
      let finalVideo = uploadedVideo;

      // Upload pending images to storage and insert into UserMedia table
      for (let i = 0; i < pendingImages.length; i++) {
        const imageFile = pendingImages[i];
        console.log('Uploading image:', imageFile.name);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `usermedia/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('kaizen')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('kaizen')
          .getPublicUrl(filePath);

        // Insert into UserMedia table
        const { error: dbError } = await supabase
          .from('UserMedia')
          .insert({
            user_id: profile.id,
            file_url: publicUrl,
            file_name: imageFile.name,
            file_type: 'image',
            mime_type: imageFile.type,
            is_primary: finalImages.length === 0 && i === 0,
            display_order: finalImages.length + i,
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        }

        finalImages.push(publicUrl);
      }

      // Upload pending video (replaces existing video if any)
      if (pendingVideo) {
        // Delete old video from storage and database if exists
        if (uploadedVideo) {
          const oldVideoPath = uploadedVideo.split('/').slice(-2).join('/');
          await supabase.storage.from('kaizen').remove([oldVideoPath]);

          await supabase
            .from('UserMedia')
            .delete()
            .eq('user_id', profile.id)
            .eq('file_type', 'video');
        }

        const fileExt = pendingVideo.name.split('.').pop();
        const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
        const filePath = `usermedia/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('kaizen')
          .upload(filePath, pendingVideo);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('kaizen')
          .getPublicUrl(filePath);

        // Insert into UserMedia table
        const { error: dbError } = await supabase
          .from('UserMedia')
          .insert({
            user_id: profile.id,
            file_url: publicUrl,
            file_name: pendingVideo.name,
            file_type: 'video',
            mime_type: pendingVideo.type,
            is_primary: true,
            display_order: 0,
          });

        if (dbError) throw dbError;

        finalVideo = publicUrl;
      }

      toast.success('Media uploaded successfully!');

      // Update state
      setUploadedImages(finalImages);
      setUploadedVideo(finalVideo);
      setPendingImages([]);
      setPendingVideo(null);

      // Clean up previews
      setImagesPreviews([]);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
        setVideoPreview(null);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to save media: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Track if there are unsaved changes
  const [initialImagesCount, setInitialImagesCount] = useState(0);
  const [initialVideo, setInitialVideo] = useState<string | null>(null);

  useEffect(() => {
    setInitialImagesCount(uploadedImages.length);
    setInitialVideo(uploadedVideo);
  }, [uploadedImages, uploadedVideo]);

  const hasChanges = pendingImages.length > 0 ||
    pendingVideo !== null ||
    uploadedImages.length !== initialImagesCount ||
    uploadedVideo !== initialVideo;

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
              Add Image
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {uploadedImages.length > 0 || imagesPreviews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Uploaded Images */}
            {uploadedImages.filter(url => url && url.trim() !== '').map((imageUrl, index) => {
              if (!imageUrl) return null;
              console.log(`Rendering uploaded image ${index}:`, imageUrl);
              return (
                <div key={imageUrl} className="relative group">
                  <div className="relative w-full h-48 rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <Image
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                      onLoad={() => console.log(`Uploaded image ${index} loaded successfully`)}
                      onError={(e) => {
                        console.error(`Uploaded image ${index} load error`);
                        console.error('Failed URL:', imageUrl);
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
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
              console.log(`Rendering preview ${index}:`, previewUrl ? `${previewUrl.substring(0, 50)}...` : 'NO URL');
              return (
                <div key={`preview-${index}`} className="relative group">
                  <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-blue-400 overflow-hidden bg-white">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        onLoad={(e) => {
                          console.log(`Image preview ${index} loaded successfully`);
                        }}
                        onError={(e) => {
                          console.error(`Image load error for preview ${index}:`, e);
                          console.error('Failed src:', previewUrl.substring(0, 100));
                        }}
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
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
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
            <p className="mt-2 text-sm text-gray-600">No images yet. Click &ldquo;Add Image&rdquo; to get started.</p>
          </div>
        )}
      </div>

      {/* Video Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Profile Video</h3>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              disabled={saving}
            />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="pi pi-video mr-2"></i>
              {videoPreview || uploadedVideo ? 'Replace Video' : 'Add Video'}
            </button>
          </div>
        </div>

        {/* Video Display */}
        {videoPreview ? (
          <div className="relative">
            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded z-10">
              New Video (Preview)
            </div>
            <video
              src={videoPreview}
              controls
              className="w-full max-w-2xl rounded-lg border-2 border-dashed border-blue-400"
            />
            <button
              onClick={handleRemovePendingVideo}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="pi pi-times mr-2"></i>
              Cancel Video
            </button>
          </div>
        ) : uploadedVideo ? (
          <div className="relative">
            <video
              src={uploadedVideo}
              controls
              className="w-full max-w-2xl rounded-lg border border-gray-200"
            />
            <button
              onClick={handleDeleteUploadedVideo}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="pi pi-trash mr-2"></i>
              Remove Video
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">No video yet. Click &ldquo;Add Video&rdquo; to get started.</p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Media Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality, professional images</li>
          <li>• Ensure good lighting in photos and videos</li>
          <li>• Show your practice space and equipment</li>
          <li>• Keep videos concise and engaging (1-2 minutes recommended)</li>
          <li>• Avoid copyrighted music in videos</li>
          <li>• Images: Max 10MB each</li>
          <li>• Video: Max 50MB, replaces existing video</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageImagesVideo;

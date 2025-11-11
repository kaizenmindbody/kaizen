import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET: Fetch all media items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch media items from UserMedia table
    const { data: mediaData, error } = await supabase
      .from('UserMedia')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: mediaData || [],
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Upload media files (images and/or video)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const uploadedMedia: any[] = [];

    // Get current image count to set display_order
    const { data: existingMedia } = await supabase
      .from('UserMedia')
      .select('display_order')
      .eq('user_id', userId)
      .eq('file_type', 'image')
      .order('display_order', { ascending: false })
      .limit(1);

    let nextDisplayOrder = existingMedia && existingMedia.length > 0
      ? (existingMedia[0].display_order || 0) + 1
      : 0;

    // Check if there's already an image marked as primary
    const { data: primaryImage } = await supabase
      .from('UserMedia')
      .select('id')
      .eq('user_id', userId)
      .eq('file_type', 'image')
      .eq('is_primary', true)
      .limit(1);

    const hasPrimaryImage = primaryImage && primaryImage.length > 0;

    // Upload images
    const imageEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('image_'));

    for (const [key, file] of imageEntries) {
      if (!(file instanceof File)) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `usermedia/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('kaizen')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      // Insert into UserMedia table
      const isFirstImage = !hasPrimaryImage && uploadedMedia.filter(m => m.file_type === 'image').length === 0;

      const { data: insertedMedia, error: dbError } = await supabase
        .from('UserMedia')
        .insert({
          user_id: userId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: 'image',
          mime_type: file.type,
          is_primary: isFirstImage,
          display_order: nextDisplayOrder++,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Failed to save ${file.name} to database: ${dbError.message}`);
      }

      uploadedMedia.push(insertedMedia);
    }

    // Upload videos (support multiple videos)
    const videoEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('video_'));

    // Get current video count to set display_order
    const { data: existingVideos } = await supabase
      .from('UserMedia')
      .select('display_order')
      .eq('user_id', userId)
      .eq('file_type', 'video')
      .order('display_order', { ascending: false })
      .limit(1);

    let nextVideoDisplayOrder = existingVideos && existingVideos.length > 0
      ? (existingVideos[0].display_order || 0) + 1
      : 0;

    for (const [key, file] of videoEntries) {
      if (!(file instanceof File)) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `usermedia/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('kaizen')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Video upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      // Insert into UserMedia table
      const { data: insertedMedia, error: dbError } = await supabase
        .from('UserMedia')
        .insert({
          user_id: userId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: 'video',
          mime_type: file.type,
          is_primary: false,
          display_order: nextVideoDisplayOrder++,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Video database insert error:', dbError);
        throw new Error(`Failed to save ${file.name} to database: ${dbError.message}`);
      }

      uploadedMedia.push(insertedMedia);
    }

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      media: uploadedMedia,
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/media:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific media item
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileUrl, fileType } = body;

    if (!userId || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: 'User ID, file URL, and file type are required' },
        { status: 400 }
      );
    }

    if (fileType !== 'image' && fileType !== 'video') {
      return NextResponse.json(
        { error: 'File type must be "image" or "video"' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Delete from storage
    const filePath = fileUrl.split('/').slice(-2).join('/');
    const { error: storageError } = await supabase.storage
      .from('kaizen')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue even if storage delete fails - the file might already be deleted
    }

    // Delete from UserMedia table
    const { error: dbError } = await supabase
      .from('UserMedia')
      .delete()
      .eq('user_id', userId)
      .eq('file_url', fileUrl);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json(
        { error: `Failed to delete ${fileType} from database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

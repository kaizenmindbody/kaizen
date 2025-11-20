import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST: Upload avatar
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const avatarFile = formData.get('avatar') as File;
    const oldAvatarUrl = formData.get('oldAvatarUrl') as string | null;

    if (!userId || !avatarFile) {
      return NextResponse.json(
        { error: 'User ID and avatar file are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Delete old avatar if exists
    if (oldAvatarUrl) {
      try {
        const oldAvatarPath = oldAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('kaizen').remove([oldAvatarPath]);
      } catch (error) {
        // Continue even if deletion fails
      }
    }

    // Upload new avatar
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}_avatar_${Date.now()}.${fileExt}`;
    const filePath = `usermedia/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('kaizen')
      .upload(filePath, avatarFile);

    if (uploadError) {
      return NextResponse.json(
        { error: `Failed to upload avatar: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('kaizen')
      .getPublicUrl(filePath);

    // Update database
    const { error: dbError } = await supabase
      .from('Users')
      .update({ avatar: publicUrl })
      .eq('id', userId);

    if (dbError) {
      // Try to clean up uploaded file
      await supabase.storage.from('kaizen').remove([filePath]);
      return NextResponse.json(
        { error: `Failed to update avatar in database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { error: 'User ID and avatar URL are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Delete from storage
    const avatarPath = avatarUrl.split('/').slice(-2).join('/');
    const { error: storageError } = await supabase.storage
      .from('kaizen')
      .remove([avatarPath]);

    if (storageError) {
      // Continue even if storage delete fails
    }

    // Update database to set avatar to null
    const { error: dbError } = await supabase
      .from('Users')
      .update({ avatar: null })
      .eq('id', userId);

    if (dbError) {
      return NextResponse.json(
        { error: `Failed to remove avatar from database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

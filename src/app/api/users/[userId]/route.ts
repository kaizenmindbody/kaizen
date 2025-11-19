import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    // Extract only the fields we want to update
    const updateData: any = {};

    if (body.firstname !== undefined) updateData.firstname = body.firstname;
    if (body.lastname !== undefined) updateData.lastname = body.lastname;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.user_type !== undefined) updateData.type = body.user_type;
    if (body.clinic !== undefined) updateData.clinic = body.clinic;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.degree !== undefined) updateData.degree = body.degree;
    if (body.bio !== undefined) updateData.bio = body.bio;

    // Update the user in the database
    const { error } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch the updated user data
    const { data: updatedUser, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching updated user:', fetchError);
      // Still return success since the update worked
      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Unexpected error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Fetch user profile from database
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      firstname,
      lastname,
      phone,
      address,
      degree,
      title,
      specialty,
      clinic,
      ptype,
      clinicpage,
      website,
      languages,
      avatar,
      aboutme,
      gender,
      specialty_rate
    } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('[Profile Update] Received user_id:', user_id);

    const supabase = createServerSupabaseClient();

    // First, check if the user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    console.log('[Profile Update] Existing user check:', { existingUser, fetchError });

    if (fetchError) {
      console.error('[Profile Update] Error checking user existence:', fetchError);
      return NextResponse.json(
        { error: `Failed to verify user: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!existingUser) {
      console.error('[Profile Update] User not found with id:', user_id);
      return NextResponse.json(
        { error: 'User not found. Please ensure your account is properly set up.' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (degree !== undefined) updateData.degree = degree;
    if (title !== undefined) updateData.title = title;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (clinic !== undefined) updateData.clinic = clinic;
    if (ptype !== undefined) updateData.ptype = ptype;
    if (clinicpage !== undefined) updateData.clinicpage = clinicpage;
    if (website !== undefined) updateData.website = website;
    if (languages !== undefined) updateData.languages = languages ? JSON.stringify(languages) : JSON.stringify([]);
    if (avatar !== undefined) updateData.avatar = avatar;
    if (aboutme !== undefined) updateData.aboutme = aboutme;
    if (gender !== undefined) updateData.gender = gender;
    if (specialty_rate !== undefined) updateData.specialty_rate = specialty_rate ? JSON.stringify(specialty_rate) : null;

    console.log('[Profile Update] Update data:', updateData);

    // Update profile in database
    const { data: updatedData, error } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', user_id)
      .select();

    console.log('[Profile Update] Update result:', { updatedData, error });

    if (error) {
      console.error('[Profile Update] Error updating profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedData });
  } catch (err: any) {
    console.error('[Profile Update] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
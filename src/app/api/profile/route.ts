import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

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

    const supabase = createServerSupabaseClient();

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

    // Update profile in database
    const { error } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', user_id);

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
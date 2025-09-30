import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      full_name,
      phone,
      address,
      degrees,
      title,
      specialty,
      clinic,
      website,
      rate,
      languages,
      avatar,
      experience,
      aboutme,
      gender,
      specialty_rate,
      reviews
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

    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (degrees !== undefined) updateData.degree = degrees ? JSON.stringify(degrees.filter((d: string) => d.trim())) : JSON.stringify([]);
    if (title !== undefined) updateData.title = title;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (clinic !== undefined) updateData.clinic = clinic;
    if (website !== undefined) updateData.website = website;
    if (rate !== undefined) updateData.rate = rate || null;
    if (languages !== undefined) updateData.languages = languages ? JSON.stringify(languages) : JSON.stringify([]);
    if (avatar !== undefined) updateData.avatar = avatar;
    if (experience !== undefined) updateData.experience = experience || null;
    if (aboutme !== undefined) updateData.aboutme = aboutme;
    if (gender !== undefined) updateData.gender = gender;
    if (specialty_rate !== undefined) updateData.specialty_rate = specialty_rate ? JSON.stringify(specialty_rate) : null;
    if (reviews !== undefined) updateData.reviews = reviews || null;

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
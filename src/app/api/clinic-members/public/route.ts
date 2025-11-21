import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
      );
    }

    // Validate that clinic_id is a valid UUID format
    // clinic_id in ClinicMembers refers to the clinic owner's practitioner_id (UUID), not the clinic's integer id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clinicId)) {
      return NextResponse.json(
        { error: 'clinic_id must be a valid UUID (practitioner_id of clinic owner)' },
        { status: 400 }
      );
    }

    // Fetch clinic members with accepted invitation status
    // Using admin client to bypass RLS for public access
    const { data: membersData, error: membersError } = await supabaseAdmin
      .from('ClinicMembers')
      .select('practitioner_id, firstname, lastname, degree')
      .eq('clinic_id', clinicId)
      .eq('invitation_status', 'accepted');

    if (membersError) {
      return NextResponse.json(
        { error: `Failed to fetch clinic members: ${membersError.message}` },
        { status: 500 }
      );
    }

    if (!membersData || membersData.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Fetch full practitioner data for each member using admin client
    const memberPromises = membersData.map(async (member) => {
      // Fetch user data
      const { data: userData, error: userError } = await supabaseAdmin
        .from('Users')
        .select('id, firstname, lastname, title, degree, ptype, avatar, website')
        .eq('id', member.practitioner_id)
        .single();

      if (userError || !userData) {
        return null;
      }

      // Fetch media from UserMedia table
      const { data: mediaData } = await supabaseAdmin
        .from('UserMedia')
        .select('file_url, file_type, display_order')
        .eq('user_id', member.practitioner_id)
        .order('display_order', { ascending: true });

      // Get video and first image
      const video = mediaData?.find(m => m.file_type === 'video')?.file_url || null;
      const image = mediaData?.find(m => m.file_type === 'image')?.file_url || null;

      // Use ptype as specialty
      let specialty: string[] = [];
      if (userData.ptype) {
        specialty = [userData.ptype];
      }

      return {
        id: userData.id,
        practitioner_id: member.practitioner_id,
        firstname: userData.firstname || member.firstname,
        lastname: userData.lastname || member.lastname,
        title: userData.title || null,
        degree: userData.degree || member.degree || null,
        specialty: specialty.length > 0 ? specialty : null,
        ptype: userData.ptype || null,
        video,
        image,
        avatar: userData.avatar || null,
        website: userData.website || null,
      };
    });

    const members = (await Promise.all(memberPromises)).filter(Boolean);

    return NextResponse.json({ data: members }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


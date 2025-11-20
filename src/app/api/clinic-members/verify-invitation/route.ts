import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Fetch member by invitation token
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('ClinicMembers')
      .select(`
        id,
        email,
        firstname,
        lastname,
        phone,
        degree,
        website,
        address,
        clinic_id,
        invitation_status,
        invitation_expires_at
      `)
      .eq('invitation_token', token)
      .single();

    if (fetchError || !member) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (member.invitation_expires_at) {
      const expiresAt = new Date(member.invitation_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Invitation has expired' },
          { status: 410 } // 410 Gone
        );
      }
    }

    // Check if already registered
    if (member.invitation_status === 'registered') {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 409 } // 409 Conflict
        );
    }

    // Update invitation status from 'pending' to 'accepted' when user visits the link
    if (member.invitation_status === 'pending') {
      const { error: updateError } = await supabaseAdmin
        .from('ClinicMembers')
        .update({ invitation_status: 'accepted' })
        .eq('id', member.id);

      if (updateError) {
        // Don't fail the request, just log the error
      }
    }

    // Fetch clinic details
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('Clinics')
      .select('clinic_name, practitioner_id')
      .eq('id', member.clinic_id)
      .single();

    // Return member details for pre-filling signup form
    return NextResponse.json(
      {
        success: true,
        member: {
          email: member.email,
          firstname: member.firstname,
          lastname: member.lastname,
          phone: member.phone,
          degree: member.degree,
          website: member.website,
          address: member.address,
          clinicName: clinic?.clinic_name || 'Unknown Clinic',
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

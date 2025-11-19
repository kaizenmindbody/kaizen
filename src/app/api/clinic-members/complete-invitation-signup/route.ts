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
    const { token, password, firstname, lastname, phone } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Fetch member by invitation token
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('ClinicMembers')
      .select('*')
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
          { status: 410 }
        );
      }
    }

    // Check if already registered
    if (member.invitation_status === 'registered' || member.user_id) {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 409 }
      );
    }

    // Check if email already has an account
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(u => u.email === member.email);

    if (emailExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: member.email,
      password: password,
      email_confirm: true, // Auto-confirm email since invitation was already verified
      user_metadata: {
        firstname: firstname || member.firstname,
        lastname: lastname || member.lastname,
        phone: phone || member.phone,
        type: 'Practitioner',
        invited_via_clinic: true,
        clinic_id: member.clinic_id
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: `Failed to create account: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Insert into Users table
    const { error: insertError } = await supabaseAdmin
      .from('Users')
      .insert({
        id: authData.user.id,
        firstname: firstname || member.firstname,
        lastname: lastname || member.lastname,
        email: member.email,
        phone: phone || member.phone,
        type: 'Practitioner',
        degree: member.degree,
        website: member.website,
        avatar: member.avatar,
      });

    if (insertError) {
      console.error('User table insert error:', insertError);
      // Note: Auth user was created, but Users table insert failed
      // We should handle this better in production
    }

    // Update ClinicMembers record with user_id and status
    const { error: updateError } = await supabaseAdmin
      .from('ClinicMembers')
      .update({
        user_id: authData.user.id,
        invitation_status: 'registered',
        firstname: firstname || member.firstname,
        lastname: lastname || member.lastname,
        phone: phone || member.phone,
        // Clear the token after successful registration
        invitation_token: null,
      })
      .eq('id', member.id);

    if (updateError) {
      console.error('ClinicMembers update error:', updateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

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
    const { email, firstName, lastName, message, metadata } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError || !existingUsers?.users) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { error: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    const userExists = existingUsers.users.some((user: any) => user.email === email);

    if (userExists) {
      // User already has an account - send a custom notification instead
      // For now, we'll return a specific message
      // You could implement a custom email notification here if needed
      return NextResponse.json(
        {
          success: true,
          message: 'User already exists. Invitation recorded in database.',
          userExists: true,
          info: 'The practitioner already has an account. They can log in and accept the invitation from their dashboard.'
        },
        { status: 200 }
      );
    }

    // User doesn't exist - send Supabase invitation
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: firstName && lastName ? `${firstName} ${lastName}` : '',
        type: 'Practitioner', // Default to practitioner type
        custom_message: message,
        ...metadata, // Any additional metadata
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    });

    if (error) {
      console.error('Error inviting user:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation email sent successfully',
        user: data.user,
        userExists: false
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

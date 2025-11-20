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
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    // Check existing users in auth
    const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthEmails = (existingUsersData?.users || [])
      .map((u: any) => u.email?.toLowerCase())
      .filter(Boolean);

    // Filter to only emails that exist in the provided list
    const providedEmailsLower = emails.map((e: string) => e.toLowerCase());
    const matchingEmails = existingAuthEmails.filter((email: string) =>
      providedEmailsLower.includes(email)
    );

    return NextResponse.json({
      success: true,
      existingEmails: matchingEmails,
      totalChecked: emails.length,
      found: matchingEmails.length
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


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

interface CSVUser {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  degree?: string;
  website?: string;
  address?: string;
  avatar?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { users, clinicId } = body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Users array is required' },
        { status: 400 }
      );
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as Array<{ email: string; userId: string; message: string }>,
      failed: [] as Array<{ email: string; error: string }>,
      skipped: [] as Array<{ email: string; reason: string }>
    };

    // Check existing users in auth
    const { data: existingUsersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingEmails = new Set(
      existingUsersData?.users?.map((u: any) => u.email.toLowerCase()) || []
    );

    // Process each user
    for (const user of users as CSVUser[]) {
      const email = user.email?.toLowerCase().trim();
      
      if (!email || !email.includes('@')) {
        results.failed.push({
          email: user.email || 'unknown',
          error: 'Invalid email address'
        });
        continue;
      }

      // PRIORITY: Check Users table first - practitioner_id MUST be Users.id
      const { data: existingUser } = await supabaseAdmin
        .from('Users')
        .select('id, email, type')
        .eq('email', email)
        .single();

      if (existingUser) {
        // User exists in Users table - use their ID
        // Update user type to Practitioner if not already
        if (existingUser.type !== 'Practitioner') {
          const { error: updateError } = await supabaseAdmin
            .from('Users')
            .update({ type: 'Practitioner' })
            .eq('id', existingUser.id);

          if (updateError) {
            results.failed.push({
              email,
              error: `Failed to update user type: ${updateError.message}`
            });
            continue;
          }
        }

        // Return the Users.id - this will be used as practitioner_id
        results.success.push({
          email,
          userId: existingUser.id,
          message: existingUser.type === 'Practitioner' 
            ? 'User already exists as Practitioner - ready to add to clinic'
            : 'User type updated to Practitioner - ready to add to clinic'
        });
        continue;
      }

      // User doesn't exist in Users table - check Auth and create if needed
      // Auth user exists but no Users table record - create it
      if (existingEmails.has(email)) {
        const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
        const foundAuthUser = authUser?.users?.find((u: any) => u.email.toLowerCase() === email);

        if (foundAuthUser) {
          // Create Users record using Auth user's ID
          const { error: insertError } = await supabaseAdmin
            .from('Users')
            .insert({
              id: foundAuthUser.id,
              email: user.email,
              firstname: user.firstname || null,
              lastname: user.lastname || null,
              phone: user.phone || null,
              type: 'Practitioner',
              degree: user.degree || null,
              website: user.website || null,
              address: user.address || null,
              avatar: user.avatar || null,
            });

          if (insertError) {
            results.failed.push({
              email,
              error: `Failed to create Users record: ${insertError.message}`
            });
          } else {
            // Return the Users.id - this will be used as practitioner_id
            results.success.push({
              email,
              userId: foundAuthUser.id,
              message: 'Users record created for existing auth user - ready to add to clinic'
            });
          }
        } else {
          results.failed.push({
            email,
            error: 'Auth user found but could not retrieve ID'
          });
        }
        continue;
      }

      // Generate a secure random password
      const tempPassword = generateSecurePassword();

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            phone: user.phone || '',
            type: 'Practitioner',
            invited_via_clinic: true,
            clinic_id: clinicId
          }
        });

        if (authError) {
          results.failed.push({
            email,
            error: `Failed to create auth user: ${authError.message}`
          });
          continue;
        }

        if (!authData.user) {
          results.failed.push({
            email,
            error: 'Auth user creation returned no user data'
          });
          continue;
        }

        // Create Users table record
        const { error: insertError } = await supabaseAdmin
          .from('Users')
          .insert({
            id: authData.user.id,
            email: user.email,
            firstname: user.firstname || null,
            lastname: user.lastname || null,
            phone: user.phone || null,
            type: 'Practitioner',
            degree: user.degree || null,
            website: user.website || null,
            address: user.address || null,
            avatar: user.avatar || null,
          });

        if (insertError) {
          // Auth user was created but Users insert failed
          // Try to delete the auth user to maintain consistency
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          
          results.failed.push({
            email,
            error: `Failed to create Users record: ${insertError.message}`
          });
          continue;
        }

        results.success.push({
          email,
          userId: authData.user.id,
          message: 'User created successfully in Auth and Users table'
        });

      } catch (error: any) {
        results.failed.push({
          email,
          error: `Unexpected error: ${error.message}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: users.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Generate a secure random password
function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}


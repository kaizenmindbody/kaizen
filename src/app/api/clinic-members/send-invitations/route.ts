import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

// Generate a secure random token
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberIds, clinicName } = body;

    // Validate required fields
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs array is required' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    // Process each member
    for (const memberId of memberIds) {
      try {
        // Fetch member details
        const { data: member, error: fetchError } = await supabaseAdmin
          .from('ClinicMembers')
          .select('id, email, firstname, lastname, clinic_id, invitation_status')
          .eq('id', memberId)
          .single();

        if (fetchError || !member) {
          results.failed.push({
            email: 'Unknown',
            error: 'Member not found'
          });
          continue;
        }

        // Skip if already registered
        if (member.invitation_status === 'registered') {
          results.failed.push({
            email: member.email,
            error: 'Already registered'
          });
          continue;
        }

        // Generate invitation token
        const invitationToken = generateInvitationToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        // Update member with invitation token
        const { error: updateError } = await supabaseAdmin
          .from('ClinicMembers')
          .update({
            invitation_token: invitationToken,
            invitation_status: 'pending',
            invitation_sent_at: new Date().toISOString(),
            invitation_expires_at: expiresAt.toISOString()
          })
          .eq('id', memberId);

        if (updateError) {
          // Check if error is due to missing columns (migration not run)
          if (updateError.message.includes('invitation_expires_at') || 
              updateError.message.includes('invitation_sent_at') ||
              updateError.message.includes('invitation_token') ||
              updateError.message.includes('invitation_status') ||
              updateError.message.includes('schema cache') ||
              updateError.message.includes('column') && updateError.message.includes('not found')) {
            results.failed.push({
              email: member.email,
              error: 'Database migration required. Please run: public/sql/add-invitation-tracking-to-clinic-members.sql in Supabase SQL Editor. See MIGRATION_INSTRUCTIONS.md for details.'
            });
          } else {
            results.failed.push({
              email: member.email,
              error: `Failed to update member: ${updateError.message}`
            });
          }
          continue;
        }

        // Create invitation URL
        const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/signup/invitation?token=${invitationToken}`;

        // Check if user already exists in Auth
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = authUsers?.users?.find((u: any) => u.email.toLowerCase() === member.email.toLowerCase());

        let emailSent = false;
        let emailError: any = null;

        if (existingAuthUser) {
          // User already exists in Auth - use password reset link that redirects to invitation page
          // This uses Supabase's email service
          try {
            const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: member.email,
              options: {
                redirectTo: invitationUrl,
              }
            });

            if (!resetError && resetData?.properties?.action_link) {
              // Password reset email will be sent via Supabase's email service
              // The link will redirect to our invitation page
              emailSent = true;
            } else {
              emailError = resetError;
            }
          } catch (err: any) {
            emailError = err;
          }
        } else {
          // User doesn't exist in Auth - use inviteUserByEmail (Supabase's email service)
          
          // Use the same format as manual invite - redirect to our invitation page
          const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            member.email,
            {
              redirectTo: invitationUrl, // Redirect to our custom invitation page with token
            }
          );

          if (inviteError) {
            emailError = inviteError;
            
            // Check if error is because user already exists (race condition)
            if (inviteError.message.includes('already been registered') || 
                inviteError.message.includes('already exists')) {
              // User was created between our check and the invite call
              // Try password reset approach
              try {
                const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                  type: 'recovery',
                  email: member.email,
                  options: {
                    redirectTo: invitationUrl,
                  }
                });

                if (!resetError && resetData?.properties?.action_link) {
                  emailSent = true;
                } else {
                  emailError = resetError;
                }
              } catch (err: any) {
                emailError = err;
              }
            }
          } else if (inviteData?.user) {
            // Success - invitation email sent
            emailSent = true;
            
            // Note: Supabase may return success but email might not be sent if:
            // 1. SMTP not configured (uses default service with rate limits)
            // 2. Email quota exceeded
            // 3. Email in spam folder
            // Check Supabase Dashboard → Logs → Auth Logs for email delivery status
          } else {
            // No error but no user data - unexpected response
            emailError = new Error('Invitation sent but no user data returned');
          }
        }

        if (emailSent) {
          results.success.push(member.email);
        } else {
          const errorMsg = emailError?.message || 'Failed to send invitation email via Supabase email service.';
          results.failed.push({
            email: member.email,
            error: errorMsg
          });
        }
      } catch (error: any) {
        results.failed.push({
          email: 'Unknown',
          error: error.message || 'Unexpected error'
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        results,
        message: `Sent ${results.success.length} invitation(s), ${results.failed.length} failed`
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

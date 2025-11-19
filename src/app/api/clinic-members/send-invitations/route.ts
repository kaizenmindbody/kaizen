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
          results.failed.push({
            email: member.email,
            error: `Failed to update member: ${updateError.message}`
          });
          continue;
        }

        // Create invitation URL
        const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/signup/invitation?token=${invitationToken}`;

        // Send invitation email using Supabase Auth
        // We'll use a workaround: create a temporary "magic link" style invitation
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .button:hover { background: #2563eb; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited to Join ${clinicName || 'Our Clinic'}</h1>
    </div>
    <div class="content">
      <p>Hi ${member.firstname || 'there'},</p>

      <p>You've been invited to join <strong>${clinicName || 'the clinic'}</strong> on our platform!</p>

      <p>To accept this invitation and create your account, please click the button below:</p>

      <div style="text-align: center;">
        <a href="${invitationUrl}" class="button">Accept Invitation & Sign Up</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${invitationUrl}">${invitationUrl}</a>
      </p>

      <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
        <strong>Note:</strong> This invitation link will expire in 7 days.
      </p>

      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
        `;

        // Use Supabase admin to send email
        // Note: This requires Supabase email templates to be configured
        // Alternative: Use a service like Resend, SendGrid, or AWS SES

        // For now, we'll use Supabase's inviteUserByEmail as a workaround
        // This will send an email, but the user still needs to use our custom signup page
        const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          member.email,
          {
            data: {
              firstname: member.firstname,
              lastname: member.lastname,
              invitation_token: invitationToken,
              clinic_id: member.clinic_id,
              custom_invite: true,
            },
            redirectTo: invitationUrl,
          }
        );

        if (emailError) {
          // If Supabase email fails, we should use an alternative email service
          // For now, log the error but don't fail the entire operation
          console.error(`Email send error for ${member.email}:`, emailError);

          results.failed.push({
            email: member.email,
            error: `Invitation created but email failed: ${emailError.message}`
          });
          continue;
        }

        results.success.push(member.email);
      } catch (error: any) {
        console.error(`Error processing member ${memberId}:`, error);
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
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

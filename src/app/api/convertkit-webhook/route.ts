import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * ConvertKit Webhook Handler
 * 
 * This endpoint receives notifications from ConvertKit when someone subscribes.
 * It will send an email notification to hello@kaizenmindbody.com
 * 
 * To set this up in ConvertKit:
 * 1. Go to ConvertKit Dashboard → Settings → Webhooks
 * 2. Add a new webhook
 * 3. Select "Subscriber created" event
 * 4. Set URL to: https://yourdomain.com/api/convertkit-webhook
 * 5. Save
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ConvertKit webhook payload structure
    const { subscriber } = body;
    
    if (!subscriber || !subscriber.email) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Create transporter for sending notification email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send notification email to hello@kaizenmindbody.com
    const notificationMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'hello@kaizenmindbody.com',
      subject: `New Newsletter Subscriber: ${subscriber.email}`,
      html: `
        <h2>New Newsletter Subscriber</h2>
        <p><strong>Email:</strong> ${subscriber.email}</p>
        <p><strong>Name:</strong> ${subscriber.first_name || 'Not provided'} ${subscriber.last_name || ''}</p>
        <p><strong>Subscribed at:</strong> ${new Date(subscriber.created_at).toLocaleString()}</p>
        <hr>
        <p><small>This notification was sent from the ConvertKit webhook.</small></p>
      `,
    };

    await transporter.sendMail(notificationMailOptions);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (error: any) {
    console.error('ConvertKit webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}


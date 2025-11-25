import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email app password
      },
    });

    // Email to admin (you)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'hello@kaizenmindbody.com', // Default to hello@kaizenmindbody.com if ADMIN_EMAIL not set
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This message was sent from the Kaizen contact form.</small></p>
      `,
    };

    // Send email to admin
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({
      message: 'Message sent successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleCalendarService } from '@/lib/google-calendar';
import { supabase } from '@/lib/supabase';

// POST - Create calendar event for booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking details with patient and practitioner information
    const { data: booking, error: bookingError } = await supabase
      .from('Books')
      .select(`
        *,
        patient:Users!patient_id(id, email, full_name),
        practitioner:Users!practitioner_id(id, email, full_name)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Skip calendar creation for blocked slots
    if (booking.service_type === 'blocked') {
      return NextResponse.json({
        message: 'Calendar event not created for blocked slots',
        booking_id
      });
    }

    // Check if patient and practitioner data exist
    if (!booking.patient || !booking.practitioner) {
      return NextResponse.json(
        { error: 'Patient or practitioner information missing' },
        { status: 400 }
      );
    }

    const calendarService = createGoogleCalendarService();
    const result = await calendarService.createBookingEvent({
      practitioner: {
        email: booking.practitioner.email,
        full_name: booking.practitioner.full_name,
      },
      patient: {
        email: booking.patient.email,
        full_name: booking.patient.full_name,
      },
      date: booking.date,
      time: booking.time,
      service_type: booking.service_type,
      reason: booking.reason,
    });

    if (!result.success) {
      console.error('Failed to create calendar event:', result.error);
      return NextResponse.json(
        { error: 'Failed to create calendar event', details: result.error },
        { status: 500 }
      );
    }

    // Update booking with calendar event ID
    const { error: updateError } = await supabase
      .from('Books')
      .update({ calendar_event_id: result.eventId })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Error updating booking with calendar event ID:', updateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      message: 'Calendar event created successfully',
      eventId: result.eventId,
      booking_id
    });
  } catch (error) {
    console.error('Error in calendar POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update calendar event for booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking details with calendar event ID
    const { data: booking, error: bookingError } = await supabase
      .from('Books')
      .select(`
        *,
        patient:Users!patient_id(id, email, full_name),
        practitioner:Users!practitioner_id(id, email, full_name)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.calendar_event_id) {
      return NextResponse.json(
        { error: 'No calendar event associated with this booking' },
        { status: 400 }
      );
    }

    // Skip calendar update for blocked slots
    if (booking.service_type === 'blocked') {
      return NextResponse.json({
        message: 'Calendar event not updated for blocked slots',
        booking_id
      });
    }

    if (!booking.patient || !booking.practitioner) {
      return NextResponse.json(
        { error: 'Patient or practitioner information missing' },
        { status: 400 }
      );
    }

    const calendarService = createGoogleCalendarService();
    const result = await calendarService.updateBookingEvent(booking.calendar_event_id, {
      practitioner: {
        email: booking.practitioner.email,
        full_name: booking.practitioner.full_name,
      },
      patient: {
        email: booking.patient.email,
        full_name: booking.patient.full_name,
      },
      date: booking.date,
      time: booking.time,
      service_type: booking.service_type,
      reason: booking.reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to update calendar event', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Calendar event updated successfully',
      booking_id
    });
  } catch (error) {
    console.error('Error in calendar PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete calendar event for booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const booking_id = searchParams.get('booking_id');

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking to get calendar event ID
    const { data: booking, error: bookingError } = await supabase
      .from('Books')
      .select('calendar_event_id')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.calendar_event_id) {
      return NextResponse.json({
        message: 'No calendar event to delete',
        booking_id
      });
    }

    const calendarService = createGoogleCalendarService();
    const result = await calendarService.deleteBookingEvent(booking.calendar_event_id);

    if (!result.success) {
      console.error('Failed to delete calendar event:', result.error);
      // Don't fail the request, just log the error
    }

    // Clear calendar event ID from booking
    const { error: updateError } = await supabase
      .from('Books')
      .update({ calendar_event_id: null })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Error clearing calendar event ID:', updateError);
    }

    return NextResponse.json({
      message: 'Calendar event deleted successfully',
      booking_id
    });
  } catch (error) {
    console.error('Error in calendar DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practitioner_id = searchParams.get('practitioner_id');
    const patient_id = searchParams.get('patient_id');
    const date = searchParams.get('date');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const status = searchParams.get('status');

    let query = supabase
      .from('Books')
      .select('*');

    // Add filters based on query parameters
    if (practitioner_id) {
      query = query.eq('practitioner_id', practitioner_id);
    }

    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    if (date) {
      query = query.eq('date', date);
    } else if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
    } else if (start_date) {
      query = query.gte('date', start_date);
    } else if (end_date) {
      query = query.lte('date', end_date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('date').order('time');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Fetch patient and practitioner details for each booking
    if (data && data.length > 0) {
      const patientIds = [...new Set(data.map(booking => booking.patient_id))].filter(id => id); // Remove null/undefined
      const practitionerIds = [...new Set(data.map(booking => booking.practitioner_id))].filter(id => id); // Remove null/undefined

      // Fetch both patient and practitioner data (only if we have IDs to fetch)
      const fetchPromises = [];

      if (patientIds.length > 0) {
        fetchPromises.push(
          supabase
            .from('Users')
            .select('id, full_name, email, phone, avatar')
            .in('id', patientIds)
        );
      } else {
        fetchPromises.push(Promise.resolve({ data: [], error: null }));
      }

      if (practitionerIds.length > 0) {
        fetchPromises.push(
          supabase
            .from('Users')
            .select('id, full_name, email, phone, avatar')
            .in('id', practitionerIds)
        );
      } else {
        fetchPromises.push(Promise.resolve({ data: [], error: null }));
      }

      const [patientsResponse, practitionersResponse] = await Promise.all(fetchPromises);

      const { data: patients, error: patientsError } = patientsResponse;
      const { data: practitioners, error: practitionersError } = practitionersResponse;

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
      }
      if (practitionersError) {
        console.error('Error fetching practitioners:', practitionersError);
      }

      // Create maps for quick lookup (even if one fails, we can still provide partial data)
      const patientMap = patients ? patients.reduce((acc, patient) => {
        acc[patient.id] = patient;
        return acc;
      }, {}) : {};

      const practitionerMap = practitioners ? practitioners.reduce((acc, practitioner) => {
        acc[practitioner.id] = practitioner;
        return acc;
      }, {}) : {};

      // Add patient and practitioner data to each booking
      const bookingsWithDetails = data.map(booking => {
        const patient = patientMap[booking.patient_id] || null;
        const practitioner = practitionerMap[booking.practitioner_id] || null;
        return {
          ...booking,
          patient,
          practitioner
        };
      });

      return NextResponse.json({ bookings: bookingsWithDetails });
    }

    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error('Error in bookings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      practitioner_id,
      patient_id,
      date,
      time,
      service_type,
      price,
      reason,
      book_number
    } = body;

    // Validate required fields - for blocked slots, patient_id and price are optional
    const isBlockedSlot = service_type === 'blocked';

    if (!practitioner_id || !date || !time || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For regular appointments, patient_id and price are required
    if (!isBlockedSlot && (!patient_id || !price)) {
      return NextResponse.json(
        { error: 'Missing required fields for appointment booking' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if the time slot is already booked
    const { data: existingBooking, error: checkError } = await supabase
      .from('Books')
      .select('id')
      .eq('practitioner_id', practitioner_id)
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'confirmed')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing booking:', checkError);
      console.error('Error details:', {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      });
      return NextResponse.json(
        { error: 'Failed to check availability', details: checkError.message },
        { status: 500 }
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Create the booking or blocked slot
    const insertData = {
      practitioner_id,
      patient_id: isBlockedSlot ? null : patient_id,
      date,
      time,
      service_type,
      price: isBlockedSlot ? null : Number(price), // No price for blocked slots
      reason: isBlockedSlot ? 'Personal appointment' : reason,
      book_number: isBlockedSlot ? null : book_number,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('Books')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to create booking', details: error.message },
        { status: 500 }
      );
    }

    // Create Google Calendar event for patient bookings (not blocked slots)
    if (!isBlockedSlot && data) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: data.id })
        });
      } catch (calendarError) {
        // Don't fail the booking creation if calendar fails
      }
    }

    return NextResponse.json({
      message: isBlockedSlot ? 'Time slot blocked successfully' : 'Booking created successfully',
      booking: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a booking (for status changes, cancellations, etc.) or reschedule bookings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, reason, book_number, reschedule_data } = body;

    // Handle rescheduling multiple bookings
    if (book_number && reschedule_data) {

      // First, delete all existing bookings with this book number
      const { error: deleteError } = await supabase
        .from('Books')
        .delete()
        .eq('book_number', book_number);

      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to delete old bookings', details: deleteError.message },
          { status: 500 }
        );
      }

      // Then create new bookings with the same book number
      const { data, error } = await supabase
        .from('Books')
        .insert(reschedule_data)
        .select('*');

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create rescheduled bookings', details: error.message },
          { status: 500 }
        );
      }

      // Create calendar events for rescheduled bookings
      if (data && data.length > 0) {
        for (const booking of data) {
          if (booking.service_type !== 'blocked') {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: booking.id })
              });
            } catch (calendarError) {
            }
          }
        }
      }

      return NextResponse.json({
        message: `Successfully rescheduled ${data?.length || 0} bookings`,
        bookings: data
      });
    }

    // Handle single booking update
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (status) {
      updateData.status = status;
    }

    if (reason !== undefined) {
      updateData.reason = reason;
    }

    const { data, error } = await supabase
      .from('Books')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Update calendar event if booking has one and it's not a blocked slot
    if (data && data.calendar_event_id && data.service_type !== 'blocked') {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: id })
        });
      } catch (calendarError) {
      }
    }

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel bookings by book number or individual booking ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const book_number = searchParams.get('book_number');
    const booking_id = searchParams.get('id');

    if (!book_number && !booking_id) {
      return NextResponse.json(
        { error: 'Either book_number or id is required' },
        { status: 400 }
      );
    }

    let data, error;

    if (booking_id) {
      // Delete individual booking by ID (for blocked slots)
      const result = await supabase
        .from('Books')
        .delete()
        .eq('id', booking_id)
        .select('*');
      data = result.data;
      error = result.error;
    } else {
      // Delete all bookings with the same book number (for appointment cancellation)
      const result = await supabase
        .from('Books')
        .delete()
        .eq('book_number', book_number)
        .select('*');
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error cancelling bookings:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to cancel bookings', details: error.message },
        { status: 500 }
      );
    }

    // Delete calendar events for cancelled bookings
    if (data && data.length > 0) {
      for (const booking of data) {
        if (booking.calendar_event_id && booking.service_type !== 'blocked') {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/calendar?booking_id=${booking.id}`, {
              method: 'DELETE'
            });
          } catch (calendarError) {
          }
        }
      }
    }

    return NextResponse.json({
      message: booking_id
        ? `Successfully deleted booking`
        : `Successfully cancelled ${data?.length || 0} bookings`,
      cancelledBookings: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Check practitioner availability based on bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practitioner_id = searchParams.get('practitioner_id');
    const date = searchParams.get('date');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!practitioner_id) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    // Default time slots (8-12 PM, 2-6 PM)
    const defaultTimeSlots = [
      '08:00', '09:00', '10:00', '11:00', // Morning: 8-12 (4 slots)
      '14:00', '15:00', '16:00', '17:00'  // Afternoon: 2-6 (4 slots)
    ];

    let query = supabase
      .from('Books')
      .select('date, time')
      .eq('practitioner_id', practitioner_id)
      .eq('status', 'confirmed'); // Only consider confirmed bookings

    // Also fetch manual availability blocks
    let availabilityQuery = supabase
      .from('Availabilities')
      .select('date, unavailable_slots')
      .eq('practitioner_id', practitioner_id);

    // Add date filters to both queries
    if (date) {
      query = query.eq('date', date);
      availabilityQuery = availabilityQuery.eq('date', date);
    } else if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
      availabilityQuery = availabilityQuery.gte('date', start_date).lte('date', end_date);
    } else if (start_date) {
      query = query.gte('date', start_date);
      availabilityQuery = availabilityQuery.gte('date', start_date);
    } else if (end_date) {
      query = query.lte('date', end_date);
      availabilityQuery = availabilityQuery.lte('date', end_date);
    }

    query = query.order('date').order('time');
    availabilityQuery = availabilityQuery.order('date');

    // Execute both queries in parallel
    const [bookingsResult, availabilityResult] = await Promise.all([
      query,
      availabilityQuery
    ]);

    const { data: bookings, error } = bookingsResult;
    const { data: availabilityRecords } = availabilityResult;

    if (error) {
      console.error('Error fetching bookings for availability:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    // If querying for a specific date
    if (date) {
      const bookedSlots = bookings ? bookings.map(booking => booking.time) : [];

      // Get manually blocked slots for this date
      let manuallyBlockedSlots: string[] = [];
      if (availabilityRecords && availabilityRecords.length > 0) {
        const availabilityRecord = availabilityRecords.find(record => record.date === date);
        if (availabilityRecord) {
          manuallyBlockedSlots = availabilityRecord.unavailable_slots || [];
        }
      }

      const availableSlots = {
        morning: [],
        afternoon: []
      };

      // Morning slots (8-12)
      defaultTimeSlots.slice(0, 4).forEach(slot => {
        // Available only if not booked AND not manually blocked
        if (!bookedSlots.includes(slot) && !manuallyBlockedSlots.includes(slot)) {
          const hour = parseInt(slot.split(':')[0]);
          const nextHour = hour + 1;
          const startTime = `${hour}:00 AM`;
          const endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
          const displayTime = `${startTime} - ${endTime}`;
          availableSlots.morning.push(displayTime);
        }
      });

      // Afternoon slots (2-6)
      defaultTimeSlots.slice(4, 8).forEach(slot => {
        // Available only if not booked AND not manually blocked
        if (!bookedSlots.includes(slot) && !manuallyBlockedSlots.includes(slot)) {
          const hour = parseInt(slot.split(':')[0]);
          const nextHour = hour + 1;
          const displayTime = `${hour - 12}:00 PM - ${nextHour - 12}:00 PM`;
          availableSlots.afternoon.push(displayTime);
        }
      });

      return NextResponse.json({
        date,
        availability: availableSlots,
        bookedSlots,
        manuallyBlockedSlots
      });
    }

    // For date range queries, group by date
    const availabilityByDate: { [date: string]: any } = {};

    // Group bookings by date
    const bookingsByDate: { [date: string]: string[] } = {};
    if (bookings) {
      bookings.forEach(booking => {
        const dateKey = booking.date;
        if (!bookingsByDate[dateKey]) {
          bookingsByDate[dateKey] = [];
        }
        bookingsByDate[dateKey].push(booking.time);
      });
    }

    // Calculate availability for each date in the range
    const startDateObj = new Date(start_date || date || new Date().toISOString().split('T')[0]);
    const endDateObj = new Date(end_date || date || startDateObj);

    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const bookedSlots = bookingsByDate[dateKey] || [];

      const availableSlots = {
        morning: [],
        afternoon: []
      };

      // Morning slots
      defaultTimeSlots.slice(0, 4).forEach(slot => {
        if (!bookedSlots.includes(slot)) {
          const hour = parseInt(slot.split(':')[0]);
          const nextHour = hour + 1;
          const startTime = `${hour}:00 AM`;
          const endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
          const displayTime = `${startTime} - ${endTime}`;
          availableSlots.morning.push(displayTime);
        }
      });

      // Afternoon slots
      defaultTimeSlots.slice(4, 8).forEach(slot => {
        if (!bookedSlots.includes(slot)) {
          const hour = parseInt(slot.split(':')[0]);
          const nextHour = hour + 1;
          const displayTime = `${hour - 12}:00 PM - ${nextHour - 12}:00 PM`;
          availableSlots.afternoon.push(displayTime);
        }
      });

      availabilityByDate[dateKey] = {
        availability: availableSlots,
        bookedSlots,
        totalAvailable: availableSlots.morning.length + availableSlots.afternoon.length,
        totalSlots: defaultTimeSlots.length
      };
    }

    return NextResponse.json({
      availability: availabilityByDate,
      defaultTimeSlots
    });
  } catch (error) {
    console.error('Error in availability GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
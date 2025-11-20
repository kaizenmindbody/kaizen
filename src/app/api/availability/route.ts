import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch practitioner availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const practitioner_id = searchParams.get('practitioner_id');
    const date = searchParams.get('date'); // Optional: get availability for specific date
    const start_date = searchParams.get('start_date'); // Optional: date range start
    const end_date = searchParams.get('end_date'); // Optional: date range end

    if (!practitioner_id) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('Availabilities')
      .select('*')
      .eq('practitioner_id', practitioner_id);

    // Add date filters if provided
    if (date) {
      query = query.eq('date', date);
    } else if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
    } else if (start_date) {
      query = query.gte('date', start_date);
    } else if (end_date) {
      query = query.lte('date', end_date);
    }

    query = query.order('date');

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ availability: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save/Update practitioner availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitioner_id, date, unavailable_slots } = body;

    if (!practitioner_id || !date) {
      return NextResponse.json(
        { error: 'Practitioner ID and date are required' },
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

    // Validate unavailable_slots is an array
    if (unavailable_slots && !Array.isArray(unavailable_slots)) {
      return NextResponse.json(
        { error: 'Unavailable slots must be an array' },
        { status: 400 }
      );
    }

    const slotsToSave = unavailable_slots || [];

    // Upsert availability record for the specific date
    const { data, error } = await supabase
      .from('Availabilities')
      .upsert({
        practitioner_id,
        date,
        unavailable_slots: slotsToSave,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'practitioner_id,date'
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Availability saved successfully',
      data 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
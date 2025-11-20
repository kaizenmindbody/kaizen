import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Availabilities')
      .select('*')
      .eq('practitioner_id', id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to fetch availability', details: error.message },
        { status: 500 }
      );
    }

    // Process the data to parse JSON fields
    const processedData = data?.map(availability => ({
      ...availability,
      unavailable_slots: availability.unavailable_slots ?
        (typeof availability.unavailable_slots === 'string' ?
          JSON.parse(availability.unavailable_slots) : availability.unavailable_slots) : []
    })) || [];

    return NextResponse.json({ availabilities: processedData });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
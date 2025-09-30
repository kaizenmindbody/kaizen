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
      .from('Users')
      .select('*')
      .eq('id', id)
      .eq('user_type', 'practitioner')
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to fetch practitioner', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    // Process the data to parse JSON fields
    const processedData = {
      ...data,
      degrees: data.degree ?
        (typeof data.degree === 'string' ? JSON.parse(data.degree) : data.degree) : [],
      languages: data.languages ?
        (typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages) : [],
      specialty_rate: data.specialty_rate ?
        (typeof data.specialty_rate === 'string' ? JSON.parse(data.specialty_rate) : data.specialty_rate) : {},
    };

    return NextResponse.json({ practitioner: processedData });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
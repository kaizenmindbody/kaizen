import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch AboutUs data from Supabase
    const { data: aboutUsItems, error } = await supabase
      .from('AboutUs')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch about us data from database',
          success: false
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: aboutUsItems || [],
      success: true
    });
  } catch (error) {
    console.error('Error fetching about us data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch about us data',
        success: false
      },
      { status: 500 }
    );
  }
}
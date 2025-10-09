import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          success: false,
          data: []
        },
        { status: 500 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

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
          success: false,
          data: []
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
        success: false,
        data: []
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('TCMFaqs')
      .select('*');
    if (error) {
      console.error('Error fetching TCM FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch TCM FAQs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
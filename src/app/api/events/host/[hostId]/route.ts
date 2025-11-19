import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hostId: string }> }
) {
  try {
    // In Next.js 15, params is a Promise and must be awaited
    const { hostId } = await context.params;

    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      );
    }

    console.log('[API Events Host] Fetching events for hostId:', hostId);

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      console.error('[API Events Host] Failed to create Supabase client');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[API Events Host] Querying Events table...');

    const { data, error } = await supabase
      .from('Events')
      .select('*')
      .eq('host_id', hostId)
      .order('event_start_datetime', { ascending: false });

    if (error) {
      console.error('[API Events Host] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        {
          error: 'Failed to fetch events',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('[API Events Host] Query successful. Found events:', data?.length || 0);

    if (data && data.length > 0) {
      console.log('[API Events Host] Sample event:', data[0]);
    }

    return NextResponse.json({
      success: true,
      events: data || [],
    });
  } catch (error: any) {
    console.error('[API Events Host] Unexpected error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
        type: error?.name
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

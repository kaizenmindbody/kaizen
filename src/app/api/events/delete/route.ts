import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const hostId = searchParams.get('host_id');


    // Validate required fields
    if (!eventId || !hostId) {
      return NextResponse.json(
        { error: 'Event ID and Host ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Validate Supabase client
    if (!supabase) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First, get the event to retrieve the image URL
    const { data: eventData, error: fetchError } = await supabase
      .from('Events')
      .select('event_image')
      .eq('id', eventId)
      .eq('host_id', hostId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the event (cascade will delete related ticket types)
    const { error: deleteError } = await supabase
      .from('Events')
      .delete()
      .eq('id', eventId)
      .eq('host_id', hostId); // Ensure user can only delete their own events

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete event: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Delete event image from storage if it exists
    if (eventData?.event_image) {
      try {
        const filePath = eventData.event_image.split('/').slice(-2).join('/');
        await supabase.storage.from('kaizen').remove([filePath]);
      } catch (imageError) {
        // Continue anyway - event is already deleted
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

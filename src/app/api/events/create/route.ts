import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract event data
    const hostId = formData.get('host_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const location = formData.get('location') as string;
    const eventImageFile = formData.get('event_image') as File | null;
    const ticketTypesJson = formData.get('ticket_types') as string;

    // Validate required fields
    if (!hostId || !title || !description ||
        !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Upload event image if provided
    let eventImageUrl = null;
    if (eventImageFile && eventImageFile.size > 0) {
      const fileExt = eventImageFile.name.split('.').pop();
      const fileName = `${hostId}_event_${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kaizen')
        .upload(filePath, eventImageFile);

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload event image: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      eventImageUrl = publicUrl;
    }

    // Create event
    const { data: eventData, error: eventError } = await supabase
      .from('Events')
      .insert({
        host_id: hostId,
        title: title,
        description: description,
        start_date: startDate,
        end_date: endDate,
        location: location,
        image: eventImageUrl,
        status: 'draft',
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);

      // Clean up uploaded image if event creation failed
      if (eventImageUrl) {
        const filePath = eventImageUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('kaizen').remove([filePath]);
      }

      return NextResponse.json(
        { error: `Failed to create event: ${eventError.message}` },
        { status: 500 }
      );
    }

    // Create ticket types if provided
    let ticketTypes = [];
    if (ticketTypesJson) {
      try {
        ticketTypes = JSON.parse(ticketTypesJson);
      } catch (parseError) {
        console.error('Error parsing ticket types:', parseError);
      }
    }

    if (ticketTypes.length > 0) {
      const ticketTypeInserts = ticketTypes.map((ticket: any, index: number) => ({
        event_id: eventData.id,
        ticket_name: ticket.name,
        description: ticket.description || null,
        max_quantity: parseInt(ticket.quantity),
        sales_start_datetime: ticket.salesStartDate,
        sales_end_datetime: ticket.salesEndDate,
        price: parseFloat(ticket.price),
        requires_approval: ticket.requiresApproval || false,
        suggested_pricing: ticket.suggestedPricing || false,
        is_sold_out: ticket.markedAsSoldOut || false,
        display_order: index,
      }));

      const { error: ticketError } = await supabase
        .from('TicketTypes')
        .insert(ticketTypeInserts);

      if (ticketError) {
        console.error('Ticket types creation error:', ticketError);
        // Event was created, so we should still return success but note the ticket error
        return NextResponse.json(
          {
            success: true,
            message: 'Event created but some ticket types failed to save',
            eventId: eventData.id,
            warning: ticketError.message,
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      eventId: eventData.id,
      event: eventData,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error in POST /api/events/create:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

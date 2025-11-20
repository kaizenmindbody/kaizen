import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract event data
    const hostId = formData.get('host_id') as string;
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const description = formData.get('description') as string;
    const whatToBring = formData.get('what_to_bring') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const location = formData.get('location') as string;
    const hideAddress = formData.get('hide_address') === 'true';
    const enableTicketing = formData.get('enable_ticketing') === 'true';
    const nonRefundable = formData.get('non_refundable') === 'true';
    const status = formData.get('status') as string || 'draft';
    const eventImageFile = formData.get('event_image') as File | null;
    const ticketTypesJson = formData.get('ticket_types') as string;

    // Validate required fields
    if (!hostId || !title || !summary || !description ||
        !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
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

    // Upload event image if provided
    let eventImageUrl = null;
    if (eventImageFile && eventImageFile.size > 0) {
      try {
        const fileExt = eventImageFile.name.split('.').pop();
        const fileName = `${hostId}_event_${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        // Convert File to ArrayBuffer then to Buffer for upload
        const arrayBuffer = await eventImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('kaizen')
          .upload(filePath, buffer, {
            contentType: eventImageFile.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
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
      } catch (uploadErr: any) {
        return NextResponse.json(
          { error: `Failed to upload event image: ${uploadErr.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Create event with correct column names
    const { data: eventData, error: eventError } = await supabase
      .from('Events')
      .insert({
        host_id: hostId,
        event_name: title,
        event_summary: summary,
        event_description: description,
        what_to_bring: whatToBring || null,
        event_start_datetime: startDate,
        event_end_datetime: endDate,
        address: location,
        event_image: eventImageUrl,
        hide_address: hideAddress,
        enable_ticketing: enableTicketing,
        non_refundable: nonRefundable,
        status: status,
      })
      .select()
      .single();

    if (eventError) {

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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// Configure the route to accept larger file uploads
export const maxDuration = 60; // Maximum allowed duration
export const runtime = 'nodejs';

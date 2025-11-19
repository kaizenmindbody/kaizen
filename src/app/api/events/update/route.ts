import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    console.log('[Event Update API] Starting event update...');
    const formData = await request.formData();

    // Extract event data
    const eventId = formData.get('event_id') as string;
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
    const existingImageUrl = formData.get('existing_image_url') as string | null;
    const ticketTypesJson = formData.get('ticket_types') as string;

    console.log('[Event Update API] Received data:', {
      eventId,
      hostId,
      title,
      hasNewImage: !!eventImageFile,
      existingImageUrl
    });

    // Validate required fields
    if (!eventId || !hostId || !title || !summary || !description ||
        !startDate || !endDate || !location) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Validate Supabase client
    if (!supabase) {
      console.error('Failed to create Supabase client');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Upload new event image if provided, otherwise keep existing
    let eventImageUrl = existingImageUrl;
    if (eventImageFile && eventImageFile.size > 0) {
      try {
        const fileExt = eventImageFile.name.split('.').pop();
        const fileName = `${hostId}_event_${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        console.log('Uploading new event image:', {
          fileName,
          filePath,
          fileSize: eventImageFile.size,
          fileType: eventImageFile.type
        });

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
        console.log('Event image uploaded successfully:', publicUrl);

        // Delete old image if it exists
        if (existingImageUrl) {
          try {
            const oldFilePath = existingImageUrl.split('/').slice(-2).join('/');
            await supabase.storage.from('kaizen').remove([oldFilePath]);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
            // Continue anyway - this is not critical
          }
        }
      } catch (uploadErr: any) {
        console.error('Event image upload exception:', uploadErr);
        return NextResponse.json(
          { error: `Failed to upload event image: ${uploadErr.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Update event with correct column names
    const { data: eventData, error: eventError } = await supabase
      .from('Events')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('host_id', hostId) // Ensure user can only update their own events
      .select()
      .single();

    if (eventError) {
      console.error('Event update error:', eventError);
      return NextResponse.json(
        { error: `Failed to update event: ${eventError.message}` },
        { status: 500 }
      );
    }

    // Delete existing ticket types and create new ones
    if (ticketTypesJson) {
      try {
        // First, delete existing ticket types
        await supabase
          .from('TicketTypes')
          .delete()
          .eq('event_id', eventId);

        // Parse and insert new ticket types
        const ticketTypes = JSON.parse(ticketTypesJson);

        if (ticketTypes.length > 0) {
          const ticketTypeInserts = ticketTypes.map((ticket: any, index: number) => ({
            event_id: eventId,
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
            console.error('Ticket types update error:', ticketError);
            return NextResponse.json(
              {
                success: true,
                message: 'Event updated but some ticket types failed to save',
                eventId: eventData.id,
                warning: ticketError.message,
              },
              { status: 200 }
            );
          }
        }
      } catch (parseError) {
        console.error('Error parsing ticket types:', parseError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      eventId: eventData.id,
      event: eventData,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in PUT /api/events/update:', error);
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

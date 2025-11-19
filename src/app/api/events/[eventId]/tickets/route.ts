import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[Tickets API] Fetching tickets for event:', eventId);

    // Fetch ticket types for the event
    const { data: ticketTypes, error } = await supabase
      .from('TicketTypes')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Tickets API] Error fetching ticket types:', error);
      return NextResponse.json(
        { error: `Failed to fetch ticket types: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    console.log('[Tickets API] Found tickets:', ticketTypes?.length || 0);

    // Transform to match the frontend TicketType interface
    const formattedTickets = (ticketTypes || []).map((ticket: any) => ({
      id: ticket.id.toString(),
      name: ticket.ticket_name,
      description: ticket.description || '',
      quantity: ticket.max_quantity,
      salesStartDate: ticket.sales_start_datetime,
      salesEndDate: ticket.sales_end_datetime,
      price: ticket.price,
      requiresApproval: ticket.requires_approval,
      suggestedPricing: ticket.suggested_pricing,
      markedAsSoldOut: ticket.is_sold_out,
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
    });
  } catch (error: any) {
    console.error('Error in GET /api/events/[eventId]/tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

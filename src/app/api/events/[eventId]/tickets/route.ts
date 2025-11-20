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

    // Fetch ticket types for the event
    const { data: ticketTypes, error } = await supabase
      .from('TicketTypes')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch ticket types: ${error.message}`, details: error },
        { status: 500 }
      );
    }

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
      is_active: ticket.is_active !== false, // Default to true if not specified
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

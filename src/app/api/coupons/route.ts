import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Fetch all coupons for the host or practitioner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('host_id');
    const practitionerId = searchParams.get('practitioner_id');

    if (!hostId && !practitionerId) {
      return NextResponse.json(
        { error: 'Host ID or Practitioner ID is required' },
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

    let query = supabase
      .from('Coupons')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by either host_id or practitioner_id
    if (hostId) {
      query = query.eq('host_id', hostId);
    } else if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }

    const { data: coupons, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      coupons: coupons || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      host_id,
      practitioner_id,
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active,
      event_id,
    } = body;

    if ((!host_id && !practitioner_id) || !code || !discount_type || !discount_value || !max_uses || !valid_from || !valid_until) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const insertData: any = {
      code: code.toUpperCase(),
      description,
      discount_type,
      discount_value,
      max_uses,
      used_count: 0,
      valid_from,
      valid_until,
      is_active: is_active ?? true,
      event_id: event_id || null,
    };

    // Add either host_id or practitioner_id
    if (host_id) {
      insertData.host_id = host_id;
    } else if (practitioner_id) {
      insertData.practitioner_id = practitioner_id;
    }

    const { data: coupon, error } = await supabase
      .from('Coupons')
      .insert(insertData)
      .select()
      .single();

    if (error) {

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing coupon
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      host_id,
      practitioner_id,
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active,
      event_id,
    } = body;

    if (!id || (!host_id && !practitioner_id)) {
      return NextResponse.json(
        { error: 'Coupon ID and Host ID or Practitioner ID are required' },
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

    let query = supabase
      .from('Coupons')
      .update({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        max_uses,
        valid_from,
        valid_until,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Add filter for either host_id or practitioner_id
    if (host_id) {
      query = query.eq('host_id', host_id);
    } else if (practitioner_id) {
      query = query.eq('practitioner_id', practitioner_id);
    }

    const { data: coupon, error } = await query
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hostId = searchParams.get('host_id');
    const practitionerId = searchParams.get('practitioner_id');

    if (!id || (!hostId && !practitionerId)) {
      return NextResponse.json(
        { error: 'Coupon ID and Host ID or Practitioner ID are required' },
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

    let query = supabase
      .from('Coupons')
      .delete()
      .eq('id', id);

    // Add filter for either host_id or practitioner_id
    if (hostId) {
      query = query.eq('host_id', hostId);
    } else if (practitionerId) {
      query = query.eq('practitioner_id', practitionerId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

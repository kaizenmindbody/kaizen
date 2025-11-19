import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Fetch all coupons for the host
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('host_id');

    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
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

    const { data: coupons, error } = await supabase
      .from('Coupons')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
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
    console.error('Error in GET /api/coupons:', error);
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
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active,
    } = body;

    if (!host_id || !code || !discount_type || !discount_value || !max_uses || !valid_from || !valid_until) {
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

    const { data: coupon, error } = await supabase
      .from('Coupons')
      .insert({
        host_id,
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        max_uses,
        used_count: 0,
        valid_from,
        valid_until,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);

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
    console.error('Error in POST /api/coupons:', error);
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
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active,
    } = body;

    if (!id || !host_id) {
      return NextResponse.json(
        { error: 'Coupon ID and Host ID are required' },
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

    const { data: coupon, error } = await supabase
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
      .eq('id', id)
      .eq('host_id', host_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
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
    console.error('Error in PUT /api/coupons:', error);
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

    if (!id || !hostId) {
      return NextResponse.json(
        { error: 'Coupon ID and Host ID are required' },
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

    const { error } = await supabase
      .from('Coupons')
      .delete()
      .eq('id', id)
      .eq('host_id', hostId);

    if (error) {
      console.error('Error deleting coupon:', error);
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
    console.error('Error in DELETE /api/coupons:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

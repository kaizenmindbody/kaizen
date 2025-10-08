import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET all services
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Services')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services', details: error.message },
        { status: 500 }
      );
    }

    // Ensure all services have a valid type, defaulting to 'real' if missing
    const services = (data || []).map((service: any) => ({
      id: service.id,
      title: service.title,
      type: service.type && ['real', 'virtual'].includes(service.type) ? service.type : 'real',
      created_at: service.created_at,
      updated_at: service.updated_at
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { title, type } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Service title is required' },
        { status: 400 }
      );
    }

    // Default to 'real' if type is not provided or invalid
    const serviceType = type && ['real', 'virtual'].includes(type) ? type : 'real';

    const { data, error } = await supabase
      .from('Services')
      .insert([{ title, type: serviceType }])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ service: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a service
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { id, title, type } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'Service ID and title are required' },
        { status: 400 }
      );
    }

    // Default to 'real' if type is not provided or invalid
    const serviceType = type && ['real', 'virtual'].includes(type) ? type : 'real';

    const { data, error } = await supabase
      .from('Services')
      .update({ title, type: serviceType })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update service', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ service: data?.[0] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // First check if the service exists
    const { data: existingService, error: checkError } = await supabase
      .from('Services')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Attempt to delete
    const { data, error } = await supabase
      .from('Services')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete service', details: error.message },
        { status: 500 }
      );
    }

    // Check if deletion was successful
    if (!data || data.length === 0) {
      console.error('Delete returned success but no rows were deleted. Possible RLS policy issue.');
      return NextResponse.json(
        { error: 'Delete failed. This might be a permissions issue. Please check RLS policies.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, deleted: data[0] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

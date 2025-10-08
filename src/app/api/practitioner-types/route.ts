import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET all practitioner types
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('PractitionerTypes')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch practitioner types', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ practitionerTypes: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new practitioner type
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Practitioner type title is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('PractitionerTypes')
      .insert([{ title }])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create practitioner type', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ practitionerType: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a practitioner type
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { id, title } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'Practitioner type ID and title are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('PractitionerTypes')
      .update({ title })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update practitioner type', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ practitionerType: data?.[0] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a practitioner type
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Practitioner type ID is required' },
        { status: 400 }
      );
    }

    // First check if the practitioner type exists
    const { data: existingType, error: checkError } = await supabase
      .from('PractitionerTypes')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingType) {
      return NextResponse.json(
        { error: 'Practitioner type not found' },
        { status: 404 }
      );
    }

    // Attempt to delete
    const { data, error } = await supabase
      .from('PractitionerTypes')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete practitioner type', details: error.message },
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

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Degrees')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching degrees:', error);
      return NextResponse.json(
        { error: 'Failed to fetch degrees' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Degree title is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Degrees')
      .insert([{ title: title.trim() }])
      .select();

    if (error) {
      console.error('Error adding degree:', error);
      return NextResponse.json(
        { error: 'Failed to add degree' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Degree title is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Degrees')
      .update({ title: title.trim() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating degree:', error);
      return NextResponse.json(
        { error: 'Failed to update degree' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Degree not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('Degrees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting degree:', error);
      return NextResponse.json(
        { error: 'Failed to delete degree' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

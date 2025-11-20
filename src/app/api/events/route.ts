import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image, location, category, price, author } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Events')
      .insert([{
        title: title.trim(),
        description: description.trim(),
        image: image || '',
        location: location || '',
        category: category || 'General',
        price: price ? parseFloat(price) : 0,
        author: author || 'Anonymous'
      }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, image, location, category, price, author } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Events')
      .update({
        title: title.trim(),
        description: description.trim(),
        image: image || '',
        location: location || '',
        category: category || 'General',
        price: price ? parseFloat(price) : 0,
        author: author || 'Anonymous'
      })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
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
      .from('Events')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

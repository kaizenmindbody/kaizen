import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Specialties')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch specialties' },
        { status: 500 }
      );
    }

    const specialties = data?.map(specialty => ({
      id: specialty.id,
      title: specialty.title,
      created_at: specialty.created_at,
    })) || [];

    return NextResponse.json({ data: specialties });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Specialties')
      .insert([{ title: title.trim() }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add specialty' },
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
    const { id, title } = await request.json();

    if (!id || !title || !title.trim()) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Specialties')
      .update({ title: title.trim() })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update specialty' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Specialty not found' },
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
      .from('Specialties')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete specialty' },
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
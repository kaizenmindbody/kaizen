import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Blogs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blogs' },
        { status: 500 }
      );
    }

    const blogPreviews = data?.map(blog => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      image: blog.image,
      author: blog.author || 'Anonymous',
      updated_at: new Date(blog.updated_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      category: blog.category ,
    }));

    return NextResponse.json({ data: blogPreviews });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
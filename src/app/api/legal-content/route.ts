import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch legal content by page type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('page_type');

    if (!pageType) {
      return NextResponse.json(
        { error: 'page_type parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('LegalContent')
      .select('*')
      .eq('page_type', pageType)
      .single();

    if (error) {
      console.error('Error fetching legal content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch legal content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/legal-content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update legal content (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_type, content, user_id } = body;

    if (!page_type || !content) {
      return NextResponse.json(
        { error: 'page_type and content are required' },
        { status: 400 }
      );
    }

    // Verify user is admin
    if (user_id) {
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('user_type')
        .eq('id', user_id)
        .single();

      if (userError || userData?.user_type !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 403 }
        );
      }
    }

    // Update the legal content
    const { data, error } = await supabase
      .from('LegalContent')
      .update({
        content,
        updated_by: user_id,
        updated_at: new Date().toISOString()
      })
      .eq('page_type', page_type)
      .select()
      .single();

    if (error) {
      console.error('Error updating legal content:', error);
      return NextResponse.json(
        { error: 'Failed to update legal content' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Legal content updated successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/legal-content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const specialty = searchParams.get('specialty') || '';
    const location = searchParams.get('location') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'asc';

    // Debug logging
    console.log('Search parameters:', { search, specialty, location, page, limit, sortBy, order });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('Users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'practitioner');

    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase();
      query = query.or(`full_name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`);
    }

    if (specialty && specialty !== 'All Specialties' && specialty !== '') {
      // Ensure case-insensitive partial matching for specialty field
      const searchTerm = specialty.toLowerCase();
      console.log('Filtering by specialty:', searchTerm);
      query = query.ilike('specialty', `%${searchTerm}%`);
    }

    if (location) {
      query = query.ilike('address', `%${location}%`);
    }

    // Apply sorting
    if (sortBy === 'rate') {
      query = query.order('rate', { ascending: order === 'asc'});
    } else {
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to fetch practitioners', details: error.message },
        { status: 500 }
      );
    }

    // Process the data to parse JSON fields
    const processedData = data?.map(practitioner => {
      let degrees = [];
      let languages = [];

      try {
        degrees = practitioner.degree ?
          (typeof practitioner.degree === 'string' ?
            JSON.parse(practitioner.degree) : practitioner.degree) : [];
      } catch (e) {
        console.error('Error parsing degrees:', e);
        degrees = [];
      }

      try {
        languages = practitioner.languages ?
          (typeof practitioner.languages === 'string' ?
            JSON.parse(practitioner.languages) : practitioner.languages) : [];
      } catch (e) {
        console.error('Error parsing languages:', e);
        languages = [];
      }

      return {
        ...practitioner,
        degrees,
        languages,
      };
    }) || [];

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      practitioners: processedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
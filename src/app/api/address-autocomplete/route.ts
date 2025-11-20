import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.NEXT_PUBLIC_PLACEKIT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Fetch from PlaceKit API
    const url = `https://api.placekit.io/search`;
    const params = new URLSearchParams({
      q: query,
      countries: 'US,CA',
      types: 'street,city,administrative',
      maxResults: '5',
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-PlaceKit-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PlaceKit API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`PlaceKit API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.results || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch address suggestions' },
      { status: 500 }
    );
  }
}

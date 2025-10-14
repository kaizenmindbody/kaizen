import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// GET all service pricing for a practitioner
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const practitionerId = searchParams.get('practitionerId');
    const isClinicSpecific = searchParams.get('isClinicSpecific') === 'true';

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ServicePricing')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('is_clinic_specific', isClinicSpecific)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch service pricing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ servicePricing: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update multiple service pricing entries
export async function POST(request: NextRequest) {
  try {
    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const body = await request.json();
    const { practitionerId, servicePricings, packagePricings, isClinicSpecific = false } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Authenticated user:', user?.id);
    console.log('Practitioner ID from request:', practitionerId);
    console.log('Is clinic specific:', isClinicSpecific);
    console.log('Auth error:', authError);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Delete ONLY existing service pricings for this practitioner with the same is_clinic_specific flag
    // This ensures personal pricing and clinic pricing remain separate
    const { error: deleteError } = await supabase
      .from('ServicePricing')
      .delete()
      .eq('practitioner_id', practitionerId)
      .eq('is_clinic_specific', isClinicSpecific);

    if (deleteError) {
      console.error('Error deleting existing service pricing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to update service pricing', details: deleteError.message },
        { status: 500 }
      );
    }

    const allPricingsToInsert = [];

    // Insert service pricings (In-Person and Virtual)
    if (servicePricings && Array.isArray(servicePricings)) {
      const pricingsToInsert = servicePricings
        .filter(sp => sp.service_name) // Only insert if service name is provided
        .map(sp => {
          // Validate service_id: must be a non-empty string with UUID format (length > 20)
          const validServiceId = sp.service_id && typeof sp.service_id === 'string' && sp.service_id.length > 20
            ? sp.service_id
            : null;

          return {
            practitioner_id: practitionerId,
            service_id: validServiceId,
            service_name: sp.service_name,
            first_time_price: sp.first_time_price || null,
            first_time_duration: sp.first_time_duration ? parseFloat(sp.first_time_duration) : null,
            returning_price: sp.returning_price || null,
            returning_duration: sp.returning_duration ? parseFloat(sp.returning_duration) : null,
            service_category: sp.service_category || 'In-Person / Clinic Visit',
            is_sliding_scale: sp.is_sliding_scale || false,
            sliding_scale_info: sp.sliding_scale_info || null,
            is_clinic_specific: isClinicSpecific,
          };
        });

      console.log('Service pricings to insert:', JSON.stringify(pricingsToInsert, null, 2));
      allPricingsToInsert.push(...pricingsToInsert);
    }

    // Insert package pricings
    if (packagePricings && Array.isArray(packagePricings)) {
      const packagesToInsert = packagePricings
        .filter(pkg => pkg.service_name) // Only insert if service name is provided
        .map(pkg => {
          // Validate service_id: must be a non-empty string with UUID format (length > 20)
          const validServiceId = pkg.service_id && typeof pkg.service_id === 'string' && pkg.service_id.length > 20
            ? pkg.service_id
            : null;

          return {
            practitioner_id: practitionerId,
            service_id: validServiceId,
            service_name: pkg.service_name,
            no_of_sessions: pkg.no_of_sessions ? parseInt(pkg.no_of_sessions) : null,
            price: pkg.price || null,
            service_category: pkg.service_category || 'Packages',
            is_clinic_specific: isClinicSpecific,
          };
        });

      console.log('Packages to insert:', JSON.stringify(packagesToInsert, null, 2));
      allPricingsToInsert.push(...packagesToInsert);
    }

    console.log('All pricings to insert:', JSON.stringify(allPricingsToInsert, null, 2));

    if (allPricingsToInsert.length === 0) {
      return NextResponse.json({ servicePricing: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('ServicePricing')
      .insert(allPricingsToInsert)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create service pricing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ servicePricing: data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific service pricing entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Service pricing ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ServicePricing')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete service pricing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

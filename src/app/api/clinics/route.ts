import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('Clinics')
      .select('*')
      .order('clinic_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch clinics: ${error.message}` },
        { status: 500 }
      );
    }

    // Map database columns to expected format
    const clinicPreviews = data?.map(clinic => ({
      id: clinic.id,
      service: clinic.clinic_name || '',
      location: clinic.clinic_address || '',
      image: clinic.clinic_logo || '',
      member: clinic.clinic_phone || '',
    })) || [];

    return NextResponse.json({ data: clinicPreviews });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, location, image, member, practitioner_id } = body;

    if (!service || !service.trim()) {
      return NextResponse.json(
        { error: 'Clinic name is required' },
        { status: 400 }
      );
    }

    if (!practitioner_id) {
      return NextResponse.json(
        { error: 'Practitioner ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .insert([{
        clinic_name: service.trim(),
        clinic_address: location || '',
        clinic_logo: image || '',
        clinic_phone: member || '',
        practitioner_id: practitioner_id
      }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add clinic' },
        { status: 500 }
      );
    }

    // Map back to expected format
    const clinicPreview = {
      id: data[0].id,
      service: data[0].clinic_name,
      location: data[0].clinic_address,
      image: data[0].clinic_logo,
      member: data[0].clinic_phone,
    };

    return NextResponse.json({ data: clinicPreview });
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
    const { id, service, location, image, member } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    if (!service || !service.trim()) {
      return NextResponse.json(
        { error: 'Clinic name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .update({
        clinic_name: service.trim(),
        clinic_address: location || '',
        clinic_logo: image || '',
        clinic_phone: member || ''
      })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update clinic' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Map back to expected format
    const clinicPreview = {
      id: data[0].id,
      service: data[0].clinic_name,
      location: data[0].clinic_address,
      image: data[0].clinic_logo,
      member: data[0].clinic_phone,
    };

    return NextResponse.json({ data: clinicPreview });
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
      .from('Clinics')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete clinic' },
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

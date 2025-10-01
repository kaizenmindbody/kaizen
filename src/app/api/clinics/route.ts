import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .select('*')
      .order('service', { ascending: true });

    if (error) {
      console.error('Error fetching clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clinics' },
        { status: 500 }
      );
    }

    const clinicPreviews = data?.map(clinic => ({
      id: clinic.id,
      service: clinic.service,
      location: clinic.location,
      image: clinic.image,
      member: clinic.member,
    })) || [];

    return NextResponse.json({ data: clinicPreviews });
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
    const { service, location, image, member } = body;

    if (!service || !service.trim()) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .insert([{
        service: service.trim(),
        location: location || '',
        image: image || '',
        member: member || ''
      }])
      .select();

    if (error) {
      console.error('Error adding clinic:', error);
      return NextResponse.json(
        { error: 'Failed to add clinic' },
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
    const { id, service, location, image, member } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    if (!service || !service.trim()) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .update({
        service: service.trim(),
        location: location || '',
        image: image || '',
        member: member || ''
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating clinic:', error);
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
      .from('Clinics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting clinic:', error);
      return NextResponse.json(
        { error: 'Failed to delete clinic' },
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

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('Clinics')
      .select('*')
      .order('service', { ascending: false });

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
      address: clinic.address,
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
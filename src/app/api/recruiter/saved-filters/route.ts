import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly';

// GET: Retrieve saved filters for the authenticated recruiter
export async function GET() {
  try {
    const supabase = await createSupabaseServerOnly();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch saved filters
    const { data: filters, error } = await supabase
      .from('recruiter_saved_filters')
      .select('id, name, filters, created_at')
      .eq('recruiter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(filters || []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save new filter for the authenticated recruiter
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerOnly();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a recruiter
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, filters } = await request.json();

    if (!name || !filters) {
      return NextResponse.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    // Save the filter
    const { data, error } = await supabase
      .from('recruiter_saved_filters')
      .insert({
        recruiter_id: user.id,
        name,
        filters
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

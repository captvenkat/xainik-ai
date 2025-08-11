import { NextResponse } from 'next/server';
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly';

export async function GET() {
  const supabase = createSupabaseServerOnly();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no-session' }, { status: 401 });

  const { data, error } = await supabase.from('users').select('id, role').eq('id', user.id).single();
  return NextResponse.json({ user: user.id, data, error });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerOnly();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no-session' }, { status: 401 });

  try {
    const { role } = await request.json();
    
    if (!role || !['veteran', 'recruiter', 'supporter'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const sb = supabaseService();
    const { error } = await sb.from('contact_requests').insert([{
      name: name?.trim() || 'Anonymous',
      email: email.trim(),
      message: message.trim()
    }]);

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Contact request saved successfully' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

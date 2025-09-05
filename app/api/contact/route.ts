import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-server';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().min(1),
  message: z.string().min(1).max(1000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    
    const { name, email, message } = parsed.data;

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

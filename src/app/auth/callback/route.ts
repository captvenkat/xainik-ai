import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { code: !!code, next, error, errorDescription });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error in callback:', { error, errorDescription });
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, req.url));
  }

  if (!code) {
    console.error('No code parameter in callback');
    return NextResponse.redirect(new URL('/auth/error?error=no_code', req.url));
  }

  try {
    const supabase = await createSupabaseServer();
    console.log('🔄 Exchanging code for session...');
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      return NextResponse.redirect(new URL(`/auth/error?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, req.url));
    }

    if (!data?.user) {
      console.error('No user data after exchange');
      return NextResponse.redirect(new URL('/auth/error?error=no_user', req.url));
    }

    console.log('✅ Auth exchange successful for user:', data.user.email);
    
    // Create user record in public.users table if it doesn't exist
    console.log('🔄 Checking if user exists in public.users...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist in public.users, create them
      console.log('🔄 Creating user record in public.users...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Unknown',
          role: null // Will be set during role selection
        });
      
      if (createError) {
        console.error('Error creating user record:', createError);
        return NextResponse.redirect(new URL(`/auth/error?error=user_creation_failed&details=${encodeURIComponent(createError.message)}`, req.url));
      }
      
      console.log('✅ User record created in public.users');
    } else if (checkError) {
      console.error('Error checking user existence:', checkError);
      return NextResponse.redirect(new URL(`/auth/error?error=user_check_failed&details=${encodeURIComponent(checkError.message)}`, req.url));
    } else {
      console.log('✅ User already exists in public.users');
    }
    
    // Optional: role routing
    const profile = data?.user ?? null;
    const to = next.startsWith('/') ? next : '/';
    
    console.log('🔄 Redirecting to:', to);
    return NextResponse.redirect(new URL(to, req.url));
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL(`/auth/error?error=unexpected&details=${encodeURIComponent(String(error))}`, req.url));
  }
}

import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error in callback:', { error, errorDescription });
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`, req.url));
  }

  if (!code) {
    console.error('No code parameter in callback');
    return NextResponse.redirect(new URL('/auth/error?error=no_code', req.url));
  }

  // Validate state parameter for security
  if (!state) {
    console.error('No state parameter in callback');
    return NextResponse.redirect(new URL('/auth/error?error=no_state', req.url));
  }

  try {
    const supabase = await createSupabaseServer();
    
    // Exchange code for session with proper error handling
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      
      // Handle specific OAuth errors
      if (exchangeError.message.includes('expired')) {
        return NextResponse.redirect(new URL('/auth/error?error=code_expired&details=Please try signing in again', req.url));
      } else if (exchangeError.message.includes('invalid')) {
        return NextResponse.redirect(new URL('/auth/error?error=invalid_code&details=Please try signing in again', req.url));
      } else {
        return NextResponse.redirect(new URL(`/auth/error?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, req.url));
      }
    }

    if (!data?.user) {
      console.error('No user data after exchange');
      return NextResponse.redirect(new URL('/auth/error?error=no_user&details=Authentication completed but no user data received', req.url));
    }

    if (!data.session) {
      console.error('No session data after exchange');
      return NextResponse.redirect(new URL('/auth/error?error=no_session&details=Authentication completed but no session created', req.url));
    }
    
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
    
    // Check if user has a role and route accordingly
    const { data: userProfile, error: roleCheckError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    let redirectUrl = '/';
    
    if (roleCheckError) {
      console.error('❌ Error checking user role:', roleCheckError);
      redirectUrl = '/auth';
    } else if (userProfile?.role) {
      // User has role, check if they have a specific redirect request
      if (next && next !== '/' && next.startsWith('/dashboard/')) {
        // User requested a specific dashboard, validate it matches their role
        const requestedRole = next.split('/')[2];
        if (requestedRole === userProfile.role) {
          redirectUrl = next;
        } else {
          redirectUrl = `/dashboard/${userProfile.role}`;
        }
      } else {
        redirectUrl = `/dashboard/${userProfile.role}`;
      }
    } else {
      // User needs role selection
      redirectUrl = '/auth';
    }
    
    // Set cookies for client-side session detection
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));
    
    // Add session cookies for better client-side detection
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL(`/auth/error?error=unexpected&details=${encodeURIComponent(String(error))}`, req.url));
  }
}

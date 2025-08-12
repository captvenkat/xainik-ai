'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function processCallback() {
      try {
        
        // Check if we have hash fragment tokens
        const hash = window.location.hash.substring(1);
        if (!hash) {
          setError('No authentication data received');
          setStatus('error');
          return;
        }

        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const error = params.get('error');

        if (error) {
          setError(`Authentication error: ${error}`);
          setStatus('error');
          return;
        }

        if (!accessToken || !refreshToken) {
          setError('Missing authentication tokens');
          setStatus('error');
          return;
        }


        // Create Supabase client and set session
        const supabase = createSupabaseBrowser();
        
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(`Session creation failed: ${sessionError.message}`);
          setStatus('error');
          return;
        }

        if (!data.session) {
          setError('No session created');
          setStatus('error');
          return;
        }

        // Verify the session is properly set
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        if (!verifySession) {
          setError('Session verification failed');
          setStatus('error');
          return;
        }

        // Create user record in the users table if it doesn't exist
        try {
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', verifySession.user.id)
            .single();

          if (userCheckError && userCheckError.code === 'PGRST116') {
            // User doesn't exist in the users table, create them
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: verifySession.user.id,
                email: verifySession.user.email || '',
                name: verifySession.user.user_metadata?.full_name || 
                       verifySession.user.user_metadata?.name || 
                       verifySession.user.email?.split('@')[0] || 'User',
                role: 'veteran' // Default role
              });

            if (createError) {
              console.warn('Failed to create user record:', createError);
              // Don't fail the auth process if user creation fails
            } else {
              console.log('User record created successfully');
            }
          } else if (userCheckError) {
            console.warn('Error checking user record:', userCheckError);
          } else {
            console.log('User record already exists');
          }
        } catch (userError) {
          console.warn('User creation check failed:', userError);
          // Don't fail the auth process if user creation fails
        }

        setStatus('success');
        
        // Get the stored redirect path
        const redirectPath = sessionStorage.getItem('auth_redirect') || '/dashboard/veteran';
        sessionStorage.removeItem('auth_redirect');
        
        
        // Clear any hash fragments from the URL
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Small delay to show success message, then redirect
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
        setStatus('error');
      }
    }

    processCallback();
  }, [router]);

  if (status === 'processing') {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Processing Authentication...</h1>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold mb-2 text-red-700">Authentication Failed</h1>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-xl font-semibold mb-2 text-green-700">Authentication Successful!</h1>
        <p className="text-green-600 mb-6">Redirecting you to the dashboard...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </main>
    );
  }

  return null;
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function SimpleAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function processCallback() {
      try {
        console.log('Processing callback...');
        
        // Check if we have hash fragment tokens
        const hash = window.location.hash.substring(1);
        console.log('Hash:', hash);
        
        if (!hash) {
          setError('No authentication data received');
          setStatus('error');
          return;
        }

        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const error = params.get('error');

        console.log('Access token exists:', !!accessToken);
        console.log('Refresh token exists:', !!refreshToken);
        console.log('Error:', error);

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
        
        console.log('Setting session...');
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(`Session creation failed: ${sessionError.message}`);
          setStatus('error');
          return;
        }

        if (!data.session) {
          setError('No session created');
          setStatus('error');
          return;
        }

        console.log('Session created successfully');

        // Verify the session is properly set
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        if (!verifySession) {
          setError('Session verification failed');
          setStatus('error');
          return;
        }

        console.log('Session verified, user:', verifySession.user.email);

        // Clear any hash fragments from the URL
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }

        setStatus('success');
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard/veteran');
        }, 2000);

      } catch (e) {
        console.error('Callback error:', e);
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

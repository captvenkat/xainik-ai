'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/supabaseBrowser';

function AuthPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get('redirect') || '/dashboard/veteran';
  const error = params.get('error');

  useEffect(() => {
    // Clean up accidental hash fragments (implicit grant leftovers)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Check if we have a stored redirect path and user is authenticated
    const storedRedirect = sessionStorage.getItem('auth_redirect');
    if (storedRedirect && !error) {
      // Clear the stored redirect
      sessionStorage.removeItem('auth_redirect');
      // Redirect to the stored path
      router.push(storedRedirect);
    }
  }, [router, error]);

  async function handleGoogle() {
    try {
      await signInWithGoogle(redirect);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      // Handle error appropriately
    }
  }

  return (
    <main className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            {error === 'no_state' && 'Authentication failed. Please try again.'}
            {error === 'missing_code' && 'Authentication code missing. Please try again.'}
            {error === 'exchange_failed' && 'Session creation failed. Please try again.'}
            {error === 'no_session' && 'Session not created. Please try again.'}
            {error === 'callback_crash' && 'Authentication error. Please try again.'}
            {!['no_state', 'missing_code', 'exchange_failed', 'no_session', 'callback_crash'].includes(error) && 
              `Authentication error: ${error}`}
          </p>
        </div>
      )}
      
      <button
        onClick={handleGoogle}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue with Google
      </button>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}

'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/supabaseBrowser';

function AuthPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get('redirect') || '/dashboard/veteran';
  const error = params.get('error');
  const errorCode = params.get('code');
  const errorDescription = params.get('description');
  const message = params.get('message');

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

  // Function to get user-friendly error message
  const getErrorMessage = () => {
    if (message) return message;
    
    switch (error) {
      case 'state_mismatch':
        return 'Authentication session expired. Please try again.';
      case 'invalid_state':
        return 'Invalid authentication state. Please try again.';
      case 'flow_state_not_found':
        return 'Authentication session expired. Please try again.';
      case 'server_error':
        return 'Server error occurred. Please try again.';
      case 'missing_code':
        return 'Authentication code missing. Please try again.';
      case 'exchange_failed':
        return 'Session creation failed. Please try again.';
      case 'no_session':
        return 'Session not created. Please try again.';
      case 'callback_crash':
        return 'Authentication error. Please try again.';
      default:
        if (errorDescription) return errorDescription;
        if (error) return `Authentication error: ${error}`;
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <main className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            {getErrorMessage()}
          </p>
          {errorCode && (
            <p className="text-red-600 text-xs mt-2">
              Error Code: {errorCode}
            </p>
          )}
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

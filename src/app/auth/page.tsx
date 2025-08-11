'use client';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithGoogle, createSupabaseBrowser } from '@/lib/supabaseBrowser';

function AuthPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get('redirect') || '/dashboard/veteran';
  const error = params.get('error');
  const errorCode = params.get('code');
  const errorDescription = params.get('description');
  const message = params.get('message');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          // If authenticated and no error, redirect to stored path or default
          if (!error) {
            const storedRedirect = sessionStorage.getItem('auth_redirect') || redirect;
            sessionStorage.removeItem('auth_redirect');
            router.push(storedRedirect);
            return;
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, redirect, error]);

  useEffect(() => {
    // Clean up accidental hash fragments (implicit grant leftovers)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Check if we have a stored redirect path and user is authenticated
    const storedRedirect = sessionStorage.getItem('auth_redirect');
    if (storedRedirect && !error && isAuthenticated) {
      // Clear the stored redirect
      sessionStorage.removeItem('auth_redirect');
      // Redirect to the stored path
      router.push(storedRedirect);
    }
  }, [router, error, isAuthenticated]);

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
        if (errorCode) {
          return `Error ${errorCode}: ${errorDescription || 'Authentication failed'}`;
        }
        return errorDescription || 'Authentication failed. Please try again.';
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Checking Authentication...</h2>
            <p className="text-gray-600">Please wait while we verify your session.</p>
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated and no error, don't show login form
  if (isAuthenticated && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Already Authenticated</h2>
            <p className="text-gray-600 mb-6">You are already signed in. Redirecting...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sign in to Xainik
          </h2>
          <p className="text-gray-600">
            Access your dashboard and manage your pitch
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {getErrorMessage()}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <button
            onClick={handleGoogle}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}

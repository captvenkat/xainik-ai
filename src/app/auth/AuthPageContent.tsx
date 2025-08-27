'use client';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithGoogle, createSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AuthPageContent({ roleHint }: { roleHint?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get('redirect') || '/dashboard/veteran';
  const error = params.get('error');
  const errorCode = params.get('code');
  const errorDescription = params.get('description');
  const message = params.get('message');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Set role hint cookie if provided
  useEffect(() => {
    if (roleHint === 'veteran' || roleHint === 'supporter' || roleHint === 'recruiter') {
      document.cookie = `x-role-hint=${roleHint}; Max-Age=300; Path=/; HttpOnly=false`;
    }
  }, [roleHint]);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const supabase = createSupabaseBrowser();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          setAuthError(sessionError.message);
        } else if (session) {
          // If authenticated and no error, redirect to stored path or default
          if (!error) {
            const storedRedirect = sessionStorage.getItem('auth_redirect') || redirect;
            sessionStorage.removeItem('auth_redirect');
            router.push(storedRedirect);
            return;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthError(err instanceof Error ? err.message : 'Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirect, error]);

  async function handleGoogle() {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Add a timeout to prevent infinite spinning
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setAuthError('Sign-in timeout. Please try again.');
      }, 10000); // 10 second timeout

      await signInWithGoogle();
      
      // If we reach here, the OAuth redirect should have happened
      // Clear the timeout since we're redirecting
      clearTimeout(timeoutId);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed');
      setIsLoading(false);
    }
  }

  // Function to get user-friendly error message
  const getErrorMessage = () => {
    if (message) return message;
    if (authError) return authError;
    
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Xainik
          </h1>
          <p className="text-gray-600">
            Join the platform supporting military veterans
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Error Display */}
          {(error || authError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
                  <div className="mt-1 text-sm text-red-700">
                    {getErrorMessage()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What you'll get:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized job referral dashboard
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority access to opportunities
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Community support network
              </div>
            </div>
          </div>

          {/* Single Google Sign-in Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 text-base font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? 'Signing you in...' : 'Continue with Google'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Quick and secure sign-in with your Google account
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

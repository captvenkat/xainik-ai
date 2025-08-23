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
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
        } else {

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
      setAuthError(null); // Clear any previous errors

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
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Xainik
          </h1>
          <p className="text-xl text-gray-600">
            Choose your path to support military veterans
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT SIDE - Veterans */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Military Veterans
            </h2>
            <p className="text-lg text-blue-700 mb-6">
              Join our exclusive waitlist for priority access to personalized job referrals and career support.
            </p>
            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center text-blue-800">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized job referral dashboard
              </div>
              <div className="flex items-center text-blue-800">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority access to opportunities
              </div>
              <div className="flex items-center text-blue-800">
                <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Community support network
              </div>
            </div>
            <a 
              href="/waitlist" 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Join Veteran Waitlist
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* RIGHT SIDE - Supporters & Recruiters */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Supporters & Recruiters
            </h2>
            <p className="text-lg text-green-700 mb-6">
              Sign in to access your dashboard and support military veterans in their career transition.
            </p>
            <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              <div className="flex items-center text-green-800">
                <svg className="h-5 w-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Browse veteran profiles
              </div>
              <div className="flex items-center text-green-800">
                <svg className="h-5 w-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Connect & support veterans
              </div>
              <div className="flex items-center text-green-800">
                <svg className="h-5 w-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access your dashboard
              </div>
            </div>
            
                         {/* Error Display */}
             {(error || authError) && (
               <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
             
             <div className="bg-white py-6 px-6 shadow rounded-lg">
               <div className="text-center mb-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
                   Sign In to Continue
                 </h3>
                 <p className="text-sm text-gray-600 mb-4">
                   Quick and secure sign-in with your Google account
                 </p>
               </div>
               
               <button
                 onClick={handleGoogle}
                 disabled={isLoading}
                 className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-green-600 to-green-700 text-base font-medium text-white hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
               
               <div className="mt-4 text-center">
                 <p className="text-xs text-gray-500">
                   By continuing, you agree to our{' '}
                   <a href="/terms" className="text-green-600 hover:text-green-800 underline">Terms of Service</a>
                   {' '}and{' '}
                   <a href="/privacy" className="text-green-600 hover:text-green-800 underline">Privacy Policy</a>
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || authError) && (
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
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get Started Now
            </h3>
            <p className="text-sm text-gray-600">
              Quick and secure sign-in with your Google account
            </p>
          </div>
          
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm bg-gradient-to-r from-blue-600 to-blue-700 text-base font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
            </p>
          </div>
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

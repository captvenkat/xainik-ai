'use client';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';

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

  const supabase = createSupabaseBrowser();
  const site = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  type Role = 'veteran'|'supporter'|'recruiter';
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const firedRef = useRef(false); // absolute single-fire guard

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        setIsLoading(true);
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

  const joinWithRole = useCallback(async (role: Role, e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (firedRef.current || pendingRole) return;
    firedRef.current = true;
    setPendingRole(role);
    
    try {
      // Set short-lived, non-HttpOnly cookie so SSR can read it on /auth/warmup
      document.cookie = `x-role-hint=${role}; Max-Age=300; Path=/; SameSite=Lax`;
      
      // Land directly on warmup so cookie gets consumed immediately
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${site}/auth/warmup?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed');
      // Reset state on error
      firedRef.current = false;
      setPendingRole(null);
    }
  }, [pendingRole, redirect, site, supabase]);

  async function handleGenericGoogle() {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Add a timeout to prevent infinite spinning
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setAuthError('Sign-in timeout. Please try again.');
      }, 10000); // 10 second timeout

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${site}/auth/warmup?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Xainik
          </h1>
          <p className="text-xl text-gray-600">
            Choose your path to support military veterans
          </p>
        </div>

        {/* Error Display */}
        {(error || authError) && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
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

        {/* User Type Selection */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto" onClickCapture={(e) => e.stopPropagation()}>
          {/* Veterans */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-3">
              Military Veterans
            </h2>
            <p className="text-blue-700 mb-4">
              Join our exclusive platform for personalized job referrals and career support.
            </p>
            <div className="space-y-2 mb-6 text-left text-sm">
              <div className="flex items-center text-blue-800">
                <svg className="h-4 w-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Personalized job dashboard
              </div>
              <div className="flex items-center text-blue-800">
                <svg className="h-4 w-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority opportunities
              </div>
              <div className="flex items-center text-blue-800">
                <svg className="h-4 w-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Community support
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => joinWithRole('veteran', e)}
              disabled={!!pendingRole && pendingRole !== 'veteran'}
              className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {pendingRole === 'veteran' ? 'Redirecting…' : 'Join as Veteran'}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Supporters */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-3">
              Supporters
            </h2>
            <p className="text-green-700 mb-4">
              Support veterans by connecting, endorsing, and providing opportunities.
            </p>
            <div className="space-y-2 mb-6 text-left text-sm">
              <div className="flex items-center text-green-800">
                <svg className="h-4 w-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Browse veteran profiles
              </div>
              <div className="flex items-center text-green-800">
                <svg className="h-4 w-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Endorse & connect
              </div>
              <div className="flex items-center text-green-800">
                <svg className="h-4 w-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Share opportunities
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => joinWithRole('supporter', e)}
              disabled={!!pendingRole && pendingRole !== 'supporter'}
              className="w-full inline-flex justify-center items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {pendingRole === 'supporter' ? 'Redirecting…' : 'Join as Supporter'}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Recruiters */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-purple-900 mb-3">
              Recruiters
            </h2>
            <p className="text-purple-700 mb-4">
              Find talented veterans and post job opportunities on our platform.
            </p>
            <div className="space-y-2 mb-6 text-left text-sm">
              <div className="flex items-center text-purple-800">
                <svg className="h-4 w-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Post job opportunities
              </div>
              <div className="flex items-center text-purple-800">
                <svg className="h-4 w-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Browse veteran profiles
              </div>
              <div className="flex items-center text-purple-800">
                <svg className="h-4 w-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Direct messaging
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => joinWithRole('recruiter', e)}
              disabled={!!pendingRole && pendingRole !== 'recruiter'}
              className="w-full inline-flex justify-center items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {pendingRole === 'recruiter' ? 'Redirecting…' : 'Join as Recruiter'}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleGenericGoogle}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Sign in here
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

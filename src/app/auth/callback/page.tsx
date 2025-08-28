'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import dynamic from 'next/dynamic';

// Dynamically import the RoleSelectionModal to avoid SSR issues
const RoleSelectionModal = dynamic(() => import('@/components/RoleSelectionModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading role selection...</p>
      </div>
    </div>
  )
});

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'role-selection' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only process callback when client is ready
    if (!isClient) return;
    
    async function processCallback() {
      // Add a timeout to prevent infinite spinning
      const timeoutId = setTimeout(() => {
        console.error('AuthCallback: Timeout reached, redirecting to auth page');
        setError('Authentication timeout. Please try again.');
        setStatus('error');
      }, 10000); // 10 second timeout

      try {
        console.log('AuthCallback: Starting callback processing...');
        
        // Check for OAuth errors in URL (Google OAuth typically doesn't pass tokens in URL)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        console.log('AuthCallback: URL params:', urlParams.toString());
        console.log('AuthCallback: Error param:', error);

        if (error) {
          console.error('AuthCallback: Authentication error:', error);
          setError(`Authentication error: ${error}`);
          setStatus('error');
          clearTimeout(timeoutId);
          return;
        }

        // If no tokens in URL, that's okay - Supabase should handle the OAuth flow
        console.log('AuthCallback: Proceeding with Supabase session check...');

        // Create Supabase client - session should be automatically set from URL
        const supabase = createSupabaseBrowser();
        console.log('AuthCallback: Checking session...');
        
        // Wait for OAuth flow to complete and session to be established
        let session = null;
        let sessionError = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
          attempts++;
          console.log(`AuthCallback: Session check attempt ${attempts}/${maxAttempts}`);
          
          const result = await supabase.auth.getSession();
          session = result.data.session;
          sessionError = result.error;
          
          if (session) {
            console.log('AuthCallback: Session found on attempt', attempts);
            break;
          }
          
          if (sessionError) {
            console.log('AuthCallback: Session error on attempt', attempts, sessionError);
            break;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('AuthCallback: Session check result:', { session: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('AuthCallback: Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          setStatus('error');
          clearTimeout(timeoutId);
          return;
        }

        if (!session) {
          console.error('AuthCallback: No session found - this usually means OAuth failed');
          setError('OAuth authentication failed. Please check your Google account settings and try again.');
          setStatus('error');
          clearTimeout(timeoutId);
          return;
        }

        console.log('AuthCallback: Session found for:', session.user.email);

        console.log('AuthCallback: Session verified, checking user role...');

        // Check if user already has a role set in profiles table
        let { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileError && profileError.code === 'PGRST116') {
          console.log('AuthCallback: Profile not found, creating new profile...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: session.user.id,
              email: session.user.email,
              status: 'pending'
            })
            .select('role, onboarding_complete')
            .single();
          
          if (createError) {
            console.error('AuthCallback: Failed to create profile:', createError);
            setError('Failed to create user profile. Please try again.');
            setStatus('error');
            clearTimeout(timeoutId);
            return;
          }
          
          existingProfile = newProfile;
          profileError = null;
        } else if (profileError) {
          console.error('AuthCallback: Profile query error:', profileError);
          setError('Failed to access user profile. Please try again.');
          setStatus('error');
          clearTimeout(timeoutId);
          return;
        }

        if (existingProfile?.role) {
          console.log('AuthCallback: User has role:', existingProfile.role);
          
          // User already has a role, redirect to warmup for proper cookie setup
          setStatus('success');
          const redirectPath = sessionStorage.getItem('auth_redirect') || '/dashboard';
          sessionStorage.removeItem('auth_redirect');
          
          // Clear any hash fragments from the URL
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          
          console.log('AuthCallback: Redirecting to warmup:', redirectPath);
          clearTimeout(timeoutId);
          setTimeout(() => {
            router.push(`/auth/warmup?redirect=${encodeURIComponent(redirectPath)}`);
          }, 1000);
        } else {
          console.log('AuthCallback: User exists but no role, showing role selection');
          // User exists but has no role
          setUserEmail(session.user.email || '');
          setStatus('role-selection');
          
          // Clear any hash fragments from the URL
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          clearTimeout(timeoutId);
        }

      } catch (e) {
        console.error('AuthCallback: Unexpected error:', e);
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
        setStatus('error');
        clearTimeout(timeoutId);
      }
    }

    processCallback();
  }, [router, isClient]);

  const handleRoleSelected = (role: string) => {
    setStatus('success');
    const redirectPath = sessionStorage.getItem('auth_redirect') || '/dashboard';
    sessionStorage.removeItem('auth_redirect');
    
    setTimeout(() => {
      router.push(`/auth/warmup?redirect=${encodeURIComponent(redirectPath)}`);
    }, 1000);
  };

  const handleCloseRoleSelection = () => {
    // Redirect to warmup if user doesn't want to select role now
    router.push('/auth/warmup?redirect=%2Fdashboard');
  };

  if (status === 'processing') {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Processing Authentication...</h1>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        {!isClient && (
          <p className="text-sm text-gray-500 mt-4">Loading client-side components...</p>
        )}
      </main>
    );
  }

  if (status === 'role-selection' && isClient) {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="text-blue-500 text-6xl mb-4">🎯</div>
        <h1 className="text-xl font-semibold mb-2 text-blue-700">Authentication Successful!</h1>
        <p className="text-blue-600 mb-6">Please select your role to continue...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        
        <RoleSelectionModal
          isOpen={true}
          onClose={handleCloseRoleSelection}
          onRoleSelected={handleRoleSelected}
          userEmail={userEmail}
        />
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

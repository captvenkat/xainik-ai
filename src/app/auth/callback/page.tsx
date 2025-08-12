'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import RoleSelectionModal from '@/components/RoleSelectionModal';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'role-selection' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

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

        // Check if user already has a role set
        const { data: existingUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', verifySession.user.id)
          .single();

        if (existingUser?.role) {
          // User already has a role, proceed to dashboard
          setStatus('success');
          const redirectPath = sessionStorage.getItem('auth_redirect') || `/dashboard/${existingUser.role}`;
          sessionStorage.removeItem('auth_redirect');
          
          // Clear any hash fragments from the URL
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          
          setTimeout(() => {
            router.push(redirectPath);
          }, 1000);
        } else {
          // User needs to select a role
          setUserEmail(verifySession.user.email || '');
          setStatus('role-selection');
          
          // Clear any hash fragments from the URL
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }

      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error occurred');
        setStatus('error');
      }
    }

    processCallback();
  }, [router]);

  const handleRoleSelected = (role: string) => {
    setStatus('success');
    const redirectPath = sessionStorage.getItem('auth_redirect') || `/dashboard/${role}`;
    sessionStorage.removeItem('auth_redirect');
    
    setTimeout(() => {
      router.push(redirectPath);
    }, 1000);
  };

  const handleCloseRoleSelection = () => {
    // Redirect to a default page if user doesn't want to select role now
    router.push('/dashboard/veteran');
  };

  if (status === 'processing') {
    return (
      <main className="max-w-md mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Processing Authentication...</h1>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </main>
    );
  }

  if (status === 'role-selection') {
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

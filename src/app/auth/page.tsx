'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseBrowser';
import { updateUserRole } from '@/lib/actions/updateUserRole';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        console.log('🔍 Checking user authentication status...');
        
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError.message);
          if (isMounted) setIsCheckingAuth(false);
          return;
        }
        
        if (!session) {
          console.log('❌ No session found');
          if (isMounted) setIsCheckingAuth(false);
          return;
        }
        
        console.log('✅ Session found, checking user...');
        
        // Now check the user from the session
        const user = session.user;
        
        if (user) {
          console.log('✅ User authenticated:', user.email);
          
          // Check if user has a role
          console.log('🔍 Checking user role...');
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('❌ Error fetching user profile:', profileError);
            if (isMounted) {
              setShowRoleSelection(true);
              setIsCheckingAuth(false);
            }
            return;
          }
          
          console.log('📋 User profile:', profile);
          
          if (profile?.role) {
            console.log('✅ User has role, redirecting to dashboard:', profile.role);
            if (isMounted) router.push(`/dashboard/${profile.role}`);
          } else {
            console.log('🔄 User needs role selection');
            if (isMounted) {
              setShowRoleSelection(true);
              setIsCheckingAuth(false);
            }
          }
        } else {
          console.log('❌ No user in session');
          if (isMounted) setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
        if (isMounted) setIsCheckingAuth(false);
      }
    };
    
    // Enhanced session check that waits for session to be fully ready
    const waitForSession = async () => {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts && isMounted) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('✅ Session ready after', attempts + 1, 'attempts');
            await checkUser();
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (err) {
          console.log('⚠️ Session check attempt', attempts + 1, 'failed:', err.message);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      if (isMounted) {
        console.log('⏰ Max session check attempts reached, stopping');
        setIsCheckingAuth(false);
      }
    };

    // Wait for session to be established
    const timer = setTimeout(() => {
      if (isMounted) {
        waitForSession();
      }
    }, 1000);
    
    // Fallback: if still checking after 3 seconds, stop and show sign-in
    const fallbackTimer = setTimeout(() => {
      if (isMounted && isCheckingAuth) {
        console.log('⏰ Fallback: stopping auth check, showing sign-in options');
        setIsCheckingAuth(false);
      }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'INITIAL_SESSION') {
        console.log('✅ Initial session event received');
        if (session?.user) {
          console.log('✅ Initial session has user, checking role...');
          if (isMounted) {
            checkUser();
          }
        } else {
          console.log('🔄 Initial session but no user yet, waiting...');
          // Wait a bit more for session to fully establish
          setTimeout(() => {
            if (isMounted) {
              checkUser();
            }
          }, 500);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, checking role...');
        
        // Check if user has a role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Error fetching profile on auth state change:', profileError);
          if (isMounted) {
            setShowRoleSelection(true);
            setIsCheckingAuth(false);
          }
          return;
        }
        
        console.log('📋 Profile on auth state change:', profile);
        
        if (profile?.role) {
          console.log('✅ User has role, redirecting to dashboard:', profile.role);
          if (isMounted) router.push(`/dashboard/${profile.role}`);
        } else {
          console.log('🔄 User needs role selection on auth state change');
          if (isMounted) {
            setShowRoleSelection(true);
            setIsCheckingAuth(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔄 User signed out');
        if (isMounted) {
          setShowRoleSelection(false);
          setIsCheckingAuth(false);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed, checking session...');
        if (isMounted) {
          checkUser();
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError('Failed to sign in with LinkedIn. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUserRole(selectedRole as 'veteran' | 'recruiter' | 'supporter');
      setSuccess(`Role updated to ${selectedRole}! Redirecting...`);
      
      // Redirect to appropriate dashboard
      setTimeout(() => {
        router.push(`/dashboard/${selectedRole}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update role. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center animate-spin">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking authentication...
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Choose Your Role
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Select how you&apos;d like to use Xainik
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('veteran')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                selectedRole === 'veteran'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Veteran</h3>
                  <p className="text-sm text-gray-600">Post pitches and find opportunities</p>
                </div>
                {selectedRole === 'veteran' && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('recruiter')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                selectedRole === 'recruiter'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Recruiter</h3>
                  <p className="text-sm text-gray-600">Browse veterans and hire talent</p>
                </div>
                {selectedRole === 'recruiter' && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('supporter')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                selectedRole === 'supporter'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Supporter</h3>
                  <p className="text-sm text-gray-600">Refer veterans and support the mission</p>
                </div>
                {selectedRole === 'supporter' && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </button>
          </div>

          <button
            onClick={handleRoleSelection}
            disabled={isLoading || !selectedRole}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Xainik
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleLinkedInSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

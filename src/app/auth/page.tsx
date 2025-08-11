'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/supabaseBrowser';

function AuthPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get('redirect') || '/dashboard/veteran';

  useEffect(() => {
    // Clean up accidental hash fragments (implicit grant leftovers)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  async function handleGoogle() {
    await signInWithGoogle(redirect);
  }

  return (
    <main className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
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

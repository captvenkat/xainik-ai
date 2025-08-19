'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import { Shield, Briefcase, Heart, Check } from 'lucide-react';

const roles = [
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'I am a veteran looking for job opportunities',
    icon: Shield,
    color: 'blue',
    features: [
      'Create and manage your pitch',
      'Track views and engagement',
      'Receive endorsements',
      'Get contacted by recruiters'
    ]
  },
  {
    id: 'recruiter',
    title: 'Recruiter',
    description: 'I am a recruiter looking to hire veterans',
    icon: Briefcase,
    color: 'green',
    features: [
      'Browse veteran pitches',
      'Contact candidates directly',
      'Request resumes',
      'Track your pipeline'
    ]
  },
  {
    id: 'supporter',
    title: 'Supporter',
    description: 'I want to help veterans find opportunities',
    icon: Heart,
    color: 'red',
    features: [
      'Refer veterans to opportunities',
      'Endorse veteran profiles',
      'Track your impact',
      'Support the mission'
    ]
  }
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createSupabaseBrowser();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/auth?redirect=/role-selection');
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        router.push('/auth?redirect=/role-selection');
      }
    };
    fetchUser();
  }, [router]);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = createSupabaseBrowser();
      
      // Update user role in database
      const { error } = await supabase
        .from('users')
        .update({ role: selectedRole })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      // Handle referral attribution if coming from supporter signup
      const supporterData = sessionStorage.getItem('supporter_signup_data');
      if (supporterData && selectedRole === 'supporter') {
        try {
          const { name, email, reason, referralId } = JSON.parse(supporterData);
          
          // Create supporter profile with the stored reason
          const { error: supporterError } = await supabase
            .from('supporters')
            .insert({
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (supporterError) {
            console.error('Error creating supporter profile:', supporterError);
          }

          // Log SIGNUP_FROM_REFERRAL event if referralId exists
          if (referralId) {
            const { error: eventError } = await supabase
              .from('referral_events')
              .insert({
                event_type: 'SIGNUP_FROM_REFERRAL',
                created_at: new Date().toISOString(),
                occurred_at: new Date().toISOString()
              });

            if (eventError) {
              console.error('Error logging referral event:', eventError);
            }
          }

          // Clear the stored data
          sessionStorage.removeItem('supporter_signup_data');
        } catch (parseError) {
          console.error('Error parsing supporter data:', parseError);
        }
      }

      // Redirect to the appropriate dashboard
      router.push(`/dashboard/${selectedRole}`);
      
    } catch (err) {
      console.error('Failed to update role:', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600">
            Select how you'd like to use Xainik
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
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? `border-${role.color}-500 bg-${role.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${role.color}-500 rounded-full flex items-center justify-center`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className={`w-12 h-12 bg-${role.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${role.color}-600`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 bg-${role.color}-500 rounded-full mr-2`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className={`w-full max-w-md px-6 py-3 rounded-lg font-medium text-white transition-colors ${
              selectedRole && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting up your dashboard...
              </div>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </div>

        {/* Note */}
        <div className="text-center text-sm text-gray-500">
          <p>You can change your role later in your profile settings</p>
        </div>
      </div>
    </div>
  );
}

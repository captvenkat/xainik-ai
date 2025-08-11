import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
    };
    
    const hasRequiredVars = envVars.NEXT_PUBLIC_SUPABASE_URL === 'Set' && 
                           envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'Set';
    
    return NextResponse.json({
      success: hasRequiredVars,
      environment: envVars,
      message: hasRequiredVars ? 'Environment variables configured correctly' : 'Missing required environment variables'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

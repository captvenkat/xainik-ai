import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'

// Mock Next.js environment
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Set default test values
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.CRON_API_KEY = 'test-cron-key'
process.env.SUPPORT_EMAIL = 'test@xainik.com'

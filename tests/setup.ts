import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Mock Next.js environment
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Set default test values
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.CRON_API_KEY = 'test-cron-key'
process.env.SUPPORT_EMAIL = 'test@xainik.com'

// Test environment validation
const requiredTestEnvVars = [
  'TEST_SUPABASE_URL',
  'TEST_SUPABASE_SERVICE_ROLE_KEY',
  'TEST_SUPABASE_ANON_KEY'
]

for (const envVar of requiredTestEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing test environment variable: ${envVar}`)
  }
}

// Mock cache TTL for tests (2 seconds)
// Note: Vitest mocking is handled in individual test files
// Global test timeout is handled by vitest config

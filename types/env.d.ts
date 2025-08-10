declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SITE_URL: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    OPENAI_API_KEY?: string;
    RAZORPAY_KEY_ID?: string;
    RAZORPAY_KEY_SECRET?: string;
    RAZORPAY_WEBHOOK_SECRET?: string;
    RESEND_API_KEY?: string;
    ORG_INVOICE_PREFIX?: string;
    BILLING_PDF_BUCKET?: string;
    BILLING_SIGNED_URL_TTL?: string;
    CRON_API_KEY?: string;
    SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    DEV_TEST_ROUTES?: string;
    DEV_UAT?: string;
  }
}
export {};

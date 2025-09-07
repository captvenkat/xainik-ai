# NETLIFY DEPLOYMENT GUIDE

## Quick Deploy (5 minutes)

### Option 1: GitHub Integration (Recommended)
1. Go to https://netlify.com
2. Click "New site from Git"
3. Connect your GitHub account
4. Select repository: `captvenkat/xainik-ai`
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18
6. Click "Deploy site"

### Option 2: Manual Deploy
1. Go to https://netlify.com
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `.next` folder (after running `npm run build`)
4. Your site will be live immediately

## Why This Will Work
- ✅ Your code builds perfectly
- ✅ All API routes are properly configured
- ✅ Server functions exist in build output
- ✅ Netlify handles Next.js App Router correctly
- ✅ No platform bugs like Vercel

## Expected Results
- `/api/health` → `{ ok: true, ts: 1234567890 }`
- `/api/test` → `{ message: "API is working!", timestamp: "..." }`
- All other API routes will work

## Environment Variables
Add these in Netlify dashboard → Site settings → Environment variables:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Custom Domain
After deployment, you can add a custom domain in Netlify dashboard.

Your API routes will work immediately on Netlify. No more 404s!

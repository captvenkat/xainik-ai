# Database Cleanup Guide for Xainik Fundraising App

## 🎯 Objective
Remove all unnecessary tables, views, functions, and triggers from your Supabase database, keeping only the essential structure for the fundraising app.

## 📋 What Will Be Removed
- **~50+ unnecessary tables** (analytics, tracking, billing, AI, etc.)
- **~20+ complex views** (analytics dashboards, performance metrics)
- **~30+ functions** (tracking, analytics, attribution)
- **~50+ triggers** (automated tracking and analytics)

## ✅ What Will Be Kept
- **donors** - Donor information
- **donations** - Payment records
- **subscribers** - Email subscriptions
- **documents** - Transparency documents
- **badge_tiers** - Donor recognition tiers
- **v_stats** - Live fundraising statistics view
- **v_public_feed** - Public donation feed view

## 🚀 Step-by-Step Cleanup Process

### Step 1: Check Current Database State
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `check-current-db.sql`
4. Run the script to see what's currently in your database
5. Review the results to understand what will be removed

### Step 2: Backup (Optional but Recommended)
1. In Supabase Dashboard, go to **Settings** → **Database**
2. Click **Create a backup** (if available in your plan)
3. Or export your current schema for reference

### Step 3: Run the Cleanup Script
1. In **SQL Editor**, copy and paste the contents of `cleanup-supabase.sql`
2. **IMPORTANT**: Review the script to ensure you understand what will be removed
3. Click **Run** to execute the cleanup
4. The script will remove all unnecessary objects with CASCADE

### Step 4: Verify Clean State
1. Run the verification queries at the end of the cleanup script
2. You should see only the fundraising app tables remaining:
   - `donors`
   - `donations` 
   - `subscribers`
   - `documents`
   - `badge_tiers`
   - `v_stats`
   - `v_public_feed`

### Step 5: Apply Fundraising App Schema
1. Copy and paste the contents of `supabase-schema.sql`
2. Run the script to create the fundraising app structure
3. This will ensure all tables have the correct structure and RLS policies

## ⚠️ Important Notes

### Before Running Cleanup:
- **This is irreversible** - Make sure you have backups
- **Review the script** - Understand what will be removed
- **Test in development first** - If possible, test on a copy of your database

### After Cleanup:
- Your database will be much cleaner and faster
- Only fundraising app functionality will remain
- All old analytics, tracking, and complex features will be gone
- The app will be focused solely on donations and transparency

## 🎉 Expected Results

### Before Cleanup:
- **~50+ tables** (complex analytics, tracking, billing, etc.)
- **~20+ views** (analytics dashboards, performance metrics)
- **~30+ functions** (tracking, analytics, attribution)
- **~50+ triggers** (automated tracking)

### After Cleanup:
- **5 tables** (fundraising app only)
- **2 views** (live stats and public feed)
- **0 functions** (clean slate)
- **0 triggers** (clean slate)

## 🔧 If Something Goes Wrong

### Rollback Options:
1. **Use your backup** - Restore from the backup you created
2. **Recreate tables** - Use the original migration files to recreate specific tables
3. **Contact support** - Supabase support can help with database recovery

### Common Issues:
- **Foreign key constraints** - The CASCADE option should handle this
- **Permission errors** - Ensure you have admin access to the database
- **Timeout errors** - The cleanup might take a few minutes for large databases

## 📊 Performance Benefits

After cleanup, you can expect:
- **Faster queries** - Fewer tables to scan
- **Reduced storage** - Less data to store and index
- **Simpler maintenance** - Fewer objects to manage
- **Better performance** - Cleaner database structure
- **Easier debugging** - Simpler schema to understand

## 🎯 Final State

Your database will be optimized for the fundraising app with:
- ✅ Clean, focused schema
- ✅ Only essential tables
- ✅ Optimized for donations and transparency
- ✅ Fast performance
- ✅ Easy maintenance

---

**Ready to clean up? Follow the steps above and enjoy a much cleaner, faster database! 🚀**

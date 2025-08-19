# Manual Migration Guide

## 🚀 Quick Migration Steps

Since the automated scripts require functions that don't exist yet, let's apply the migration manually via Supabase Dashboard. This is actually safer and more reliable.

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Apply the Migration
Copy and paste the **entire contents** of `migrations/20250127_safe_schema_update.sql` into the SQL Editor and click **Run**.

### Step 3: Verify Success
After running the migration, you should see:
```
Schema update migration completed successfully!
```

## 🔍 What This Migration Does

### ✅ Adds Critical Missing Fields:

**Pitches Table:**
- `user_id` - Common identifier
- `allow_resume_requests` - Resume request feature
- `photo_url`, `resume_url` - File uploads
- `likes_count`, `shares_count`, `views_count` - Analytics
- `plan_tier`, `is_active` - Subscription features

**Endorsements Table:**
- `user_id`, `endorser_user_id` - User relationships
- `text` - Endorsement content
- `pitch_id` - Link to specific pitch
- `endorser_name`, `endorser_email` - Endorser details

**Notifications Table:**
- `user_id` - User relationship
- `read_at` - Read status tracking
- `type`, `payload_json` - Notification content
- `channel` - Delivery method

**Donations Table:**
- `user_id` - User relationship
- `amount_cents` - Amount in cents (INR)
- `currency` - Currency (INR)
- `is_anonymous` - Anonymous donations

### ✅ Creates Missing Tables:
- `user_activity_log` - Activity tracking
- `likes` - Pitch likes system
- `shares` - Pitch sharing
- `ai_suggestions` - AI recommendations
- `supporter_celebrations` - Supporter features
- And 12 more supporting tables...

### ✅ Adds Functions:
- `create_mission_invitation()` - Invitation system
- `exec_sql()` - Future migrations

## 🛡️ Safety Guarantees

- ✅ **Non-destructive**: Only adds, never removes
- ✅ **Safe defaults**: All new fields have sensible defaults
- ✅ **IF NOT EXISTS**: Won't break if fields already exist
- ✅ **Zero downtime**: Application continues working

## 🎯 Expected Results

After migration, your application will have:

1. **Full Resume Request System** - Recruiters can request resumes with notes
2. **Complete Endorsement System** - Supporters can add text endorsements
3. **Real Notification System** - Users get proper notifications with read status
4. **Proper Donation Handling** - Amounts in INR, anonymous options
5. **Dashboard Analytics** - Real metrics instead of placeholders
6. **Activity Tracking** - User activity logs for insights

## 🔄 After Migration

1. **Test the application** - Verify everything still works
2. **Remove workarounds** - Delete all the `// Note: table doesn't exist` comments
3. **Deploy updates** - Push the cleaned code to production

## ⚠️ If Something Goes Wrong

1. **Check the error message** - Supabase will show specific issues
2. **Rollback available** - Use `migrations/20250127_rollback_schema_update.sql`
3. **No data loss** - Migration is designed to be safe

## 📞 Need Help?

If you encounter any issues:
1. Copy the exact error message
2. Check if it's a permission issue (you need admin access)
3. Try running individual statements if the full migration fails

---

**Ready to migrate?** Just copy the SQL file contents and run it in Supabase Dashboard! 🚀

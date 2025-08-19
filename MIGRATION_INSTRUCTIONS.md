# Safe Schema Migration Instructions

This migration adds missing tables and fields to make your application fully functional without breaking existing data.

## 🚨 IMPORTANT: Safety First

- ✅ **Non-destructive**: This migration only ADDS features, never removes existing data
- ✅ **Reversible**: Complete rollback script provided
- ✅ **Tested**: Includes verification and safety checks
- ✅ **No downtime**: Application continues working during migration

## 🎯 What This Migration Does

### Adds Missing Tables:
- `user_activity_log` - For activity tracking
- `likes` - For pitch likes functionality  
- `shares` - For pitch sharing
- `ai_suggestions` - For AI recommendations
- `supporter_celebrations` - For supporter features
- `user_subscriptions` - For subscription management
- `community_suggestions` - For community feedback
- `mission_invitations` - For invitation system

### Adds Missing Fields:
- `users.updated_at` - Timestamp tracking
- `pitches.user_id`, `pitches.photo_url`, `pitches.allow_resume_requests` - Enhanced pitch features
- `endorsements.user_id`, `endorsements.pitch_id`, `endorsements.text` - Full endorsement functionality
- `notifications.user_id`, `notifications.read_at`, `notifications.payload_json` - Complete notification system
- `donations.amount_cents`, `donations.currency`, `donations.is_anonymous` - Full donation features

### Adds Missing Functions:
- `create_mission_invitation()` - For invitation system
- `exec_sql()` - For future migrations

## 🚀 How to Apply the Migration

### Option 1: Automatic Script (Recommended)

```bash
# Make the script executable
chmod +x scripts/apply-safe-migration.js

# Run the migration
node scripts/apply-safe-migration.js
```

### Option 2: Manual Application

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy the contents of `migrations/20250127_safe_schema_update.sql`**
4. **Paste and execute in SQL Editor**

### Option 3: API Route (if available)

```bash
# If you have the apply-migration API route
curl -X POST http://localhost:3000/api/apply-migration
```

## 🔍 Verification

After migration, verify it worked:

```bash
# Run verification script
node scripts/verify-migration.js
```

## 🔄 Next Steps After Migration

1. **Verify migration completed successfully**
2. **Remove workarounds from application code** (all the `// Note: table doesn't exist` comments)
3. **Test key features**: resume requests, endorsements, notifications
4. **Deploy the updated application**

## 🛡️ Rollback (if needed)

If something goes wrong, you can rollback:

### Automatic Rollback
```bash
# In Supabase SQL Editor, run:
migrations/20250127_rollback_schema_update.sql
```

### What Rollback Does
- Removes all added tables
- Removes all added columns  
- Removes all added functions
- Restores database to previous state
- **Your existing data remains safe**

## 📊 Expected Results

After successful migration:

### ✅ Working Features:
- Resume request system (full functionality)
- Endorsement system (with text and pitch linking)
- Notification system (with read status)
- Donation system (with proper amounts and anonymity)
- User activity tracking
- Pitch likes and shares
- Mission invitation system

### ✅ Dashboard Improvements:
- Real metrics instead of placeholder data
- Full resume request analytics  
- Complete endorsement tracking
- Proper notification management

### ✅ No More Workarounds:
- No more "table doesn't exist" errors
- No more placeholder/disabled functionality
- Full TypeScript compatibility
- Complete feature set

## 🔧 Troubleshooting

### Common Issues:

**Permission errors:**
- Ensure you're using the service role key
- Check that RLS policies allow the operations

**Table already exists:**
- Normal - migration uses `IF NOT EXISTS` for safety
- These warnings can be ignored

**Function errors:**
- Check that the user has admin role for `exec_sql`
- Verify Supabase function permissions

**Connection timeout:**
- Migration runs in chunks to avoid timeouts
- Can be safely rerun if interrupted

## 📞 Support

If you encounter issues:

1. **Check the verification script output**
2. **Review migration logs for specific errors**  
3. **Ensure your environment variables are correct**
4. **Try running individual SQL statements manually**

## 🎉 Success Indicators

You'll know the migration succeeded when:

- ✅ Verification script shows all green checkmarks
- ✅ Application builds without TypeScript errors
- ✅ Dashboard shows real data instead of placeholders
- ✅ Resume request feature works end-to-end
- ✅ Endorsements can be created with text
- ✅ Notifications show up with read/unread status

---

**Remember**: This migration is designed to be safe and non-destructive. Your existing data and functionality will continue working throughout the process.

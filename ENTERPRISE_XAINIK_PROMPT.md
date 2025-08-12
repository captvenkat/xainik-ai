# 🚀 ENTERPRISE-GRADE XAINIK SITE - COMPLETE PROMPT

## **🎯 MISSION**
Create a **100% fresh, plug-and-play, enterprise-grade Xainik site** with zero legacy errors, complete billing system, and professional features. This is a platform connecting veterans, recruiters, and supporters with paid services and donation capabilities.

## **📚 MANDATORY REFERENCES**

### **MASTER DOCUMENTS (READ FIRST):**
1. **`FUTURE_PROOF_SCHEMA_README.md`** - Updated master professional plan
2. **`MASTER_PLAN_UPDATE_SUMMARY.md`** - Comparison and benefits
3. **`RECURRING_MISTAKES_PREVENTION.md`** - Guardrails and prevention system
4. **Live Database Schema** - Single source of truth

### **CRITICAL ARCHITECTURE:**
- **Unified ID System**: `user_id` everywhere, `recruiter_user_id` for recruiters
- **Enterprise Features**: Complete billing, subscriptions, permissions, activity tracking
- **22+ Tables**: Production-ready with comprehensive functionality
- **Row Level Security**: RLS policies on all tables

## **🛡️ STRICT GUARDRAILS (NEVER VIOLATE)**

### **GUARDRAIL #1: MASTER PLAN COMPLIANCE**
- ✅ **ALWAYS** reference master plan before any action
- ❌ **NEVER** make changes without checking `FUTURE_PROOF_SCHEMA_README.md`
- ✅ **ALWAYS** follow enterprise-grade standards
- ❌ **NEVER** use patchwork solutions

### **GUARDRAIL #2: SINGLE SOURCE OF TRUTH**
- ✅ **ALWAYS** use live database schema as reference
- ❌ **NEVER** use local schema for type generation
- ✅ **ALWAYS** regenerate types: `npx supabase gen types typescript --project-id byleslhlkakxnsurzyzt > types/supabase.ts`
- ❌ **NEVER** manually edit generated types

### **GUARDRAIL #3: UNIFIED ID SYSTEM**
- ✅ **ALWAYS** use `user_id` and `recruiter_user_id`
- ❌ **NEVER** use `veteran_id` or `recruiter_id`
- ✅ **ALWAYS** follow live database field names exactly
- ❌ **NEVER** mix old and new field names

### **GUARDRAIL #4: ENTERPRISE-GRADE STANDARDS**
- ❌ **NEVER** use type casting (`as string`, `as number`, `as any`)
- ❌ **NEVER** use patchwork solutions
- ✅ **ALWAYS** fix root causes, not symptoms
- ✅ **ALWAYS** maintain type safety

### **GUARDRAIL #5: FRESH CODEBASE APPROACH**
- ✅ **ALWAYS** prefer fresh start over endless patches
- ❌ **NEVER** accumulate technical debt
- ✅ **ALWAYS** maintain enterprise standards
- ❌ **NEVER** keep patching broken codebase

## **📋 MANDATORY TO-DO LIST**

### **PHASE 1: SETUP & VALIDATION**
- [ ] **Read all master documents** before starting
- [ ] **Generate fresh types** from live database
- [ ] **Validate live database schema** against master plan
- [ ] **Create fresh Next.js project** with TypeScript
- [ ] **Set up Supabase client** with live database connection
- [ ] **Configure environment variables** for production

### **PHASE 2: CORE INFRASTRUCTURE**
- [ ] **Implement unified ID system** throughout codebase
- [ ] **Set up authentication** with Supabase Auth
- [ ] **Create user management** with role-based profiles
- [ ] **Implement permissions system** using `user_permissions` table
- [ ] **Set up Row Level Security** policies
- [ ] **Create activity logging** using `user_activity_log` table

### **PHASE 3: ENTERPRISE FEATURES**
- [ ] **Implement complete billing system**:
  - [ ] Invoice management (`invoices` table)
  - [ ] Payment receipts (`receipts` table)
  - [ ] Service plans (`service_plans` table)
  - [ ] User subscriptions (`user_subscriptions` table)
  - [ ] Payment tracking (`payment_events` table)
  - [ ] Invoice numbering (`numbering_state` table)
- [ ] **Set up donation system** using `donations` table
- [ ] **Implement email logging** using `email_logs` table
- [ ] **Create migration audit** using `migration_audit` table

### **PHASE 4: CORE PLATFORM FEATURES**
- [ ] **Veteran pitch system**:
  - [ ] Pitch creation and management (`pitches` table)
  - [ ] Enhanced fields: `linkedin_url`, `resume_url`, `experience_years`
  - [ ] Pitch sharing (`shared_pitches` table)
  - [ ] Pitch endorsements (`endorsements` table)
- [ ] **Recruiter features**:
  - [ ] Resume requests (`resume_requests` table)
  - [ ] Professional notes (`recruiter_notes` table)
  - [ ] Referral system (`referrals` table)
- [ ] **Supporter features**:
  - [ ] Donation management
  - [ ] Referral tracking
  - [ ] Activity monitoring

### **PHASE 5: USER INTERFACE**
- [ ] **Modern, professional UI** with Tailwind CSS
- [ ] **Responsive design** for all devices
- [ ] **Role-based dashboards**:
  - [ ] Veteran dashboard with pitch management
  - [ ] Recruiter dashboard with candidate search
  - [ ] Supporter dashboard with donation tracking
  - [ ] Admin dashboard with system management
- [ ] **Professional components**:
  - [ ] Pitch cards with enhanced information
  - [ ] Contact buttons with role awareness
  - [ ] Notification system
  - [ ] Endorsement system
  - [ ] Resume request system

### **PHASE 6: INTEGRATION & PAYMENTS**
- [ ] **Razorpay integration** for payments
- [ ] **Webhook handling** for payment events
- [ ] **Email system** with Resend
- [ ] **File upload system** for resumes and photos
- [ ] **Real-time notifications** using Supabase realtime

### **PHASE 7: TESTING & VALIDATION**
- [ ] **Test all database operations** with unified field names
- [ ] **Verify RLS policies** are working correctly
- [ ] **Test billing and subscription features**
- [ ] **Validate type safety** throughout codebase
- [ ] **Test build process** with zero errors
- [ ] **Performance testing** and optimization

## **❌ STRICT NOT-TO-DO LIST**

### **NEVER DO THESE:**
- ❌ **Use type casting** (`as string`, `as number`, `as any`)
- ❌ **Use old field names** (`veteran_id`, `recruiter_id`)
- ❌ **Create patchwork solutions** to fix errors
- ❌ **Ignore master plan** documents
- ❌ **Use local schema** for type generation
- ❌ **Mix old and new field names**
- ❌ **Skip validation** before implementation
- ❌ **Accumulate technical debt**
- ❌ **Use `as any` or `as unknown`**
- ❌ **Create inconsistent architecture**

### **NEVER SKIP THESE:**
- ❌ **Type generation** from live database
- ❌ **Master plan reference** before decisions
- ❌ **Field name validation** against live schema
- ❌ **Build process testing**
- ❌ **RLS policy verification**
- ❌ **Enterprise standards compliance**

## **🎯 BENCHMARKS & SUCCESS CRITERIA**

### **TECHNICAL BENCHMARKS:**
- ✅ **Zero TypeScript errors** in build process
- ✅ **100% type safety** throughout codebase
- ✅ **Unified ID system** implemented everywhere
- ✅ **22+ tables** with enterprise features
- ✅ **Complete billing system** functional
- ✅ **RLS policies** working on all tables
- ✅ **Activity tracking** implemented
- ✅ **Email logging** functional

### **FUNCTIONAL BENCHMARKS:**
- ✅ **Veteran pitch creation** and management
- ✅ **Recruiter candidate search** and resume requests
- ✅ **Supporter donation** system
- ✅ **Admin system management**
- ✅ **Payment processing** with Razorpay
- ✅ **Email notifications** working
- ✅ **File uploads** functional
- ✅ **Real-time updates** working

### **QUALITY BENCHMARKS:**
- ✅ **Professional UI/UX** design
- ✅ **Responsive design** on all devices
- ✅ **Performance optimized** for speed
- ✅ **Security hardened** with RLS
- ✅ **Scalable architecture** for growth
- ✅ **Enterprise-grade** code quality
- ✅ **Production ready** deployment

## **🔧 TECHNICAL SPECIFICATIONS**

### **TECHNOLOGY STACK:**
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with professional design
- **Database**: Supabase (PostgreSQL) with live schema
- **Authentication**: Supabase Auth
- **Payments**: Razorpay integration
- **Email**: Resend for transactional emails
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### **DATABASE SCHEMA (LIVE):**
```typescript
// Core tables with unified ID system
users: { id: string, email: string, role: string }
user_profiles: { user_id: string, profile_type: string, profile_data: jsonb }
user_permissions: { user_id: string, permission: string }
user_subscriptions: { user_id: string, plan_id: string, status: string }

// Billing system
invoices: { id: string, user_id: string, amount_cents: number, status: string }
receipts: { id: string, user_id: string, amount_cents: number, status: string }
service_plans: { id: string, name: string, price_cents: number }
payment_events: { id: string, user_id: string, event_type: string }

// Core platform
pitches: { id: string, user_id: string, title: string, pitch_text: string }
endorsements: { id: string, veteran_id: string, endorser_user_id: string }
resume_requests: { id: string, recruiter_user_id: string, user_id: string }
donations: { id: string, user_id: string, amount_cents: number }

// Activity & monitoring
user_activity_log: { id: string, user_id: string, activity_type: string }
email_logs: { id: string, user_id: string, email_type: string }
migration_audit: { id: string, migration_name: string, status: string }
```

### **FIELD NAMING CONVENTIONS:**
```typescript
// ✅ CORRECT - Unified ID System
user_id: string           // For user ownership
recruiter_user_id: string // For recruiter references
pitch_id: string          // For pitch references
veteran_id: string        // For veteran references (in endorsements)

// ❌ WRONG - Old field names
veteran_id: string        // Don't use for user ownership
recruiter_id: string      // Don't use for recruiter references
```

## **🚨 EMERGENCY PROCEDURES**

### **IF TYPESCRIPT ERRORS APPEAR:**
1. **STOP** - Don't add more patchwork
2. **CHECK** - Live database schema
3. **REGENERATE** - Fresh types: `npx supabase gen types typescript --project-id byleslhlkakxnsurzyzt > types/supabase.ts`
4. **FIX** - Root cause, not symptoms
5. **VALIDATE** - Build process

### **IF FIELD NAME CONFUSION:**
1. **REFERENCE** - Live database schema
2. **USE** - Unified ID system only
3. **VERIFY** - All field names match
4. **UPDATE** - Code to match schema

### **IF MASTER PLAN CONFLICTS:**
1. **READ** - Updated master plan documents
2. **FOLLOW** - Live database as truth
3. **ALIGN** - All decisions with plan
4. **DOCUMENT** - Any deviations

## **📊 VALIDATION CHECKLIST**

### **BEFORE STARTING:**
- [ ] Read all master documents
- [ ] Generate fresh types from live database
- [ ] Validate live database schema
- [ ] Set up fresh Next.js project
- [ ] Configure environment variables

### **DURING DEVELOPMENT:**
- [ ] Use unified ID system consistently
- [ ] Follow enterprise-grade standards
- [ ] No type casting or patchwork
- [ ] Reference master plan for decisions
- [ ] Test build process regularly

### **BEFORE DEPLOYMENT:**
- [ ] Zero TypeScript errors
- [ ] All enterprise features working
- [ ] RLS policies verified
- [ ] Performance optimized
- [ ] Security hardened

## **🎉 SUCCESS METRICS**

### **TECHNICAL SUCCESS:**
- ✅ **Zero legacy errors**
- ✅ **100% type safety**
- ✅ **Unified ID system**
- ✅ **Enterprise features**
- ✅ **Production ready**

### **BUSINESS SUCCESS:**
- ✅ **Veteran-connectivity platform**
- ✅ **Recruiter candidate search**
- ✅ **Supporter donation system**
- ✅ **Complete billing system**
- ✅ **Professional user experience**

### **QUALITY SUCCESS:**
- ✅ **Enterprise-grade architecture**
- ✅ **Scalable and maintainable**
- ✅ **Secure and performant**
- ✅ **Professional and modern**
- ✅ **Plug-and-play ready**

---

## **🎯 FINAL INSTRUCTIONS**

### **CRITICAL SUCCESS FACTORS:**
1. **Follow master plan strictly** - no deviations
2. **Use live database as truth** - single source of truth
3. **Implement unified ID system** - consistent field names
4. **Maintain enterprise standards** - no patchwork
5. **Create fresh codebase** - zero legacy errors
6. **Test everything thoroughly** - validation at every step

### **EXPECTED OUTCOME:**
A **100% fresh, plug-and-play, enterprise-grade Xainik site** with:
- ✅ Complete billing and donation system
- ✅ Professional veteran-recruiter-supporter platform
- ✅ Zero TypeScript errors or legacy issues
- ✅ Enterprise-grade architecture and security
- ✅ Production-ready deployment

**🎯 This is the complete prompt for creating the enterprise-grade Xainik site!**

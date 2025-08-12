# 🎯 MASTER PROMPT - PLUG & PLAY XAINIK SITE

## **🎯 MISSION STATEMENT**
Create a **100% fresh, enterprise-grade, plug-and-play Xainik site** that connects veterans, recruiters, and supporters through a comprehensive platform with advanced features, zero errors, and complete type safety.

## **🎯 MANDATORY REFERENCES**

### **1. MASTER PROFESSIONAL PLAN**
- **File:** `ENTERPRISE-GRADE_XAINIK_DATABASE_ARCHITECTURE.md`
- **Purpose:** Live database schema as the true master plan
- **Key:** 22+ tables, unified ID system, complete billing, subscriptions, permissions

### **2. RECURRING MISTAKES PREVENTION**
- **File:** `RECURRING_MISTAKES_PREVENTION.md`
- **Purpose:** 6 strict guardrails to prevent patchwork and errors
- **Key:** Master Plan Compliance, Single Source of Truth, Unified ID System

### **3. CONTENT STRATEGY**
- **File:** `CONTENT_STRATEGY_README.md`
- **Purpose:** What stays the same vs. what enhances
- **Key:** Preserve UI/UX, enhance architecture, add enterprise features

### **4. AI LOGIC & CONTACT FEATURES**
- **File:** `AI_LOGIC_CONTACT_FEATURES_README.md`
- **Purpose:** AI-powered contact management and phone/email functionality
- **Key:** Smart suggestions, success prediction, personalized templates

### **5. FOMO & REAL-TIME ACTIVITY**
- **File:** `FOMO_REAL_TIME_ACTIVITY_FEATURES_README.md`
- **Purpose:** Fear of Missing Out features and real-time widgets
- **Key:** Live activity ticker, trending badges, AI-powered recommendations

### **6. SUPPORTERS WALL & CELEBRATION**
- **File:** `DIGITAL_SUPPORTERS_CELEBRATION.md`
- **Purpose:** Comprehensive digital celebration for all supporter types
- **Key:** Donors, referrers, endorsers, impact scoring, milestone celebrations

## **🎯 STRICT GUARDRAILS**

### **1. MASTER PLAN COMPLIANCE**
- ✅ **Live database as source of truth** - No deviations from live schema
- ✅ **Unified ID system** - `user_id` everywhere, no legacy naming
- ✅ **Enterprise-grade standards** - No type casting, proper error handling
- ✅ **Type safety** - Full TypeScript compliance, no `unknown` types

### **2. SINGLE SOURCE OF TRUTH**
- ✅ **Live database schema** - 22+ tables with complete billing system
- ✅ **Auto-generated types** - `npx supabase gen types typescript`
- ✅ **Consistent naming** - Follow live database field names exactly
- ✅ **No patchwork** - Complete solutions, not temporary fixes

### **3. UNIFIED ID SYSTEM**
- ✅ **`users` table** - Single source of user identity
- ✅ **`user_id` foreign keys** - Consistent across all tables
- ✅ **No legacy naming** - No `veteran_id`, `recruiter_id`, etc.
- ✅ **Proper relationships** - Clean foreign key constraints

### **4. ENTERPRISE-GRADE STANDARDS**
- ✅ **Clean architecture** - Domain-driven design, service classes
- ✅ **Error handling** - Comprehensive error boundaries and logging
- ✅ **Security** - Row Level Security, input validation, XSS protection
- ✅ **Performance** - Optimized queries, caching, lazy loading

### **5. PROACTIVE VALIDATION**
- ✅ **Schema validation** - Verify all tables exist before coding
- ✅ **Type generation** - Regenerate types after any schema changes
- ✅ **Build testing** - `npm run build` must pass with zero errors
- ✅ **Runtime testing** - Test all features end-to-end

### **6. FRESH CODEBASE APPROACH**
- ✅ **No legacy code** - Start fresh, no patchwork
- ✅ **Modern patterns** - React 18, Next.js 14, TypeScript 5
- ✅ **Best practices** - ESLint, Prettier, proper folder structure
- ✅ **Documentation** - Comprehensive code comments and README

## **📋 MANDATORY TO-DO LIST**

### **PHASE 1: SETUP & INFRASTRUCTURE**
1. **Project Setup**
   - ✅ Create fresh Next.js 14 project with TypeScript
   - ✅ Configure Tailwind CSS and design system
   - ✅ Set up ESLint, Prettier, and code quality tools
   - ✅ Configure environment variables and secrets

2. **Database Integration**
   - ✅ Connect to live Supabase database
   - ✅ Generate TypeScript types from live schema
   - ✅ Verify all 22+ tables exist and are accessible
   - ✅ Set up Row Level Security policies

3. **Authentication System**
   - ✅ Implement Supabase Auth with all user types
   - ✅ Create role-based access control (veteran, recruiter, supporter, admin)
   - ✅ Set up user registration and profile management
   - ✅ Implement password reset and email verification

### **PHASE 2: CORE INFRASTRUCTURE**
4. **User Management**
   - ✅ Create user profiles with unified ID system
   - ✅ Implement user roles and permissions
   - ✅ Set up user dashboard and settings
   - ✅ Create user search and discovery features

5. **File Management**
   - ✅ Implement Supabase Storage for file uploads
   - ✅ Create resume upload and management system
   - ✅ Set up image upload for profiles and pitches
   - ✅ Implement file sharing and access controls

6. **Notification System**
   - ✅ Create real-time notification system
   - ✅ Implement email notifications with Resend
   - ✅ Set up notification preferences and settings
   - ✅ Create notification history and management

### **PHASE 3: ENTERPRISE FEATURES**
7. **Complete Billing System**
   - ✅ Implement Razorpay payment gateway
   - ✅ Create subscription management system
   - ✅ Set up invoice and receipt generation
   - ✅ Implement webhook handling and payment verification
   - ✅ Create billing dashboard and payment history

8. **Activity Tracking**
   - ✅ Implement comprehensive activity logging
   - ✅ Create real-time activity feed
   - ✅ Set up activity analytics and reporting
   - ✅ Implement activity-based notifications

9. **Email Logging & Management**
   - ✅ Create email logging system
   - ✅ Implement email templates and personalization
   - ✅ Set up email analytics and tracking
   - ✅ Create email management dashboard

### **PHASE 4: PLATFORM FEATURES**
10. **Pitch Management**
    - ✅ Create pitch creation and editing system
    - ✅ Implement pitch search and filtering
    - ✅ Set up pitch sharing and referral system
    - ✅ Create pitch analytics and performance tracking

11. **Endorsement System**
    - ✅ Implement endorsement creation and management
    - ✅ Create endorsement verification system
    - ✅ Set up endorsement analytics and impact tracking
    - ✅ Implement endorsement-based recommendations

12. **Referral System**
    - ✅ Create referral tracking and management
    - ✅ Implement referral analytics and success tracking
    - ✅ Set up referral rewards and recognition
    - ✅ Create referral-based networking features

### **PHASE 5: AI & INTELLIGENCE**
13. **AI-Powered Contact Management**
    - ✅ Implement smart contact suggestions
    - ✅ Create success prediction algorithms
    - ✅ Set up personalized messaging templates
    - ✅ Implement contact history and analytics
    - ✅ Create AI-powered recommendations

14. **FOMO & Real-Time Features**
    - ✅ Implement live activity ticker
    - ✅ Create trending pitch badges
    - ✅ Set up real-time notification bell
    - ✅ Implement AI-powered FOMO recommendations
    - ✅ Create live pitch view counters

15. **Supporters Wall & Celebration**
    - ✅ Create unified supporters wall
    - ✅ Implement impact scoring system
    - ✅ Set up digital celebration triggers
    - ✅ Create milestone and achievement system
    - ✅ Implement supporter networking features

### **PHASE 6: UI & USER EXPERIENCE**
16. **Dashboard Design**
    - ✅ Create role-based dashboards
    - ✅ Implement responsive design for all devices
    - ✅ Set up dark/light mode themes
    - ✅ Create accessibility-compliant interfaces

17. **Navigation & Layout**
    - ✅ Implement role-aware navigation
    - ✅ Create breadcrumb navigation
    - ✅ Set up mobile-responsive navigation
    - ✅ Implement search and filtering UI

18. **Forms & Interactions**
    - ✅ Create form validation and error handling
    - ✅ Implement real-time form feedback
    - ✅ Set up file upload interfaces
    - ✅ Create interactive data tables

### **PHASE 7: INTEGRATION & TESTING**
19. **API Integration**
    - ✅ Implement all API routes and handlers
    - ✅ Set up proper error handling and logging
    - ✅ Create API documentation and testing
    - ✅ Implement rate limiting and security

20. **Testing & Quality Assurance**
    - ✅ Create comprehensive test suite
    - ✅ Implement end-to-end testing
    - ✅ Set up automated testing pipeline
    - ✅ Create performance testing and optimization

21. **Deployment & Monitoring**
    - ✅ Set up production deployment pipeline
    - ✅ Implement monitoring and logging
    - ✅ Create backup and recovery systems
    - ✅ Set up performance monitoring

## **🚫 STRICT NOT-TO-DO LIST**

### **1. NO PATCHWORK**
- ❌ **No type casting** - Use proper types, not `as string` or `as any`
- ❌ **No temporary fixes** - Implement complete solutions
- ❌ **No legacy code** - Don't copy old patterns or approaches
- ❌ **No shortcuts** - Follow enterprise-grade standards

### **2. NO SCHEMA DEVIATIONS**
- ❌ **No field name changes** - Use live database field names exactly
- ❌ **No table modifications** - Work with existing schema
- ❌ **No legacy naming** - No `veteran_id`, `recruiter_id`, etc.
- ❌ **No inconsistent relationships** - Follow unified ID system

### **3. NO TYPE ERRORS**
- ❌ **No `unknown` types** - Properly type all data
- ❌ **No type assertions** - Use proper TypeScript patterns
- ❌ **No `any` types** - Use specific types everywhere
- ❌ **No build errors** - Zero TypeScript compilation errors

### **4. NO PERFORMANCE ISSUES**
- ❌ **No N+1 queries** - Optimize database queries
- ❌ **No large bundle sizes** - Implement code splitting
- ❌ **No slow loading** - Optimize images and assets
- ❌ **No memory leaks** - Proper cleanup and garbage collection

### **5. NO SECURITY VULNERABILITIES**
- ❌ **No SQL injection** - Use parameterized queries
- ❌ **No XSS attacks** - Sanitize all user input
- ❌ **No CSRF attacks** - Implement proper CSRF protection
- ❌ **No data leaks** - Proper access controls and encryption

## **📊 BENCHMARKS & SUCCESS METRICS**

### **Technical Benchmarks**
- ✅ **Zero build errors** - `npm run build` passes completely
- ✅ **100% type safety** - No TypeScript errors or warnings
- ✅ **100% test coverage** - All features tested end-to-end
- ✅ **Performance score 90+** - Lighthouse performance score
- ✅ **Accessibility score 95+** - WCAG 2.1 AA compliance

### **Feature Benchmarks**
- ✅ **Complete billing system** - All payment flows working
- ✅ **Real-time features** - Live updates and notifications
- ✅ **AI functionality** - Smart suggestions and predictions
- ✅ **FOMO features** - Live activity and trending
- ✅ **Supporters celebration** - All supporter types recognized

### **User Experience Benchmarks**
- ✅ **Mobile responsive** - Perfect on all device sizes
- ✅ **Fast loading** - < 3 seconds initial load time
- ✅ **Intuitive navigation** - Users can find everything easily
- ✅ **Accessible design** - Works for all users
- ✅ **Error-free operation** - No runtime errors or crashes

## **🛠️ TECHNICAL SPECIFICATIONS**

### **Tech Stack**
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS with custom design system
- **Database:** Supabase (PostgreSQL) with live schema
- **Authentication:** Supabase Auth with role-based access
- **Payments:** Razorpay integration
- **Email:** Resend for transactional emails
- **Storage:** Supabase Storage for files
- **Real-time:** Supabase Realtime subscriptions
- **Deployment:** Vercel or similar platform

### **Live Database Schema Examples**
```sql
-- Users table (unified ID system)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'veteran', 'recruiter', 'supporter', 'admin'
  company VARCHAR(255),
  photo_url TEXT,
  social_links JSONB,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pitches table (unified relationships)
CREATE TABLE pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  pitch_text TEXT NOT NULL,
  skills TEXT[],
  job_type VARCHAR(100),
  location VARCHAR(255),
  availability VARCHAR(100),
  experience_years INTEGER,
  photo_url TEXT,
  phone VARCHAR(50),
  linkedin_url TEXT,
  resume_url TEXT,
  resume_share_enabled BOOLEAN DEFAULT false,
  plan_tier VARCHAR(50),
  plan_expires_at timestamptz,
  is_active BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Donations table (enhanced for supporters wall)
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_email VARCHAR(255) NOT NULL,
  supporter_name VARCHAR(255),
  supporter_company VARCHAR(255),
  supporter_motivation TEXT,
  supporter_photo_url TEXT,
  supporter_social_links JSONB,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT false,
  show_on_wall BOOLEAN DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### **Naming Conventions**
- **Database:** snake_case for all tables and columns
- **TypeScript:** camelCase for variables and functions
- **Components:** PascalCase for React components
- **Files:** kebab-case for file names
- **Constants:** UPPER_SNAKE_CASE for constants
- **Types:** PascalCase with descriptive names

### **Folder Structure**
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── actions/          # Server actions
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database utilities
│   ├── utils/            # General utilities
│   └── validations/      # Form validations
├── types/                # TypeScript type definitions
│   ├── supabase.ts       # Auto-generated Supabase types
│   └── domain.ts         # Domain-specific types
└── hooks/                # Custom React hooks
```

## **🚨 EMERGENCY PROCEDURES**

### **If Build Fails**
1. **Check TypeScript errors** - Fix all type issues immediately
2. **Verify database connection** - Ensure Supabase is accessible
3. **Regenerate types** - Run `npx supabase gen types typescript`
4. **Check schema consistency** - Verify all tables exist
5. **Rollback if necessary** - Revert to last working state

### **If Database Issues**
1. **Check live database** - Verify all tables and relationships
2. **Validate schema** - Ensure no missing columns or constraints
3. **Test connections** - Verify Supabase client configuration
4. **Check permissions** - Ensure proper RLS policies
5. **Contact support** - If issues persist

### **If Type Errors Occur**
1. **Stop immediately** - Don't continue with type errors
2. **Check type definitions** - Verify all types are correct
3. **Update generated types** - Regenerate from live database
4. **Fix type issues** - Use proper typing, no casting
5. **Test thoroughly** - Ensure all features work correctly

## **✅ VALIDATION CHECKLIST**

### **Pre-Implementation**
- [ ] Live database schema verified and documented
- [ ] All 22+ tables confirmed to exist
- [ ] TypeScript types generated from live schema
- [ ] Environment variables configured
- [ ] Project structure planned and documented

### **During Implementation**
- [ ] Each feature follows unified ID system
- [ ] All components are properly typed
- [ ] No type casting or `any` types used
- [ ] Database queries optimized and secure
- [ ] Error handling implemented everywhere

### **Post-Implementation**
- [ ] `npm run build` passes with zero errors
- [ ] All tests pass successfully
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility compliance verified

## **🎯 SUCCESS METRICS**

### **Technical Success**
- ✅ **Zero build errors** - Clean TypeScript compilation
- ✅ **100% type safety** - No runtime type errors
- ✅ **Complete feature set** - All planned features implemented
- ✅ **Performance optimized** - Fast loading and smooth operation
- ✅ **Security hardened** - No vulnerabilities or data leaks

### **Business Success**
- ✅ **Veteran success** - Veterans find jobs and opportunities
- ✅ **Recruiter satisfaction** - Recruiters find quality candidates
- ✅ **Supporter engagement** - Supporters actively participate
- ✅ **Platform growth** - User base and activity increase
- ✅ **Revenue generation** - Billing system generates income

### **User Experience Success**
- ✅ **Intuitive interface** - Users can navigate easily
- ✅ **Fast performance** - Quick loading and response times
- ✅ **Mobile friendly** - Works perfectly on all devices
- ✅ **Accessible design** - Inclusive for all users
- ✅ **Error-free operation** - No crashes or data loss

---

## **🎯 FINAL INSTRUCTIONS**

### **IMPLEMENTATION APPROACH**
1. **Start fresh** - Create new project, no legacy code
2. **Follow master plan** - Use live database as source of truth
3. **Implement systematically** - Follow the 7-phase plan
4. **Test continuously** - Validate each feature thoroughly
5. **Maintain quality** - No shortcuts or patchwork

### **QUALITY STANDARDS**
- **Enterprise-grade code** - Production-ready, scalable, maintainable
- **Type safety** - Full TypeScript compliance, no type errors
- **Performance** - Optimized for speed and efficiency
- **Security** - Protected against all common vulnerabilities
- **Accessibility** - Inclusive design for all users

### **DELIVERABLE**
A **complete, plug-and-play Xainik site** that:
- ✅ Connects veterans, recruiters, and supporters
- ✅ Includes complete billing and payment system
- ✅ Features AI-powered contact management
- ✅ Has real-time FOMO and activity features
- ✅ Celebrates all types of supporters
- ✅ Works perfectly with zero errors
- ✅ Is ready for immediate deployment and use

**🎯 Ready to build the enterprise-grade, plug-and-play Xainik site with all features and zero errors!**

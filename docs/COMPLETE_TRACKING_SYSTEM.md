# Complete Professional Tracking System

## Overview

The Complete Professional Tracking System is a world-class, enterprise-grade tracking solution built with `user_id` as the central source of truth and `pitch` as the central tracking entity. This system provides comprehensive tracking, attribution, analytics, and real-time dashboard capabilities.

## Key Features

### 🔗 Central Entity Architecture
- **user_id**: Central source of truth for all tracking data
- **pitch_id**: Central tracking entity for all pitch-related events
- **Professional Database Design**: Optimized schema with proper indexing and RLS

### 📊 Comprehensive Tracking
- **Universal Event Tracking**: Captures all user interactions across platforms
- **Real-time Updates**: Automatic metric updates via database triggers
- **Pixel-based Fallback**: Robust tracking that works even when JavaScript fails
- **Attribution Chains**: Complete referral chain tracking with unlimited depth

### 🎯 Advanced Analytics
- **Conversion Funnels**: Detailed funnel analysis with drop-off tracking
- **Engagement Metrics**: Scroll depth, time spent, and interaction tracking
- **Viral Coefficient**: Automatic calculation of content virality
- **Platform Performance**: Cross-platform analytics and comparison

### 📈 Professional Dashboard
- **Real-time Updates**: Auto-refreshing dashboard with live data
- **Multiple Views**: Overview, pitch-specific, attribution, and engagement tabs
- **Responsive Design**: Beautiful, professional UI that works on all devices
- **Export Capabilities**: Data export for further analysis

## Database Schema

### Core Tables

#### `tracking_events` (Main Event Store)
```sql
- id: uuid (Primary Key)
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- referral_id: uuid (References referrals)
- event_type: text (PITCH_VIEWED, CALL_CLICKED, etc.)
- platform: text (web, mobile, whatsapp, etc.)
- user_agent: text
- ip_hash: text
- session_id: text
- metadata: jsonb
- occurred_at: timestamptz
```

#### `referrals` (Enhanced with Attribution)
```sql
- id: uuid (Primary Key)
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- supporter_id: uuid (Who shared)
- share_link: text
- platform: text
- parent_referral_id: uuid (For attribution chains)
- original_supporter_id: uuid (First in chain)
- attribution_chain: text[] (Array of referral IDs)
- attribution_depth: integer
- source_type: text (direct, self, supporter, anonymous, chain)
```

#### `pitch_metrics` (Real-time Aggregated)
```sql
- id: uuid (Primary Key)
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- total_views: integer
- total_calls: integer
- total_emails: integer
- total_shares: integer
- total_conversions: integer
- scroll_depth_25_count: integer
- scroll_depth_50_count: integer
- scroll_depth_75_count: integer
- time_30_count: integer
- time_60_count: integer
- time_120_count: integer
- last_activity_at: timestamptz
```

#### `user_tracking_summary` (User-level Aggregated)
```sql
- id: uuid (Primary Key)
- user_id: uuid (Central source of truth)
- total_pitches: integer
- total_views: integer
- total_conversions: integer
- avg_conversion_rate: numeric
- viral_coefficient: numeric
- last_activity_at: timestamptz
```

### Analytics Tables

#### `daily_tracking_metrics`
```sql
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- date: date
- views: integer
- calls: integer
- emails: integer
- shares: integer
- conversions: integer
- engagement_time: integer
- unique_visitors: integer
```

#### `platform_metrics`
```sql
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- platform: text
- date: date
- views: integer
- calls: integer
- emails: integer
- shares: integer
- conversions: integer
- conversion_rate: numeric
```

#### `attribution_chains`
```sql
- user_id: uuid (Central source of truth)
- pitch_id: uuid (Central tracking entity)
- original_referral_id: uuid
- original_supporter_id: uuid
- chain_depth: integer
- total_chain_views: integer
- total_chain_conversions: integer
- viral_coefficient: numeric
- attribution_value: numeric
```

#### `supporter_performance`
```sql
- user_id: uuid (Central source of truth - pitch owner)
- pitch_id: uuid (Central tracking entity)
- supporter_id: uuid
- total_referrals_created: integer
- total_attributed_views: integer
- total_attributed_conversions: integer
- conversion_rate: numeric
- attribution_value: numeric
```

## API Endpoints

### Universal Tracking API
**POST** `/api/track-event`
```typescript
{
  eventType: string,
  pitchId: string, // Central tracking entity
  userId: string, // Central source of truth
  referralId?: string,
  parentReferralId?: string,
  platform?: string,
  userAgent?: string,
  ipAddress?: string,
  metadata?: object,
  sessionId?: string,
  timestamp?: string
}
```

**GET** `/api/track-event` (Pixel Tracking)
```
/api/track-event?event=PITCH_VIEWED&pitch=123&user=456&ref=789&parent=101
```

### Pitch Owner API
**GET** `/api/pitch/[pitchId]/owner`
```typescript
{
  success: boolean,
  userId: string // Central source of truth
}
```

## Client-Side Integration

### Tracking Utility (`src/lib/tracking.ts`)
```typescript
// Universal tracking function
await trackEvent({
  eventType: 'PITCH_VIEWED',
  pitchId: 'pitch-id', // Central tracking entity
  userId: 'user-id', // Central source of truth
  referralId: 'ref-id',
  platform: 'web'
})

// Convenience functions
await tracking.pitchViewed(pitchId, referralId, parentReferralId, platform)
await tracking.callClicked(pitchId, referralId, parentReferralId, platform)
await tracking.emailClicked(pitchId, referralId, parentReferralId, platform)
await tracking.shareReshared(pitchId, referralId, parentReferralId, platform)

// Auto-tracking
enableAutoTracking() // Automatic page views and clicks
enableRealTimeTracking() // Scroll depth, time spent, exit tracking
```

### Analytics Functions (`src/lib/tracking-analytics.ts`)
```typescript
// User-level analytics
const userSummary = await getUserTrackingSummary(userId)
const dashboardData = await getDashboardData(userId)

// Pitch-level analytics
const pitchMetrics = await getPitchMetrics(pitchId, userId)
const conversionFunnel = await getConversionFunnel(pitchId, userId)
const engagementMetrics = await getEngagementMetrics(pitchId, userId)
const viralCoefficient = await getViralCoefficient(pitchId, userId)

// Attribution analytics
const attributionChains = await getAttributionChains(pitchId, userId)
const supporterPerformance = await getSupporterPerformance(pitchId, userId)

// Time-based analytics
const dailyMetrics = await getDailyTrackingMetrics(pitchId, userId, 30)
const platformMetrics = await getPlatformMetrics(pitchId, userId, 30)
const todayMetrics = await getTodayMetrics(pitchId, userId)
```

## Dashboard Components

### TrackingDashboard (`src/components/tracking/TrackingDashboard.tsx`)
```typescript
// User-level dashboard
<TrackingDashboard userId={userId} />

// Pitch-specific dashboard
<TrackingDashboard userId={userId} pitchId={pitchId} />
```

**Features:**
- Real-time auto-refresh (30-second intervals)
- Multiple tabs: Overview, Pitch Analytics, Attribution, Engagement, Recent Activity
- Professional metric cards with icons and colors
- Conversion funnel visualization
- Attribution chain display
- Engagement metrics breakdown
- Recent activity feed

## Database Functions & Triggers

### Automatic Updates
```sql
-- Update pitch metrics on event
CREATE TRIGGER trigger_update_pitch_metrics
  AFTER INSERT ON tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_metrics();

-- Update daily metrics on event
CREATE TRIGGER trigger_update_daily_metrics
  AFTER INSERT ON tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_metrics();

-- Update platform metrics on event
CREATE TRIGGER trigger_update_platform_metrics
  AFTER INSERT ON tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_metrics();
```

### Functions
```sql
-- Update pitch metrics
CREATE FUNCTION update_pitch_metrics() RETURNS TRIGGER
-- Updates pitch_metrics table based on event type

-- Update daily metrics
CREATE FUNCTION update_daily_metrics() RETURNS TRIGGER
-- Updates daily_tracking_metrics table

-- Update platform metrics
CREATE FUNCTION update_platform_metrics() RETURNS TRIGGER
-- Updates platform_metrics table
```

## Security & Performance

### Row Level Security (RLS)
```sql
-- Users can only see events for their pitches
CREATE POLICY "Users can view tracking events for their pitches" 
ON tracking_events FOR SELECT 
USING (pitch_id IN (SELECT id FROM pitches WHERE user_id = auth.uid()));

-- Users can only see their own metrics
CREATE POLICY "Users can view their own pitch metrics" 
ON pitch_metrics FOR SELECT 
USING (user_id = auth.uid());
```

### Performance Indexes
```sql
-- Core tracking indexes
CREATE INDEX idx_tracking_events_user_id ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_pitch_id ON tracking_events(pitch_id);
CREATE INDEX idx_tracking_events_event_type ON tracking_events(event_type);
CREATE INDEX idx_tracking_events_occurred_at ON tracking_events(occurred_at DESC);

-- Attribution indexes
CREATE INDEX idx_referrals_attribution_chain ON referrals USING GIN (attribution_chain);
CREATE INDEX idx_referrals_source_type ON referrals(source_type);

-- Metrics indexes
CREATE INDEX idx_pitch_metrics_last_activity ON pitch_metrics(last_activity_at DESC);
CREATE INDEX idx_daily_tracking_metrics_user_date ON daily_tracking_metrics(user_id, date DESC);
```

## Event Types

### Core Events
- `PITCH_VIEWED`: When someone views a pitch
- `CALL_CLICKED`: When someone clicks the call button
- `PHONE_CLICKED`: When someone clicks the phone number
- `EMAIL_CLICKED`: When someone clicks the email button
- `LINKEDIN_CLICKED`: When someone clicks LinkedIn profile
- `RESUME_REQUEST_CLICKED`: When someone requests resume
- `SHARE_RESHARED`: When someone shares the pitch
- `LINK_OPENED`: When someone opens a shared link
- `SIGNUP_FROM_REFERRAL`: When someone signs up via referral

### Engagement Events
- `SCROLL_25_PERCENT`: User scrolled 25% of the page
- `SCROLL_50_PERCENT`: User scrolled 50% of the page
- `SCROLL_75_PERCENT`: User scrolled 75% of the page
- `TIME_30_SECONDS`: User spent 30 seconds on page
- `TIME_60_SECONDS`: User spent 60 seconds on page
- `TIME_120_SECONDS`: User spent 120 seconds on page
- `PAGE_EXIT`: User left the page

### Custom Events
- `FORM_SUBMITTED`: Custom form submission
- `DOWNLOAD_CLICKED`: File download
- `VIDEO_PLAYED`: Video playback
- `SOCIAL_SHARE`: Social media share

## Setup Instructions

### 1. Database Setup
Run the migration in Supabase SQL Editor:
```sql
-- Run migrations/20250127_complete_tracking_system.sql
```

### 2. API Integration
The tracking API is automatically available at `/api/track-event`

### 3. Client Integration
```typescript
// In your layout or app component
import { enableAutoTracking, enableRealTimeTracking } from '@/lib/tracking'

// Enable tracking
enableAutoTracking()
enableRealTimeTracking()
```

### 4. Dashboard Integration
```typescript
// In your dashboard component
import TrackingDashboard from '@/components/tracking/TrackingDashboard'

// Add to your dashboard
<TrackingDashboard userId={userId} pitchId={pitchId} />
```

## Best Practices

### 1. Central Entity Consistency
- Always use `user_id` as the central source of truth
- Always use `pitch_id` as the central tracking entity
- Ensure all tables reference these central entities

### 2. Performance Optimization
- Use database triggers for real-time updates
- Implement proper indexing for common queries
- Use aggregated tables for dashboard performance

### 3. Security
- Implement RLS policies for all tables
- Validate user permissions before data access
- Sanitize all user inputs

### 4. Error Handling
- Implement graceful fallbacks for tracking failures
- Use pixel tracking as backup for API failures
- Log errors for debugging

### 5. Data Integrity
- Use database constraints to ensure data consistency
- Implement proper foreign key relationships
- Use transactions for multi-table operations

## Monitoring & Maintenance

### 1. Performance Monitoring
- Monitor query performance on aggregated tables
- Track API response times
- Monitor database trigger execution times

### 2. Data Quality
- Regular data consistency checks
- Monitor for orphaned records
- Validate attribution chain integrity

### 3. System Health
- Monitor tracking API availability
- Check database connection health
- Monitor real-time update performance

## Future Enhancements

### 1. Advanced Analytics
- Machine learning for conversion prediction
- A/B testing framework integration
- Cohort analysis capabilities

### 2. Enhanced Attribution
- Multi-touch attribution models
- Cross-device tracking
- Offline-to-online attribution

### 3. Real-time Features
- WebSocket-based live updates
- Real-time notifications
- Live collaboration features

### 4. Export & Integration
- Data export APIs
- Third-party analytics integration
- Custom reporting tools

## Conclusion

The Complete Professional Tracking System provides a robust, scalable, and secure foundation for comprehensive user tracking and analytics. With its central entity architecture, real-time updates, and professional dashboard, it delivers enterprise-grade tracking capabilities while maintaining simplicity and performance.

The system is designed to grow with your needs, providing the flexibility to add new tracking events, analytics features, and dashboard capabilities as your requirements evolve.

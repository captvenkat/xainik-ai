# Attribution Chain System Documentation

## Overview

The Attribution Chain System is a comprehensive tracking solution that captures the complete journey of how content spreads through referrals, attributing all actions back to their original sources. This system tracks everything from direct visits to multi-level referral chains, providing complete visibility into content virality and supporter performance.

## Key Features

### 🔗 Complete Attribution Chains
- Track multi-level referral chains (unlimited depth)
- Attribute all actions back to original supporters
- Distinguish between self-shares, supporter shares, anonymous visits, and chain referrals

### 📊 Real-time Analytics
- Live tracking of all user interactions
- Real-time dashboard updates
- Pixel-based tracking for maximum reliability

### 🎯 Source Attribution
- **Direct**: Direct visits to pitch URLs
- **Self**: Veteran sharing their own pitch
- **Supporter**: Registered supporters sharing pitches
- **Anonymous**: Unknown users sharing content
- **Chain**: Multi-level referral chains

### 📈 Performance Metrics
- Viral coefficient calculation
- Conversion attribution
- Supporter performance ranking
- Chain reach analysis

## Database Schema

### Core Tables

#### `referrals` (Enhanced)
```sql
- id: uuid (Primary Key)
- supporter_id: uuid (References users)
- pitch_id: uuid (References pitches)
- share_link: text
- platform: text (whatsapp, linkedin, email, direct, web)
- parent_referral_id: uuid (For attribution chains)
- original_supporter_id: uuid (First supporter in chain)
- attribution_chain: text[] (Array of referral IDs)
- attribution_depth: integer (How many levels deep)
- source_type: text (direct, self, supporter, anonymous, chain)
- created_at: timestamptz
```

#### `referral_events` (Enhanced)
```sql
- id: uuid (Primary Key)
- referral_id: uuid (References referrals)
- event_type: text (PITCH_VIEWED, CALL_CLICKED, etc.)
- platform: text
- user_agent: text
- ip_hash: text
- metadata: jsonb
- occurred_at: timestamptz
```

#### `attribution_events` (New)
```sql
- id: uuid (Primary Key)
- referral_id: uuid (References referrals)
- original_referral_id: uuid (First referral in chain)
- event_type: text
- platform: text
- user_agent: text
- ip_hash: text
- metadata: jsonb
- attribution_chain: text[] (Full chain of referral IDs)
- attribution_depth: integer
- source_type: text
- original_supporter_id: uuid
- occurred_at: timestamptz
```

#### `referral_chain_analytics` (New)
```sql
- id: uuid (Primary Key)
- original_referral_id: uuid (References referrals)
- original_supporter_id: uuid (References users)
- pitch_id: uuid (References pitches)
- chain_depth: integer
- total_views: integer
- total_calls: integer
- total_emails: integer
- total_shares: integer
- total_conversions: integer
- chain_reach: integer
- viral_coefficient: numeric(5,2)
- attribution_value: numeric(10,2)
- last_activity_at: timestamptz
```

#### `supporter_attribution_summary` (New)
```sql
- id: uuid (Primary Key)
- supporter_id: uuid (References users)
- pitch_id: uuid (References pitches)
- total_referrals_created: integer
- total_chain_reach: integer
- total_attributed_views: integer
- total_attributed_calls: integer
- total_attributed_emails: integer
- total_attributed_shares: integer
- total_attributed_conversions: integer
- viral_coefficient: numeric(5,2)
- attribution_value: numeric(10,2)
- last_activity_at: timestamptz
```

### Database Views

#### `attribution_chain_view`
Complete view of all attribution chains with supporter and performance data.

#### `supporter_attribution_performance`
Supporter performance metrics with calculated conversion and engagement rates.

#### `viral_coefficient_analysis`
Viral coefficient calculations and analysis per pitch.

## API Endpoints

### Universal Tracking Endpoint
```
POST /api/track-event
```

**Request Body:**
```json
{
  "eventType": "PITCH_VIEWED",
  "pitchId": "uuid",
  "referralId": "uuid",
  "parentReferralId": "uuid", // For attribution chains
  "platform": "web",
  "userAgent": "string",
  "ipAddress": "string",
  "metadata": {},
  "timestamp": "2025-01-27T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "tracked": true,
  "referralId": "uuid"
}
```

### Pixel Tracking
```
GET /api/track-event?event=PITCH_VIEWED&pitch=uuid&ref=uuid&parent=uuid&platform=web
```

Returns a 1x1 transparent GIF for maximum reliability.

## Client-Side Integration

### Tracking Utility
```typescript
import { tracking } from '@/lib/tracking'

// Track pitch view with attribution
await tracking.pitchViewed(pitchId, referralId, parentReferralId, 'web')

// Track call click with attribution
await tracking.callClicked(pitchId, referralId, parentReferralId, 'web')

// Track custom event with attribution
await tracking.custom('CUSTOM_EVENT', pitchId, referralId, parentReferralId, 'web', metadata)
```

### Auto-Tracking
The system automatically tracks:
- Page views on pitch pages
- Contact button clicks
- Scroll depth milestones (25%, 50%, 75%)
- Time spent on page (30s, 60s, 120s)
- Page exits

### Attribution Chain Detection
```typescript
// Extract referral and parent IDs from URL
const referralId = new URLSearchParams(window.location.search).get('ref')
const parentReferralId = new URLSearchParams(window.location.search).get('parent')

// Track with attribution chain
await tracking.pitchViewed(pitchId, referralId, parentReferralId, 'web')
```

## Attribution Chain Logic

### Chain Creation
1. **Direct Visit**: Creates referral with `source_type = 'direct'`
2. **Supporter Share**: Creates referral with `source_type = 'supporter'`
3. **Chain Share**: Creates referral with `parent_referral_id` and builds attribution chain

### Attribution Chain Building
```sql
-- Example: A -> B -> C -> D
-- A shares pitch (depth 0)
-- B clicks A's link and shares (depth 1, parent = A)
-- C clicks B's link and shares (depth 2, parent = B)
-- D clicks C's link (depth 3, parent = C)

-- D's attribution_chain = ['A', 'B', 'C']
-- D's original_supporter_id = A's supporter_id
-- D's attribution_depth = 3
```

### Event Attribution
All events are attributed back to the original supporter in the chain:
- Views, calls, emails, shares are counted for the original supporter
- Chain reach tracks unique people reached
- Viral coefficient = (total shares / total views) * 100

## Analytics Functions

### Core Analytics
```typescript
// Get attribution summary for veteran
const summary = await getAttributionSummary(veteranId)

// Get supporter performance
const performance = await getSupporterAttributionPerformance(pitchId, supporterId)

// Get viral coefficient analysis
const viralAnalysis = await getViralCoefficientAnalysis(pitchId)

// Get attribution chain
const chain = await getAttributionChain(pitchId)
```

### Real-time Metrics
```typescript
// Get real-time attribution metrics
const metrics = await getRealtimeAttributionMetrics(pitchId)

// Get attribution breakdown by source
const breakdown = await getAttributionBreakdown(pitchId)

// Get chain depth analysis
const depthAnalysis = await getChainDepthAnalysis(pitchId)
```

## Dashboard Components

### AttributionDashboard
Main dashboard component with tabs for:
- Overview: Key metrics and summaries
- Attribution Chains: Complete chain tracking
- Supporter Performance: Supporter rankings and metrics
- Viral Analysis: Viral coefficient analysis

### AttributionChainView
Displays complete attribution chains with:
- Chain depth and source type
- Original and current supporter info
- Chain performance metrics
- Expandable details

### SupporterAttributionPerformance
Shows supporter performance with:
- Attribution value rankings
- Conversion and engagement rates
- Viral coefficient scores
- Performance comparisons

### ViralCoefficientAnalysis
Analyzes viral spread with:
- Viral coefficient calculations
- Share rate analysis
- Growth patterns
- Performance benchmarks

## Setup Instructions

### 1. Database Setup
Run the complete setup script:
```sql
-- Run in Supabase SQL Editor
\i scripts/setup-complete-tracking-system.sql
```

### 2. API Integration
The tracking API is automatically available at `/api/track-event`

### 3. Client Integration
Add to your layout:
```typescript
import { TrackingProvider } from '@/components/TrackingProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TrackingProvider>
          {children}
        </TrackingProvider>
      </body>
    </html>
  )
}
```

### 4. Dashboard Integration
Add to veteran dashboard:
```typescript
import AttributionDashboard from '@/components/attribution/AttributionDashboard'

<AttributionDashboard veteranId={userId} pitchId={pitchId} />
```

## Event Types

### Tracked Events
- `PITCH_VIEWED`: Pitch page view
- `CALL_CLICKED`: Call button click
- `PHONE_CLICKED`: Phone number click
- `EMAIL_CLICKED`: Email button click
- `LINKEDIN_CLICKED`: LinkedIn profile click
- `RESUME_REQUEST_CLICKED`: Resume request click
- `SHARE_RESHARED`: Content share
- `LINK_OPENED`: Link opened
- `SIGNUP_FROM_REFERRAL`: Signup from referral
- `SCROLL_25_PERCENT`: 25% scroll depth
- `SCROLL_50_PERCENT`: 50% scroll depth
- `SCROLL_75_PERCENT`: 75% scroll depth
- `TIME_30_SECONDS`: 30 seconds on page
- `TIME_60_SECONDS`: 60 seconds on page
- `TIME_120_SECONDS`: 120 seconds on page
- `PAGE_EXIT`: User leaving page

## Performance Optimization

### Database Indexes
- Comprehensive indexing on all query patterns
- GIN indexes for array columns (attribution_chain)
- Composite indexes for common queries

### Caching
- Real-time metrics cache table
- Aggregated views for fast queries
- Automatic cache updates via triggers

### Query Optimization
- Pre-aggregated views for dashboard queries
- Efficient chain traversal algorithms
- Optimized attribution calculations

## Security

### Row Level Security (RLS)
- Users can only see their own attribution data
- Pitch owners can see all attribution for their pitches
- Supporters can see their own performance data

### Data Privacy
- IP addresses are hashed
- User agents are stored but not exposed
- Metadata is encrypted in transit

## Monitoring

### Real-time Monitoring
- Live tracking status indicators
- Real-time dashboard updates
- Performance metrics tracking

### Error Handling
- Graceful fallback to pixel tracking
- Comprehensive error logging
- Automatic retry mechanisms

## Future Enhancements

### Planned Features
- Advanced attribution modeling
- Machine learning for conversion prediction
- A/B testing for attribution optimization
- Advanced viral coefficient algorithms
- Multi-platform attribution tracking
- Advanced reporting and exports

### Integration Opportunities
- Email marketing attribution
- Social media platform integration
- CRM system integration
- Advanced analytics platforms
- Custom attribution models

## Support

For questions or issues with the attribution system:
1. Check the database setup script
2. Verify API endpoints are accessible
3. Review client-side integration
4. Check browser console for errors
5. Review server logs for API errors

The attribution system provides complete visibility into how content spreads and converts, enabling data-driven decisions for content optimization and supporter engagement.

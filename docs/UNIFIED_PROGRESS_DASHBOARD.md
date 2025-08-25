# Unified Progress Dashboard

## Overview

The Unified Progress Dashboard is a mobile-first, action-first dashboard that provides veterans with a comprehensive view of their pitch performance and engagement metrics. It follows a progressive flow: **Profile → Pitch → Progress**.

## Features

### Core Components

1. **HeaderBar** - Pitch selector, date range picker, and Smart Share Hub
2. **KpiRow** - Key performance indicators (Shares, Views, Contacts) with sparklines
3. **Funnel** - Progress funnel showing Shares → Views → Contacts with source attribution
4. **SupporterSpotlight** - Top supporters and their contributions
5. **ChannelInsights** - Channel performance analysis with efficiency metrics
6. **ContactOutcomes** - Contact tracking with status management
7. **NudgeRail** - Contextual suggestions and quick actions

### Key Features

- **Mobile-first design** - Responsive layout that scales from mobile to desktop
- **Action-first approach** - All actions open in modals, no external navigation
- **Real-time analytics** - Live data from referral events and user interactions
- **Smart suggestions** - AI-powered nudges based on user behavior
- **Comprehensive tracking** - All user actions emit analytics events

## Architecture

### File Structure

```
src/
├── app/dashboard/veteran/page.tsx          # Main dashboard with feature flag routing
├── components/progress/
│   ├── UnifiedProgressDashboard.tsx       # Main container component
│   ├── HeaderBar.tsx                      # Header with controls
│   ├── KpiRow.tsx                         # KPI cards with sparklines
│   ├── Funnel.tsx                         # Progress funnel visualization
│   ├── SupporterSpotlight.tsx             # Supporter management
│   ├── ChannelInsights.tsx                # Channel performance
│   ├── ContactOutcomes.tsx                # Contact tracking
│   ├── NudgeRail.tsx                      # Smart suggestions
│   └── charts/
│       ├── FunnelBars.tsx                 # Funnel chart component
│       ├── LineTrend.tsx                  # Line chart component
│       └── BarGrouped.tsx                 # Bar chart component
├── lib/
│   ├── actions/progress.ts                # Server actions for data fetching
│   ├── microcopy/progress.ts              # UI text and tooltips
│   └── metrics/track.ts                   # Analytics tracking
```

### Data Flow

1. **Data Fetching** - Server actions query the `referral_events` table
2. **State Management** - React state for UI interactions and data caching
3. **Analytics** - All user actions tracked via activity log
4. **Real-time Updates** - Data refreshes on date range or pitch changes

## Implementation Details

### Feature Flag

The dashboard is controlled by the environment variable:
```
NEXT_PUBLIC_FEATURE_UNIFIED_PROGRESS=true
```

When enabled, the unified dashboard replaces the legacy analytics view.

### Database Schema

Uses existing `referral_events` table with the following structure:
- `event_type`: SHARE_RESHARED, PITCH_VIEWED, CALL_CLICKED, EMAIL_CLICKED
- `platform`: whatsapp, linkedin, facebook, email, twitter, direct
- `referrals`: Links to supporter and pitch data

### Analytics Events

All user interactions are tracked:
- `dashboard_viewed`
- `share_performed`
- `supporter_thanked`
- `contact_followup_sent`
- `date_range_changed`
- And many more...

## Usage

### For Veterans

1. Navigate to `/dashboard/veteran`
2. Select date range (7d, 14d, 30d, 60d, 90d)
3. View performance metrics and insights
4. Take action via modals (share, follow-up, thank supporters)
5. Receive smart suggestions for improvement

### For Developers

1. Enable feature flag in `.env.local`
2. Ensure database has required tables
3. Test with sample data
4. Monitor analytics events

## Mobile-First Design

- Single column layout on mobile
- Sticky header with essential controls
- Touch-friendly buttons and interactions
- Responsive charts and visualizations
- Progressive enhancement for desktop

## Action-First Approach

- All actions open in modals
- No external navigation for core flows
- Inline editing and quick actions
- Contextual suggestions
- One-click operations

## Future Enhancements

1. **Advanced Analytics** - Cohort analysis, conversion funnels
2. **AI Insights** - Predictive analytics and recommendations
3. **Integration** - CRM integration, email automation
4. **Real-time Updates** - WebSocket connections for live data
5. **Export Features** - PDF reports, data export

## Testing

The dashboard includes comprehensive error handling and loading states:
- Zero states for empty data
- Loading spinners for data fetching
- Error boundaries for failed requests
- Graceful degradation for missing features

## Performance

- Optimized database queries with proper indexing
- Client-side caching for frequently accessed data
- Lazy loading for chart components
- Efficient re-rendering with React optimization

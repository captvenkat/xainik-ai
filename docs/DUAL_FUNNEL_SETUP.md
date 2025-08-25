# Dual Funnel Dashboard Setup Guide

## Overview

The Dual Funnel Dashboard is a new Vercel-style analytics interface for veterans and supporters, featuring:

- **Inbound Funnel**: Tracks effort → views (shares vs views over time)
- **Conversion Funnel**: Tracks views → hires (conversion pipeline)
- **Channel Performance**: Platform-specific analytics
- **Smart Nudges**: Actionable insights with one-click actions
- **Supporter Progress**: Individual supporter impact tracking

## Feature Flag

To enable the dual funnel dashboards, set this environment variable:

```bash
NEXT_PUBLIC_FEATURE_DUAL_FUNNEL=true
```

When `false` or unset, the legacy dashboard will be shown.

## Database Setup

Run the migration script to add required columns and views:

```sql
-- File: migrations/20250127_add_dual_funnel_dashboards.sql
-- This adds:
-- - New columns to referral_events table
-- - Database views for funnel analytics
-- - Indexes for performance
```

## Components Structure

```
src/components/veteran/
├── DualFunnelDashboard.tsx      # Main dashboard container
├── HeaderBar.tsx                # Pitch selector + date range + actions
├── OnboardingBanner.tsx         # Progress steps (Profile → Pitch → Track)
├── KPICards.tsx                 # 4 KPI cards with sparklines
├── charts/
│   ├── InboundTrend.tsx         # Shares vs Views line chart
│   ├── ConversionFunnel.tsx     # Views → Hires funnel
│   └── ChannelBars.tsx          # Platform performance bars
├── ReferralsTable.tsx           # Vercel-style events table
└── RightRail.tsx                # Supporters + Smart Nudges

src/components/supporter/
└── SupporterDashboard.tsx       # Supporter impact tracking
```

## Analytics Functions

```typescript
// src/lib/analytics-dual-funnel.ts
export async function getDualFunnelData(veteranId: string, dateRange: '7d' | '30d' | '90d')
export async function getDualFunnelKPIs(veteranId: string)
export async function getSupporterDashboardData(supporterId: string, pitchId: string)
export function isDualFunnelFeatureEnabled()
```

## Usage

### Veteran Dashboard

The dual funnel dashboard automatically replaces the legacy analytics when the feature flag is enabled:

```tsx
// In veteran dashboard
{isDualFunnelFeatureEnabled() ? (
  <DualFunnelDashboard 
    userId={userId}
    onSharePitch={handleSharePitch}
    onEditPitch={handleEditPitch}
  />
) : (
  <LegacyAnalytics />
)}
```

### Supporter Dashboard

Supporters can access their impact dashboard:

```tsx
<SupporterDashboard 
  supporterId={supporterId}
  pitchId={pitchId}
/>
```

## Data Flow

1. **Referral Events** → Database views aggregate data
2. **Analytics Functions** → Transform raw data for charts
3. **Chart Components** → Render with recharts library
4. **Smart Nudges** → Generate actionable insights
5. **Action Handlers** → Execute one-click actions

## Customization

### Adding New Chart Types

1. Create component in `src/components/veteran/charts/`
2. Add data transformation in `analytics-dual-funnel.ts`
3. Integrate into `DualFunnelDashboard.tsx`

### Modifying Nudges

Update the nudge generation logic in `RightRail.tsx`:

```typescript
const generateNudge = () => {
  // Custom nudge logic based on data
  return {
    title: "Custom Action",
    description: "Custom description",
    action: "Take Action",
    actionType: "custom_action",
    priority: "high"
  }
}
```

## Performance Considerations

- Database views are optimized with proper indexes
- Chart data is cached and transformed efficiently
- Lazy loading for chart components
- Responsive design for mobile devices

## Testing

### Feature Flag Testing

```typescript
// Test with feature flag disabled
process.env.NEXT_PUBLIC_FEATURE_DUAL_FUNNEL = 'false'
// Should show legacy dashboard

// Test with feature flag enabled
process.env.NEXT_PUBLIC_FEATURE_DUAL_FUNNEL = 'true'
// Should show dual funnel dashboard
```

### Data Testing

```typescript
// Test with empty data
const emptyData = { inbound: [], conversion: {}, channels: [], table: [] }
// Should show zero states

// Test with sample data
const sampleData = { /* mock data */ }
// Should render charts and metrics
```

## Troubleshooting

### Common Issues

1. **Charts not rendering**: Check if recharts is properly installed
2. **Data not loading**: Verify database views exist and have data
3. **Feature flag not working**: Ensure environment variable is set correctly
4. **Performance issues**: Check database indexes and query optimization

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG_DUAL_FUNNEL=true
```

This will log data loading, transformations, and component rendering.

## Future Enhancements

- Real-time data updates
- Advanced filtering and segmentation
- Export functionality
- Custom date ranges
- A/B testing for nudge effectiveness
- Integration with external analytics tools

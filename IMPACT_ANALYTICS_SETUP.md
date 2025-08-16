# Impact Analytics Setup Guide

## Overview
The Impact Analytics feature provides veterans with detailed insights into their pitch performance, supporter engagement, and conversion metrics.

## Feature Components

### 1. Impact Analytics Page
- **Location**: `/dashboard/veteran/impact`
- **Access**: Available to veterans with the `NEXT_PUBLIC_FEATURE_IMPACT=true` flag

### 2. Components
- **KpiRow**: Key performance indicators (referrals, opens, calls, outcomes, value)
- **FunnelCard**: Conversion funnel visualization
- **ChannelPerformance**: Performance by sharing channels
- **SupporterLeaderboard**: Top performing supporters
- **KeywordChips**: AI-suggested keywords for pitch optimization
- **ActivityFeed**: Real-time activity tracking
- **NudgePanel**: AI-powered action suggestions

### 3. Database Tables & Views
- `impact_calls`: Track supporter calls and outcomes
- `impact_outcomes`: Record successful outcomes (job offers, interviews)
- `impact_keywords`: AI-suggested keywords for optimization
- `impact_nudges`: Actionable suggestions for veterans
- `impact_funnel`: Aggregated funnel metrics
- `impact_supporter_stats`: Supporter performance metrics

## Setup Instructions

### 1. Enable Feature Flag
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_FEATURE_IMPACT=true
```

### 2. Database Migration
The impact analytics tables and views are already created. Verify with:
```bash
node scripts/check-impact-tables.js
```

### 3. Access the Feature
1. Sign in as a veteran
2. Navigate to `/dashboard/veteran`
3. Click "Impact Analytics" in the navigation tabs
4. Or click "View Detailed Impact Analytics" in the quick actions

## Features

### Real-time Analytics
- Track pitch views, likes, shares, endorsements
- Monitor conversion rates through the funnel
- View supporter engagement metrics

### AI-Powered Insights
- Keyword suggestions for pitch optimization
- Actionable nudges based on performance
- Contact suggestions for networking

### Supporter Tracking
- Leaderboard of top-performing supporters
- Individual supporter impact metrics
- Value generated tracking

### Performance Optimization
- Channel performance analysis
- Conversion funnel optimization
- Engagement rate tracking

## Usage

### For Veterans
1. **View Analytics**: Access detailed metrics about pitch performance
2. **Optimize Pitch**: Use AI-suggested keywords to improve visibility
3. **Engage Supporters**: Follow up with top-performing supporters
4. **Track Progress**: Monitor conversion rates and outcomes

### For Supporters
1. **Track Impact**: See how their referrals are performing
2. **Engage Further**: Make calls and record outcomes
3. **Generate Value**: Help veterans achieve successful outcomes

## Technical Implementation

### Server Actions
- `getImpactKpis()`: Fetch key performance indicators
- `getFunnel()`: Get conversion funnel data
- `getChannelPerformance()`: Channel-specific metrics
- `getSupporterImpact()`: Supporter leaderboard data
- `getKeywordSuggestions()`: AI keyword recommendations
- `getNudges()`: Actionable suggestions

### Security
- Row Level Security (RLS) enabled on all impact tables
- Users can only access data for their own pitches
- Proper authentication and authorization

## Next Steps

1. **Test the Feature**: Navigate to the impact analytics page
2. **Add Sample Data**: Create test referrals and outcomes
3. **Monitor Performance**: Track real user engagement
4. **Iterate**: Use feedback to improve the analytics

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database tables exist
3. Ensure feature flag is enabled
4. Check user permissions and RLS policies

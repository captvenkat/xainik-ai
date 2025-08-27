# Magic Mode - Xainik AI-Powered Pitch Creation

## Overview

Magic Mode is an AI-powered, mobile-first pitch creation system that transforms how veterans create and share their professional stories. It provides a zero-typing, minimal-friction experience that leverages AI to generate compelling pitches and daily story suggestions.

## Key Features

### 🎯 AI-Powered Pitch Generation
- **Auto-Pitch**: Generates title (≤80 chars) and summary (≤300 chars) from resume and objective
- **Objective Suggestions**: AI suggests 6-8 career objectives based on resume content
- **Story Suggestions**: Daily AI-generated story ideas with outlines and angles
- **Content Expansion**: Expands story outlines into full markdown content (120-180 words)

### 📱 Mobile-First Design
- **Single Column Layout**: `max-w-[480px] mx-auto px-4`
- **Large Touch Targets**: All interactive elements ≥44px
- **Bottom Navigation**: Fixed navigation for veteran dashboard
- **App-Like Experience**: Smooth transitions and intuitive flow

### 📚 Story Management
- **Daily Publishing**: 1 story per day per pitch with automatic queuing
- **Public Stories**: SEO-friendly story pages with analytics
- **Story Cards**: Beautiful presentation in pitch pages
- **Share Integration**: WhatsApp, LinkedIn, Twitter with auto-UTM

### 🔒 Security & Privacy
- **Private Resumes**: Resume files remain in private storage
- **PII Protection**: AI prompts strip sensitive information
- **Row-Level Security**: Database policies mirror existing pitch security
- **Feature Flags**: Controlled rollout with environment variables

## Architecture

### Database Schema

```sql
-- Stories table
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  summary text NOT NULL,
  body_md text NOT NULL,
  source_spans jsonb,
  status text NOT NULL CHECK (status IN ('draft','queued','published')) DEFAULT 'draft',
  scheduled_for date,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pitch extensions
ALTER TABLE public.pitches 
ADD COLUMN IF NOT EXISTS objective text,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';

-- Analytics extensions
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS story_id uuid REFERENCES public.stories(id) ON DELETE SET NULL;

-- Resume request enhancements
ALTER TABLE public.resume_requests 
ADD COLUMN IF NOT EXISTS reason text;
```

### API Endpoints

#### AI Endpoints (`/api/xainik/ai/`)
- `POST /suggest-objectives` - Generate career objectives from resume
- `POST /auto-pitch` - Generate pitch title and summary
- `POST /suggest-stories` - Generate story ideas with outlines
- `POST /expand-story` - Expand outline into full story content

#### Story Management (`/api/xainik/stories/`)
- `POST /` - Create story draft
- `GET /[pitchId]` - List stories for pitch
- `POST /[id]/publish` - Publish or queue story

### Components

#### Core Components
- `MagicPitchWizard` - Multi-step pitch creation flow
- `ObjectivePicker` - Career objective selection with chips
- `AutoPitch` - AI-generated pitch display and approval
- `StorySuggestions` - Daily story idea cards
- `StoryModal` - Story preview and editing

#### Layout Components
- `AppContainer` - Mobile-first layout wrapper
- `BottomNav` - Fixed bottom navigation for dashboard
- `ChipGroup` - Reusable chip selection component

## User Flow

### 1. Magic Mode Pitch Creation
```
Resume Upload → Objective Picker → Preferences → Auto Pitch → Complete
```

1. **Resume Upload**: User uploads resume (extracted text stored privately)
2. **Objective Picker**: AI suggests 6-8 career objectives, user selects one
3. **Preferences**: User selects job type, industry, seniority preferences
4. **Auto Pitch**: AI generates title and summary, user can approve/regenerate/edit
5. **Complete**: Pitch is created and user is redirected to dashboard

### 2. Daily Story Management
```
Story Suggestions → Select Story → Expand Content → Preview → Publish/Queue
```

1. **Story Suggestions**: AI generates 3 story ideas daily
2. **Select Story**: User chooses a story to develop
3. **Expand Content**: AI expands outline into full story
4. **Preview**: User reviews story in modal
5. **Publish**: Story is published immediately or queued for next day

### 3. Public Story Experience
```
Story Discovery → Read Story → Share → Analytics Tracking
```

1. **Discovery**: Stories appear in "More About Me" section of pitch pages
2. **Reading**: Full story pages with rich formatting
3. **Sharing**: Social media integration with auto-UTM
4. **Analytics**: View and share tracking with attribution

## AI Implementation

### Model Configuration
- **Model**: `gpt-4o-mini` for all AI operations
- **Temperature**: 0.4 for pitch generation, 0.6 for stories
- **Timeout**: 12 seconds with single retry
- **Input Truncation**: 8000 characters for resume text

### Prompt Engineering
- **Objective Suggestions**: Focus on common veteran transitions
- **Auto Pitch**: Recruiter-friendly, outcome-focused language
- **Story Suggestions**: Diverse angles with clear outlines
- **Content Expansion**: Problem → Action → Outcome structure

### Regeneration Logic
- **Diversity**: Avoid prior outputs in regeneration
- **Caching**: Last 3 generations cached for 10 minutes
- **Fallbacks**: Friendly error messages with retry options

## Analytics & Tracking

### Event Types
- `story_view` - Story page views
- `story_share` - Social media shares
- `cta_click` - Call-to-action clicks

### Attribution
- `pitch_id` - Links events to specific pitches
- `story_id` - Links events to specific stories
- `referrer` - Tracks traffic sources
- `utm` - Campaign parameter tracking

## Feature Flags

### Environment Variables
```bash
NEXT_PUBLIC_FEATURE_MAGIC_MODE=true
NEXT_PUBLIC_FEATURE_FOUNDING50=true
```

### Usage in Code
```typescript
const MAGIC = process.env.NEXT_PUBLIC_FEATURE_MAGIC_MODE === 'true';
```

## Deployment

### Prerequisites
1. Supabase project with existing pitches table
2. OpenAI API key configured
3. Vercel deployment environment

### Steps
1. **Database Migration**: Run `migrations/2025-08-26_magic_mode.sql`
2. **Environment Setup**: Configure feature flags
3. **Deploy**: `npx vercel --prod`
4. **Verify**: Test Magic Mode flow end-to-end

### Verification Checklist
- [ ] Magic vs Classic toggle appears on `/pitch/new`
- [ ] Magic Mode flow creates pitches successfully
- [ ] Story suggestions generate in dashboard
- [ ] Stories publish and appear on public pages
- [ ] Analytics events fire correctly
- [ ] Mobile experience is smooth

## Performance Considerations

### Optimization
- **Lazy Loading**: Story content loads on demand
- **Caching**: AI responses cached to reduce API calls
- **Image Optimization**: Resume files processed efficiently
- **Bundle Splitting**: Magic Mode components loaded separately

### Monitoring
- **AI API Latency**: Track response times
- **Error Rates**: Monitor AI generation failures
- **User Engagement**: Story view and share metrics
- **Mobile Performance**: Lighthouse scores

## Future Enhancements

### Planned Features
- **Story Templates**: Pre-built story structures
- **Collaborative Editing**: Supporter feedback on stories
- **Advanced Analytics**: Story performance insights
- **A/B Testing**: Story format optimization

### Technical Improvements
- **Streaming Responses**: Real-time AI generation
- **Offline Support**: Draft saving without internet
- **Voice Input**: Speech-to-text for story creation
- **Multi-language**: International story support

## Support & Troubleshooting

### Common Issues
1. **AI Generation Fails**: Check OpenAI API key and quota
2. **Stories Not Publishing**: Verify 1/day limit and queue status
3. **Mobile Layout Issues**: Ensure AppContainer wrapper is used
4. **Analytics Not Tracking**: Check /api/track-event endpoint

### Debug Mode
Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG_MAGIC_MODE=true
```

## Contributing

### Development Guidelines
- **Append-Only**: Never modify existing files
- **Mobile-First**: All new components use mobile-first design
- **Feature Flags**: All new features are feature-flagged
- **Type Safety**: Use TypeScript interfaces from `@/types/xainik`

### Testing
- **Unit Tests**: AI API endpoints and utilities
- **Integration Tests**: Story publishing flow
- **E2E Tests**: Complete Magic Mode user journey
- **Mobile Tests**: Touch interactions and responsive design

export type PitchId = string;
export type StoryId = string;

export interface StoryCandidate {
  title: string;         // <= 60
  angle: string;         // one sentence
  outline: string[];     // 3–5 bullets
  coverage_facets: string[];  // facet keys from resume
  source_spans: { start: number; end: number }[];
}

export interface StoryPublic {
  id: StoryId;
  pitch_id: PitchId;
  title: string;
  slug: string;
  summary: string;
  body_md: string;
  published_at?: string;
}

export interface AnalyticsEvent {
  event_type: 'view' | 'share' | 'cta_click';
  pitch_id: PitchId;
  story_id?: StoryId;
  referrer?: string;
  utm?: Record<string, string>;
}

export interface AutoPitchInput {
  objective: string;
  extracted_text: string;
}

export interface AutoPitchOutput {
  title: string;   // <= 80
  summary: string; // <= 300
}

export interface StoryPreferences {
  jobType?: string[];
  role?: string[];
  industry?: string[];
  seniority?: string[];
  location?: string[];
  availability?: string[];
}

export interface StoryDraft {
  pitch_id: PitchId;
  title: string;
  summary: string;
  body_md: string;
  source_spans?: { start: number; end: number }[];
}

export interface StoryPublishResult {
  success: boolean;
  status: 'published' | 'queued';
  message: string;
  published_at?: string;
  scheduled_for?: string;
}

// AI Framework Types
export interface Target {
  type: 'industry'|'role'|'company'|'geography'|'seniority'|'function'|'team'|'domain'|'tech'|'certification';
  value: string;
}

export interface StyleSeed {
  format: 'prose'|'bullets'|'numbered';
  tone: 'direct'|'reflective';
}

export interface CorpifyBullet {
  text: string;
  metrics_present: boolean;
  used_military_term: boolean;
  competency: string;
}

export interface ResumeFacet {
  id: string;
  pitch_id: string;
  facet_key: string;
  facet_label: string;
  span_start?: number;
  span_end?: number;
  created_at: string;
}

export interface ProfileSuggestions {
  service?: {
    service_start_date?: string;
    service_end_date?: string;
    years_of_service?: number;
    is_veteran?: boolean;
    retirement_type?: string;
    discharge_reason?: string;
    confidence: 'high' | 'medium' | 'low';
  };
  contact?: {
    email?: string;
    phone?: string;
    linkedin_url?: string;
    location?: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

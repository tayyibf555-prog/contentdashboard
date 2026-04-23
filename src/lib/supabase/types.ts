export type TrackedAccount = {
  id: string;
  name: string;
  category: "leader" | "competitor" | "other";
  platforms: string[];
  handles: Record<string, string>;
  created_at: string;
};

export type ScrapedPost = {
  id: string;
  tracked_account_id: string;
  platform: string;
  title: string | null;
  content_summary: string | null;
  engagement_stats: Record<string, number>;
  url: string | null;
  scraped_at: string;
};

export type AiAnalysis = {
  id: string;
  scraped_post_id: string;
  key_insight: string | null;
  content_opportunity: string | null;
  suggested_pillar: string | null;
  trending_topics: string[];
  created_at: string;
};

export type GeneratedContent = {
  id: string;
  platform: string;
  account: "business" | "personal";
  content_type: "carousel" | "long_form" | "short" | "video_script" | "thread" | "tweet" | "reel";
  title: string;
  body: string | null;
  hashtags: string[];
  pillar: string | null;
  source_type: string | null;
  source_reference: string | null;
  best_time: string | null;
  status: "pending" | "approved" | "scheduled" | "posted" | "draft";
  is_repurposed: boolean;
  repurposed_from: string | null;
  scheduled_for: string | null;
  posted_at: string | null;
  companion_pdf_url: string | null;
  created_at: string;
};

export type Strategy = {
  id: string;
  platform: "instagram" | "linkedin" | "twitter" | "youtube";
  account: "personal" | "business" | "both";
  category: "hook" | "format" | "engagement" | "cadence" | "distribution" | "positioning";
  title: string;
  summary: string;
  when_to_use: string;
  how_to_apply: string[];
  example: string | null;
  why_it_works: string;
  sources: Array<{ title: string; url: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EngagementIdea = {
  id: string;
  account: "business" | "personal";
  source_post_ids: string[];
  topic: string;
  hook_template: string;
  format: "reel" | "carousel" | "post";
  engagement_mechanic: string;
  rationale: string;
  status: "new" | "used" | "dismissed";
  created_at: string;
};

export type CarouselSlide = {
  id: string;
  generated_content_id: string;
  slide_number: number;
  headline: string | null;
  body_text: string | null;
  slide_type: "cover" | "content" | "cta";
  image_url: string | null;
  custom_background_url: string | null;
  template_variant: "architect" | "gradient" | "minimal" | "bold" | null;
  accent_color: string | null;
  created_at: string;
};

export type YoutubeScript = {
  id: string;
  generated_content_id: string;
  hook: string | null;
  intro: string | null;
  body_sections: Array<{ title: string; content: string; start_time: string; end_time: string }>;
  cta: string | null;
  thumbnail_concepts: Array<{ label: string; description: string; image_url?: string }>;
  title_variants: Array<{ title: string; ctr_score: number }>;
  description: string | null;
  tags: string[];
  estimated_duration: string | null;
  created_at: string;
};

export type EngagementMetrics = {
  id: string;
  generated_content_id: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  recorded_at: string;
};

export type VoiceSettings = {
  id: string;
  account_type: "business" | "personal";
  writing_samples: string[];
  tone_guidelines: string | null;
  avoid_words: string[];
  preferred_words: string[];
  updated_at: string;
};

export type SocialAuthToken = {
  id: string;
  platform: string;
  account_type: "business" | "personal";
  ayrshare_profile_key: string | null;
  connected_at: string;
};

export type ReelScript = {
  id: string;
  generated_content_id: string;
  hook: string | null;
  body_script: string | null;
  cta: string | null;
  on_screen_text: string[];
  estimated_duration: string | null;
  recording_notes: string | null;
  created_at: string;
};

export type EvergreenContent = {
  id: string;
  generated_content_id: string;
  flagged_at: string;
  last_reshared_at: string | null;
  reshare_count: number;
  cooldown_days: number;
};

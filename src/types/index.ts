export type AccountType = "business" | "personal";
export type Platform = "instagram" | "linkedin" | "twitter" | "youtube";
export type ContentStatus = "pending" | "approved" | "scheduled" | "posted" | "draft";
export type ContentType = "carousel" | "long_form" | "short" | "video_script" | "thread" | "tweet" | "reel";

export type { TrackedAccount, ScrapedPost, AiAnalysis, GeneratedContent, CarouselSlide, YoutubeScript, ReelScript, EngagementMetrics, SocialAuthToken, VoiceSettings, EvergreenContent } from "@/lib/supabase/types";

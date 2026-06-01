# YouTube Video Ideas — Design

**Date:** 2026-06-01
**Status:** Approved design

## Summary

Add a YouTube "Ideas" tab for the personal account that mirrors the Instagram
Ideas feature but is tailored to YouTube long-form video. It surfaces the
top-performing videos from tracked YouTube channels and, for each, generates a
recreate-able video title, a brief overview of the source video, and how to
recreate it — themed toward content that brings in clients for an AI agency
(founder takes on AI, personal AI stories, lead-gen angles).

## Decisions

- **Separate `video_ideas` table** (not reusing `engagement_ideas`).
- **Long-form only** — scrape the channel `/videos` tab (Shorts live under
  `/shorts`), plus a code-side duration filter (> 60s) as a safety net.
- **Pull depth:** top 25 videos per channel, sorted by popularity (views).
- Same actor as today: `streamers~youtube-scraper` — optimize its input, no new
  connector.
- Personal account only (YouTube is personal-only in this app).

## Apify optimization (`src/lib/apify/client.ts`)

Current YouTube input pulls the 5 newest videos. Change `buildInput` for the
`youtube` case to:

```ts
{
  startUrls: [{ url: `https://www.youtube.com/@${handle.replace("@", "")}/videos` }],
  maxResults: 25,
  sortVideosBy: "POPULAR",
}
```

Extend the `youtube` case of `normalizeResult` to also capture duration so we can
filter long-form and show it:

- keep `views` (`item.viewCount`), `likes`, `comments` (`item.commentsCount`)
- add `duration` (raw string, e.g. `item.duration`) and `durationSeconds`
  (parsed from the string; `null` if unparseable) into the engagement object.

Field names confirmed against the actor's input schema (`startUrls`,
`maxResults`, `sortVideosBy: NEWEST|POPULAR|OLDEST`; output `viewCount`, `likes`,
`commentsCount`, `duration`, `date`, `title`, `url`).

## Data model

Migration `supabase/migrations/008_video_ideas.sql`:

```sql
CREATE TABLE IF NOT EXISTS video_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  source_post_ids UUID[] DEFAULT '{}',
  video_title TEXT NOT NULL,
  overview TEXT NOT NULL,
  how_to_recreate TEXT NOT NULL,
  niche TEXT,
  source_url TEXT,
  source_metric TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'used', 'dismissed')),
  saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_ideas_account ON video_ideas(account);
CREATE INDEX IF NOT EXISTS idx_video_ideas_status ON video_ideas(status);
ALTER TABLE video_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON video_ideas;
CREATE POLICY "Service role full access" ON video_ideas FOR ALL USING (true) WITH CHECK (true);
```

New `VideoIdea` type in `src/lib/supabase/types.ts` (exported via `src/types`):
`id, account, source_post_ids[], video_title, overview, how_to_recreate,
niche (string|null), source_url (string|null), source_metric (string|null),
status, saved, created_at`.

## Claude generation (`src/lib/claude/ideas.ts`)

New `generateVideoIdeas(account, videos)`:

- **Input:** `{ id, title, content, engagement, url }[]` (top long-form videos).
- **Output per video:** `{ source_post_id, video_title, overview,
  how_to_recreate, niche }`.
- **Prompt theme:** the personal account is Tayyib, founder of Azen AI. The goal
  is YouTube content that attracts business-owner clients who need AI. Bias the
  ideas toward: founder takes on AI, personal AI stories, practical AI for
  businesses, and lead-gen angles. For each source video:
  - `video_title`: a compelling title the user could use for their OWN video on
    the same idea (their voice, client-attracting) — not a copy of the original.
  - `overview`: 1-2 sentences on what the source video covers.
  - `how_to_recreate`: a short, practical note on how to make their own version
    (the angle/approach, not a full script).
  - `niche`: which lane it fits — e.g. "Founder takes on AI", "Personal story",
    "Client acquisition", "AI use-cases".
- One idea per video; reuse `generateWithClaude` + `extractJSON`.

## Generation helper (`src/lib/ideas/generate.ts`)

New `generateAndStoreVideoIdeas(account)` (sibling to the IG helper):

1. Pull `scraped_posts` where `platform = 'youtube'` (limit 500, newest first).
2. Long-form filter: keep videos with `durationSeconds == null || > 60`.
3. Rank by views (fallback likes + comments). Take top 15 candidates.
4. Dedup against existing `video_ideas.source_post_ids` for the account.
5. Generate for up to 8 new videos; attach `source_url` + `source_metric`
   (formatted views/likes/comments) from the scraped row.
6. Insert into `video_ideas` with `status: 'new'`.

Shared formatting helpers (`fmtNum`, `formatMetric`) are reused/extracted.

## API (`src/app/api/video-ideas/route.ts`)

- `POST { account }` → `generateAndStoreVideoIdeas(account)` (manual "Refresh").
- `PATCH { id, status?, saved? }` → update `video_ideas` (mirrors `/api/ideas`).

## Auto-trigger

In both scrape routes, after the existing Instagram idea call, also refresh
YouTube ideas (best-effort, never fails the scrape):

- `src/app/api/cron/scrape/route.ts` — after the loop.
- `src/app/api/scrape/route.ts` — when `platform === "youtube"`.

## UI

The YouTube page has no tabs today. Add a tab shell mirroring Instagram:

- `src/app/youtube/youtube-page-client.tsx` (new) — tabs **Scripts | Ideas**
  (Ideas personal-only), with `?tab=` URL sync like `instagram-page-client`.
  Scripts renders the existing `YouTubeEditor`; Ideas renders the new tab.
- `src/app/youtube/page.tsx` — also fetch `video_ideas` for the account and pass
  posts + ideas into the client.
- `src/components/youtube/youtube-ideas-tab.tsx` (new) — mirrors
  `ideas-tab.tsx`: new/saved/used/dismissed/all filters, "Refresh ideas" button
  (POST `/api/video-ideas`), star toggle, mark used/dismiss. Card shows: niche
  badge + performance badge, `video_title` as title, `overview`,
  `how_to_recreate`, and "View original video →" (`source_url`).

## Files touched

- `supabase/migrations/008_video_ideas.sql` (new)
- `src/lib/supabase/types.ts` (VideoIdea type) + `src/types` re-export
- `src/lib/apify/client.ts` (input + normalizer)
- `src/lib/claude/ideas.ts` (generateVideoIdeas)
- `src/lib/ideas/generate.ts` (generateAndStoreVideoIdeas)
- `src/app/api/video-ideas/route.ts` (new)
- `src/app/api/cron/scrape/route.ts`, `src/app/api/scrape/route.ts` (trigger)
- `src/app/youtube/page.tsx`, `src/app/youtube/youtube-page-client.tsx` (new)
- `src/components/youtube/youtube-ideas-tab.tsx` (new)

## Out of scope

- Shorts as idea sources.
- Turning ideas into full scripts (the existing script generator already does
  that separately).
- Business-account YouTube (not configured).

# Instagram Ideas Tab — Overhaul Design

**Date:** 2026-06-01
**Status:** Approved design (pre-implementation)

## Summary

The personal Instagram account already has an "Ideas" tab. Today it generates
"engagement mechanic" templates from the 30 *most recent* scraped posts, on a
manual button press. This overhaul reshapes it into an automatic idea feed:
when a competitor scrape finishes, it surfaces the **top-performing competitor
reels**, distills the **core idea** behind each, links to the **original reel**,
and offers **2–3 short, casual ways to frame the idea**.

This is an in-place overhaul of the existing tab — not a new tab.

## Locked decisions

- **Overhaul** the existing personal-account Ideas tab in place.
- **Source signal:** top reels ranked by raw views (fallback: likes + comments)
  across *all* competitors. **Reels only.**
- **Trigger:** auto-generate after every scrape (scheduled cron + manual scrape).
  Also keep a manual "Refresh ideas" button on the tab.
- **Per idea output:** the core idea distilled from the reel (not a script) +
  a link to the original reel + 2–3 short casual angle framings + a performance
  badge proving it performed.
- **Dedup:** never produce a second idea from a reel that already generated one.
- Clear existing (obsolete) `engagement_ideas` rows during migration.

## Data model

New migration `supabase/migrations/006_ideas_overhaul.sql`.

Reshape `engagement_ideas`:

- **Drop columns:** `hook_template`, `engagement_mechanic`, `format`, `rationale`.
- **Add columns:**
  - `idea TEXT NOT NULL` — the core concept distilled from the reel.
  - `framings TEXT[] DEFAULT '{}'` — the 2–3 casual angle framings.
  - `source_url TEXT` — link to the original reel.
  - `source_metric TEXT` — human-readable performance proof, e.g.
    `"1.4M views · 22k likes"`.
- **Keep:** `id`, `account`, `status` (`new`/`used`/`dismissed`), `created_at`,
  `source_post_ids` (UUID[], used for dedup), `topic`.
- **Clear obsolete data:** `DELETE FROM engagement_ideas;` before/within the
  reshape so the feed starts clean.

Keep existing indexes on `account` and `status`; keep the service-role RLS policy.

Update `EngagementIdea` type in `src/lib/supabase/types.ts` to match:

```ts
export type EngagementIdea = {
  id: string;
  account: "business" | "personal";
  source_post_ids: string[];
  topic: string;
  idea: string;
  framings: string[];
  source_url: string | null;
  source_metric: string | null;
  status: "new" | "used" | "dismissed";
  created_at: string;
};
```

## Selection logic

Lives in a shared helper (see Wiring). Steps:

1. Pull `scraped_posts` where `platform = 'instagram'` and the reel type
   (`engagement_stats.postType === 'reel'`). Filtering on the JSONB `postType`
   is done in code after fetch (robust against missing keys), or via a JSONB
   filter if reliable.
2. Rank candidates by `engagement_stats.views` descending; when views are
   missing/zero, fall back to `likes + comments`. Take the top ~15.
3. **Dedup:** load `source_post_ids` from all existing `engagement_ideas` for
   the account into a Set; drop any candidate reel whose id is already present.
4. Generate ideas only for the *new* top reels, capped at ~8 per run to control
   AI cost. If no new reels remain, no-op.
5. `source_url` and `source_metric` are taken from the scraped row in code (not
   from Claude) so the link and stats are always accurate. `source_metric` is
   formatted from `engagement_stats` (e.g. views + likes).

## Claude generation

Rework the function in `src/lib/claude/ideas.ts` (replacing
`generateEngagementIdeas`'s output shape; `generateRecreationPlan` is untouched).

- **Input:** account + array of top reels `{ id, title, content, engagement, url }`.
- **Output:** one idea per reel — `{ source_post_id, topic, idea, framings[] }`.
- **Prompt rules:**
  - Distill the *core idea / concept* behind the reel — what made it work as a
    content idea. **Not a script, not a hook line, not a caption.**
  - `topic`: 3–8 word label of what it's about.
  - `idea`: 1–2 sentences describing the reusable idea.
  - `framings`: exactly 2–3 entries. Each is a short, casual angle on the same
    idea — written like a quick note to self (e.g. "as a mistake you made",
    "as a contrarian take", "as a step-by-step you wish you'd known"). Casual
    tone, not polished copy.
- Uses the existing `generateWithClaude` + `extractJSON` helpers and the
  account voice context already in the file.

## Auto-trigger wiring

New shared helper, e.g. `src/lib/ideas/generate.ts`, exporting
`generateAndStoreIdeas(account: "personal" | "business")`. It runs the selection
logic, calls Claude, and inserts new rows with `status: "new"`,
`source_post_ids`, `source_url`, `source_metric`.

Because the Ideas tab is personal-only, auto-triggers target `"personal"`.

Called (wrapped in try/catch so a failure never breaks the scrape) from:

- `src/app/api/cron/scrape/route.ts` — **once**, after the full scrape loop
  completes.
- `src/app/api/scrape/route.ts` — after a manual scrape succeeds, **only if**
  `platform === "instagram"`.

`src/app/api/ideas/route.ts`:

- `POST` is simplified to delegate to `generateAndStoreIdeas(account)` (used by
  the manual "Refresh ideas" button).
- `PATCH` (status updates) is unchanged.

Note: these routes make an AI call inside the request; ensure `maxDuration` is
sufficient (existing `maxDuration = 60` is adequate; Vercel default ceiling is
higher if needed).

## UI / output

`src/components/instagram/ideas-tab.tsx`:

- **Keep** the new/used/dismissed/all filter buttons and the mark-used/dismiss
  actions.
- **Keep** a manual button, relabeled "Refresh ideas", calling `POST /api/ideas`.
- Empty state copy → "Ideas appear automatically after the next competitor
  scrape." (Refresh button still available.)
- **IdeaCard** renders:
  - performance badge — `source_metric` (e.g. `1.4M views`)
  - `topic` as the card title
  - `idea` text
  - `framings` as a short list (2–3 items)
  - a "View original reel →" link to `source_url` (opens in a new tab)
  - status label + mark-used/dismiss buttons on `new` ideas (unchanged behavior)

## Files touched

- `supabase/migrations/006_ideas_overhaul.sql` (new)
- `src/lib/supabase/types.ts` (EngagementIdea type)
- `src/lib/claude/ideas.ts` (rework generation function)
- `src/lib/ideas/generate.ts` (new shared helper)
- `src/app/api/ideas/route.ts` (POST delegates to helper)
- `src/app/api/cron/scrape/route.ts` (call helper after loop)
- `src/app/api/scrape/route.ts` (call helper after IG scrape)
- `src/components/instagram/ideas-tab.tsx` (card + button + empty state)

## Out of scope

- Outlier/engagement-rate scoring (chose raw views/engagement overall).
- Carousels / non-reel post types as idea sources.
- Business-account auto-generation surfacing (tab is personal-only).
- Any change to `generateRecreationPlan` or the Recreate/Recreated tabs.

# Save (Bookmark) Ideas — Design

**Date:** 2026-06-01
**Status:** Approved design

## Summary

Let the user bookmark/favorite ideas in the personal Instagram Ideas tab and
filter to just their saved shortlist. Bookmarking is independent of the
existing `new`/`used`/`dismissed` lifecycle.

## Decisions

- **Separate `saved` boolean**, not a new status value. An idea can be saved
  AND used/dismissed at the same time.
- **Saved persists** regardless of status — dismissing or marking used does NOT
  clear the star. The Saved filter is a true keep-for-later list.

## Data model

Migration `supabase/migrations/007_save_ideas.sql`:

```sql
ALTER TABLE engagement_ideas
  ADD COLUMN IF NOT EXISTS saved BOOLEAN NOT NULL DEFAULT false;
```

`EngagementIdea` type in `src/lib/supabase/types.ts` gains `saved: boolean`.

## API

`src/app/api/ideas/route.ts` `PATCH` currently accepts `{ id, status }`. Extend
to also accept an optional `saved` boolean: `{ id, status?, saved? }`. Build the
update object from whichever fields are present so the one endpoint handles both
status changes and bookmark toggles.

## UI

`src/components/instagram/ideas-tab.tsx`:

- **Filter row:** add a `saved` option to the existing
  `new`/`used`/`dismissed`/`all` buttons. The `saved` filter shows ideas where
  `saved === true` (across all statuses). Count reflects saved ideas.
- **IdeaCard:** a star toggle (★ when saved, ☆ when not) in the top-right header,
  shown on every card regardless of status. Clicking it calls
  `PATCH /api/ideas { id, saved: !idea.saved }` then refreshes.
- Mark-used/dismiss buttons are unchanged; they no longer hide saved ideas from
  the Saved filter.

## Files touched

- `supabase/migrations/007_save_ideas.sql` (new)
- `src/lib/supabase/types.ts`
- `src/app/api/ideas/route.ts`
- `src/components/instagram/ideas-tab.tsx`

## Out of scope

- Sending ideas to the content pipeline (a separate feature).
- Editing idea text/framings.

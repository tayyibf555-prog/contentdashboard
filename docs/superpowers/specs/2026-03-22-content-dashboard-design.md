# Azen Content Dashboard — Design Spec

## Overview

A content dashboard for Azen (@azen_ai) and personal brand (@tayyib.ai) that researches AI industry leaders and competitors, generates ready-to-post content across Instagram, LinkedIn, and YouTube, and provides a semi-automated approval workflow. Content is delivered daily by 9 AM (Europe/London timezone), with YouTube content ready by 9 AM on Sundays.

## Business Context

- **Business**: Azen — AI agency helping businesses implement custom AI solutions with a strategy-first approach (Audit, Educate, Deploy)
- **Personal**: @tayyib.ai — Casual, behind-the-scenes, broader AI and entrepreneurship topics
- **Goals**: Lead generation, authority building, market education
- **Website**: azen.io
- **Tagline**: "The Future Made Simple."

## Architecture

### Approach: Next.js + External Services (Approach C)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend & API | Next.js (App Router) | Dashboard UI + API routes |
| Hosting | Vercel (Pro) | Deployment + Cron Jobs |
| Scraping | Apify | Social media data extraction |
| Content Generation | Claude API (Anthropic) | AI-powered content creation |
| Database | Supabase | Data storage + auth + file storage |
| Scheduling | Vercel Cron | Daily 9 AM content generation trigger |
| Notifications | Resend | Email notifications for daily content |
| Social Media Posting | Ayrshare | Unified API for posting to IG, LI, YT with OAuth and scheduling |
| Carousel Image Generation | Satori + @resvg/resvg-js | Renders carousel slides as HTML/CSS to PNG images server-side |
| Carousel Image Storage | Supabase Storage | Stores generated carousel slide PNGs |

### Why This Approach

- Apify has purpose-built, maintained scrapers for Instagram, LinkedIn, YouTube, and Twitter/X that handle rate limits and platform changes
- Claude API produces the most natural, human-sounding content — critical for both professional and personal brand voices
- Each service specializes in one thing, so failures are isolated
- Proper image formatting, character limits, and carousel formatting handled by dedicated services

## Brand Identity

### Business (@azen_ai / Azen AI)

- **Background**: Dark navy/black (#0a0e1a)
- **Card/Panel backgrounds**: Dark navy (#0d1220)
- **Borders**: Dark blue (#1a2340)
- **Accent color**: Teal (#00d4aa)
- **Text**: White (#fff) for headings, muted blue-grey (#8892b0) for secondary
- **Logo**: "azen" in lowercase, clean sans-serif
- **Tone**: Professional, strategy-focused, client-facing
- **No emojis** — clean text formatting throughout

### Personal (@tayyib.ai)

- **Same color theme** as business for brand consistency
- **Tone**: Casual, behind-the-scenes, entrepreneurship-focused, broader AI topics
- **No emojis** — clean text formatting throughout

## Content Pillars

### Business (@azen_ai) — 5 Pillars

1. **AI Education** — Explain AI concepts simply, show what's possible, demystify the tech for business owners
2. **Case Studies & Results** — Client wins, before/after, ROI breakdowns (anonymized if needed)
3. **Industry Trends** — What leaders are saying, new tools, market shifts
4. **Strategy & Process** — The strategy-first approach, why AI projects fail, audit frameworks
5. **CTA / Lead Gen** — Direct offers, free audits, "book a call" posts, social proof

### Personal (@tayyib.ai) — 5 Pillars

1. **Behind the Scenes** — Day in the life, building the agency, honest takes on entrepreneurship
2. **Hot Takes & Opinions** — Controversial AI opinions, reacting to thought leaders
3. **Tips & Tools** — Quick AI tools, prompts, workflows for the audience
4. **Journey & Lessons** — Personal growth, mistakes, lessons learned building Azen
5. **Curated Insights** — Repackaging best ideas from tracked leaders with personal spin

## Posting Schedule

| Platform | Account | Frequency | Optimal Time |
|----------|---------|-----------|-------------|
| Instagram | @azen_ai | Daily | 12:00-1:00 PM |
| Instagram | @tayyib.ai | Daily | 5:00-6:00 PM |
| LinkedIn | Azen AI | Daily | 9:00 AM |
| LinkedIn | @tayyib.ai | Daily | 8:00-8:30 AM |
| YouTube | @tayyib.ai | Weekly (Sunday) | 2:00 PM |

**Total**: 28 posts per week + 1 YouTube video = 29 pieces of content

Content is generated and ready for approval by 9 AM daily (Europe/London). YouTube content is ready by 9 AM on Sundays.

## Pages & Features

### 1. Dashboard (Home)

The main overview page shown on login.

**Components:**
- Greeting bar with date and pending approval count
- Last scraped timestamp + manual "Refresh Research" button
- Stats row: Pending Approval, Posted This Week, Trending Topics, Today's Content Pillar
- Engagement tracker: Weekly likes, comments, shares with % change vs last week, best performing post
- Content queue: Today's posts listed with platform badge, title, account, pillar tag, research source, best time to post
- Each queue item has: Approve, Edit, and Regenerate buttons
- Business/Personal toggle in the sidebar

**Queue item details (visible on each row):**
- Platform badge (IG pink #E1306C, LI blue #0A66C2, YT red #FF0000)
- Post title and format (carousel, long-form, short, video script)
- Account (@azen_ai or @tayyib.ai)
- Content pillar badge (color-coded)
- Research source tag ("Inspired by @liamottley", "Trending topic", "Original content")
- Best time to post
- Approve / Edit / Regenerate (↻) buttons

**Expandable preview:** Click any queue item to see full caption, hashtags, and carousel slide preview inline without navigating away.

### 2. Research Feed

The intelligence engine that powers content generation.

**Components:**
- Scrape status bar + manual "Scrape Now" button
- Filter tabs: by person (@liamottley, @nateherk, etc.) and by platform (IG, LI, YT, Twitter/X)
- Trending Topics bar: Auto-detected trending themes across all tracked accounts
- Feed items showing scraped posts with:
  - Source account avatar, name, platform, timestamp
  - Post title/summary
  - Engagement badges (HIGH ENGAGEMENT, TRENDING TOPIC, COMPETITOR)
  - AI Analysis section per post containing:
    - Key Insight: What makes this post notable
    - Content Opportunity: How Azen/Tayyib can create content inspired by this
    - Suggested Pillar: Which content pillar it maps to
  - Engagement stats (views, likes, comments, shares)
  - Action buttons: Generate Content From This, Save for Later, View Original
- Competitor alerts: Red-bordered cards when competitors post notable content, with competitive analysis
- Manual URL input bar: Paste any URL to analyze and extract content ideas

### 3. Instagram

Carousel builder and caption editor for both accounts.

**Components:**
- Header with post count, Drafts, Posted history, + Generate New button
- Phone mockup preview: Shows exactly how the carousel looks on Instagram
  - IG header with profile avatar and handle
  - Square aspect ratio slide content
  - IG action bar (like, comment, share)
- Slide navigator: Thumbnail strip of all slides (Cover through CTA), click to navigate
- Caption editor: Editable AI-generated caption, click to modify
- Hashtag manager: Auto-generated platform-specific hashtags with add/remove and regenerate
- Post details panel: Account, pillar, source, best time, slide count
- Approve & Schedule button + Regenerate button

**Carousel slide structure (8 slides):**
1. Cover — Bold hook headline with accent color keyword, "azen" logo, slide counter
2. Slides 2-7 — One key point per slide, clean typography, supporting text
3. Slide 8 (CTA) — Call to action: follow, save, book a call, visit link in bio

**Business carousel theme:** Dark navy background (#0a1628), teal accent (#00d4aa), white text, "azen" logo at bottom
**Personal carousel theme:** Same dark background, same color system, @tayyib.ai branding

### 4. LinkedIn

Post editor with multiple format support for both accounts.

**Components:**
- Header with post count, Drafts, Posted history, + Generate New
- Format tabs: Long-form Post, Carousel Document (PDF), Short Punchy Post
- LinkedIn post preview: Realistic LinkedIn feed mockup showing how the post appears
- Post stats prediction bar: Estimated reach, hook score (/10), read time, CTA strength
- Tone selector: Professional, Conversational, Story-driven, Controversial
- Hook variants: AI generates 3 different opening hooks each with a score, pick the best or regenerate more
- Post details: Account, format, pillar, source, best time, character count (against 3,000 limit)
- Approve & Schedule + Regenerate buttons

**No emojis in generated content.** Use line breaks and bold text for structure instead.

### 5. YouTube

Script generator and video content builder for @tayyib.ai (personal only).

**Components:**
- Header with next upload date (Sunday 2:00 PM), Past Videos, + Generate New Idea
- Format tabs: Long-form Video, YouTube Short
- Thumbnail concepts: 3 AI-generated thumbnail designs to choose from, with generate more option
- Video script: Color-coded sections with timestamps:
  - Hook (red) — First 30 seconds, attention-grabbing opener
  - Intro (teal) — Setup and context
  - Body (blue) — Main content broken into phases
  - CTA (yellow) — Natural lead to azen.io + subscribe
- Title variants: 3 options each with CTR (click-through rate) score
- Auto-generated description: Includes timestamps and link to azen.io
- Tags manager: SEO-optimized YouTube tags
- Video details: Channel, format, estimated duration, pillar, upload day, source
- Approve Script + Regenerate buttons

Every script naturally weaves in a CTA to azen.io for lead generation from personal YouTube back to the business.

### 6. Content Calendar

Weekly and monthly planning view.

**Components:**
- Week/Month/Pillar Overview tabs
- Navigation: Previous, This Week, Next
- Pillar rotation legend: Color-coded dots for each pillar
- Weekly grid (7 columns, Mon-Sun): Each day shows all scheduled posts with:
  - Platform badge and account
  - Post title
  - Status: Posted (green), Scheduled (teal), Pending Approval (orange)
  - Click to open in platform-specific editor
- Weekly pillar assignment: Each day has a designated content pillar that rotates through all pillars
- Week summary bar: Total posts, status breakdown, pillar coverage count
- Drag and drop: Reschedule posts between days

**Daily content structure:**
- 1x Business IG carousel (@azen_ai)
- 1x Business LinkedIn post (Azen AI)
- 1x Personal IG carousel (@tayyib.ai)
- 1x Personal LinkedIn post (@tayyib.ai)
- 1x YouTube video on Sundays (@tayyib.ai)

### 7. Analytics

Engagement tracking to improve content over time.

**Components:**
- Engagement metrics: Likes, comments, shares, saves across all platforms
- Week-over-week comparison with % change
- Best performing posts by platform
- Pillar performance: Which content pillars drive the most engagement
- Platform breakdown: Performance comparison across IG, LinkedIn, YouTube
- Account comparison: Business vs personal engagement trends

### 8. Tracked Accounts

Manage research sources.

**Components:**
- Account cards in 2-column grid showing:
  - Name, avatar, category (Leader/Competitor/Other)
  - Tracked platforms with active status indicators
  - Stats: Posts tracked, content generated, approval rate
  - Last scraped timestamp
  - Edit/Remove buttons
- Category tabs: All, Leaders, Competitors, Other
- Competitor cards: Red-bordered with alert count instead of content generation stats
- Add New Account card: Enter handles, select platforms, categorize

## Data Flow

### Daily Content Generation (9 AM Cron)

1. **Scrape**: Vercel Cron triggers Apify scrapers for all tracked accounts at ~7 AM
2. **Analyze**: Scraped data sent to Claude API for trend analysis and content opportunity extraction
3. **Generate**: Claude generates content for each platform/account based on:
   - Today's content pillar assignment
   - Research insights from scraped data
   - Posting schedule and optimal times
   - Account-specific tone (professional vs casual)
4. **Store**: Generated content (text + carousel layouts) saved to Supabase
5. **Notify**: Email notification sent via Resend at 9 AM with summary
6. **Review**: User opens dashboard, reviews queue, approves/edits/regenerates
7. **Post**: Approved content is posted at the scheduled optimal time via Ayrshare API

### Manual Content Generation

- "Generate Content From This" on any Research Feed item
- "+ Generate New" on any platform page
- Manual URL paste and analyze in Research Feed

## Database Schema (Supabase)

### Core Tables

- **tracked_accounts**: id, name, category (leader/competitor/other), platforms (jsonb), handles (jsonb), created_at
- **scraped_posts**: id, tracked_account_id, platform, title, content_summary, engagement_stats (jsonb), url, scraped_at
- **ai_analysis**: id, scraped_post_id, key_insight, content_opportunity, suggested_pillar, trending_topics (text[])
- **generated_content**: id, platform, account (business/personal), content_type (carousel/long_form/short/video_script), title, body, hashtags (text[]), pillar, source_type, source_reference, best_time, status (pending/approved/scheduled/posted), scheduled_for, posted_at
- **carousel_slides**: id, generated_content_id, slide_number, headline, body_text, slide_type (cover/content/cta), image_url
- **youtube_scripts**: id, generated_content_id, hook, intro, body_sections (jsonb), cta, thumbnail_concepts (jsonb), title_variants (jsonb), description, tags (text[]), estimated_duration
- **engagement_metrics**: id, generated_content_id, platform, likes, comments, shares, saves, views, recorded_at
- **social_auth_tokens**: id, platform, account_type (business/personal), ayrshare_profile_key, connected_at

## Posting Workflow

1. Content appears in dashboard queue with "Pending Approval" status
2. User can:
   - **Approve**: Content moves to "Scheduled" at optimal time
   - **Edit**: Opens content in platform-specific editor, then approve
   - **Regenerate**: Claude creates a completely new version of the same topic
3. At scheduled time, content is posted via Ayrshare API (a unified social media posting API that handles Instagram, LinkedIn, and YouTube through a single integration with OAuth token management)
4. After posting, status changes to "Posted" and engagement tracking begins via periodic Ayrshare analytics API calls

This is a semi-automated system — nothing is posted without human approval.

## Carousel & Thumbnail Image Generation

### Carousel Slides

Carousel slide images are generated server-side using **Satori** (converts JSX/HTML to SVG) + **@resvg/resvg-js** (converts SVG to PNG). This runs in Next.js API routes.

**Process:**
1. Claude generates the text content for each slide (headline, body, slide type)
2. A Next.js API route renders each slide using predefined React/JSX templates matching the Azen brand
3. Satori converts the JSX to SVG, resvg converts SVG to 1080x1080 PNG
4. PNGs are uploaded to Supabase Storage
5. The dashboard displays these images in the carousel preview

**Templates:** Pre-built JSX templates for Cover, Content, and CTA slide types using the Azen color scheme (dark navy, teal accents, white text).

### YouTube Thumbnails

Thumbnail concepts are generated as **text descriptions + rendered mockups** using the same Satori pipeline. These are conceptual layouts (text placement, color scheme, composition) — not photo-realistic images. The user uses these as guidance when creating the final thumbnail in Canva or similar tools, or can use the rendered mockup directly if it's sufficient.

## External Service Dependencies

| Service | Purpose | Key Consideration |
|---------|---------|-------------------|
| Apify | Social media scraping | Purpose-built scrapers for IG, LI, YT, Twitter/X; handles rate limits and platform changes |
| Claude API | Content generation + analysis | Best natural language quality for social content; handles tone switching between accounts |
| Ayrshare | Social media posting | Unified API for posting to Instagram, LinkedIn, YouTube; handles OAuth, scheduling, and format requirements |
| Supabase | Database + auth + storage | Postgres database, file storage for carousel images, authentication |
| Satori + resvg | Image generation | Server-side rendering of carousel slides and thumbnail mockups from JSX to PNG |
| Vercel | Hosting + cron | Pro plan needed for longer function timeouts on scraping/generation |
| Resend | Email notifications | Daily 9 AM content ready notification |

## Non-Functional Requirements

- **Timezone**: All times in Europe/London (GMT/BST)
- **Theme**: Dark theme matching Azen brand (dark navy, teal accents)
- **No emojis**: All generated content uses clean text formatting
- **Responsive**: Dashboard should work on desktop (primary) and tablet
- **Authentication**: Single-user (Tayyib), Supabase Auth with email/password

# Azen Content Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a content dashboard that scrapes AI industry leaders, generates social media content via Claude API, and provides semi-automated posting across Instagram, LinkedIn, Twitter/X, and YouTube.

**Architecture:** Next.js App Router on Vercel Pro with external services — Apify for scraping, Claude API for content generation, Ayrshare for posting, Supabase for database/auth/storage, Satori for carousel image generation, Resend for notifications.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Storage), Claude API (Anthropic SDK), Apify Client, Ayrshare API, Satori, @resvg/resvg-js, Resend, Vercel Cron

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar navigation
│   ├── page.tsx                      # Dashboard (home) page
│   ├── globals.css                   # Global styles + Tailwind config
│   ├── research/
│   │   └── page.tsx                  # Research feed page
│   ├── instagram/
│   │   └── page.tsx                  # Instagram carousel builder
│   ├── linkedin/
│   │   └── page.tsx                  # LinkedIn post editor
│   ├── twitter/
│   │   └── page.tsx                  # Twitter/X post editor
│   ├── youtube/
│   │   └── page.tsx                  # YouTube script builder
│   ├── calendar/
│   │   └── page.tsx                  # Content calendar
│   ├── analytics/
│   │   └── page.tsx                  # Engagement analytics
│   ├── tracked-accounts/
│   │   └── page.tsx                  # Tracked accounts manager
│   ├── settings/
│   │   └── page.tsx                  # Voice settings / tone training
│   ├── evergreen/
│   │   └── page.tsx                  # Evergreen content library
│   ├── login/
│   │   └── page.tsx                  # Login page
│   └── api/
│       ├── scrape/
│       │   └── route.ts              # Trigger Apify scrapers
│       ├── generate/
│       │   └── route.ts              # Claude content generation
│       ├── carousel/
│       │   └── route.ts              # Satori carousel image generation
│       ├── post/
│       │   └── route.ts              # Ayrshare posting
│       ├── analyze-url/
│       │   └── route.ts              # Manual URL analysis
│       ├── repurpose/
│       │   └── route.ts              # Content repurposing
│       ├── evergreen/
│       │   └── route.ts              # Evergreen content flag/unflag/list
│       └── cron/
│           └── daily/
│               └── route.ts          # Daily 9 AM cron job
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx               # Sidebar navigation
│   │   └── top-bar.tsx               # Top bar with greeting + actions
│   ├── dashboard/
│   │   ├── stats-row.tsx             # Stats cards row
│   │   ├── engagement-summary.tsx    # Weekly engagement bar
│   │   └── content-queue.tsx         # Today's content queue
│   ├── content/
│   │   ├── queue-item.tsx            # Single queue item (approve/edit/regen)
│   │   ├── caption-editor.tsx        # Editable caption textarea
│   │   ├── hashtag-manager.tsx       # Hashtag add/remove/regenerate
│   │   └── post-details.tsx          # Post metadata panel
│   ├── instagram/
│   │   ├── phone-preview.tsx         # iPhone mockup with IG post
│   │   ├── slide-navigator.tsx       # Carousel slide thumbnails
│   │   └── carousel-slide.tsx        # Single slide renderer
│   ├── linkedin/
│   │   ├── linkedin-preview.tsx      # LinkedIn feed mockup
│   │   ├── hook-variants.tsx         # Hook options with scores
│   │   └── tone-selector.tsx         # Tone toggle buttons
│   ├── twitter/
│   │   ├── tweet-preview.tsx         # Twitter/X feed mockup
│   │   └── thread-builder.tsx        # Multi-tweet thread editor
│   ├── youtube/
│   │   ├── thumbnail-concepts.tsx    # Thumbnail options
│   │   ├── script-editor.tsx         # Color-coded script sections
│   │   └── title-variants.tsx        # Title options with CTR scores
│   ├── calendar/
│   │   ├── week-view.tsx             # 7-column weekly grid
│   │   ├── month-view.tsx            # Monthly calendar
│   │   ├── calendar-cell.tsx         # Single day cell with posts
│   │   └── pillar-legend.tsx         # Pillar color legend
│   ├── research/
│   │   ├── feed-item.tsx             # Single research feed item
│   │   ├── ai-analysis.tsx           # AI analysis card
│   │   ├── trending-bar.tsx          # Trending topics bar
│   │   └── url-input.tsx             # Manual URL analyzer
│   ├── tracked-accounts/
│   │   ├── account-card.tsx          # Single tracked account card
│   │   └── add-account-modal.tsx     # Add new account form
│   ├── analytics/
│   │   ├── engagement-chart.tsx      # Engagement line chart
│   │   └── pillar-breakdown.tsx      # Pillar performance cards
│   └── ui/
│       ├── badge.tsx                 # Platform badge (IG, LI, YT, X)
│       ├── button.tsx                # Styled button component
│       ├── card.tsx                  # Styled card component
│       ├── modal.tsx                 # Modal dialog
│       └── account-toggle.tsx        # Business/Personal toggle
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase browser client
│   │   ├── server.ts                # Supabase server client
│   │   └── types.ts                 # Database type definitions
│   ├── apify/
│   │   └── client.ts                # Apify scraper triggers
│   ├── claude/
│   │   └── client.ts                # Claude API content generation
│   ├── ayrshare/
│   │   └── client.ts                # Ayrshare posting client
│   ├── carousel/
│   │   ├── generator.ts             # Satori + resvg pipeline
│   │   └── templates.tsx            # JSX slide templates (Cover, Content, CTA)
│   ├── resend/
│   │   └── client.ts                # Email notification sender
│   └── constants.ts                 # Pillars, colors, schedule config
└── types/
    └── index.ts                     # Shared TypeScript types
```

---

## Phase 1: Project Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `.env.local.example`

- [ ] **Step 1: Create Next.js project**

```bash
cd "/Users/tayyibarbab/Desktop/content dashboard"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select: Yes to all defaults with App Router, src/ directory, Tailwind CSS.

- [ ] **Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk satori @resvg/resvg-js resend @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/node
```

- [ ] **Step 3: Create environment variable template**

Create `.env.local.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Apify
APIFY_API_TOKEN=

# Ayrshare
AYRSHARE_API_KEY=

# Resend
RESEND_API_KEY=

# Cron Secret
CRON_SECRET=

# Site URL (for Vercel deployment)
NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 4: Set up Tailwind with Azen brand colors**

Update `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        azen: {
          bg: "#0a0e1a",
          card: "#0d1220",
          border: "#1a2340",
          accent: "#00d4aa",
          text: "#8892b0",
          white: "#ffffff",
        },
        platform: {
          ig: "#E1306C",
          li: "#0A66C2",
          yt: "#FF0000",
          x: "#1DA1F2",
        },
        pillar: {
          education: "#00d4aa",
          strategy: "#a29bfe",
          bts: "#ffeaa7",
          casestudy: "#fab1a0",
          hottakes: "#74b9ff",
          cta: "#ff7675",
          tips: "#55efc4",
          journey: "#fdcb6e",
          curated: "#e17055",
          trends: "#81ecec",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 5: Set up global CSS**

Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0e1a;
  color: #ffffff;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0d1220;
}
::-webkit-scrollbar-thumb {
  background: #1a2340;
  border-radius: 3px;
}
```

- [ ] **Step 6: Verify the app runs**

```bash
npm run dev
```

Expected: App starts on localhost:3000 with dark background.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: initialize Next.js project with Azen brand theme"
```

---

### Task 2: Supabase Database Setup

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/types.ts`, `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create Supabase project**

Go to supabase.com, create a new project. Copy the URL and anon key into `.env.local`.

- [ ] **Step 2: Write the database migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Tracked accounts (leaders, competitors)
CREATE TABLE tracked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('leader', 'competitor', 'other')),
  platforms JSONB NOT NULL DEFAULT '[]',
  handles JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped posts from tracked accounts
CREATE TABLE scraped_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_account_id UUID REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT,
  content_summary TEXT,
  engagement_stats JSONB DEFAULT '{}',
  url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis of scraped posts
CREATE TABLE ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_post_id UUID REFERENCES scraped_posts(id) ON DELETE CASCADE,
  key_insight TEXT,
  content_opportunity TEXT,
  suggested_pillar TEXT,
  trending_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content for all platforms
CREATE TABLE generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  content_type TEXT NOT NULL CHECK (content_type IN ('carousel', 'long_form', 'short', 'video_script', 'thread', 'tweet')),
  title TEXT NOT NULL,
  body TEXT,
  hashtags TEXT[] DEFAULT '{}',
  pillar TEXT,
  source_type TEXT,
  source_reference TEXT,
  best_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'posted', 'draft')),
  is_repurposed BOOLEAN DEFAULT FALSE,
  repurposed_from UUID REFERENCES generated_content(id),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carousel slides
CREATE TABLE carousel_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  headline TEXT,
  body_text TEXT,
  slide_type TEXT NOT NULL CHECK (slide_type IN ('cover', 'content', 'cta')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube scripts
CREATE TABLE youtube_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  hook TEXT,
  intro TEXT,
  body_sections JSONB DEFAULT '[]',
  cta TEXT,
  thumbnail_concepts JSONB DEFAULT '[]',
  title_variants JSONB DEFAULT '[]',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  estimated_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement metrics
CREATE TABLE engagement_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social auth tokens (Ayrshare)
CREATE TABLE social_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  ayrshare_profile_key TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice settings for tone training
CREATE TABLE voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  writing_samples TEXT[] DEFAULT '{}',
  tone_guidelines TEXT,
  avoid_words TEXT[] DEFAULT '{}',
  preferred_words TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evergreen content bank
CREATE TABLE evergreen_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  last_reshared_at TIMESTAMPTZ,
  reshare_count INTEGER DEFAULT 0,
  cooldown_days INTEGER DEFAULT 30
);

-- Indexes for common queries
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_generated_content_platform ON generated_content(platform);
CREATE INDEX idx_generated_content_account ON generated_content(account);
CREATE INDEX idx_generated_content_scheduled ON generated_content(scheduled_for);
CREATE INDEX idx_scraped_posts_account ON scraped_posts(tracked_account_id);
CREATE INDEX idx_scraped_posts_scraped_at ON scraped_posts(scraped_at);
```

- [ ] **Step 3: Run the migration**

In the Supabase dashboard, go to SQL Editor and paste the migration SQL. Run it.

- [ ] **Step 4: Create Supabase client utilities**

Create `src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

- [ ] **Step 5: Create TypeScript types**

Create `src/lib/supabase/types.ts`:
```ts
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
  content_type: "carousel" | "long_form" | "short" | "video_script" | "thread" | "tweet";
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

export type EvergreenContent = {
  id: string;
  generated_content_id: string;
  flagged_at: string;
  last_reshared_at: string | null;
  reshare_count: number;
  cooldown_days: number;
};
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Supabase schema, client utilities, and TypeScript types"
```

---

### Task 3: Constants and Shared Configuration

**Files:**
- Create: `src/lib/constants.ts`, `src/types/index.ts`

- [ ] **Step 1: Create constants file**

Create `src/lib/constants.ts`:
```ts
export const BUSINESS_PILLARS = [
  { key: "education", label: "AI Education", color: "#00d4aa" },
  { key: "casestudy", label: "Case Studies & Results", color: "#fab1a0" },
  { key: "trends", label: "Industry Trends", color: "#81ecec" },
  { key: "strategy", label: "Strategy & Process", color: "#a29bfe" },
  { key: "cta", label: "CTA / Lead Gen", color: "#ff7675" },
] as const;

export const PERSONAL_PILLARS = [
  { key: "bts", label: "Behind the Scenes", color: "#ffeaa7" },
  { key: "hottakes", label: "Hot Takes & Opinions", color: "#74b9ff" },
  { key: "tips", label: "Tips & Tools", color: "#55efc4" },
  { key: "journey", label: "Journey & Lessons", color: "#fdcb6e" },
  { key: "curated", label: "Curated Insights", color: "#e17055" },
] as const;

export const PLATFORMS = {
  instagram: { key: "instagram", label: "IG", color: "#E1306C" },
  linkedin: { key: "linkedin", label: "LI", color: "#0A66C2" },
  youtube: { key: "youtube", label: "YT", color: "#FF0000" },
  twitter: { key: "twitter", label: "X", color: "#1DA1F2" },
} as const;

export const POSTING_SCHEDULE = {
  business: {
    instagram: { time: "12:30", label: "12:30 PM" },
    linkedin: { time: "09:00", label: "9:00 AM" },
    twitter: { time: "10:00", label: "10:00 AM" },
  },
  personal: {
    instagram: { time: "17:30", label: "5:30 PM" },
    linkedin: { time: "08:00", label: "8:00 AM" },
    twitter: { time: "11:00", label: "11:00 AM" },
    youtube: { time: "14:00", label: "2:00 PM", day: "Sunday" },
  },
} as const;

export const ACCOUNTS = {
  business: {
    instagram: "@azen_ai",
    linkedin: "Azen AI",
    twitter: "@azen_ai",
  },
  personal: {
    instagram: "@tayyib.ai",
    linkedin: "@tayyib.ai",
    twitter: "@tayyib.ai",
    youtube: "@tayyib.ai",
  },
} as const;
```

- [ ] **Step 2: Create shared types**

Create `src/types/index.ts`:
```ts
export type AccountType = "business" | "personal";
export type Platform = "instagram" | "linkedin" | "twitter" | "youtube";
export type ContentStatus = "pending" | "approved" | "scheduled" | "posted" | "draft";
export type ContentType = "carousel" | "long_form" | "short" | "video_script" | "thread" | "tweet";

export type { TrackedAccount, ScrapedPost, AiAnalysis, GeneratedContent, CarouselSlide, YoutubeScript, EngagementMetrics, SocialAuthToken, VoiceSettings, EvergreenContent } from "@/lib/supabase/types";
```

- [ ] **Step 3: Create account context provider**

Create `src/lib/account-context.tsx`:
```tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { AccountType } from "@/types";

type AccountContextType = {
  account: AccountType;
  setAccount: (account: AccountType) => void;
};

const AccountContext = createContext<AccountContextType>({
  account: "business",
  setAccount: () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountType>("business");
  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add constants, pillars, schedule config, and shared types"
```

---

### Task 4: Layout Shell with Sidebar Navigation

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/top-bar.tsx`, `src/components/ui/account-toggle.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the account toggle component**

Create `src/components/ui/account-toggle.tsx`:
```tsx
"use client";

import { useAccount } from "@/lib/account-context";

export function AccountToggle() {
  const { account, setAccount } = useAccount();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setAccount("business")}
        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
          account === "business"
            ? "bg-azen-accent text-azen-bg"
            : "bg-transparent text-azen-text border border-azen-border hover:text-white"
        }`}
      >
        Business
      </button>
      <button
        onClick={() => setAccount("personal")}
        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
          account === "personal"
            ? "bg-azen-accent text-azen-bg"
            : "bg-transparent text-azen-text border border-azen-border hover:text-white"
        }`}
      >
        Personal
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create the sidebar component**

Create `src/components/layout/sidebar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountToggle } from "@/components/ui/account-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/research", label: "Research Feed", icon: "search" },
  { href: "/instagram", label: "Instagram", icon: "camera" },
  { href: "/linkedin", label: "LinkedIn", icon: "briefcase" },
  { href: "/twitter", label: "Twitter/X", icon: "message" },
  { href: "/youtube", label: "YouTube", icon: "play" },
  { href: "/calendar", label: "Content Calendar", icon: "calendar" },
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/tracked-accounts", label: "Tracked Accounts", icon: "users" },
  { href: "/evergreen", label: "Evergreen Library", icon: "bookmark" },
  { href: "/settings", label: "Voice Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-azen-card border-r border-azen-border flex flex-col h-screen fixed left-0 top-0">
      <div className="px-5 py-6 border-b border-azen-border">
        <span className="text-white text-[22px] font-bold">azen</span>
        <span className="text-azen-accent text-[10px] ml-1">content</span>
      </div>

      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-5 py-2.5 text-[13px] transition-colors ${
                isActive
                  ? "text-azen-accent font-semibold bg-azen-accent/[0.08] border-l-[3px] border-azen-accent"
                  : "text-azen-text hover:text-white border-l-[3px] border-transparent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-azen-border">
        <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Account</div>
        <AccountToggle />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create the top bar component**

Create `src/components/layout/top-bar.tsx`:
```tsx
export function TopBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-white text-xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-azen-text text-[13px] mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Update root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AccountProvider } from "@/lib/account-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Azen Content Dashboard",
  description: "AI-powered content generation and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[220px] p-6">{children}</main>
          </div>
        </AccountProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create placeholder dashboard page**

Replace `src/app/page.tsx`:
```tsx
import { TopBar } from "@/components/layout/top-bar";

export default function DashboardPage() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <TopBar
        title={`${greeting}, Tayyib`}
        subtitle={`${dateStr} · Loading...`}
        actions={
          <>
            <span className="bg-azen-border text-azen-text px-3.5 py-2 rounded-md text-xs">
              Last scraped: --
            </span>
            <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
              Refresh Research
            </button>
          </>
        }
      />
      <p className="text-azen-text">Dashboard content coming soon...</p>
    </div>
  );
}
```

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
```

Expected: Dark sidebar with navigation links, main content area with greeting.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add sidebar navigation and layout shell"
```

---

## Phase 2: External Service Clients

### Task 5: Claude API Client

**Files:**
- Create: `src/lib/claude/client.ts`

- [ ] **Step 1: Create Claude client**

Create `src/lib/claude/client.ts`:
```ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateContent(
  prompt: string,
  voiceSettings?: { tone_guidelines: string | null; writing_samples: string[]; avoid_words: string[]; preferred_words: string[] }
) {
  const systemParts = [
    "You are a content strategist for Azen, an AI agency that helps businesses implement custom AI solutions with a strategy-first approach (Audit, Educate, Deploy).",
    "Website: azen.io. Tagline: The Future Made Simple.",
    "Never use emojis. Use clean, professional text formatting.",
    "Write content that sounds human and authentic, not AI-generated.",
  ];

  if (voiceSettings) {
    if (voiceSettings.tone_guidelines) {
      systemParts.push(`Tone guidelines: ${voiceSettings.tone_guidelines}`);
    }
    if (voiceSettings.writing_samples.length > 0) {
      systemParts.push(`Match the voice and style of these writing samples:\n${voiceSettings.writing_samples.join("\n---\n")}`);
    }
    if (voiceSettings.avoid_words.length > 0) {
      systemParts.push(`Never use these words/phrases: ${voiceSettings.avoid_words.join(", ")}`);
    }
    if (voiceSettings.preferred_words.length > 0) {
      systemParts.push(`Prefer using these words/phrases: ${voiceSettings.preferred_words.join(", ")}`);
    }
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemParts.join("\n\n"),
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

export async function analyzeResearch(scrapedContent: string) {
  return generateContent(
    `Analyze this scraped social media content and extract:\n1. Key Insight: What makes this post notable\n2. Content Opportunity: How an AI agency (Azen) could create content inspired by this\n3. Suggested Pillar: Which content pillar it maps to (AI Education, Case Studies, Industry Trends, Strategy & Process, CTA/Lead Gen, Behind the Scenes, Hot Takes, Tips & Tools, Journey & Lessons, Curated Insights)\n4. Trending Topics: Any trending themes mentioned\n\nRespond in JSON format: { "key_insight": "", "content_opportunity": "", "suggested_pillar": "", "trending_topics": [] }\n\nContent:\n${scrapedContent}`
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Claude API client with voice settings support"
```

---

### Task 6: Apify Scraping Client

**Files:**
- Create: `src/lib/apify/client.ts`

- [ ] **Step 1: Install Apify client**

```bash
npm install apify-client
```

- [ ] **Step 2: Create Apify client**

Create `src/lib/apify/client.ts`:
```ts
import { ApifyClient } from "apify-client";

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

type ScrapeResult = {
  platform: string;
  title: string;
  content: string;
  engagement: Record<string, number>;
  url: string;
  postedAt: string;
};

const ACTOR_IDS: Record<string, string> = {
  instagram: "apify/instagram-scraper",
  youtube: "bernardo/youtube-scraper",
  twitter: "apidojo/tweet-scraper",
  linkedin: "curious_coder/linkedin-post-scraper",
};

export async function scrapeAccount(
  platform: string,
  handle: string
): Promise<ScrapeResult[]> {
  const actorId = ACTOR_IDS[platform];
  if (!actorId) throw new Error(`No scraper for platform: ${platform}`);

  const input = buildInput(platform, handle);
  const run = await apify.actor(actorId).call(input);
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  return items.map((item: Record<string, unknown>) => normalizeResult(platform, item));
}

function buildInput(platform: string, handle: string): Record<string, unknown> {
  switch (platform) {
    case "instagram":
      return { usernames: [handle.replace("@", "")], resultsLimit: 10 };
    case "youtube":
      return { channelUrls: [`https://youtube.com/@${handle.replace("@", "")}`], maxResults: 5 };
    case "twitter":
      return { handle: handle.replace("@", ""), tweetsDesired: 10 };
    case "linkedin":
      return { profileUrl: handle, maxPosts: 10 };
    default:
      return {};
  }
}

function normalizeResult(platform: string, item: Record<string, unknown>): ScrapeResult {
  return {
    platform,
    title: (item.title as string) || (item.text as string) || "",
    content: (item.caption as string) || (item.text as string) || (item.description as string) || "",
    engagement: {
      likes: (item.likesCount as number) || (item.likes as number) || 0,
      comments: (item.commentsCount as number) || (item.comments as number) || 0,
      shares: (item.sharesCount as number) || (item.shares as number) || 0,
      views: (item.viewsCount as number) || (item.views as number) || 0,
    },
    url: (item.url as string) || (item.postUrl as string) || "",
    postedAt: (item.timestamp as string) || (item.publishedAt as string) || new Date().toISOString(),
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Apify scraping client with multi-platform support"
```

---

### Task 7: Ayrshare Posting Client

**Files:**
- Create: `src/lib/ayrshare/client.ts`

- [ ] **Step 1: Create Ayrshare client**

Create `src/lib/ayrshare/client.ts`:
```ts
const AYRSHARE_BASE = "https://app.ayrshare.com/api";

async function ayrshareRequest(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  profileKey?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
  };
  if (profileKey) {
    headers["Profile-Key"] = profileKey;
  }

  const res = await fetch(`${AYRSHARE_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Ayrshare API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function postToSocial({
  platforms,
  post,
  mediaUrls,
  scheduleDate,
  profileKey,
}: {
  platforms: string[];
  post: string;
  mediaUrls?: string[];
  scheduleDate?: string;
  profileKey?: string;
}) {
  return ayrshareRequest("/post", "POST", {
    platforms,
    post,
    mediaUrls,
    scheduleDate,
    shortenLinks: true,
  }, profileKey);
}

export async function getAnalytics({
  platforms,
  profileKey,
}: {
  platforms: string[];
  profileKey?: string;
}) {
  return ayrshareRequest("/analytics/social", "POST", {
    platforms,
  }, profileKey);
}

export async function deletePost(id: string, profileKey?: string) {
  return ayrshareRequest("/delete", "DELETE", { id }, profileKey);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Ayrshare posting client"
```

---

### Task 8: Carousel Image Generator

**Files:**
- Create: `src/lib/carousel/generator.ts`, `src/lib/carousel/templates.tsx`

- [ ] **Step 1: Create carousel JSX templates**

Create `src/lib/carousel/templates.tsx`:
```tsx
import React from "react";

const BRAND = {
  bg: "#0a1628",
  accent: "#00d4aa",
  white: "#ffffff",
  muted: "#8892b0",
  cardBg: "#0d1f3c",
};

export function CoverSlide({
  headline,
  accentWord,
  account,
}: {
  headline: string;
  accentWord: string;
  account: "business" | "personal";
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";
  const parts = headline.split(accentWord);

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: `linear-gradient(160deg, ${BRAND.bg} 0%, ${BRAND.cardBg} 50%, ${BRAND.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.white,
          fontSize: 64,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.3,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {parts[0]}
        <span style={{ color: BRAND.accent }}>{accentWord}</span>
        {parts[1] || ""}
      </div>
      <div style={{ color: BRAND.muted, fontSize: 32, marginTop: 40 }}>
        Swipe to learn more
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: BRAND.white, fontSize: 28, fontWeight: 600 }}>
          {logo}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        1/8
      </div>
    </div>
  );
}

export function ContentSlide({
  headline,
  bodyText,
  slideNumber,
  totalSlides,
  account,
}: {
  headline: string;
  bodyText: string;
  slideNumber: number;
  totalSlides: number;
  account: "business" | "personal";
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: BRAND.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.accent,
          fontSize: 48,
          fontWeight: 700,
          marginBottom: 30,
          lineHeight: 1.3,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: BRAND.white,
          fontSize: 32,
          lineHeight: 1.7,
        }}
      >
        {bodyText}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 80,
          color: BRAND.white,
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        {logo}
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        {slideNumber}/{totalSlides}
      </div>
    </div>
  );
}

export function CtaSlide({
  headline,
  ctaText,
  account,
  totalSlides,
}: {
  headline: string;
  ctaText: string;
  account: "business" | "personal";
  totalSlides: number;
}) {
  const logo = account === "business" ? "azen" : "tayyib.ai";

  return (
    <div
      style={{
        width: 1080,
        height: 1080,
        background: `linear-gradient(160deg, ${BRAND.bg} 0%, ${BRAND.cardBg} 50%, ${BRAND.bg} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
      }}
    >
      <div
        style={{
          color: BRAND.white,
          fontSize: 52,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 40,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          color: BRAND.accent,
          fontSize: 36,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {ctaText}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: BRAND.white, fontSize: 28, fontWeight: 600 }}>
          {logo}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 30,
          right: 30,
          color: BRAND.muted,
          fontSize: 24,
        }}
      >
        {totalSlides}/{totalSlides}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the image generation pipeline**

Create `src/lib/carousel/generator.ts`:
```ts
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises";
import path from "path";
import { CoverSlide, ContentSlide, CtaSlide } from "./templates";
import React from "react";

let fontData: ArrayBuffer | null = null;

async function loadFont() {
  if (fontData) return fontData;
  const fontPath = path.join(process.cwd(), "public", "fonts", "Inter-Bold.woff");
  fontData = await readFile(fontPath);
  return fontData;
}

export async function generateSlideImage(
  slideType: "cover" | "content" | "cta",
  props: Record<string, unknown>
): Promise<Buffer> {
  const font = await loadFont();

  let element: React.ReactElement;

  switch (slideType) {
    case "cover":
      element = React.createElement(CoverSlide, props as any);
      break;
    case "content":
      element = React.createElement(ContentSlide, props as any);
      break;
    case "cta":
      element = React.createElement(CtaSlide, props as any);
      break;
  }

  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts: [
      {
        name: "Inter",
        data: font,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });

  return Buffer.from(resvg.render().asPng());
}
```

- [ ] **Step 3: Download Inter font file**

```bash
mkdir -p public/fonts
curl -L "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.woff" -o public/fonts/Inter-Bold.woff
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add carousel image generator with Satori + resvg pipeline"
```

---

### Task 9: Resend Email Client

**Files:**
- Create: `src/lib/resend/client.ts`

- [ ] **Step 1: Create email client**

Create `src/lib/resend/client.ts`:
```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyDigest({
  pendingCount,
  topics,
  pillar,
}: {
  pendingCount: number;
  topics: string[];
  pillar: string;
}) {
  await resend.emails.send({
    from: "Azen Content <content@azen.io>",
    to: ["tayyib@azen.io"],
    subject: `${pendingCount} posts ready for approval — ${pillar}`,
    html: `
      <div style="font-family: sans-serif; background: #0a0e1a; color: #fff; padding: 32px;">
        <h1 style="color: #00d4aa;">Good Morning, Tayyib</h1>
        <p style="color: #8892b0;">You have <strong style="color: #fff;">${pendingCount} posts</strong> ready for approval.</p>
        <p style="color: #8892b0;">Today's pillar: <strong style="color: #00d4aa;">${pillar}</strong></p>
        ${topics.length > 0 ? `
          <p style="color: #8892b0; margin-top: 16px;">Trending topics today:</p>
          <ul style="color: #ccc;">
            ${topics.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        ` : ""}
        <a href="https://your-dashboard-url.vercel.app" style="display: inline-block; background: #00d4aa; color: #0a0e1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">Open Dashboard</a>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Resend email client for daily digest"
```

---

## Phase 3: API Routes

### Task 10: Scraping API Route

**Files:**
- Create: `src/app/api/scrape/route.ts`

- [ ] **Step 1: Create scrape route**

Create `src/app/api/scrape/route.ts`:
```ts
import { NextResponse } from "next/server";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { accountId, platform, handle } = await request.json();

  const results = await scrapeAccount(platform, handle);

  for (const result of results) {
    // Check for duplicates by URL
    const { data: existing } = await supabase
      .from("scraped_posts")
      .select("id")
      .eq("url", result.url)
      .single();

    if (existing) continue;

    // Insert scraped post
    const { data: post } = await supabase
      .from("scraped_posts")
      .insert({
        tracked_account_id: accountId,
        platform: result.platform,
        title: result.title,
        content_summary: result.content,
        engagement_stats: result.engagement,
        url: result.url,
      })
      .select()
      .single();

    if (!post) continue;

    // Analyze with Claude
    const analysisRaw = await analyzeResearch(
      `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}\nEngagement: ${JSON.stringify(result.engagement)}`
    );

    try {
      const analysis = JSON.parse(analysisRaw);
      await supabase.from("ai_analysis").insert({
        scraped_post_id: post.id,
        key_insight: analysis.key_insight,
        content_opportunity: analysis.content_opportunity,
        suggested_pillar: analysis.suggested_pillar,
        trending_topics: analysis.trending_topics || [],
      });
    } catch {
      // If Claude response isn't valid JSON, store raw text as insight
      await supabase.from("ai_analysis").insert({
        scraped_post_id: post.id,
        key_insight: analysisRaw,
      });
    }
  }

  return NextResponse.json({ scraped: results.length });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add scraping API route with Claude analysis"
```

---

### Task 11: Content Generation API Route

**Files:**
- Create: `src/app/api/generate/route.ts`

- [ ] **Step 1: Create generation route**

Create `src/app/api/generate/route.ts`:
```ts
import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_PILLARS, PERSONAL_PILLARS, POSTING_SCHEDULE } from "@/lib/constants";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { platform, account, pillar, researchContext, contentType } = await request.json();

  // Fetch voice settings
  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", account)
    .single();

  const schedule = POSTING_SCHEDULE[account as keyof typeof POSTING_SCHEDULE];
  const platformSchedule = schedule[platform as keyof typeof schedule] as { time: string; label: string } | undefined;

  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillarLabel = pillars.find((p) => p.key === pillar)?.label || pillar;

  const accountHandle = account === "business" ? "@azen_ai" : "@tayyib.ai";

  let prompt = "";

  if (contentType === "carousel") {
    prompt = `Generate an Instagram carousel post for ${accountHandle}.
Content pillar: ${pillarLabel}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "post title",
  "caption": "full Instagram caption (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...],
  "slides": [
    { "slide_type": "cover", "headline": "...", "accent_word": "..." },
    { "slide_type": "content", "headline": "...", "body_text": "..." },
    ... (6 content slides),
    { "slide_type": "cta", "headline": "...", "cta_text": "..." }
  ]
}`;
  } else if (contentType === "long_form") {
    prompt = `Generate a LinkedIn long-form post for ${accountHandle}.
Content pillar: ${pillarLabel}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "post title",
  "body": "full post text (no emojis, use line breaks for formatting, max 3000 chars)",
  "hook_variants": [
    { "text": "hook option 1", "score": 8.5 },
    { "text": "hook option 2", "score": 7.8 },
    { "text": "hook option 3", "score": 9.1 }
  ],
  "hashtags": ["tag1", "tag2", ...]
}`;
  } else if (contentType === "tweet" || contentType === "thread") {
    prompt = `Generate a Twitter/X ${contentType === "thread" ? "thread" : "single tweet"} for ${accountHandle}.
Content pillar: ${pillarLabel}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "topic title",
  "body": "${contentType === "thread" ? "first tweet of the thread" : "the tweet text (max 280 chars)"}",
  ${contentType === "thread" ? '"thread_tweets": ["tweet 2", "tweet 3", ...],' : ""}
  "hashtags": ["tag1", "tag2", ...]
}`;
  } else if (contentType === "video_script") {
    prompt = `Generate a YouTube video script for @tayyib.ai.
Content pillar: ${pillarLabel}
${researchContext ? `Research context: ${researchContext}` : ""}
The script should naturally include a CTA to azen.io for lead generation.

Respond in JSON format:
{
  "title": "video title",
  "title_variants": [
    { "title": "option 1", "ctr_score": 8.7 },
    { "title": "option 2", "ctr_score": 7.9 },
    { "title": "option 3", "ctr_score": 8.2 }
  ],
  "hook": "first 30 seconds script",
  "intro": "30s-1:30 intro script",
  "body_sections": [
    { "title": "Section 1", "content": "...", "start_time": "1:30", "end_time": "4:00" }
  ],
  "cta": "closing CTA script mentioning azen.io",
  "description": "YouTube description with timestamps and azen.io link",
  "tags": ["tag1", "tag2", ...],
  "thumbnail_concepts": [
    { "label": "A", "description": "description of thumbnail concept" }
  ],
  "estimated_duration": "12 min"
}`;
  } else {
    prompt = `Generate a short social media post for ${accountHandle} on ${platform}.
Content pillar: ${pillarLabel}
${researchContext ? `Research context: ${researchContext}` : ""}

Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;
  }

  const raw = await generateContent(prompt, voice || undefined);

  let parsed;
  try {
    // Extract JSON from Claude's response (may include markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw }, { status: 500 });
  }

  // Store generated content
  const { data: content } = await supabase
    .from("generated_content")
    .insert({
      platform,
      account,
      content_type: contentType,
      title: parsed.title,
      body: parsed.body || parsed.caption || "",
      hashtags: parsed.hashtags || [],
      pillar,
      source_type: researchContext ? "research" : "original",
      source_reference: researchContext || null,
      best_time: platformSchedule?.label || null,
      status: "pending",
    })
    .select()
    .single();

  if (!content) {
    return NextResponse.json({ error: "Failed to store content" }, { status: 500 });
  }

  // Store carousel slides if applicable
  if (contentType === "carousel" && parsed.slides) {
    const slides = parsed.slides.map((slide: Record<string, string>, i: number) => ({
      generated_content_id: content.id,
      slide_number: i + 1,
      headline: slide.headline,
      body_text: slide.body_text || slide.accent_word || slide.cta_text || "",
      slide_type: slide.slide_type,
    }));
    await supabase.from("carousel_slides").insert(slides);
  }

  // Store YouTube script if applicable
  if (contentType === "video_script") {
    await supabase.from("youtube_scripts").insert({
      generated_content_id: content.id,
      hook: parsed.hook,
      intro: parsed.intro,
      body_sections: parsed.body_sections || [],
      cta: parsed.cta,
      thumbnail_concepts: parsed.thumbnail_concepts || [],
      title_variants: parsed.title_variants || [],
      description: parsed.description,
      tags: parsed.tags || [],
      estimated_duration: parsed.estimated_duration,
    });
  }

  return NextResponse.json({ content, parsed });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add content generation API route with multi-format support"
```

---

### Task 12: Daily Cron Job

**Files:**
- Create: `src/app/api/cron/daily/route.ts`, `vercel.json`

- [ ] **Step 1: Create daily cron route**

Create `src/app/api/cron/daily/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeAccount } from "@/lib/apify/client";
import { analyzeResearch, generateContent } from "@/lib/claude/client";
import { sendDailyDigest } from "@/lib/resend/client";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine today's pillar index (rotate through 7 days)
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const businessPillar = BUSINESS_PILLARS[dayIndex % BUSINESS_PILLARS.length];
  const personalPillar = PERSONAL_PILLARS[dayIndex % PERSONAL_PILLARS.length];

  // 1. Scrape all tracked accounts
  const { data: accounts } = await supabase.from("tracked_accounts").select("*");

  if (accounts) {
    for (const account of accounts) {
      const handles = account.handles as Record<string, string>;
      for (const platform of account.platforms as string[]) {
        const handle = handles[platform];
        if (!handle) continue;

        try {
          const results = await scrapeAccount(platform, handle);
          for (const result of results) {
            const { data: existing } = await supabase
              .from("scraped_posts")
              .select("id")
              .eq("url", result.url)
              .single();

            if (existing) continue;

            const { data: post } = await supabase
              .from("scraped_posts")
              .insert({
                tracked_account_id: account.id,
                platform: result.platform,
                title: result.title,
                content_summary: result.content,
                engagement_stats: result.engagement,
                url: result.url,
              })
              .select()
              .single();

            if (post) {
              const analysisRaw = await analyzeResearch(
                `Title: ${result.title}\nContent: ${result.content}\nPlatform: ${result.platform}`
              );
              try {
                const analysis = JSON.parse(analysisRaw);
                await supabase.from("ai_analysis").insert({
                  scraped_post_id: post.id,
                  key_insight: analysis.key_insight,
                  content_opportunity: analysis.content_opportunity,
                  suggested_pillar: analysis.suggested_pillar,
                  trending_topics: analysis.trending_topics || [],
                });
              } catch {}
            }
          }
        } catch (err) {
          console.error(`Scraping failed for ${account.name} on ${platform}:`, err);
        }
      }
    }
  }

  // 2. Generate daily content
  const contentRequests = [
    { platform: "instagram", account: "business", pillar: businessPillar.key, contentType: "carousel" },
    { platform: "linkedin", account: "business", pillar: businessPillar.key, contentType: "long_form" },
    { platform: "twitter", account: "business", pillar: businessPillar.key, contentType: "tweet" },
    { platform: "instagram", account: "personal", pillar: personalPillar.key, contentType: "carousel" },
    { platform: "linkedin", account: "personal", pillar: personalPillar.key, contentType: "long_form" },
    { platform: "twitter", account: "personal", pillar: personalPillar.key, contentType: "tweet" },
  ];

  // Add YouTube on Sundays
  if (dayIndex === 0) {
    contentRequests.push({
      platform: "youtube",
      account: "personal",
      pillar: personalPillar.key,
      contentType: "video_script",
    });
  }

  // Get recent research for context
  const { data: recentPosts } = await supabase
    .from("scraped_posts")
    .select("*, ai_analysis(*)")
    .order("scraped_at", { ascending: false })
    .limit(10);

  const researchContext = recentPosts
    ?.map((p) => `[${p.platform}] ${p.title}: ${p.ai_analysis?.[0]?.content_opportunity || p.content_summary}`)
    .join("\n") || "";

  let generatedCount = 0;
  for (const req of contentRequests) {
    try {
      // Fetch voice settings for the account
      const { data: voice } = await supabase
        .from("voice_settings")
        .select("*")
        .eq("account_type", req.account)
        .single();

      const accountHandle = req.account === "business" ? "@azen_ai" : "@tayyib.ai";
      const pillars = req.account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
      const pillarLabel = pillars.find((p) => p.key === req.pillar)?.label || req.pillar;

      let prompt = "";
      if (req.contentType === "carousel") {
        prompt = `Generate an Instagram carousel post for ${accountHandle}.\nContent pillar: ${pillarLabel}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "post title", "caption": "full Instagram caption (no emojis)", "hashtags": ["tag1"], "slides": [{ "slide_type": "cover", "headline": "...", "accent_word": "..." }, { "slide_type": "content", "headline": "...", "body_text": "..." }, { "slide_type": "cta", "headline": "...", "cta_text": "..." }] }`;
      } else if (req.contentType === "long_form") {
        prompt = `Generate a LinkedIn long-form post for ${accountHandle}.\nContent pillar: ${pillarLabel}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "post title", "body": "full post text (no emojis, max 3000 chars)", "hashtags": ["tag1"] }`;
      } else if (req.contentType === "tweet") {
        prompt = `Generate a Twitter/X tweet for ${accountHandle}.\nContent pillar: ${pillarLabel}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "topic title", "body": "tweet text (max 280 chars, no emojis)", "hashtags": ["tag1"] }`;
      } else if (req.contentType === "video_script") {
        prompt = `Generate a YouTube video script for @tayyib.ai.\nContent pillar: ${pillarLabel}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "video title", "hook": "first 30s script", "intro": "intro script", "body_sections": [{ "title": "Section", "content": "...", "start_time": "1:30", "end_time": "4:00" }], "cta": "closing CTA mentioning azen.io", "description": "YouTube description", "tags": ["tag1"], "thumbnail_concepts": [{ "label": "A", "description": "concept" }], "estimated_duration": "12 min", "title_variants": [{ "title": "option", "ctr_score": 8.5 }] }`;
      } else {
        prompt = `Generate a short social media post for ${accountHandle} on ${req.platform}.\nContent pillar: ${pillarLabel}\nResearch context: ${researchContext}\n\nRespond in JSON format:\n{ "title": "post title", "body": "post text (no emojis)", "hashtags": ["tag1"] }`;
      }

      const raw = await generateContent(prompt, voice || undefined);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);

      const { data: content } = await supabase
        .from("generated_content")
        .insert({
          platform: req.platform,
          account: req.account,
          content_type: req.contentType,
          title: parsed.title,
          body: parsed.body || parsed.caption || "",
          hashtags: parsed.hashtags || [],
          pillar: req.pillar,
          source_type: "research",
          best_time: null,
          status: "pending",
        })
        .select()
        .single();

      if (content && req.contentType === "carousel" && parsed.slides) {
        const slides = parsed.slides.map((slide: Record<string, string>, i: number) => ({
          generated_content_id: content.id,
          slide_number: i + 1,
          headline: slide.headline,
          body_text: slide.body_text || slide.accent_word || slide.cta_text || "",
          slide_type: slide.slide_type,
        }));
        await supabase.from("carousel_slides").insert(slides);
      }

      if (content && req.contentType === "video_script") {
        await supabase.from("youtube_scripts").insert({
          generated_content_id: content.id,
          hook: parsed.hook, intro: parsed.intro,
          body_sections: parsed.body_sections || [], cta: parsed.cta,
          thumbnail_concepts: parsed.thumbnail_concepts || [],
          title_variants: parsed.title_variants || [],
          description: parsed.description, tags: parsed.tags || [],
          estimated_duration: parsed.estimated_duration,
        });
      }

      generatedCount++;
    } catch (err) {
      console.error(`Generation failed for ${req.platform}/${req.account}:`, err);
    }
  }

  // 2b. Check for eligible evergreen content to suggest resharing
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: evergreenCandidates } = await supabase
    .from("evergreen_content")
    .select("*, generated_content(*)")
    .or(`last_reshared_at.is.null,last_reshared_at.lt.${thirtyDaysAgo}`)
    .limit(3);

  if (evergreenCandidates && evergreenCandidates.length > 0) {
    // Mark evergreen suggestions as pending reshare (creates draft copies)
    for (const eg of evergreenCandidates) {
      const original = eg.generated_content;
      if (!original) continue;
      await supabase.from("generated_content").insert({
        platform: original.platform,
        account: original.account,
        content_type: original.content_type,
        title: `[Reshare] ${original.title}`,
        body: original.body,
        hashtags: original.hashtags,
        pillar: original.pillar,
        source_type: "evergreen_reshare",
        source_reference: `Evergreen reshare of: ${original.title}`,
        status: "draft",
        is_repurposed: true,
        repurposed_from: original.id,
      });
    }
  }

  // 3. Send daily digest email
  const trendingTopics = recentPosts
    ?.flatMap((p) => p.ai_analysis?.[0]?.trending_topics || [])
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5) || [];

  try {
    await sendDailyDigest({
      pendingCount: generatedCount,
      topics: trendingTopics,
      pillar: `${businessPillar.label} / ${personalPillar.label}`,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }

  return NextResponse.json({
    scraped: accounts?.length || 0,
    generated: generatedCount,
    pillar: { business: businessPillar.label, personal: personalPillar.label },
  });
}
```

- [ ] **Step 2: Create Vercel cron config**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Note: The schedule `0 9 * * *` is in UTC. Europe/London is UTC+0 (GMT) or UTC+1 (BST). Adjust to `0 8 * * *` during BST if needed.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add daily cron job for scraping, generation, and notifications"
```

---

### Task 13: Posting and Repurposing API Routes

**Files:**
- Create: `src/app/api/post/route.ts`, `src/app/api/repurpose/route.ts`, `src/app/api/analyze-url/route.ts`, `src/app/api/carousel/route.ts`

- [ ] **Step 1: Create posting route**

Create `src/app/api/post/route.ts`:
```ts
import { NextResponse } from "next/server";
import { postToSocial } from "@/lib/ayrshare/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { contentId } = await request.json();

  const { data: content } = await supabase
    .from("generated_content")
    .select("*, carousel_slides(*)")
    .eq("id", contentId)
    .single();

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // Get profile key for the account
  const { data: auth } = await supabase
    .from("social_auth_tokens")
    .select("ayrshare_profile_key")
    .eq("platform", content.platform)
    .eq("account_type", content.account)
    .single();

  const mediaUrls = content.carousel_slides
    ?.sort((a: { slide_number: number }, b: { slide_number: number }) => a.slide_number - b.slide_number)
    .map((s: { image_url: string }) => s.image_url)
    .filter(Boolean) || [];

  const platformMap: Record<string, string> = {
    instagram: "instagram",
    linkedin: "linkedin",
    twitter: "twitter",
    youtube: "youtube",
  };

  const result = await postToSocial({
    platforms: [platformMap[content.platform]],
    post: `${content.body}\n\n${(content.hashtags || []).map((t: string) => `#${t}`).join(" ")}`,
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    scheduleDate: content.scheduled_for || undefined,
    profileKey: auth?.ayrshare_profile_key || undefined,
  });

  await supabase
    .from("generated_content")
    .update({ status: "posted", posted_at: new Date().toISOString() })
    .eq("id", contentId);

  return NextResponse.json(result);
}
```

- [ ] **Step 2: Create repurposing route**

Create `src/app/api/repurpose/route.ts`:
```ts
import { NextResponse } from "next/server";
import { generateContent } from "@/lib/claude/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { sourceContentId, targetPlatform, targetContentType, targetAccount } = await request.json();

  const { data: source } = await supabase
    .from("generated_content")
    .select("*")
    .eq("id", sourceContentId)
    .single();

  if (!source) {
    return NextResponse.json({ error: "Source content not found" }, { status: 404 });
  }

  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", targetAccount)
    .single();

  const accountHandle = targetAccount === "business" ? "@azen_ai" : "@tayyib.ai";

  const prompt = `Repurpose this content for ${targetPlatform} (${targetContentType}) for ${accountHandle}.

Original content (${source.platform} ${source.content_type}):
Title: ${source.title}
Body: ${source.body}

Rules:
- Adapt the content to feel native to ${targetPlatform}
- Do not copy it word-for-word — rewrite it
- No emojis
- Match the tone for ${targetAccount === "business" ? "a professional AI agency" : "a personal brand / entrepreneur"}
${targetContentType === "carousel" ? "- Return JSON with slides array" : ""}
${targetContentType === "thread" ? "- Return JSON with thread_tweets array" : ""}

Respond in JSON format:
{
  "title": "adapted title",
  "body": "adapted content",
  "hashtags": ["tag1", "tag2", ...]
  ${targetContentType === "carousel" ? ', "slides": [{ "slide_type": "cover", "headline": "...", "accent_word": "..." }, ...]' : ""}
  ${targetContentType === "thread" ? ', "thread_tweets": ["tweet 2", "tweet 3", ...]' : ""}
}`;

  const raw = await generateContent(prompt, voice || undefined);

  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
  }

  const { data: content } = await supabase
    .from("generated_content")
    .insert({
      platform: targetPlatform,
      account: targetAccount,
      content_type: targetContentType,
      title: parsed.title,
      body: parsed.body,
      hashtags: parsed.hashtags || [],
      pillar: source.pillar,
      source_type: "repurposed",
      source_reference: `Repurposed from ${source.platform} post: ${source.title}`,
      status: "pending",
      is_repurposed: true,
      repurposed_from: sourceContentId,
    })
    .select()
    .single();

  if (content && targetContentType === "carousel" && parsed.slides) {
    const slides = parsed.slides.map((slide: Record<string, string>, i: number) => ({
      generated_content_id: content.id,
      slide_number: i + 1,
      headline: slide.headline,
      body_text: slide.body_text || slide.accent_word || slide.cta_text || "",
      slide_type: slide.slide_type,
    }));
    await supabase.from("carousel_slides").insert(slides);
  }

  return NextResponse.json({ content, parsed });
}
```

- [ ] **Step 3: Create URL analysis route**

Create `src/app/api/analyze-url/route.ts`:
```ts
import { NextResponse } from "next/server";
import { analyzeResearch } from "@/lib/claude/client";

export async function POST(request: Request) {
  const { url } = await request.json();

  // Fetch URL content
  const res = await fetch(url);
  const html = await res.text();

  // Strip HTML to get text content (basic approach)
  const textContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000);

  const analysis = await analyzeResearch(`URL: ${url}\nContent: ${textContent}`);

  let parsed;
  try {
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { key_insight: analysis };
  } catch {
    parsed = { key_insight: analysis };
  }

  return NextResponse.json(parsed);
}
```

- [ ] **Step 4: Create carousel image route**

Create `src/app/api/carousel/route.ts`:
```ts
import { NextResponse } from "next/server";
import { generateSlideImage } from "@/lib/carousel/generator";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { slideId, slideType, props } = await request.json();

  const imageBuffer = await generateSlideImage(slideType, props);

  // Upload to Supabase Storage
  const fileName = `carousel/${slideId}-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("carousel-images")
    .upload(fileName, imageBuffer, { contentType: "image/png" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("carousel-images")
    .getPublicUrl(fileName);

  // Update slide record with image URL
  if (slideId) {
    await supabase
      .from("carousel_slides")
      .update({ image_url: publicUrl })
      .eq("id", slideId);
  }

  return NextResponse.json({ url: publicUrl });
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add posting, repurposing, URL analysis, and carousel image routes"
```

---

## Phase 4: UI Components

### Task 14: Shared UI Components

**Files:**
- Create: `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/modal.tsx`

- [ ] **Step 1: Create UI primitives**

Create `src/components/ui/badge.tsx`:
```tsx
import { PLATFORMS } from "@/lib/constants";

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!config) return null;

  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] text-white font-semibold"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}

export function PillarBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
      style={{ backgroundColor: color, color: "#0a0e1a" }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "#ffa500",
    approved: "#00d4aa",
    scheduled: "#00d4aa",
    posted: "#4CAF50",
    draft: "#8892b0",
  };

  return (
    <span className="text-[8px] font-semibold" style={{ color: colors[status] || "#8892b0" }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

Create `src/components/ui/button.tsx`:
```tsx
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "icon";

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base = "rounded-md text-[11px] font-semibold transition-colors";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-azen-accent text-azen-bg px-3 py-1.5 hover:bg-azen-accent/90",
    secondary: "bg-azen-border text-azen-text px-3 py-1.5 hover:text-white",
    icon: "bg-azen-border text-azen-text px-3 py-1.5 hover:text-white",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

Create `src/components/ui/card.tsx`:
```tsx
export function Card({
  children,
  className = "",
  border,
}: {
  children: React.ReactNode;
  className?: string;
  border?: string;
}) {
  return (
    <div
      className={`bg-azen-card rounded-lg p-4 ${className}`}
      style={{ border: `1px solid ${border || "#1a2340"}` }}
    >
      {children}
    </div>
  );
}
```

Create `src/components/ui/modal.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-azen-card border border-azen-border rounded-lg p-6 max-w-lg w-full backdrop:bg-black/50"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="text-azen-text hover:text-white text-xl">
          x
        </button>
      </div>
      {children}
    </dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components (Badge, Button, Card, Modal)"
```

---

### Task 15: Dashboard Page Components

**Files:**
- Create: `src/components/dashboard/stats-row.tsx`, `src/components/dashboard/engagement-summary.tsx`, `src/components/dashboard/content-queue.tsx`, `src/components/content/queue-item.tsx`
- Modify: `src/app/page.tsx`

This task builds the full dashboard page with stats, engagement summary, and the content queue with approve/edit/regenerate functionality. Due to the size of this task, I'll provide the key component code.

- [ ] **Step 1: Create stats row**

Create `src/components/dashboard/stats-row.tsx`:
```tsx
import { Card } from "@/components/ui/card";

type Stat = { label: string; value: string | number; sub: string; subColor?: string };

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="text-azen-text text-[11px] uppercase tracking-wider">{stat.label}</div>
          <div className="text-white text-[28px] font-bold mt-1.5">{stat.value}</div>
          <div className="text-xs mt-1" style={{ color: stat.subColor || "#8892b0" }}>
            {stat.sub}
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create engagement summary**

Create `src/components/dashboard/engagement-summary.tsx`:
```tsx
import { Card } from "@/components/ui/card";

type EngagementData = {
  likes: { value: number; change: number };
  comments: { value: number; change: number };
  shares: { value: number; change: number };
  bestPost: { title: string; platform: string };
};

export function EngagementSummary({ data }: { data: EngagementData }) {
  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white text-sm font-semibold">This Week&apos;s Engagement</span>
        <span className="text-azen-text text-[11px]">vs last week</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Likes", ...data.likes },
          { label: "Comments", ...data.comments },
          { label: "Shares", ...data.shares },
        ].map((m) => (
          <div key={m.label}>
            <div className="text-azen-text text-[11px]">{m.label}</div>
            <div className="text-white text-lg font-bold mt-0.5">
              {m.value.toLocaleString()}{" "}
              <span className={`text-[11px] ${m.change >= 0 ? "text-azen-accent" : "text-red-400"}`}>
                {m.change >= 0 ? "+" : ""}{m.change}%
              </span>
            </div>
          </div>
        ))}
        <div>
          <div className="text-azen-text text-[11px]">Best Post</div>
          <div className="text-white text-xs font-medium mt-1">{data.bestPost.title}</div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Create queue item component**

Create `src/components/content/queue-item.tsx`:
```tsx
"use client";

import { useState } from "react";
import { PlatformBadge, PillarBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratedContent } from "@/types";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

export function QueueItem({
  content,
  onApprove,
  onRegenerate,
}: {
  content: GeneratedContent;
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const pillars = content.account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillar = pillars.find((p) => p.key === content.pillar);

  return (
    <div className="bg-azen-bg rounded-md mb-2">
      <div
        className="flex items-center p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <PlatformBadge platform={content.platform} />
        <div className="flex-1 ml-3">
          <div className="text-white text-[13px] font-medium">{content.title}</div>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-azen-text text-[11px]">
              {content.content_type} · {content.account === "business" ? "@azen_ai" : "@tayyib.ai"}
            </span>
            {pillar && <PillarBadge label={pillar.label} color={pillar.color} />}
            {content.source_reference && (
              <span className="text-azen-text text-[10px]">
                Inspired by {content.source_reference}
              </span>
            )}
          </div>
        </div>
        {content.best_time && (
          <div className="text-right mr-3">
            <div className="text-azen-text text-[10px]">Best time</div>
            <div className="text-azen-accent text-[10px] font-semibold">{content.best_time}</div>
          </div>
        )}
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button variant="primary" onClick={() => onApprove(content.id)}>Approve</Button>
          <Button variant="secondary" onClick={() => setExpanded(true)}>Edit</Button>
          <Button variant="icon" onClick={() => onRegenerate(content.id)}>↻</Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-4 border-t border-azen-border pt-3">
          <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Preview</div>
          <div className="text-[#ccc] text-xs leading-relaxed whitespace-pre-wrap mb-3">
            {content.body}
          </div>
          {content.hashtags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {content.hashtags.map((tag) => (
                <span key={tag} className="bg-azen-border text-azen-accent px-2 py-0.5 rounded text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create content queue**

Create `src/components/dashboard/content-queue.tsx`:
```tsx
"use client";

import { Card } from "@/components/ui/card";
import { QueueItem } from "@/components/content/queue-item";
import type { GeneratedContent } from "@/types";

export function ContentQueue({
  items,
  onApprove,
  onRegenerate,
}: {
  items: GeneratedContent[];
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
}) {
  return (
    <Card>
      <h2 className="text-white text-base font-semibold mb-4">Today&apos;s Content Queue</h2>
      {items.length === 0 ? (
        <p className="text-azen-text text-sm">No content pending. Check back after 9 AM.</p>
      ) : (
        items.map((item) => (
          <QueueItem
            key={item.id}
            content={item}
            onApprove={onApprove}
            onRegenerate={onRegenerate}
          />
        ))
      )}
    </Card>
  );
}
```

- [ ] **Step 5: Create Server Actions for content approval and regeneration**

Create `src/app/actions.ts`:
```ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateContent } from "@/lib/claude/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function approveContent(id: string) {
  await supabase
    .from("generated_content")
    .update({ status: "approved" })
    .eq("id", id);
  revalidatePath("/");
}

export async function regenerateContent(id: string) {
  const { data: original } = await supabase
    .from("generated_content")
    .select("*")
    .eq("id", id)
    .single();

  if (!original) return;

  const { data: voice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", original.account)
    .single();

  const accountHandle = original.account === "business" ? "@azen_ai" : "@tayyib.ai";

  const prompt = `Regenerate a ${original.content_type} for ${accountHandle} on ${original.platform}.
Topic: ${original.title}
Content pillar: ${original.pillar}

Generate a completely different take on the same topic. Respond in JSON format:
{
  "title": "post title",
  "body": "post text (no emojis, clean formatting)",
  "hashtags": ["tag1", "tag2", ...]
}`;

  const raw = await generateContent(prompt, voice || undefined);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
    await supabase
      .from("generated_content")
      .update({
        title: parsed.title,
        body: parsed.body,
        hashtags: parsed.hashtags || [],
      })
      .eq("id", id);
  } catch {
    // Keep original content if regeneration fails
  }
  revalidatePath("/");
}
```

- [ ] **Step 6: Wire up the dashboard page**

Replace `src/app/page.tsx` with a server component that fetches data and passes it to a client wrapper with Server Actions:

```tsx
import { TopBar } from "@/components/layout/top-bar";
import { StatsRow } from "@/components/dashboard/stats-row";
import { EngagementSummary } from "@/components/dashboard/engagement-summary";
import { ContentQueue } from "@/components/dashboard/content-queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { approveContent, regenerateContent } from "./actions";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const { data: pendingContent } = await supabase
    .from("generated_content")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { count: postedThisWeek } = await supabase
    .from("generated_content")
    .select("*", { count: "exact", head: true })
    .eq("status", "posted")
    .gte("posted_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Fetch engagement data for "best post" and weekly totals
  const { data: weeklyEngagement } = await supabase
    .from("engagement_metrics")
    .select("*, generated_content(title, platform)")
    .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const engagementTotals = (weeklyEngagement || []).reduce(
    (acc, m) => ({
      likes: acc.likes + m.likes,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
    }),
    { likes: 0, comments: 0, shares: 0 }
  );

  const bestPost = (weeklyEngagement || []).sort(
    (a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
  )[0];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const stats = [
    { label: "Pending Approval", value: pendingContent?.length || 0, sub: "Ready to post", subColor: "#00d4aa" },
    { label: "Posted This Week", value: postedThisWeek || 0, sub: "Across all platforms" },
    { label: "Trending Topics", value: "--", sub: "Loading..." },
    { label: "Content Pillar", value: "AI Education", sub: "Today's focus" },
  ];

  return (
    <div>
      <TopBar
        title={`${greeting}, Tayyib`}
        subtitle={`${dateStr} · ${pendingContent?.length || 0} posts ready for approval`}
        actions={
          <>
            <span className="bg-azen-border text-azen-text px-3.5 py-2 rounded-md text-xs">Last scraped: --</span>
            <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">Refresh Research</button>
          </>
        }
      />
      <StatsRow stats={stats} />
      <EngagementSummary
        data={{
          likes: { value: engagementTotals.likes, change: 0 },
          comments: { value: engagementTotals.comments, change: 0 },
          shares: { value: engagementTotals.shares, change: 0 },
          bestPost: {
            title: bestPost?.generated_content?.title || "No data yet",
            platform: bestPost?.generated_content?.platform || "",
          },
        }}
      />
      <ContentQueue
        items={pendingContent || []}
        onApprove={approveContent}
        onRegenerate={regenerateContent}
      />
    </div>
  );
}
```

Note: `approveContent` and `regenerateContent` are Server Actions (marked with `"use server"`) which can be passed from server components to client components safely.

- [ ] **Step 6: Verify dashboard renders**

```bash
npm run dev
```

Expected: Dashboard page with stats, engagement bar, and content queue (empty initially).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: build dashboard page with stats, engagement, and content queue"
```

---

## Phase 5: Platform Pages

> **Note:** Tasks 16-21 follow the same pattern as the dashboard — server components for data fetching, client components for interactivity. Each task creates the page file and its specific components. Due to the plan's length, these tasks are described at a higher level. The code patterns established in Tasks 14-15 should be followed.

### Task 16: Research Feed Page

**Files:**
- Create: `src/app/research/page.tsx`, `src/components/research/feed-item.tsx`, `src/components/research/ai-analysis.tsx`, `src/components/research/trending-bar.tsx`, `src/components/research/url-input.tsx`

- [ ] **Step 1: Create trending bar component** — Displays auto-detected trending topics across tracked accounts. Query `ai_analysis` table for `trending_topics` from the last 48 hours, deduplicate, show as teal-colored tags.

- [ ] **Step 2: Create AI analysis card** — Shows key insight, content opportunity, and suggested pillar for each scraped post. Uses the `Card` component with a teal left border.

- [ ] **Step 3: Create feed item component** — Shows scraped post with source account info, platform badge, engagement stats, AI analysis card, and action buttons (Generate Content From This, Save for Later, View Original). Competitor posts get a red border and "COMPETITOR" badge.

- [ ] **Step 4: Create URL input component** — Text input with "Analyze" button. Calls `/api/analyze-url` and displays the analysis result inline.

- [ ] **Step 5: Create research feed page** — Server component that fetches `scraped_posts` with joined `ai_analysis` and `tracked_accounts`. Filter tabs by person and platform. Renders trending bar, feed items, and URL input at the bottom.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build research feed page with AI analysis and URL analyzer"
```

---

### Task 17: Instagram Carousel Builder Page

**Files:**
- Create: `src/app/instagram/page.tsx`, `src/components/instagram/phone-preview.tsx`, `src/components/instagram/slide-navigator.tsx`, `src/components/instagram/carousel-slide.tsx`, `src/components/content/caption-editor.tsx`, `src/components/content/hashtag-manager.tsx`, `src/components/content/post-details.tsx`

- [ ] **Step 1: Create phone preview component** — iPhone-shaped mockup showing the carousel slide inside an IG-style frame (header with avatar and handle, square content area, action bar with like/comment/share).

- [ ] **Step 2: Create slide navigator** — Horizontal strip of thumbnail previews for all 8 slides. Active slide has teal border. Click to select a slide.

- [ ] **Step 3: Create caption editor** — Editable textarea showing the AI-generated caption. Click to edit, auto-saves on blur.

- [ ] **Step 4: Create hashtag manager** — Shows hashtags as teal tags with "x" to remove. "+" button to add. "Regenerate" link to get new hashtags via Claude.

- [ ] **Step 5: Create post details panel** — Shows account, pillar, source, best time, slide count in a key-value layout.

- [ ] **Step 6: Create Instagram page** — Split layout: phone preview + slide navigator on left, caption editor + hashtags + post details + action buttons on right. Header with Drafts/Posted/Generate New tabs. Fetches `generated_content` where platform=instagram with joined `carousel_slides`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: build Instagram carousel builder page"
```

---

### Task 18: LinkedIn Post Editor Page

**Files:**
- Create: `src/app/linkedin/page.tsx`, `src/components/linkedin/linkedin-preview.tsx`, `src/components/linkedin/hook-variants.tsx`, `src/components/linkedin/tone-selector.tsx`

- [ ] **Step 1: Create LinkedIn preview component** — Realistic LinkedIn feed mockup with profile header, post content, and engagement bar.

- [ ] **Step 2: Create hook variants component** — Shows 3 hook options each with a score. Selected hook has teal border. "Generate more" link to get new hooks.

- [ ] **Step 3: Create tone selector** — Toggle buttons for Professional, Conversational, Story-driven, Controversial. Regenerates content when tone changes.

- [ ] **Step 4: Create LinkedIn page** — Split layout: preview + post stats prediction on left, tone selector + hook variants + post details on right. Format tabs: Long-form Post, Carousel Document, Short Punchy Post. Character counter against 3,000 limit.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: build LinkedIn post editor page"
```

---

### Task 19: Twitter/X Post Editor Page

**Files:**
- Create: `src/app/twitter/page.tsx`, `src/components/twitter/tweet-preview.tsx`, `src/components/twitter/thread-builder.tsx`

- [ ] **Step 1: Create tweet preview** — Realistic Twitter/X feed mockup with profile header, tweet text, and engagement bar.

- [ ] **Step 2: Create thread builder** — Multi-tweet editor where each tweet in a thread is editable with its own character counter.

- [ ] **Step 3: Create Twitter/X page** — Format tabs: Thread, Single Tweet, Quote Tweet. Preview on left, editor + post details on right. Character counter for 280 limit.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: build Twitter/X post editor page"
```

---

### Task 20: YouTube Script Builder Page

**Files:**
- Create: `src/app/youtube/page.tsx`, `src/components/youtube/thumbnail-concepts.tsx`, `src/components/youtube/script-editor.tsx`, `src/components/youtube/title-variants.tsx`

- [ ] **Step 1: Create thumbnail concepts component** — Shows 3 thumbnail mockups generated via Satori. Selectable with teal border. "Generate more" option.

- [ ] **Step 2: Create script editor** — Color-coded sections (Hook=red, Intro=teal, Body=blue, CTA=yellow) with timestamps. Each section is editable.

- [ ] **Step 3: Create title variants** — 3 title options with CTR scores. Selectable.

- [ ] **Step 4: Create YouTube page** — Format tabs: Long-form Video, YouTube Short. Thumbnail concepts + script on left, title variants + description + tags + details on right. Sunday 2:00 PM locked schedule.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: build YouTube script builder page"
```

---

### Task 21: Content Calendar Page

**Files:**
- Create: `src/app/calendar/page.tsx`, `src/components/calendar/week-view.tsx`, `src/components/calendar/month-view.tsx`, `src/components/calendar/calendar-cell.tsx`, `src/components/calendar/pillar-legend.tsx`

- [ ] **Step 1: Create pillar legend** — Color-coded dots with labels for each pillar.

- [ ] **Step 2: Create calendar cell with drag-and-drop** — Single day cell that acts as a droppable zone via `@dnd-kit/core`. Shows all posts with platform badges, status colors (green=posted, teal=scheduled, orange=pending), clickable to navigate to platform editor. Each post inside the cell is a draggable item using `@dnd-kit/sortable`.

The calendar cell component should:
- Import `useDroppable` from `@dnd-kit/core` and set up the day as a drop target with `id` set to the date string (e.g., `"2026-03-22"`)
- Each post card inside the cell uses `useDraggable` with `id` set to the content ID
- When a post is dragged to a different day, call a Server Action to update `scheduled_for` on the `generated_content` record

- [ ] **Step 3: Create week view** — 7-column grid (Mon-Sun) wrapped in `DndContext` from `@dnd-kit/core`. Each day header shows date and assigned pillar. Week summary bar at bottom with totals. On `onDragEnd`, extract the dragged content ID and the destination date from the `over` droppable, then call the reschedule Server Action.

- [ ] **Step 4: Create month view** — 7-column × 4-5 row grid showing the full month. Same drag-and-drop pattern as week view — wrapped in `DndContext`. Days outside the current month are dimmed. Cells are compact versions showing post count badges instead of full post cards. Clicking a day navigates to week view focused on that week.

- [ ] **Step 5: Create calendar page** — View tabs (Week/Month/Pillar Overview). Navigation (Prev/This Week/Next). Fetches all `generated_content` for the displayed date range. Create a `rescheduleContent` Server Action in `src/app/calendar/actions.ts` that updates the `scheduled_for` column.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build content calendar page with week/month views and drag-and-drop"
```

---

### Task 22: Analytics, Tracked Accounts, and Settings Pages

**Files:**
- Create: `src/app/analytics/page.tsx`, `src/app/tracked-accounts/page.tsx`, `src/app/settings/page.tsx`, related components

- [ ] **Step 1: Build Analytics page** — Engagement metrics cards, week-over-week comparison, best performing posts, pillar performance breakdown, platform comparison. Fetches from `engagement_metrics` table.

- [ ] **Step 2: Build Tracked Accounts page** — 2-column grid of account cards showing name, category, tracked platforms, stats. Category filter tabs. Add New Account modal with form for name, category, handles per platform. Edit/Remove buttons per card.

- [ ] **Step 3: Build Voice Settings page** — Two sections (Business/Personal). Each has: writing samples textarea (paste examples), tone guidelines textarea, avoid words input (comma-separated), preferred words input, "Preview & Test" button that generates a sample post via Claude with current settings.

- [ ] **Step 4: Create Evergreen Content API route**

Create `src/app/api/evergreen/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all evergreen content with cooldown status
export async function GET() {
  const { data, error } = await supabase
    .from("evergreen_content")
    .select("*, generated_content(*)")
    .order("flagged_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const enriched = (data || []).map((item) => {
    const cooldownEnd = item.last_reshared_at
      ? new Date(item.last_reshared_at).getTime() + item.cooldown_days * 24 * 60 * 60 * 1000
      : 0;
    return {
      ...item,
      eligible_for_reshare: !item.last_reshared_at || now > cooldownEnd,
      days_until_eligible: item.last_reshared_at
        ? Math.max(0, Math.ceil((cooldownEnd - now) / (24 * 60 * 60 * 1000)))
        : 0,
    };
  });

  return NextResponse.json(enriched);
}

// POST: Flag content as evergreen
export async function POST(request: Request) {
  const { contentId } = await request.json();

  const { data: existing } = await supabase
    .from("evergreen_content")
    .select("id")
    .eq("generated_content_id", contentId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already flagged as evergreen" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("evergreen_content")
    .insert({ generated_content_id: contentId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: Remove evergreen flag
export async function DELETE(request: Request) {
  const { contentId } = await request.json();
  const { error } = await supabase
    .from("evergreen_content")
    .delete()
    .eq("generated_content_id", contentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Build Evergreen Library page** — Create `src/app/evergreen/page.tsx` showing all flagged evergreen content in a card grid. Each card shows: post title, platform badge, pillar, last reshared date, cooldown countdown, reshare count, and action buttons (Reshare Now, Edit Before Reshare, Remove from Evergreen). "Reshare Now" creates a draft copy via the repurpose route with refresh-on-reshare. The page is already linked in the sidebar (added in Task 4). Add "Flag as Evergreen" button to `QueueItem` component.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: build analytics, tracked accounts, settings, and evergreen library pages"
```

---

## Phase 6: Authentication and Deployment

### Task 23: Authentication

**Files:**
- Create: `src/app/login/page.tsx`, `src/middleware.ts`

- [ ] **Step 1: Create login page** — Email/password form with Azen branding. Calls Supabase Auth `signInWithPassword`.

- [ ] **Step 2: Create middleware** — Protect all routes except `/login`. Check for valid Supabase session, redirect to `/login` if not authenticated.

- [ ] **Step 3: Add sign-out button to sidebar** — Bottom of sidebar, calls Supabase `signOut` and redirects to `/login`.

- [ ] **Step 4: Create user in Supabase** — In Supabase dashboard, create a user with Tayyib's email and password.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add authentication with Supabase Auth"
```

---

### Task 24: Deployment

**Files:**
- Modify: `vercel.json`, `.env.local`

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

Go to vercel.com, import the GitHub repo, add all environment variables from `.env.local`.

- [ ] **Step 3: Deploy**

Vercel auto-deploys on push. Verify the deployment works.

- [ ] **Step 4: Configure Supabase Storage** — In Supabase dashboard, create a storage bucket called `carousel-images` with public access.

- [ ] **Step 5: Configure Ayrshare** — Connect Instagram, LinkedIn, Twitter/X, and YouTube accounts through Ayrshare dashboard. Save profile keys to the `social_auth_tokens` table.

- [ ] **Step 6: Seed initial tracked accounts** — Add Liam Ottley, Nate Herk, Tyler Germain, and competitor accounts to the `tracked_accounts` table via the Tracked Accounts page.

- [ ] **Step 7: Test the daily cron** — Manually trigger `/api/cron/daily` with the cron secret to verify the full pipeline works (scrape, analyze, generate, notify).

- [ ] **Step 8: Verify deployment**

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://your-app.vercel.app/api/cron/daily
```

Expected: JSON response with scraped and generated counts.

- [ ] **Step 9: Commit any final adjustments**

```bash
git add -A && git commit -m "feat: finalize deployment and configuration"
```

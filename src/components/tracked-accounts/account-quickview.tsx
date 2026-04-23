"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { TrackedAccount } from "@/types";

type ScrapedRow = {
  id: string;
  platform: string;
  title: string | null;
  content_summary: string | null;
  engagement_stats: Record<string, number> | null;
  url: string | null;
  scraped_at: string;
};

const PLATFORM_ORDER = ["instagram", "youtube", "twitter", "linkedin"] as const;
const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

export function AccountQuickView({ account, onClose }: { account: TrackedAccount | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [top, setTop] = useState<Record<string, ScrapedRow[]>>({});
  const [scraping, setScraping] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeProgress, setScrapeProgress] = useState<{ done: number; total: number } | null>(null);

  const loadTopPosts = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracked-accounts/${id}/top-posts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTop(data.top || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!account) return;
    setTop({});
    setScrapeError(null);
    loadTopPosts(account.id);
  }, [account, loadTopPosts]);

  async function scrapeAll() {
    if (!account) return;
    const handles = account.handles as Record<string, string>;
    const entries = Object.entries(handles).filter(([, v]) => v);
    if (entries.length === 0) {
      setScrapeError("No handles configured for this account.");
      return;
    }
    setScrapeError(null);
    setScrapeProgress({ done: 0, total: entries.length });
    for (let i = 0; i < entries.length; i++) {
      const [platform, handle] = entries[i];
      setScraping(platform);
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: account.id, platform, handle }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Scrape ${platform} failed`);
      } catch (e) {
        setScrapeError(`${platform}: ${e instanceof Error ? e.message : "failed"}`);
      }
      setScrapeProgress({ done: i + 1, total: entries.length });
    }
    setScraping(null);
    // Reload top posts with whatever we got
    await loadTopPosts(account.id);
    // Leave progress visible briefly so user sees the final state
    setTimeout(() => setScrapeProgress(null), 2500);
  }

  if (!account) return null;

  const handles = account.handles as Record<string, string>;

  return (
    <Modal isOpen={!!account} onClose={onClose} title={account.name}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-azen-text border-b border-azen-border pb-3">
          {Object.entries(handles).filter(([, v]) => v).map(([p, h]) => (
            <span key={p}>
              <span className="uppercase tracking-wider text-azen-text/70">{p}:</span>{" "}
              <span className="text-white">{h}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={scrapeAll}
            disabled={!!scraping}
            className="bg-azen-accent text-azen-bg px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-azen-accent/90 disabled:opacity-50 transition-colors"
          >
            {scraping ? `Scraping ${scraping}…` : "Scrape latest posts"}
          </button>
          {scrapeProgress && (
            <span className="text-[11px] text-azen-text">
              {scrapeProgress.done}/{scrapeProgress.total} platforms {scrapeProgress.done === scrapeProgress.total ? "done" : ""}
            </span>
          )}
        </div>
        {scrapeError && <div className="text-xs text-red-400">{scrapeError}</div>}

        {loading && <div className="text-xs text-azen-text">Loading top posts…</div>}
        {error && <div className="text-xs text-red-400">{error}</div>}

        {!loading && !error && Object.keys(top).length === 0 && (
          <div className="text-xs text-azen-text">No scraped posts yet. Run a scrape to populate.</div>
        )}

        {!loading && !error && PLATFORM_ORDER.filter((p) => top[p]?.length).map((platform) => (
          <div key={platform}>
            <div className="text-white text-xs font-semibold mb-2 flex items-center gap-2">
              {PLATFORM_LABELS[platform]}
              <span className="text-[10px] text-azen-text font-normal">top by engagement</span>
            </div>
            <div className="space-y-2">
              {top[platform].map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function PostCard({ post }: { post: ScrapedRow }) {
  const e = post.engagement_stats || {};
  return (
    <a
      href={post.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-azen-bg border border-azen-border rounded-md p-3 hover:border-azen-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="text-white text-xs font-medium line-clamp-2 flex-1">
          {post.title || post.content_summary?.slice(0, 80) || "Untitled"}
        </div>
        <div className="text-[10px] text-azen-text flex-shrink-0">
          {new Date(post.scraped_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </div>
      </div>
      {post.content_summary && (
        <div className="text-[11px] text-azen-text/80 line-clamp-2 mb-2">{post.content_summary}</div>
      )}
      <div className="flex gap-3 text-[10px] text-azen-text">
        {e.views ? <span>👁 {fmt(e.views)}</span> : null}
        {e.likes ? <span>♥ {fmt(e.likes)}</span> : null}
        {e.comments ? <span>💬 {fmt(e.comments)}</span> : null}
        {e.shares ? <span>↗ {fmt(e.shares)}</span> : null}
        {e.saves ? <span>⛉ {fmt(e.saves)}</span> : null}
      </div>
    </a>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

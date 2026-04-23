"use client";

import Link from "next/link";
import type { GeneratedContent, CarouselSlide, ReelScript } from "@/types";

type RecreatedPost = GeneratedContent & { carousel_slides?: CarouselSlide[]; reel_scripts?: ReelScript[] };

export function RecreatedTab({ posts }: { posts: RecreatedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-sm text-azen-text">
        No recreated posts yet. Open any tracked account → click &ldquo;Recreate&rdquo; on a top post to save one here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <RecreatedCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function RecreatedCard({ post }: { post: RecreatedPost }) {
  const slides = post.carousel_slides || [];
  const reel = post.reel_scripts?.[0];
  const isCarousel = post.content_type === "carousel";
  const isReel = post.content_type === "reel";

  return (
    <div className="bg-azen-card border border-azen-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          isReel ? "bg-purple-500/20 text-purple-300" :
          isCarousel ? "bg-azen-accent/20 text-azen-accent" :
          "bg-azen-border text-azen-text"
        }`}>
          {post.content_type}
        </span>
        <span className="text-[10px] text-azen-text uppercase">{post.status}</span>
      </div>

      <div>
        <div className="text-sm font-semibold text-white mb-1">{post.title}</div>
        {post.source_reference && (
          <a
            href={post.source_reference}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-azen-text underline decoration-dotted hover:text-azen-accent"
          >
            source: {post.source_reference.slice(0, 50)}{post.source_reference.length > 50 ? "…" : ""}
          </a>
        )}
      </div>

      {post.body && (
        <div className="text-xs text-white/80 line-clamp-4 whitespace-pre-wrap leading-relaxed">{post.body}</div>
      )}

      {isReel && reel?.hook && (
        <div>
          <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Hook</div>
          <div className="text-xs text-white/90 italic">&ldquo;{reel.hook}&rdquo;</div>
        </div>
      )}

      {isCarousel && slides.length > 0 && (
        <div>
          <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">Slides</div>
          <div className="text-[11px] text-white/80">
            {slides.sort((a, b) => a.slide_number - b.slide_number).slice(0, 3).map((s) => s.headline).filter(Boolean).join(" · ")}
            {slides.length > 3 && " …"}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-azen-border">
        <Link
          href={isReel
            ? `/instagram?account=personal&tab=reels`
            : isCarousel
              ? `/instagram?account=personal&tab=carousels`
              : `/instagram?account=personal`}
          className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90 text-center"
        >
          Open to edit
        </Link>
      </div>
    </div>
  );
}

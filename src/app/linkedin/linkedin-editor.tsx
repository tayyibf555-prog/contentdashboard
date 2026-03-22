"use client";

import { useState } from "react";
import { LinkedInPreview } from "@/components/linkedin/linkedin-preview";
import { HookVariants } from "@/components/linkedin/hook-variants";
import { ToneSelector } from "@/components/linkedin/tone-selector";
import { CaptionEditor } from "@/components/content/caption-editor";
import { HashtagManager } from "@/components/content/hashtag-manager";
import { PostDetails } from "@/components/content/post-details";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GeneratedContent } from "@/types";

export function LinkedInEditor({ posts }: { posts: GeneratedContent[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tone, setTone] = useState("Professional");
  const [hookIndex, setHookIndex] = useState(0);

  const current = posts[selectedIndex];

  if (!current) {
    return <p className="text-azen-text text-sm">No LinkedIn posts yet. Generate one to get started.</p>;
  }

  const charCount = (current.body || "").length;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Preview */}
      <div>
        <LinkedInPreview body={current.body || ""} account={current.account} />
        <div className="mt-4 text-center">
          <span className={`text-xs ${charCount > 3000 ? "text-red-400" : "text-azen-text"}`}>
            {charCount} / 3,000 characters
          </span>
        </div>
        {/* Post selector */}
        {posts.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {posts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelectedIndex(i); setHookIndex(0); }}
                className={`px-2 py-1 rounded text-[10px] ${
                  i === selectedIndex ? "bg-azen-accent text-azen-bg" : "bg-azen-border text-azen-text"
                }`}
              >
                {p.title.slice(0, 25)}...
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Right: Editor */}
      <div>
        <Card>
          <ToneSelector selected={tone} onSelect={setTone} />
          <HookVariants
            hooks={[
              { text: "Default hook from the generated post", score: 8.5 },
            ]}
            selectedIndex={hookIndex}
            onSelect={setHookIndex}
          />
          <CaptionEditor caption={current.body || ""} onSave={() => {}} />
          <HashtagManager hashtags={current.hashtags || []} onUpdate={() => {}} />
          <PostDetails
            platform={current.platform}
            account={current.account}
            pillar={current.pillar}
            status={current.status}
            bestTime={current.best_time}
            contentType={current.content_type}
            sourceReference={current.source_reference}
          />
          <div className="flex gap-2 mt-4">
            <Button variant="primary">Approve</Button>
            <Button variant="secondary">Regenerate</Button>
            <Button variant="secondary">Repurpose</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

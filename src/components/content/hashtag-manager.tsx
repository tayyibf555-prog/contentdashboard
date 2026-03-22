"use client";

import { useState } from "react";

export function HashtagManager({
  hashtags,
  onUpdate,
}: {
  hashtags: string[];
  onUpdate: (tags: string[]) => void;
}) {
  const [newTag, setNewTag] = useState("");

  function addTag() {
    if (!newTag.trim()) return;
    const tag = newTag.replace(/^#/, "").trim();
    if (tag && !hashtags.includes(tag)) {
      onUpdate([...hashtags, tag]);
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    onUpdate(hashtags.filter((t) => t !== tag));
  }

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Hashtags</div>
      <div className="flex gap-1 flex-wrap mb-2">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="bg-azen-border text-azen-accent px-2 py-0.5 rounded text-[10px] flex items-center gap-1"
          >
            #{tag}
            <button onClick={() => removeTag(tag)} className="text-azen-text hover:text-white ml-0.5">
              x
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="Add hashtag..."
          className="flex-1 bg-azen-bg border border-azen-border rounded-md px-2 py-1 text-white text-[11px] placeholder:text-azen-text focus:outline-none focus:border-azen-accent"
        />
        <button
          onClick={addTag}
          className="text-azen-accent text-[11px] font-semibold hover:underline"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

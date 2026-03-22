"use client";

import { useState } from "react";

export function ThreadBuilder({
  tweets,
  onUpdate,
}: {
  tweets: string[];
  onUpdate: (tweets: string[]) => void;
}) {
  const [localTweets, setLocalTweets] = useState(tweets);

  function updateTweet(index: number, value: string) {
    const updated = [...localTweets];
    updated[index] = value;
    setLocalTweets(updated);
    onUpdate(updated);
  }

  function addTweet() {
    const updated = [...localTweets, ""];
    setLocalTweets(updated);
    onUpdate(updated);
  }

  function removeTweet(index: number) {
    if (localTweets.length <= 1) return;
    const updated = localTweets.filter((_, i) => i !== index);
    setLocalTweets(updated);
    onUpdate(updated);
  }

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Thread</div>
      <div className="space-y-3">
        {localTweets.map((tweet, i) => (
          <div key={i} className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-azen-accent text-[10px] font-semibold">Tweet {i + 1}</span>
              <span className={`text-[10px] ${tweet.length > 280 ? "text-red-400" : "text-azen-text"}`}>
                {tweet.length}/280
              </span>
              {localTweets.length > 1 && (
                <button
                  onClick={() => removeTweet(i)}
                  className="text-azen-text hover:text-red-400 text-[10px] ml-auto"
                >
                  Remove
                </button>
              )}
            </div>
            <textarea
              value={tweet}
              onChange={(e) => updateTweet(i, e.target.value)}
              rows={3}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none focus:border-azen-accent"
            />
            {i < localTweets.length - 1 && (
              <div className="absolute left-4 -bottom-3 w-px h-3 bg-azen-border" />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addTweet}
        className="text-azen-accent text-[11px] font-semibold mt-3 hover:underline"
      >
        + Add Tweet
      </button>
    </div>
  );
}

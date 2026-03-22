"use client";

import { useState } from "react";

export function CaptionEditor({
  caption,
  onSave,
}: {
  caption: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(caption);

  return (
    <div className="mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">Caption</div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        rows={6}
        className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none focus:border-azen-accent"
      />
      <div className="text-azen-text text-[10px] mt-1">{value.length} characters</div>
    </div>
  );
}

"use client";

import { useState } from "react";

type ReelScriptData = {
  hook: string | null;
  body_script: string | null;
  cta: string | null;
  on_screen_text: string[];
  estimated_duration: string | null;
  recording_notes: string | null;
};

const SECTION_COLORS = {
  hook: "#ff7675",
  body: "#74b9ff",
  cta: "#fdcb6e",
  notes: "#55efc4",
};

export function ReelScriptEditor({
  script,
  onUpdate,
}: {
  script: ReelScriptData;
  onUpdate: (script: ReelScriptData) => void;
}) {
  const [data, setData] = useState(script);

  function updateField(field: keyof ReelScriptData, value: string) {
    const updated = { ...data, [field]: value };
    setData(updated);
    onUpdate(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="bg-azen-accent/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
          {data.estimated_duration || "30s"} Reel
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.hook }} />
          <span className="text-white text-[11px] font-semibold">Hook (0:00 - 0:05)</span>
        </div>
        <textarea
          value={data.hook || ""}
          onChange={(e) => updateField("hook", e.target.value)}
          rows={2}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.hook, borderLeftWidth: 3 }}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.body }} />
          <span className="text-white text-[11px] font-semibold">Body (0:05 - 0:25)</span>
        </div>
        <textarea
          value={data.body_script || ""}
          onChange={(e) => updateField("body_script", e.target.value)}
          rows={4}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.body, borderLeftWidth: 3 }}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.cta }} />
          <span className="text-white text-[11px] font-semibold">CTA (0:25 - 0:30)</span>
        </div>
        <textarea
          value={data.cta || ""}
          onChange={(e) => updateField("cta", e.target.value)}
          rows={2}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.cta, borderLeftWidth: 3 }}
        />
      </div>

      {data.on_screen_text && data.on_screen_text.length > 0 && (
        <div>
          <div className="text-azen-text text-[11px] uppercase tracking-wider mb-2">On-Screen Text</div>
          <div className="flex gap-1.5 flex-wrap">
            {data.on_screen_text.map((text, i) => (
              <span
                key={i}
                className="bg-azen-border text-white px-2 py-1 rounded text-[10px]"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.recording_notes && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.notes }} />
            <span className="text-white text-[11px] font-semibold">Recording Notes</span>
          </div>
          <div
            className="bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-azen-text text-[11px] leading-relaxed"
            style={{ borderLeftColor: SECTION_COLORS.notes, borderLeftWidth: 3 }}
          >
            {data.recording_notes}
          </div>
        </div>
      )}
    </div>
  );
}

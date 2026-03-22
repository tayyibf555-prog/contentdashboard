"use client";

import { useState } from "react";

type BodySection = {
  title: string;
  content: string;
  start_time: string;
  end_time: string;
};

type ScriptData = {
  hook: string | null;
  intro: string | null;
  body_sections: BodySection[];
  cta: string | null;
};

const SECTION_COLORS: Record<string, string> = {
  hook: "#ff7675",
  intro: "#00d4aa",
  body: "#74b9ff",
  cta: "#fdcb6e",
};

export function ScriptEditor({ script, onUpdate }: { script: ScriptData; onUpdate: (script: ScriptData) => void }) {
  const [data, setData] = useState(script);

  function updateField(field: keyof ScriptData, value: string) {
    const updated = { ...data, [field]: value };
    setData(updated);
    onUpdate(updated);
  }

  function updateSection(index: number, field: keyof BodySection, value: string) {
    const sections = [...data.body_sections];
    sections[index] = { ...sections[index], [field]: value };
    const updated = { ...data, body_sections: sections };
    setData(updated);
    onUpdate(updated);
  }

  return (
    <div className="space-y-4">
      {/* Hook */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.hook }} />
          <span className="text-white text-[11px] font-semibold">Hook (0:00 - 0:30)</span>
        </div>
        <textarea
          value={data.hook || ""}
          onChange={(e) => updateField("hook", e.target.value)}
          rows={3}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.hook, borderLeftWidth: 3 }}
        />
      </div>
      {/* Intro */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.intro }} />
          <span className="text-white text-[11px] font-semibold">Intro (0:30 - 1:30)</span>
        </div>
        <textarea
          value={data.intro || ""}
          onChange={(e) => updateField("intro", e.target.value)}
          rows={3}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.intro, borderLeftWidth: 3 }}
        />
      </div>
      {/* Body Sections */}
      {data.body_sections.map((section, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.body }} />
            <span className="text-white text-[11px] font-semibold">
              {section.title} ({section.start_time} - {section.end_time})
            </span>
          </div>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(i, "content", e.target.value)}
            rows={4}
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
            style={{ borderLeftColor: SECTION_COLORS.body, borderLeftWidth: 3 }}
          />
        </div>
      ))}
      {/* CTA */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SECTION_COLORS.cta }} />
          <span className="text-white text-[11px] font-semibold">CTA / Outro</span>
        </div>
        <textarea
          value={data.cta || ""}
          onChange={(e) => updateField("cta", e.target.value)}
          rows={3}
          className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none"
          style={{ borderLeftColor: SECTION_COLORS.cta, borderLeftWidth: 3 }}
        />
      </div>
    </div>
  );
}

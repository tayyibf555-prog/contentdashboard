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

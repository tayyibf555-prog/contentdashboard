import { NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/claude/client";

export async function POST(request: Request) {
  const { contentType, pillar } = await request.json();

  let prompt: string;

  if (contentType === "reddit_post") {
    prompt = `Generate 5 Reddit post topic ideas for @tayyib.ai (Tayyib, founder of Azen AI — a UK AI agency that builds custom AI solutions for SMBs).

Each topic should be a specific client story, project outcome, or revenue milestone that would resonate with entrepreneurs and founders on Reddit. UK context, £ figures.

Rules:
- Each topic follows the viral Reddit title formula: specific £ figure or result + curiosity trigger
- Under 12 words, honest, not clickbaity
- Must be something Tayyib could plausibly have done as an AI agency founder
- No generic topics like "my AI journey" or "lessons from entrepreneurship"
- Examples: "Built an AI hiring tool and landed 3 clients in a week" / "Client saved £8k/month after automating their invoicing with AI" / "How a £2k project turned into a £40k/yr retainer"

Respond in JSON: { "topics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"] }`;
  } else if (contentType === "story") {
    prompt = `Generate 5 LinkedIn storytelling post topic ideas for @tayyib.ai (personal brand of Tayyib, founder of Azen AI — cybersecurity dropout who left university in his third year to build an AI agency).

Each topic should be a specific, real-life moment or turning point that could anchor a personal story post. Think: pivots, costly mistakes, near-misses, uncomfortable realisations, things no one told him, decisions that looked wrong but weren't.

Content pillar hint: ${pillar}

Rules:
- Each topic is one short sentence (max 12 words) that names the specific moment or tension — not a vague theme
- Must be something Tayyib could plausibly have lived
- Should feel like a real story waiting to be told, not a LinkedIn cliché
- No generic topics like "my entrepreneurship journey" or "the importance of mindset"

Respond in JSON: { "topics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"] }`;
  } else {
    prompt = `Generate 5 LinkedIn value post topic ideas for @tayyib.ai (personal brand of Tayyib, founder of Azen AI — an AI agency for small to medium businesses).

Each topic should be a specific contrarian angle, system teardown, or mistake-list that could anchor a value post with a lead magnet CTA. UK audience, SMB-focused.

Content pillar hint: ${pillar}

Rules:
- Each topic is one short sentence (max 12 words) that names the specific claim or system
- Must be contrarian or counter-intuitive enough to stop the scroll
- Should generate a clear keyword (e.g. "STACK", "VAULT", "BLUEPRINT") naturally
- No generic topics like "how AI can help your business" or "tips for productivity"

Respond in JSON: { "topics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"] }`;
  }

  try {
    const raw = await generateWithClaude(
      "You are a LinkedIn content strategist specialising in personal brand and conversion-driven posts.",
      prompt,
      { model: "haiku", maxTokens: 512 }
    );
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
    return NextResponse.json({ topics: parsed.topics || [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

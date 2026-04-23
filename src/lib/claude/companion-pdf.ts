import { generateWithClaude, extractJSON } from "./client";

export type PlaybookFrameworkNode = { label: string; number: number };

export type Playbook = {
  title: string;
  subtitle: string;
  keyword: string;            // the UPPERCASE comment keyword the CTA promised
  overview: string;           // 2-3 short paragraphs
  sections: Array<{
    number: number;
    title: string;
    body: string;             // 200-400 words of real depth
    example?: string;         // optional concrete example
    action: string;           // one concrete next step
  }>;
  framework_type: "sequential" | "none";
  framework_nodes: PlaybookFrameworkNode[];
  outro: string;              // 1-paragraph wrap
  cta: string;                // closing CTA
};

type Source = {
  contentType: "carousel" | "reel";
  title: string;
  body: string | null;
  hashtags: string[];
  // carousel slides OR reel script, serialised as a readable block
  details: string;
};

export async function generatePlaybook(source: Source, account: "personal" | "business"): Promise<Playbook> {
  const voice = account === "personal"
    ? "Tayyib — solo founder, AI + business, conversational and opinionated."
    : "Azen — AI agency, Audit/Educate/Deploy methodology, direct and founder-focused.";

  const systemPrompt = `You are a senior content strategist writing a LEAD-MAGNET PDF that expands a social post into a full playbook.

The social post promised that commenters who type a KEYWORD will get this PDF in their DMs. The PDF must deliver on that promise — deeper than the post, with real depth, examples and action steps.

Voice: ${voice}

Output ONE JSON object with these exact keys:

- title: punchy playbook title (6-10 words)
- subtitle: one-line subtitle
- keyword: the UPPERCASE keyword the CTA asks commenters to type (infer from the post — usually the single uppercase word in quotes)
- overview: 2-3 short paragraphs (~120 words) explaining who this is for and what they'll get
- sections: 5-7 items, each:
    - number: 1-based index
    - title: the section heading (short)
    - body: 200-400 words of real expansion of the corresponding idea in the post — not fluff
    - example: optional concrete mini-example (1-2 sentences)
    - action: one concrete action step
- framework_type: "sequential" if the post describes a numbered process (1 → 2 → 3), else "none"
- framework_nodes: if sequential, 3-7 nodes [{label, number}] capturing the flow; otherwise []
- outro: 1 short paragraph wrap
- cta: closing line (e.g. "If you want me to build this for you, DM me 'AUDIT'")

Rules:
- No emojis
- Concrete > vague
- Do NOT copy the post verbatim — expand it meaningfully
- If the post is a 5-step list, produce 5 sections that match the steps
- Action steps must be doable today, not aspirational`;

  const user = `SOURCE POST (${source.contentType}):

Title: ${source.title}
${source.body ? `Caption/Body:\n${source.body}\n` : ""}
Hashtags: ${source.hashtags.join(", ")}

DETAILS:
${source.details}

Produce the playbook JSON.`;

  const raw = await generateWithClaude(systemPrompt, user);
  return extractJSON(raw) as Playbook;
}

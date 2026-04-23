/**
 * Seed ~30 researched strategies into the strategies table.
 * Safe to run multiple times — skips rows whose (platform, account, title) already exists.
 *
 *   npx tsx scripts/seed-strategies.ts
 */
import { createClient } from "@supabase/supabase-js";

type Source = { title: string; url: string };
type StrategyInput = {
  platform: "instagram" | "linkedin" | "twitter" | "youtube";
  account: "personal" | "business" | "both";
  category: "hook" | "format" | "engagement" | "cadence" | "distribution" | "positioning";
  title: string;
  summary: string;
  when_to_use: string;
  how_to_apply: string[];
  example: string | null;
  why_it_works: string;
  sources: Source[];
};

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !KEY) throw new Error("Missing SUPABASE env vars");
const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

const SRC = {
  bufferAlgo: { title: "Buffer — 2026 Instagram Algorithm Guide", url: "https://buffer.com/resources/instagram-algorithms/" },
  hootsuite: { title: "Hootsuite — Instagram Algorithm 2026", url: "https://blog.hootsuite.com/instagram-algorithm/" },
  trueFuture: { title: "TrueFuture — Instagram Reels Reach 2026", url: "https://www.truefuturemedia.com/articles/instagram-reels-reach-2026-business-growth-guide" },
  postivB2B: { title: "Postiv AI — LinkedIn B2B 2026 Playbook", url: "https://postiv.ai/blog/linkedin-marketing-strategy-for-b-2-b" },
  postivExamples: { title: "Postiv AI — LinkedIn Post Examples 2026", url: "https://postiv.ai/blog/linkedin-post-example" },
  supergrowPersonal: { title: "Supergrow — LinkedIn Personal Branding 2026", url: "https://www.supergrow.ai/blog/linkedin-personal-branding" },
  linkBoostB2B: { title: "LinkBoost — LinkedIn B2B Lead Gen 2026", url: "https://blog.linkboost.co/linkedin-lead-generation-b2b-companies-2026/" },
  limelight: { title: "Limelight — LinkedIn Algorithm Changes 2026", url: "https://limelightmarketingsystems.com/2026/04/linkedin-algorithm-changes-2026-personal-branding-ai-visibility/" },
  teract: { title: "Teract — 70/30 Reply Strategy on X", url: "https://www.teract.ai/resources/grow-twitter-following-2026" },
  conbersa: { title: "Conbersa — How to Make a Viral Tweet 2026", url: "https://www.conbersa.ai/blog/how-to-make-a-viral-tweet" },
  postEverywhereX: { title: "Posteverywhere — How the X Algorithm Works 2026", url: "https://posteverywhere.ai/blog/how-the-x-twitter-algorithm-works" },
  stormy: { title: "Stormy AI — Twitter Viral Growth 2026", url: "https://stormy.ai/blog/viral-growth-customer-acquisition-twitter-2026-guide" },
  vugola: { title: "Vugola — YouTube Growth 2026", url: "https://www.vugolaai.com/blog/how-to-grow-youtube-channel" },
  viewsMachine: { title: "ViewsMachine — 7 YouTube Growth Strategies 2026", url: "https://blog.viewsmachine.com/youtube-growth-strategies-2026/" },
  pragmatic: { title: "Pragmatic — AI Marketing Case Studies", url: "https://www.pragmatic.digital/blog/ai-marketing-case-study-successful-campaigns" },
  designRush: { title: "DesignRush — AI in Digital Marketing Examples", url: "https://www.designrush.com/agency/digital-marketing/trends/artificial-intelligence-in-digital-marketing-examples" },
};

const STRATEGIES: StrategyInput[] = [
  // ─── INSTAGRAM / PERSONAL ─────────────────────────────────────────────────
  {
    platform: "instagram", account: "personal", category: "hook",
    title: "Two-line title-card cover",
    summary: "A carousel cover with ONE concept split across two lines — headline on top, accent word below in brand colour.",
    when_to_use: "Every educational carousel. It's the single highest-leverage cover format for AI creators right now.",
    how_to_apply: [
      "Headline: 1–4 words, white or primary text",
      "Accent word (line 2): 1–4 words in your accent colour",
      "Together they form a complete hook — e.g. 'Claude' / 'skills.'",
      "Never cram a full sentence into the headline — split it",
      "Use Playfair / Clash / other display serif for instant editorial feel",
    ],
    example: "Headline: 'Claude' — Accent: 'skills.'",
    why_it_works: "The scroll stops because the first word is huge and the second word creates curiosity. Pattern-interrupt covers have 3-second-hold rates above 60%, which boost reach 5–10× per Buffer's 2026 data.",
    sources: [SRC.bufferAlgo, SRC.trueFuture],
  },
  {
    platform: "instagram", account: "personal", category: "engagement",
    title: "Comment-keyword-for-DM mechanic",
    summary: "Final slide / reel CTA: 'Comment [KEYWORD] and I'll DM you the guide / step-by-step plan / playbook.'",
    when_to_use: "Every reel and carousel. Treat it as a mandatory ending.",
    how_to_apply: [
      "Pick one UPPERCASE keyword tied to the post topic (AI, PLAYBOOK, STACK, SCALE)",
      "Promise a specific deliverable by DM — a guide / playbook / template",
      "Max 12 words, no URLs",
      "Actually fulfil it — batch the DMs daily",
    ],
    example: "Comment 'PLAYBOOK' and I'll DM you the step-by-step implementation guide",
    why_it_works: "Comments are the strongest discoverability signal after 'sends per reach'. A keyword CTA generates high comment volume in the first hour, which the algorithm reads as relevance and boosts distribution.",
    sources: [SRC.bufferAlgo, SRC.hootsuite],
  },
  {
    platform: "instagram", account: "personal", category: "format",
    title: "POV talking-head reel with on-screen captions",
    summary: "Face-to-camera 20–30s reel where you deliver ONE tactical AI insight, with short text overlays reinforcing key beats.",
    when_to_use: "Weekly. This is the fastest way to build parasocial trust with a new audience.",
    how_to_apply: [
      "Hook (0–3s): pattern-interrupt claim or bold number",
      "Body (3–20s): one insight, delivered like you're texting a friend",
      "CTA (20–25s): comment-keyword (see that strategy)",
      "Text overlays: max 6 words per beat",
    ],
    example: "Hook: 'I just cut my content workflow from 6 hours to 30 minutes.'",
    why_it_works: "Reels get 2.35× more reach than static posts for accounts under 100k. Talking-head format wins because retention stays high — viewers bond with a face faster than with a text slide.",
    sources: [SRC.trueFuture, SRC.bufferAlgo],
  },
  {
    platform: "instagram", account: "personal", category: "format",
    title: "Save-bait listicle carousel",
    summary: "7–10 slide carousel structured as a numbered list ('5 AI tools I use daily', '7 Claude prompts for founders').",
    when_to_use: "When you want saves and sends — not just likes. Saves are now the strongest engagement signal after comments.",
    how_to_apply: [
      "Cover: number + outcome ('7 Claude prompts that…')",
      "One slide per item, each with headline + 2-3 line explanation",
      "Last slide: comment-keyword CTA for the full list as a PDF",
    ],
    example: "Cover: '5 AI Systems' / 'you need.' — then 5 content slides, then the CTA",
    why_it_works: "'Save' has eclipsed 'like' as the highest-value signal. Numbered lists create anticipation ('I want to see all 7') which extends dwell time, and readers save them to reference later.",
    sources: [SRC.bufferAlgo, SRC.hootsuite],
  },

  // ─── INSTAGRAM / BUSINESS ─────────────────────────────────────────────────
  {
    platform: "instagram", account: "business", category: "positioning",
    title: "Before / after client result carousel",
    summary: "Client's state before hiring you → specific intervention you made → measurable after-state, told as a 6-8 slide story.",
    when_to_use: "Once per week. Social proof is the #1 driver of inbound for AI agencies right now.",
    how_to_apply: [
      "Cover: 'How [client segment] cut X by Y% with AI' — no logos yet",
      "Slide 2: the problem (quote or screenshot if permitted)",
      "Slides 3–5: your method (Audit / Educate / Deploy)",
      "Slide 6: the number",
      "Final slide: CTA to the audit",
    ],
    example: "Cover: 'How a local service business cut response time by 87%.'",
    why_it_works: "Pragmatic's case study of 12 enterprise AI deployments showed social-proof content drives 3-5× the reply rates of generic educational posts. Prospects need to see the transformation not just the method.",
    sources: [SRC.pragmatic, SRC.designRush],
  },
  {
    platform: "instagram", account: "business", category: "format",
    title: "Methodology-framework carousel",
    summary: "Reusable carousel showing YOUR proprietary method (e.g. Audit → Educate → Deploy), one stage per slide.",
    when_to_use: "Monthly. Republish with fresh examples. This is how you get remembered as 'the people who do X that way'.",
    how_to_apply: [
      "Slide 1: name the framework",
      "Slides 2-N: one stage per slide with inputs, outputs, example",
      "Final slide: 'This is the same process we ran for [anonymous client] to achieve [result]'",
    ],
    example: "Azen: Audit → Educate → Deploy, 7 slides total",
    why_it_works: "Repetition builds recognition. Supergrow's personal branding research emphasises terminology consistency — 'if you want to be known for X, don't call it Y next week.' A named framework is your category-of-one positioning.",
    sources: [SRC.supergrowPersonal, SRC.postivB2B],
  },
  {
    platform: "instagram", account: "business", category: "format",
    title: "Objection-handling carousel",
    summary: "Pick one common prospect objection ('AI will replace my team', 'It's too expensive', 'I tried ChatGPT, didn't work'). Slide 1 states the objection, slides 2-N dismantle it.",
    when_to_use: "Bi-weekly. These posts preempt sales conversations and warm up leads before they DM.",
    how_to_apply: [
      "Cover: the objection verbatim, in quotes",
      "Slide 2: why people think this",
      "Slides 3-5: evidence, framing, client story",
      "Slide 6: reframe + CTA",
    ],
    example: "'AI will replace my customer support team.' — 6 slides reframing it as 'AI handles 80%, your team handles the 20% that closes deals.'",
    why_it_works: "Addressing objections publicly shortens the sales cycle. Prospects save these and send them to stakeholders ('here's why AI isn't what you think'), which boosts sends-per-reach — the single strongest distribution signal.",
    sources: [SRC.bufferAlgo, SRC.pragmatic],
  },
  {
    platform: "instagram", account: "business", category: "format",
    title: "Live tool-demo reel",
    summary: "30-second screen recording showing a real AI workflow you built for a client (or sanitised version), narrated by the founder.",
    when_to_use: "When you want to look technical and trustworthy. Once every 2 weeks.",
    how_to_apply: [
      "Hook: 'In 30 seconds, here's how [client] automates [painful task]'",
      "Screen recording 4× speed with voiceover",
      "Final frame: the outcome (time saved, cost saved, volume handled)",
      "CTA: 'DM AUDIT to see if this works for your business'",
    ],
    example: "30s clip of a Claude-powered email triage system handling 200 emails in 15 seconds",
    why_it_works: "Demo reels build technical credibility that photo carousels can't. Reels with strong 3-second holds outperform by 5-10×, and nothing holds attention like real software in motion.",
    sources: [SRC.trueFuture, SRC.designRush],
  },

  // ─── LINKEDIN / PERSONAL ──────────────────────────────────────────────────
  {
    platform: "linkedin", account: "personal", category: "format",
    title: "Personal story → business insight",
    summary: "Open with a short first-person story (2-3 lines), transition to the operating insight it taught you, close with one actionable takeaway.",
    when_to_use: "2-3× per week. The highest-reaching format on LinkedIn for personal accounts.",
    how_to_apply: [
      "Line 1: a concrete moment / scene (not a thesis)",
      "Line 2-3: what happened",
      "Blank line",
      "Middle: the insight — what you learned or realised",
      "Close: one-sentence actionable takeaway",
      "No hashtags clutter, max 3 tags at the end",
    ],
    example: "'Last Tuesday I lost a £40k deal because I sent the proposal too fast. Here's what I should have done instead…'",
    why_it_works: "Postiv's 2026 data: text-only personal-story posts have the highest dwell time and completion rate on LinkedIn. Personal posts get 5-7× more reach than company pages.",
    sources: [SRC.postivExamples, SRC.limelight],
  },
  {
    platform: "linkedin", account: "personal", category: "hook",
    title: "Contrarian hot take (narrative violation)",
    summary: "Challenge the conventional wisdom of your industry in line 1 — then spend the rest of the post defending it with evidence.",
    when_to_use: "Weekly. Builds a distinctive POV and filters out the audience that isn't for you.",
    how_to_apply: [
      "Line 1: a statement that most people in your niche would disagree with",
      "Back it up with 2-3 specific examples or data points",
      "Acknowledge the counter-argument ('I know this sounds extreme because…')",
      "End with a question to spark comments",
    ],
    example: "'Most AI agencies are selling a lie. The real moat isn't the model — it's the workflow your client can't reverse-engineer.'",
    why_it_works: "LinkedIn's 2026 algorithm weights meaningful comments heavily. Contrarian takes generate comment threads (people argue), which directly boosts distribution. Also: niche expertise gets wider reach than bland takes.",
    sources: [SRC.limelight, SRC.postivB2B],
  },
  {
    platform: "linkedin", account: "personal", category: "format",
    title: "Document (PDF) carousel for frameworks",
    summary: "Upload a multi-slide PDF (rendered in Canva, Figma, or even Google Slides) — LinkedIn displays it as swipeable slides inline.",
    when_to_use: "Once every 1-2 weeks for a framework, checklist, or playbook. It's the single highest-engagement format LinkedIn has.",
    how_to_apply: [
      "5-10 slides, 4:5 portrait aspect",
      "Cover slide: promise + one specific number or bracket",
      "One idea per slide, heavy typography",
      "Last slide: 'Save this' + a soft CTA to the original post",
    ],
    example: "'5 Frameworks Every AI Founder Should Know By Month 6' — 7 slides",
    why_it_works: "Postiv: PDF carousels consistently hit >20% engagement on LinkedIn in 2026. The format forces active engagement (swipe), which the algorithm reads as strong dwell time.",
    sources: [SRC.postivExamples, SRC.linkBoostB2B],
  },
  {
    platform: "linkedin", account: "personal", category: "engagement",
    title: "Reply-forward commenting",
    summary: "Spend 30 minutes a day leaving substantive comments on posts by people slightly larger than you in adjacent niches.",
    when_to_use: "Daily — ideally in the 30 minutes after your own post goes live.",
    how_to_apply: [
      "Target 5–10 creators 1 tier larger than you",
      "Comment must add a specific insight or counter-POV — not 'Great post!'",
      "Mention their argument, then add yours",
      "Don't pitch or drop a link",
    ],
    example: "Replying to a founder's post about hiring: 'Counter-take — I hired my first AI engineer by writing a 90-day project brief instead of a job spec, and got 40 inbound replies vs the 3 I got from a JD'",
    why_it_works: "Limelight's 2026 report: visibility on LinkedIn is shaped as much by commenting as by posting. Quality comments put you in front of the commenter's network. In 2026 comments are an integral part of professional presence.",
    sources: [SRC.limelight, SRC.supergrowPersonal],
  },

  // ─── LINKEDIN / BUSINESS ──────────────────────────────────────────────────
  {
    platform: "linkedin", account: "business", category: "positioning",
    title: "Founder-POV post (not company page)",
    summary: "Every business content push goes out under the founder's personal profile first, then optionally resharded by the company page.",
    when_to_use: "Always. Never lead with a company page post.",
    how_to_apply: [
      "Founder writes in first person ('I', 'we' if referring to the team)",
      "Tag the company page in the post body",
      "Company page reshares 2 hours later",
      "All client wins, case studies, industry takes go through the founder's feed",
    ],
    example: "'Just wrapped a 6-week deployment with a 20-person service business. Here's what the numbers looked like…'",
    why_it_works: "A founder with 10k followers posting 3×/week outperforms a company page with 50k followers posting the same frequency. Personal posts get 5-7× the organic reach of page posts — so the founder IS the distribution channel.",
    sources: [SRC.postivB2B, SRC.limelight],
  },
  {
    platform: "linkedin", account: "business", category: "format",
    title: "Metrics-forward B2B case study post",
    summary: "Lead with a bold number in line 1. Unpack the how across 6-10 lines. End with one industry lesson.",
    when_to_use: "Bi-weekly. These directly drive audit bookings.",
    how_to_apply: [
      "Line 1: THE number or result in bold framing",
      "Line 2: one-line context (industry, company size)",
      "Next: bulleted breakdown of inputs → intervention → outputs",
      "Close: the lesson a similar operator should take",
      "Soft CTA: 'DM me if this sounds relevant to your ops'",
    ],
    example: "'We saved a 20-person ops team 87 hours a week. Here's exactly how…'",
    why_it_works: "80% of B2B social leads come from LinkedIn (Postiv 2026). Metric-led hooks scroll-stop ICP buyers because the number IS the signal — they can't tell if it's exaggerated so they read to find out.",
    sources: [SRC.postivB2B, SRC.pragmatic],
  },
  {
    platform: "linkedin", account: "business", category: "format",
    title: "Methodology document-carousel",
    summary: "Your branded proprietary process, delivered as a PDF carousel on the founder's profile — reusable asset you can reshare every 6 weeks.",
    when_to_use: "Once every 6-8 weeks. This is an evergreen piece.",
    how_to_apply: [
      "Cover: name of the method + the outcome it produces",
      "One slide per stage with inputs / activities / outputs",
      "Include screenshots or sanitised examples from real work",
      "Final slide: 'We've run this 24 times. Here's when to book an audit.'",
    ],
    example: "'The Audit–Educate–Deploy playbook we run with every new AI client'",
    why_it_works: "Carousels hit the highest engagement rate on LinkedIn. Methodology content gets saved and forwarded internally ('forward to Bob, this is what they're proposing'), which is the highest-value share for B2B.",
    sources: [SRC.postivB2B, SRC.linkBoostB2B],
  },
  {
    platform: "linkedin", account: "business", category: "distribution",
    title: "Inbound-over-outbound strategy",
    summary: "Stop automated cold DMs. Invest exclusively in founder-led content + genuine manual outreach to people who've already engaged.",
    when_to_use: "As your entire sales motion on LinkedIn.",
    how_to_apply: [
      "Zero automation tools on the DM side",
      "Content-first: post 3×/week from the founder account",
      "Track who reacts / comments / saves your posts",
      "Reach out manually only to the engaged 20%",
    ],
    example: "After a case study post, DM the 5 ICP matches who reacted: 'Saw you liked the post — worth a 15 min chat?'",
    why_it_works: "LinkBoost 2026: automated cold DM tools now risk shadowbans and account restrictions. AI-powered inbound (content + engagement) consistently outperforms volume outbound for B2B AI agencies because the audience qualifies itself.",
    sources: [SRC.linkBoostB2B, SRC.postivB2B],
  },

  // ─── TWITTER / PERSONAL ───────────────────────────────────────────────────
  {
    platform: "twitter", account: "personal", category: "format",
    title: "Build-in-public thread",
    summary: "One thread a week documenting a specific thing you built, tried, or broke — with screenshots, specific numbers, and a lesson.",
    when_to_use: "Weekly. The highest-compounding format for an AI personal brand in 2026.",
    how_to_apply: [
      "Hook tweet (stands alone): 'Just shipped X' / 'Just lost £Y' / 'Built in 48 hours…'",
      "Tweets 2-5: the arc — problem, attempts, mistake, fix",
      "Include 2-3 screenshots",
      "Final tweet: the lesson + a CTA ('follow for more')",
    ],
    example: "'I built an AI customer-support agent in 48 hours using Claude + n8n. It now handles 200 tickets a day. Here's the exact stack + what broke 👇'",
    why_it_works: "Stormy 2026 case: a single build-in-public thread generated 127k views and 1,200 new followers in 48 hours. Specific numbers + screenshots + story = strong dwell time, which X amplifies 3× over single tweets.",
    sources: [SRC.stormy, SRC.postEverywhereX],
  },
  {
    platform: "twitter", account: "personal", category: "engagement",
    title: "70/30 reply strategy",
    summary: "Spend 70% of your X time replying to larger accounts in your niche. 30% on your own content.",
    when_to_use: "Every day. Replies are worth 150× likes for distribution.",
    how_to_apply: [
      "Curate a list of 20 accounts 5-50× your size in AI / founders / builder niche",
      "First 30 minutes of your day: reply with genuine, insightful responses",
      "Turn notifications on for that list so you're first in the replies",
      "Each reply should add a new angle — never 'Great take 🙌'",
    ],
    example: "When a 100k AI founder posts about Claude Code pricing, reply with your own data: 'I switched 3 months ago. Here's my actual monthly cost breakdown…'",
    why_it_works: "Teract 2026 data: replies are worth 150× likes in the algorithm because they signal active conversation. First-in, quality replies to big accounts put you in front of their entire audience for free.",
    sources: [SRC.teract, SRC.postEverywhereX],
  },
  {
    platform: "twitter", account: "personal", category: "format",
    title: "Screenshot + commentary",
    summary: "Screenshot another person's tweet / a Claude output / a dashboard / a GitHub diff — and quote-tweet or standalone tweet your own take.",
    when_to_use: "2-4× per week. Cheap to produce, high-signal format.",
    how_to_apply: [
      "Grab a screenshot of something worth commenting on",
      "Write 2-5 lines of your genuine reaction",
      "Don't dunk — add a substantive angle",
      "If quote-tweeting: add 1 new piece of information",
    ],
    example: "[screenshot of Claude output] + 'This is the exact kind of output that made me rip up my old prompting playbook. 3 things I noticed…'",
    why_it_works: "Screenshots have 30% higher engagement than text-only tweets on X 2026. Visual stops the scroll, commentary provides the signal.",
    sources: [SRC.postEverywhereX, SRC.conbersa],
  },
  {
    platform: "twitter", account: "personal", category: "hook",
    title: "Thread: hook + 3-7 body + summary",
    summary: "A rigid 5-9 tweet structure: hook (standalone), 3-7 body tweets (one idea each), summary tweet (recap + CTA).",
    when_to_use: "Every educational thread. Deviating from this structure is the #1 reason threads underperform.",
    how_to_apply: [
      "Tweet 1 (hook): bold claim, specific number, or pattern-interrupt — must stand alone",
      "Tweets 2-N (body): one clear point each, 280 chars max, no filler",
      "Final tweet: recap the key takeaway + CTA (follow, DM, link in bio)",
      "Avoid external links in the hook tweet",
    ],
    example: "Hook: 'I tested 12 AI agents in 2 weeks. Only 3 are worth paying for. Here's the list 👇'",
    why_it_works: "Conbersa 2026 thread research: 7 patterns appear in every viral thread — compelling hook, specific numbers (not vague claims), personal stories, challenging assumptions, actionable advice, and clear CTAs. Threads get 3× engagement over single tweets.",
    sources: [SRC.conbersa, SRC.stormy],
  },

  // ─── TWITTER / BUSINESS ───────────────────────────────────────────────────
  {
    platform: "twitter", account: "business", category: "positioning",
    title: "Case-study thread from the founder account",
    summary: "Narrate a client engagement as a thread from the founder's personal handle — never the company handle.",
    when_to_use: "Every 2 weeks. The most effective B2B-on-X format for AI agencies.",
    how_to_apply: [
      "Hook: the outcome number + the industry",
      "Body tweets 2-5: before-state, your intervention, inflection point",
      "Include 1-2 anonymised screenshots",
      "Summary: the repeatable pattern",
      "Soft CTA: 'If you're running [X], DM me.'",
    ],
    example: "'We cut a service business's email triage time by 87% in 3 weeks. Here's the exact stack + the mistake we almost made 👇'",
    why_it_works: "Pragmatic 2026 case-study research: AI case studies drive the highest reply rates and DM inbound on X. Founder accounts outperform company accounts because the algorithm favours person-to-person signal.",
    sources: [SRC.pragmatic, SRC.stormy],
  },
  {
    platform: "twitter", account: "business", category: "format",
    title: "Methodology thread",
    summary: "Unpack your proprietary process in one thread: how we think about AI deployments in N stages.",
    when_to_use: "Monthly — same method, fresh examples each time.",
    how_to_apply: [
      "Tweet 1: 'Most AI deployments fail because they skip step 2. Here's the N-stage process we use on every engagement 👇'",
      "Tweets 2-N+1: one stage per tweet with concrete example",
      "Final tweet: recap + invite to book the audit",
    ],
    example: "The Audit → Educate → Deploy thread — 5 tweets + a summary",
    why_it_works: "Methodology content is highly shareable in B2B — prospects forward the thread internally. This amplifies your reach through their network. Also: repeat posting of the same named framework builds recognition.",
    sources: [SRC.postivB2B, SRC.conbersa],
  },
  {
    platform: "twitter", account: "business", category: "engagement",
    title: "Client-quote → outcome → how",
    summary: "A 3-tweet mini-thread: tweet 1 is a verbatim client quote, tweet 2 is the outcome number, tweet 3 is how you got there.",
    when_to_use: "Every 3-4 weeks when a client gives you a strong quote.",
    how_to_apply: [
      "Tweet 1: '[Client name/anonymised] told us last week: [quote].'",
      "Tweet 2: 'Here's the number: [outcome].'",
      "Tweet 3: '3 things we did to get there…' followed by the list",
      "Anchor quote posts with a screenshot of the message if allowed",
    ],
    example: "'\"You saved our company £400k this quarter.\" — that's a quote from one of our clients on Tuesday. Here's what actually happened 👇'",
    why_it_works: "Social proof with a real quote bypasses the BS-filter buyers have for AI agency marketing. Multi-tweet format increases dwell and reply likelihood — both strong algorithm signals.",
    sources: [SRC.pragmatic, SRC.stormy],
  },

  // ─── YOUTUBE / PERSONAL ───────────────────────────────────────────────────
  {
    platform: "youtube", account: "personal", category: "format",
    title: "Tutorial: 'How I use [tool] for [outcome]'",
    summary: "8-15 min over-the-shoulder walkthrough of a specific AI workflow you actually use — not a generic tool review.",
    when_to_use: "Weekly. This is the bread-and-butter format for AI creators on YouTube.",
    how_to_apply: [
      "Title: '[Specific outcome] with [tool] (in [time])' — e.g. 'How I write a LinkedIn post in 5 min with Claude'",
      "Hook (0-30s): show the end result first, then rewind",
      "Body: screen recording with you voicing over every click",
      "End: 1 soft CTA, 1 link to the next video",
      "Keep it tight — aim for 80%+ retention over raw length",
    ],
    example: "'I built a Claude agent that rewrites my emails before I send them — here's the full setup (10 min)'",
    why_it_works: "ViewsMachine 2026: YouTube's algorithm is satisfaction-first. A shorter tutorial with 85% retention outranks a 20-min video where people drop off at 4 min. Specific outcomes stop the scroll in search.",
    sources: [SRC.viewsMachine, SRC.vugola],
  },
  {
    platform: "youtube", account: "personal", category: "format",
    title: "Tool comparison / tier list",
    summary: "'X vs Y vs Z' or 'I tested 12 AI [category] tools and ranked them' — decision-support video for viewers choosing which tool to buy.",
    when_to_use: "Monthly. High-intent search traffic, very shareable.",
    how_to_apply: [
      "Title includes the number and the comparison — specific is better ('5 AI video tools ranked for founders')",
      "Screen-record real usage of each tool for 60-90s",
      "Score each on 3-4 criteria (speed / price / output quality)",
      "End with your personal recommendation + link",
    ],
    example: "'I tested Claude Code, Cursor, and Windsurf for 30 days. Here's the one I kept.'",
    why_it_works: "Comparison videos rank for the highest-intent search queries ('X vs Y') and get 3-5× the CTR of generic 'best tools' videos. AI thumbnail analysis can boost CTR another 30%.",
    sources: [SRC.vugola, SRC.viewsMachine],
  },
  {
    platform: "youtube", account: "personal", category: "distribution",
    title: "Build-in-public vlog",
    summary: "10-20 min weekly vlog of what you built / shipped / broke that week. No polish — authenticity is the point.",
    when_to_use: "Weekly. This is your 'main channel' anchor content.",
    how_to_apply: [
      "Intro (0-1 min): 1 sentence on what you built this week",
      "Body: chronological walkthrough with screenshots",
      "Include the failures — what didn't work and why",
      "End with next week's experiment",
    ],
    example: "'Week 4 of building an AI agency in public — I got my first £5k client from LinkedIn. Here's what I posted.'",
    why_it_works: "Build-in-public series creates returning-viewer behaviour which YouTube rewards with shelf placement. Vugola 2026 research: consistent series outperform one-off videos by 40% in 90-day subscriber gain.",
    sources: [SRC.vugola, SRC.viewsMachine],
  },
  {
    platform: "youtube", account: "personal", category: "hook",
    title: "Retention-first short-form format",
    summary: "6-10 min videos designed for 80%+ retention, not 20-min videos designed for watch time.",
    when_to_use: "Default for every video unless the topic genuinely needs more runway.",
    how_to_apply: [
      "Cut 30% on the first rewatch — remove every beat that doesn't add a new idea",
      "No intro bumper, no 'before we begin, please subscribe'",
      "One idea per video, no tangents",
      "End abruptly right after the CTA",
    ],
    example: "'5 ways to prompt Claude better (8 minutes)' — not '5 ways to prompt Claude better (20 minutes because I padded it)'",
    why_it_works: "YouTube's 2026 algorithm weights satisfaction over raw watch time. 85% retention on 8 minutes beats 40% retention on 20 minutes. Shorter high-retention videos also play through to the next suggestion more often.",
    sources: [SRC.viewsMachine, SRC.vugola],
  },

  // ─── YOUTUBE / BUSINESS ───────────────────────────────────────────────────
  {
    platform: "youtube", account: "business", category: "positioning",
    title: "Long-form client case study",
    summary: "15-25 min documentary-style video walking through a client engagement end-to-end with the client on camera.",
    when_to_use: "Quarterly. These become your most powerful sales assets.",
    how_to_apply: [
      "Client must appear on camera (or audio at minimum)",
      "Structure: context → problem → approach → deployment → outcome",
      "Include real numbers wherever permitted",
      "End: clear invite to book an audit call",
      "Timestamp the video so prospects can jump to their use-case",
    ],
    example: "'How we deployed AI for a 40-person service business — full playbook + Q&A with the founder'",
    why_it_works: "Long-form case studies drive the highest lead quality for B2B AI agencies. Pragmatic 2026: case-study content generates 3-5× the audit bookings of general thought-leadership videos.",
    sources: [SRC.pragmatic, SRC.designRush],
  },
  {
    platform: "youtube", account: "business", category: "format",
    title: "Industry-specific playbook video",
    summary: "'The AI playbook for [specific industry]' — deep, 20-30 min video tailored to one vertical your agency serves.",
    when_to_use: "Every 6-8 weeks. One per ICP segment you're targeting.",
    how_to_apply: [
      "Pick ONE industry (real estate agents, law firms, plumbers, coaches)",
      "Title uses the industry name explicitly for SEO",
      "Structure: top 5 AI use-cases for that industry, ranked by ROI",
      "Demo each one live on screen",
      "CTA: free audit scoped to that industry",
    ],
    example: "'The complete AI playbook for real estate agents (2026 edition)'",
    why_it_works: "Industry-specific content ranks for long-tail search with high buyer intent. A prospect searching 'AI for real estate agents' is 10× closer to a buy than one searching 'AI tools'. YouTube rewards niche relevance in 2026.",
    sources: [SRC.viewsMachine, SRC.pragmatic],
  },
  {
    platform: "youtube", account: "business", category: "distribution",
    title: "Client expert-interview",
    summary: "30-45 min conversation with a client (or industry expert) about how they use AI — you host, they're the expert.",
    when_to_use: "Monthly. Builds both authority and inbound pipeline.",
    how_to_apply: [
      "Invite a client, a prospect, or a respected industry operator",
      "Pre-show: send 5-7 questions so they prep answers",
      "Record as a video podcast — two cameras if possible",
      "Clip into 5-10 shorts for IG/TikTok/LinkedIn",
      "Post the full episode on YouTube + transcribe for blog/newsletter",
    ],
    example: "'How [client founder] uses AI to run a £2m agency with 4 people — full interview'",
    why_it_works: "Interviews cross-leverage the guest's audience to yours. They also produce 5-10× repurposable content per hour of recording — a single interview becomes a week of content across every platform.",
    sources: [SRC.vugola, SRC.pragmatic],
  },
];

async function main() {
  console.log(`Seeding ${STRATEGIES.length} strategies into ${URL_}`);
  const { data: existing } = await supabase
    .from("strategies")
    .select("platform, account, title");
  const seen = new Set((existing || []).map((r) => `${r.platform}|${r.account}|${r.title}`));

  let inserted = 0;
  let skipped = 0;
  for (const s of STRATEGIES) {
    const key = `${s.platform}|${s.account}|${s.title}`;
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    const { error } = await supabase.from("strategies").insert(s);
    if (error) {
      console.warn(`  ! ${s.platform}/${s.account} "${s.title}": ${error.message}`);
      continue;
    }
    console.log(`  ✓ ${s.platform}/${s.account}: ${s.title}`);
    inserted++;
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped} (already existed).`);
}

main().catch((e) => { console.error(e); process.exit(1); });

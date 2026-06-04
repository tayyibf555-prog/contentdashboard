// Shared Reddit-post generation prompt + viral post bank.
// Used by both the generate route and the regenerate action so the two never drift.

// Viral reference posts. These are STYLE references only — the model must match
// their structure, length, specificity and authentic voice, but must NEVER reuse
// their facts, names, numbers, clients, follower counts or press features (none of
// these are Tayyib's). They belong to other creators (e.g. Ritesh Verma).
export const REDDIT_POST_BANK = `--- EXAMPLE 1 ---
Title: I Sold an AI Business (in-a-box) for $1,500
Body: This is a pretty cool way to sell an AI business (or any business) that many people are not talking about. With this huge boom that is the "AI gold rush", I've noticed a ton of business owners from ecom, health, tech, etc. are wanting to start a second business centered around AI...
(Long, casual case study. Specific numbers, an honest "but then it hit me" turn, an admitted modest result — "only 2 said yes haha" — and a broader lesson at the end. No pitch.)

--- EXAMPLE 2 ---
Title: Made $11,000 from first client in 2 months
Body: I recently was approached by a client through Youtube who ran a pretty big ecom business for vacuums... He asked me if I could find winning ads of competitors, duplicate them with AI, and run them at scale with Meta ads. To be honest, I did not know if it was possible... This was the hardest part though. I mean I spent nearly 4 weeks on just this part alone. I had promised 3 weeks but it took 6...
(Honest about the struggle and over-running the timeline, names specific tools — Veo 3, Sora 2, n8n — admits spending $500 of own money on trial and error. Ends on a reflective note about AI's real limits.)

--- EXAMPLE 3 ---
Title: I Developed a smart Agent for $150,000
Body: This is a case study you have never seen. I have been documenting my journey on Youtube... an agent is a program that can do a task on the internet by itself... I posted a video that got 250,000 views and because of it, a bunch of requests... payments range from $100/mo - $700/mo and within 8 months we crossed nearly $70,000 in profits...
(Explains jargon plainly — "to clear things up, an agent is...". Concrete revenue range, soft confidence, ends on "putting yourself out there leads to opportunities".)

--- EXAMPLE 4 ---
Title: I was featured on Business Insider
Body: ...the article went viral and a ton of business owners emailed me asking me to create AI agents... After about 15 calls in one week, I secured a couple of low-mid 5 figure deals... I also got a lot of questions asking me if people's jobs were in jeopardy... It's a bit scary but I can't bite the hand that feeds me...
(Opens a loop, leans into a slightly controversial honest take on jobs + ethics, asks the community for their thoughts at the end to drive comments.)

--- EXAMPLE 5 ---
Title: Built AI System for dental clinics
Body: Hi there, my name is Ritesh Verma and I have been building automation tools for nearly 6 years... I recently built an AI system that helps dentists convert more web traffic to paying customers... I made a video documenting the process...
(Short and direct. Clear niche, clear outcome, light "let me know what you think" close.)

--- EXAMPLE 6 ---
Title: Added $2,000/mo profit to my Saas overnight
Body: Here's a great example of how a simple add-on can make your business more money, literally overnight... businesses sometimes did not want to setup multiple Instagram accounts, proxies, track reply rates... So my partner and I decided... why not just do it for them right?... Within literally a DAY, a meeting was booked...
(Frames a single repeatable insight — "people pay to use, and pay more for you to do it for them". One concrete mechanism, one fast result.)

--- EXAMPLE 7 ---
Title: Paid $3k for an AI Agent that could run payroll
Body: Hi everyone, I am a content creator and agent developer... a program manager asked me to create an AI Agent that could run payroll... Now, this may seem simple at first. But then you dig into it... It took me writing over 15 prompts, 5 hours testing... while the agent worked flawlessly on my computer, it kept crashing on my client's... sometimes the hardest part is setup...
(Structured around explicit lessons — "lesson 1... lesson 2: AI is not as smart as you think". Very honest about debugging pain. Warm, human, ends on a life lesson.)

--- EXAMPLE 8 ---
Title: My AI Agent crossed $9k/mo in revenue (ask me anything)
Body: Hi there! I am a content creator and avid developer who recently scaled his AI scheduling agent to over $9k MRR... I charge a subscription of $500/mo... the riches are in the niches!... (1) be your user's best friend (2) referrals are your friend (3) don't overdo the AI (4) app is best...
(Numbered, genuinely useful takeaways for the target reader. Invites questions in the comments — an AMA-style engagement hook.)`;

const SUBREDDITS =
  "r/entrepreneur, r/SaaS, r/smallbusiness, r/startups, r/automation, r/nocode, r/webdev, r/ArtificialIntelligence, r/AIToolsForBusiness";

/**
 * Build the Reddit-post generation prompt.
 * - direction: optional topic/story direction to base the post on.
 * - differentAngleFrom: if set (regeneration), produce a fresh angle on this title.
 */
export function buildRedditPrompt(opts: { direction?: string; differentAngleFrom?: string } = {}): string {
  const { direction, differentAngleFrom } = opts;

  const intent = differentAngleFrom
    ? `Rewrite a Reddit post with a COMPLETELY DIFFERENT story angle on this topic: "${differentAngleFrom}". Do not repeat the previous framing.`
    : `Write a Reddit post for @tayyib.ai.${direction ? `\nTopic / story direction: ${direction}` : ""}`;

  return `${intent}

WHO YOU ARE: Tayyib, founder of Azen AI — an agency that builds custom AI solutions for businesses. Real background you may draw on: you studied cybersecurity and left in your third year to build Azen AI. Write in first person as Tayyib.

HONESTY RULES (critical):
- Use ONLY Tayyib's real story and Azen AI. NEVER fabricate credentials — no invented press features ("featured on Business Insider"), no fake follower counts, no made-up named clients, no awards you don't have.
- The example posts below are STYLE references from OTHER creators. Match their voice, structure, length and specificity — but never reuse their facts, names, numbers, clients or credentials.

NUMBERS & CURRENCY:
- Always be concrete with numbers (revenue, project fees, hours saved, MRR, timeframes) — never vague.
- No fixed currency: use whatever currency naturally fits the story. Keep figures realistic for an AI agency working with businesses.

TITLE FORMULA — the title must:
- Mention a specific, significant result (a figure, timeframe, or concrete achievement)
- Inspire curiosity — the reader wonders "how did they do that?"
- Speak to a target-audience goal or a relatable pain of founders/business owners
- Be under 12 words and feel honest, not clickbaity

BODY — 6 parts, flowing naturally with NO section headers, blank lines between sections:

1. INTRODUCTION (1-2 short paragraphs) — introduce the characters of the story (yourself, the client/situation). Casual, like telling a friend. Who are you, who is the client (industry, rough size)?
2. THE PROBLEM (1 paragraph) — the specific, concrete problem recognised. ("Spending 20 hours a week manually processing invoices", not "an efficiency issue".)
3. YOUR FEELINGS (2-4 lines) — your honest personal reaction: doubt, excitement, curiosity. Short sentences. This is what makes it feel human, not AI-generated.
4. SOLUTION IDEA (1 paragraph) — the solution that came to mind and the plan to make it happen.
5. BUILDING THE SOLUTION (1-2 paragraphs) — the real challenges and obstacles building it. At least one thing that went wrong or took longer than expected, and how you got past it. Mention tools if relevant (n8n, Claude, Zapier, Make). Do not skip the struggle.
6. END RESULT (1 paragraph) — the concrete results (figures, hours saved, clients, MRR). This is how you sell without selling. End on a soft lesson or insight. No direct pitch.

STYLE RULES:
- Conversational first person — write like a real person, not a marketer.
- Match the LENGTH and DEPTH of the examples below (typically 300-700 words) — detailed and specific, not a thin summary.
- Short paragraphs (2-4 lines max).
- Include at least one thing that went wrong or was harder than expected.
- A little dry humour is welcome where natural (the examples use the occasional "haha").
- No hard pitch, no "DM me", no explicit CTA at the end. An "ask me anything"-style invitation to comment is fine when it fits.
- No emojis.
- Suggest the single best subreddit from: ${SUBREDDITS}

STYLE REFERENCE POSTS (match the voice, structure, length and specificity — NEVER reuse their facts, names, numbers or credentials):
${REDDIT_POST_BANK}

Respond in JSON:
{
  "title": "the Reddit post title",
  "body": "the full post body — all 6 parts flowing naturally, no section headers, blank lines between sections",
  "subreddit": "r/entrepreneur"
}`;
}

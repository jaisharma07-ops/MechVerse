import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

/**
 * System prompts — the only place we shape the model's voice and rigor.
 * Three principles, applied across every prompt:
 *   1. ACCURACY OVER FLUENCY. Hallucinations are the failure mode. Whenever
 *      the model isn't sure, it must say so explicitly rather than invent.
 *   2. GROUND IN PROVIDED CONTEXT. When the gateway injects LIVE WEB
 *      CONTEXT, prefer those snippets over training-time memory and cite
 *      them by domain.
 *   3. EVERY NUMBER NEEDS A SOURCE. Specs, dates, prices — if it's a
 *      number, name the source domain inline. If no source, omit it.
 */

const personaTagline =
  "MachineVerse — the world's most knowledgeable, conversational guide to every machine and mode of transport.";

const accuracyDirective = `ACCURACY RULES (non-negotiable)
- Treat any "LIVE WEB CONTEXT" block as primary evidence. Cite by domain (e.g. "per wikipedia.org").
- If web context contradicts your training memory, trust the web context — it's fresher.
- For every numeric spec (top speed, range, weight, price, year), name the source domain inline. If you have no source, write "not verified" instead of guessing.
- Manufacturers, model names and years must be exact. If unsure of a year, say "early-2010s" rather than fabricate "2013".
- If the user's question is ambiguous, ask for one clarifying detail before answering.
- If the topic genuinely isn't covered by your knowledge AND no web context was given, say "I don't have reliable information on that — try a more specific query so I can search for it" instead of bluffing.
- Never invent quotes, never invent URLs, never invent statistics.`;

export function chatSystemPrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  const focus =
    category === "all"
      ? "any mode of transport: cars, motorcycles, aircraft, ships, trains, buses, trucks, and experimental future vehicles."
      : `${label.toLowerCase()} specifically — but you can briefly compare across categories when it adds insight.`;

  return `${personaTagline}

Your expertise covers history, engineering, specifications, manufacturers, culture, regulation, and the future of transport.
You are warm, precise, and confident.

CURRENT MODE: ${label}
The user is exploring ${focus}

${accuracyDirective}

RESPONSE STYLE
- Open with a one-sentence direct answer.
- For any structured content — vehicle specs, comparisons, performance numbers, timelines, options, pros vs cons — RENDER IT AS A GFM MARKDOWN TABLE. Tables render natively in our chat UI (mobile scrolls horizontally, desktop expands). Never describe a spec list in prose if it fits in a table.
- Table format example for a single vehicle:
    | Spec | Value |
    |------|------:|
    | Top speed | 380 km/h (per wikipedia.org) |
    | 0–100 km/h | 2.0 s |
    | Engine | 8.3L V16 hybrid |
- Table format example for a comparison:
    | Metric | Vehicle A | Vehicle B |
    |--------|----------:|----------:|
    | Top speed | 380 km/h | 410 km/h |
    | Range | 540 km | 420 km |
- After the table, add 1–2 short paragraphs of *context* — origin story, engineering insight, cultural impact — anything that the table doesn't convey.
- When the answer isn't structured (e.g. open-ended history or "explain how it works"), use short paragraphs and **bold** for key terms instead of a table.
- Cite sources inline by domain (e.g. "per wikipedia.org") in the table cells when a number is non-obvious.
- Keep responses under ~250 words unless the user explicitly asks for depth.

FOLLOW-UP SUGGESTIONS
At the very end of every response, append a JSON block exactly in this format on its own line:
<suggestions>["Question 1", "Question 2", "Question 3"]</suggestions>
- Generate 3 to 4 short, specific follow-ups that build on the conversation pivot.
- Suggestions must be questions or topics the user can click to explore next.
- Never prefix the suggestions with prose; only the tagged JSON.`;
}

export function comparePrompt(a: string, b: string): string {
  return `Compare ${a} versus ${b} factually and objectively.

${accuracyDirective}

Return ONLY a JSON object matching this TypeScript shape, no markdown fences:
{
  "vehicleA": {
    "name": string,
    "type": string,
    "manufacturer": string,
    "yearIntroduced": string,
    "topSpeed": string,
    "range": string,
    "price": string,
    "weight": string,
    "pros": string[],
    "cons": string[],
    "summary": string,
    "imageQuery": string
  },
  "vehicleB": { same shape as vehicleA },
  "verdict": string
}

Rules:
- "imageQuery" is a 2-4 word search query suitable for Wikimedia (e.g. "Tesla Model S Plaid").
- Use plain strings for numeric fields and include the unit (e.g. "322 km/h").
- If a spec is not verified, set the field to "not verified" rather than guessing.
- "pros" and "cons" should each have 3-4 entries, factual not editorial.
- "verdict" is a single-paragraph recommendation calling out who each vehicle is best for, grounded in the specs above.`;
}

export function timelinePrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  const scope =
    category === "all"
      ? "all modes of mechanized transport across history"
      : label.toLowerCase();

  return `List the 12 most pivotal milestones in the history of ${scope}.

${accuracyDirective}

Return ONLY a JSON object, no markdown fences, with this shape:
{
  "milestones": [
    {
      "year": number,
      "title": string,
      "description": string,
      "significance": "high" | "medium" | "low"
    }
  ]
}

Rules:
- Sort milestones chronologically.
- Include diverse turning points: invention, mass adoption, record-breakers, regulatory shifts, cultural moments.
- "description" must be 1-2 sentences, factually accurate. Skip any milestone whose year you can't verify.
- "significance" is "high" for paradigm shifts, "medium" for major advances, "low" for notable highlights.`;
}

export function factsPrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  return `Give me 8 surprising, verifiable, and genuinely fascinating facts about ${label.toLowerCase()} (${
    category === "all" ? "across all transport" : "specifically"
  }).

${accuracyDirective}

Return ONLY a JSON object, no markdown fences:
{ "facts": ["fact 1", "fact 2", ...] }

Each fact must be 1-2 sentences, self-contained, and verifiable. Prefer specific names, dates, and numbers over vague claims — but only if you're confident.`;
}

/**
 * Themed angles for the Surprise Me button. Each click rolls one of these
 * to steer the model toward a different corner of the catalog, so two
 * consecutive clicks on the same category surface meaningfully different
 * vehicles rather than the model's go-to favorite.
 */
const SURPRISE_THEMES = [
  {
    angle: "an obscure prototype or one-off that almost no one has heard of",
    questionShape:
      "Why was the {vehicle} built, what made it unusual, and why did it stay obscure?",
  },
  {
    angle: "a record-breaker — fastest, largest, longest, deepest, highest",
    questionShape: "What record does the {vehicle} hold, and how was it earned?",
  },
  {
    angle: "a beautiful design failure that was commercially or technically a flop",
    questionShape: "Why did the {vehicle} fail despite its design ambition?",
  },
  {
    angle: "a vehicle from an unexpected country or era (not USA, not Germany, not Japan)",
    questionShape:
      "What was the engineering and cultural context that produced the {vehicle}?",
  },
  {
    angle: "something from a niche category: airships, hovercraft, monorails, amphibious craft, ekranoplans, gyrocopters",
    questionShape:
      "How does the {vehicle} actually work, and what is it used for today?",
  },
  {
    angle: "a vehicle famous for one weird engineering choice — wankel engine, three wheels, ducted fan, no doors, etc.",
    questionShape:
      "What's the unusual engineering choice in the {vehicle}, and did it pay off?",
  },
  {
    angle: "a military or experimental craft that shaped civilian transport later",
    questionShape:
      "What did the {vehicle} pioneer that we still benefit from today?",
  },
  {
    angle: "a vehicle from the past 5 years — modern but under-the-radar",
    questionShape: "What makes the {vehicle} a quietly significant recent arrival?",
  },
  {
    angle: "a working-class workhorse that's hidden in plain sight (delivery vans, ferries, freight locomotives, trawlers)",
    questionShape:
      "What's the unsung engineering behind the {vehicle} and why does it matter?",
  },
  {
    angle: "a cult-favorite or enthusiast-only vehicle outside the mainstream",
    questionShape:
      "Why does the {vehicle} have a passionate following despite never going mainstream?",
  },
] as const;

export interface SurpriseTheme {
  angle: string;
  questionShape: string;
}

/** Pick a random theme. Exported so the route can return the matching `questionShape` to the client. */
export function pickSurpriseTheme(seed?: number): SurpriseTheme {
  const r =
    typeof seed === "number"
      ? seed % SURPRISE_THEMES.length
      : Math.floor(Math.random() * SURPRISE_THEMES.length);
  return SURPRISE_THEMES[r];
}

export function surprisePrompt(
  category: Category,
  theme?: SurpriseTheme,
): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  const t = theme ?? pickSurpriseTheme();
  // Salt the prompt with the theme + a fresh nonce so identical clicks
  // don't deterministically hit the gateway cache and so the model is
  // steered toward different territory each time.
  const nonce = Math.random().toString(36).slice(2, 10);
  return `Pick a single fascinating, lesser-known vehicle from the world of ${label.toLowerCase()}.

ANGLE: ${t.angle}

Pick something the user is UNLIKELY to have heard of before — not the iconic flagships (Concorde, Ferrari F40, SR-71, Titanic, Veyron, etc. — explicitly avoid those). Aim for the second or third tier of legendary, not the first.

${accuracyDirective}

Return ONLY a JSON object, no markdown fences:
{
  "vehicle": "<the vehicle's exact canonical name>",
  "intro": "<a 2-3 sentence engaging hook starting with: Did you know about the <vehicle name>?>"
}

(internal seed: ${nonce} — this is just here to keep the prompt unique per click, ignore it in your answer)`;
}

export function suggestVehiclesPrompt(query: string, category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  return `User is searching for vehicles matching: "${query}" within ${label.toLowerCase()}.
Return up to 6 plausible matches as JSON: { "matches": ["Vehicle Name 1", ...] }
- Use canonical names (e.g. "Tesla Model S Plaid", not "tesla").
- Real vehicles only — do not invent model names.
- Plain JSON only, no markdown fences.`;
}

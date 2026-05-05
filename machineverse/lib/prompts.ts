import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const personaTagline =
  "MachineVerse — the world's most knowledgeable, conversational guide to every machine and mode of transport.";

export function chatSystemPrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  const focus =
    category === "all"
      ? "any mode of transport: cars, motorcycles, aircraft, ships, trains, buses, trucks, and experimental future vehicles."
      : `${label.toLowerCase()} specifically — but you can briefly compare across categories when it adds insight.`;

  return `${personaTagline}

Your expertise covers history, engineering, specifications, manufacturers, culture, regulation, and the future of transport.
You are warm, precise, and confident. You never invent specs — when uncertain, say so.

CURRENT MODE: ${label}
The user is exploring ${focus}

RESPONSE STYLE
- Open with a one-sentence direct answer.
- Then add structured detail using short paragraphs and **bold** for key terms.
- When listing specs or steps, use a tight bullet list.
- Cite sources inline naturally; the system will append a sources card automatically based on web search.
- Keep responses under ~250 words unless the user explicitly asks for depth.

FOLLOW-UP SUGGESTIONS
At the very end of every response, append a JSON block exactly in this format on its own line:
<suggestions>["Question 1", "Question 2", "Question 3"]</suggestions>
- Generate 3 to 4 short, specific follow-ups that build on the conversation pivot.
- Suggestions must be questions or topics the user can click to explore next.
- Never prefix the suggestions with prose; only the tagged JSON.`;
}

export function comparePrompt(a: string, b: string): string {
  return `Compare ${a} versus ${b} as objectively as possible.

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
- "pros" and "cons" should each have 3-4 entries.
- "verdict" is a single-paragraph recommendation calling out who each vehicle is best for.`;
}

export function timelinePrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  const scope =
    category === "all"
      ? "all modes of mechanized transport across history"
      : label.toLowerCase();

  return `List the 12 most pivotal milestones in the history of ${scope}.

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
- "description" must be 1-2 sentences, factually accurate.
- "significance" is "high" for paradigm shifts, "medium" for major advances, "low" for notable highlights.`;
}

export function factsPrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  return `Give me 8 surprising, verifiable, and genuinely fascinating facts about ${label.toLowerCase()} (${
    category === "all" ? "across all transport" : "specifically"
  }).

Return ONLY a JSON object, no markdown fences:
{ "facts": ["fact 1", "fact 2", ...] }

Each fact must be 1-2 sentences and self-contained.`;
}

export function surprisePrompt(category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  return `Pick a single fascinating, lesser-known vehicle from the world of ${label.toLowerCase()}${
    category === "all" ? "" : ""
  } and introduce it in a way that makes the user want to learn more.

Return ONLY a JSON object, no markdown fences:
{
  "vehicle": "<the vehicle's name>",
  "intro": "<a 2-3 sentence engaging hook starting with: Did you know about the <vehicle name>?>"
}`;
}

export function suggestVehiclesPrompt(query: string, category: Category): string {
  const label = CATEGORY_LABELS[category]?.label ?? "All Vehicles";
  return `User is searching for vehicles matching: "${query}" within ${label.toLowerCase()}.
Return up to 6 plausible matches as JSON: { "matches": ["Vehicle Name 1", ...] }
- Use canonical names (e.g. "Tesla Model S Plaid", not "tesla").
- Plain JSON only, no markdown fences.`;
}

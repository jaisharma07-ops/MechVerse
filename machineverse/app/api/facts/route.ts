import { NextResponse } from "next/server";
import { generate, safeJsonParse, GeminiError } from "@/lib/gemini";
import { factsPrompt } from "@/lib/prompts";
import type { Category, FactsApiResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { category } = (await req.json()) as { category: Category };
    const { text } = await generate({
      prompt: factsPrompt(category ?? "all"),
      responseMimeType: "application/json",
    });
    const parsed = safeJsonParse<{ facts: string[] }>(text);
    const facts = (parsed?.facts ?? []).filter((f) => typeof f === "string");
    if (!facts.length) throw new Error("Could not parse facts");
    const res: FactsApiResponse = { facts };
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof GeminiError) {
      const status = e.code === "RATE_LIMIT" ? 429 : 502;
      return NextResponse.json({ error: e.userMessage }, { status });
    }
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[/api/facts]", msg);
    return NextResponse.json(
      { error: "Could not load facts. Please try again." },
      { status: 500 },
    );
  }
}

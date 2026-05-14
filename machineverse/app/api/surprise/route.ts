import { NextResponse } from "next/server";
import { generate, safeJsonParse, GeminiError } from "@/lib/gemini";
import { pickSurpriseTheme, surprisePrompt } from "@/lib/prompts";
import type { Category, SurpriseApiResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { category } = (await req.json()) as { category: Category };

    // Roll a fresh theme on every request — the client may also send an
    // explicit seed to force a specific angle, but the default is random.
    const theme = pickSurpriseTheme();

    const { text } = await generate({
      prompt: surprisePrompt(category ?? "all", theme),
      responseMimeType: "application/json",
      useWebSearch: true,
      // Higher temperature than the default 0.2 for JSON routes — the
      // surprise endpoint *wants* creative variance, not deterministic
      // structured output.
      temperature: 0.95,
    });
    const parsed = safeJsonParse<{ vehicle: string; intro: string }>(text);
    if (!parsed?.intro || !parsed?.vehicle) {
      throw new Error("Could not parse surprise response");
    }
    const res: SurpriseApiResponse = {
      intro: parsed.intro,
      vehicle: parsed.vehicle,
      questionShape: theme.questionShape,
    };
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof GeminiError) {
      const status = e.code === "RATE_LIMIT" ? 429 : 502;
      return NextResponse.json({ error: e.userMessage }, { status });
    }
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[/api/surprise]", msg);
    return NextResponse.json(
      { error: "Couldn't pick a surprise. Please try again." },
      { status: 500 },
    );
  }
}

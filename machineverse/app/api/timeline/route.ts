import { NextResponse } from "next/server";
import { generate, safeJsonParse, GeminiError } from "@/lib/gemini";
import { timelinePrompt } from "@/lib/prompts";
import type { Category, TimelineApiResponse, TimelineMilestone } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { category } = (await req.json()) as { category: Category };
    const { text } = await generate({
      prompt: timelinePrompt(category ?? "all"),
      responseMimeType: "application/json",
      useWebSearch: true,
    });
    const parsed = safeJsonParse<{ milestones: TimelineMilestone[] }>(text);
    if (!parsed?.milestones || !Array.isArray(parsed.milestones)) {
      throw new Error("Could not parse timeline");
    }
    parsed.milestones.sort((x, y) => x.year - y.year);
    const res: TimelineApiResponse = { milestones: parsed.milestones };
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof GeminiError) {
      const status = e.code === "RATE_LIMIT" ? 429 : 502;
      return NextResponse.json({ error: e.userMessage }, { status });
    }
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[/api/timeline]", msg);
    return NextResponse.json(
      { error: "Could not load the timeline. Please try again." },
      { status: 500 },
    );
  }
}

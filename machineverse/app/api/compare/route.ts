import { NextResponse } from "next/server";
import { generate, safeJsonParse, GeminiError } from "@/lib/gemini";
import { comparePrompt } from "@/lib/prompts";
import { fetchWikimediaImage } from "@/lib/wikimedia";
import type { CompareApiResponse, VehicleSpec } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RawCompare {
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
  verdict: string;
}

export async function POST(req: Request) {
  try {
    const { a, b } = (await req.json()) as { a?: string; b?: string };
    if (!a || !b) {
      return NextResponse.json(
        { error: "Two vehicles (a, b) are required" },
        { status: 400 },
      );
    }

    const { text } = await generate({
      prompt: comparePrompt(a, b),
      responseMimeType: "application/json",
    });

    const data = safeJsonParse<RawCompare>(text);
    if (!data?.vehicleA || !data?.vehicleB) {
      throw new Error("Failed to parse comparison from model");
    }

    const [imgA, imgB] = await Promise.all([
      fetchWikimediaImage(data.vehicleA.imageQuery || data.vehicleA.name),
      fetchWikimediaImage(data.vehicleB.imageQuery || data.vehicleB.name),
    ]);

    const result: CompareApiResponse = {
      vehicleA: { ...data.vehicleA, imageUrl: imgA },
      vehicleB: { ...data.vehicleB, imageUrl: imgB },
      verdict: data.verdict ?? "",
    };
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof GeminiError) {
      const status = e.code === "RATE_LIMIT" ? 429 : 502;
      return NextResponse.json({ error: e.userMessage }, { status });
    }
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[/api/compare]", msg);
    return NextResponse.json(
      { error: "Comparison failed. Please try again." },
      { status: 500 },
    );
  }
}

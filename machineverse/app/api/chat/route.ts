import { NextResponse } from "next/server";
import { generate, GeminiError } from "@/lib/gemini";
import { chatSystemPrompt } from "@/lib/prompts";
import type { ChatApiRequest, ChatApiResponse, Category } from "@/lib/types";
import { fetchManyWikimediaImages } from "@/lib/wikimedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUGGESTIONS_RE = /<suggestions>\s*([\s\S]*?)\s*<\/suggestions>/i;

function extractMediaQueries(text: string): string[] {
  const out = new Set<string>();
  // Bold-marked vehicle names: **Name**
  const bold = text.match(/\*\*([A-Z][A-Za-z0-9 ./'-]{2,40})\*\*/g);
  if (bold) {
    for (const b of bold) {
      const cleaned = b.replace(/\*\*/g, "").trim();
      if (cleaned.split(/\s+/).length >= 2) out.add(cleaned);
      if (out.size >= 3) break;
    }
  }
  return Array.from(out).slice(0, 3);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { messages, category } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" } satisfies Partial<ChatApiResponse>,
        { status: 400 },
      );
    }

    const cat: Category = category ?? "all";
    const system = chatSystemPrompt(cat);

    const hasAttachments = messages.some((m) => m.attachments?.length);

    const { text, sources } = await generate({
      systemInstruction: system,
      history: messages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      })),
      // googleSearch tool can't be combined with multimodal inline data on flash
      useWebSearch: !hasAttachments,
    });

    let answer = text.trim();
    let suggestions: string[] = [];
    const m = answer.match(SUGGESTIONS_RE);
    if (m) {
      try {
        const parsed = JSON.parse(m[1]);
        if (Array.isArray(parsed)) {
          suggestions = parsed
            .filter((x): x is string => typeof x === "string")
            .slice(0, 4);
        }
      } catch {
        // ignore parse error, keep empty suggestions
      }
      answer = answer.replace(SUGGESTIONS_RE, "").trim();
    }

    const mediaQueries = extractMediaQueries(answer);
    const media = mediaQueries.length
      ? await fetchManyWikimediaImages(mediaQueries)
      : [];

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount < 2) suggestions = [];

    const payload: ChatApiResponse = {
      answer,
      suggestions,
      sources,
      media,
    };
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof GeminiError) {
      console.error("[/api/chat] Gemini error:", e.code, e.userMessage);
      const status = e.code === "RATE_LIMIT" ? 429 : 502;
      return NextResponse.json(
        {
          answer: "",
          suggestions: [],
          sources: [],
          media: [],
          error: e.userMessage,
        } satisfies ChatApiResponse,
        { status },
      );
    }
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[/api/chat]", msg);
    return NextResponse.json(
      {
        answer: "",
        suggestions: [],
        sources: [],
        media: [],
        error: "Something went wrong on the server. Please try again.",
      } satisfies ChatApiResponse,
      { status: 500 },
    );
  }
}

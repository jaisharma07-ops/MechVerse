import { auth } from "@/lib/auth";
import { generateStream } from "@/lib/llm/stream";
import { GeminiError } from "@/lib/llm/types";
import { chatSystemPrompt } from "@/lib/prompts";
import { getChatStore, type ChatThread } from "@/lib/storage/chats";
import { userIdFromEmail } from "@/lib/storage/userid";
import type {
  Category,
  ChatApiMessage,
  ChatMessage,
  Source,
} from "@/lib/types";
import { fetchManyWikimediaImages } from "@/lib/wikimedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Streaming chat endpoint.
 *
 * Wire format: newline-delimited JSON (NDJSON). One JSON object per line:
 *   {"type":"chunk","delta":"..."}        — append text to the assistant msg
 *   {"type":"sources","sources":[...]}    — citation list (once, near end)
 *   {"type":"media","media":[...]}        — wiki image URLs (once, near end)
 *   {"type":"suggestions","suggestions":[]} — follow-up chips (once, near end)
 *   {"type":"done","threadId":"..."}      — terminal; thread saved if authed
 *   {"type":"error","message":"..."}      — terminal on failure
 *
 * Abort behavior: when the client closes the request body, req.signal
 * fires; we forward it down to the LLM provider, which closes its upstream
 * connection. No further tokens are consumed, no partial save happens.
 *
 * Auth: optional. If a session cookie is present we also persist the final
 * thread to the user's storage (creating or updating by `threadId`).
 */

const SUGGESTIONS_RE = /<suggestions>\s*([\s\S]*?)\s*<\/suggestions>/i;

interface StreamRequestBody {
  messages: ChatApiMessage[];
  category?: Category;
  /** Optional. If provided, the answer is appended to that thread; otherwise a new one is created. */
  threadId?: string;
}

function extractMediaQueries(text: string): string[] {
  const out = new Set<string>();
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

function newThreadId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-6);
}

function inferTitle(messages: ChatApiMessage[]): string {
  const first = messages.find((m) => m.role === "user")?.content?.trim();
  if (!first) return "New chat";
  return first.length > 60 ? `${first.slice(0, 57)}…` : first;
}

export async function POST(req: Request) {
  let body: StreamRequestBody;
  try {
    body = (await req.json()) as StreamRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const { messages, category, threadId: clientThreadId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const cat: Category = category ?? "all";
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      // Forward client-side abort into the LLM provider via req.signal.
      // We also listen here so we can close the response stream cleanly
      // without writing a trailing "done" — the client already left.
      const signal = req.signal;
      let aborted = false;
      const onAbort = () => {
        aborted = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });

      const hasAttachments = messages.some((m) => m.attachments?.length);
      let answer = "";
      let sources: Source[] = [];

      try {
        for await (const ev of generateStream({
          systemInstruction: chatSystemPrompt(cat),
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          useWebSearch: !hasAttachments,
          signal,
        })) {
          if (aborted) break;
          if (ev.kind === "delta") {
            answer += ev.text;
            write({ type: "chunk", delta: ev.text });
          } else {
            sources = ev.sources;
          }
        }
      } catch (e) {
        if (aborted) return; // client already gone, don't bother
        const message =
          e instanceof GeminiError
            ? e.userMessage
            : e instanceof Error
              ? e.message
              : "Streaming failed.";
        // Don't emit a fake error for ABORTED — abort already closed the stream.
        if (e instanceof GeminiError && e.code === "ABORTED") return;
        write({ type: "error", message });
        try {
          controller.close();
        } catch {}
        return;
      }

      if (aborted) return;

      // Post-process: strip <suggestions> JSON, pull media queries, fetch images.
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
          // ignore parse error
        }
        answer = answer.replace(SUGGESTIONS_RE, "").trim();
      }
      const userMessageCount = messages.filter((mm) => mm.role === "user").length;
      if (userMessageCount < 2) suggestions = [];

      const mediaQueries = extractMediaQueries(answer);
      const media = mediaQueries.length
        ? await fetchManyWikimediaImages(mediaQueries)
        : [];

      // Tell the client the final post-processed metadata. The chunks we
      // already sent may have embedded the <suggestions> block, so the
      // client should treat this `answer` as the canonical final text.
      if (sources.length) write({ type: "sources", sources });
      if (media.length) write({ type: "media", media });
      if (suggestions.length) write({ type: "suggestions", suggestions });
      write({ type: "final", answer });

      // Persist to user storage if signed in.
      let savedThreadId: string | null = null;
      if (userEmail) {
        try {
          const userId = userIdFromEmail(userEmail);
          const store = getChatStore();
          const tid = clientThreadId ?? newThreadId();
          const existing = clientThreadId ? await store.get(userId, tid) : null;

          // Reconstruct the message list: take the incoming user-visible
          // messages as-is, then append the new assistant turn.
          const now = Date.now();
          const fullMessages: ChatMessage[] = [
            // Convert ChatApiMessage[] → ChatMessage[] (add ids + ts).
            ...messages.map<ChatMessage>((mm, i) => ({
              id: `${now}-${i}`,
              role: mm.role,
              content: mm.content,
              attachments: mm.attachments?.map((a, j) => ({
                id: `${now}-att-${i}-${j}`,
                name: "attachment",
                mimeType: a.mimeType,
                data: a.data,
                previewUrl: `data:${a.mimeType};base64,${a.data}`,
              })),
              ts: now - (messages.length - i),
            })),
            {
              id: `${now}-bot`,
              role: "bot",
              content: answer,
              suggestions,
              sources,
              media,
              category: cat,
              ts: now,
            },
          ];

          const thread: ChatThread = {
            id: tid,
            title: existing?.title ?? inferTitle(messages),
            category: cat,
            messages: fullMessages,
            ts: existing?.ts ?? now,
            updatedTs: now,
            messageCount: fullMessages.length,
          };
          await store.save(userId, thread);
          savedThreadId = tid;
        } catch (e) {
          console.error("[/api/chat/stream] save failed:", e);
          // Don't fail the whole response over a save error.
        }
      }

      write({ type: "done", threadId: savedThreadId });
      try {
        controller.close();
      } catch {}
    },

    cancel() {
      // ReadableStream got cancelled by the runtime (e.g. client disconnect
      // before we attached the req.signal listener). Nothing else to clean up.
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no", // disable nginx buffering if anyone proxies
    },
  });
}

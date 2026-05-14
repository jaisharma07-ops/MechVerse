import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChatStore, type ChatThread } from "@/lib/storage/chats";
import { userIdFromEmail } from "@/lib/storage/userid";
import type { Category, ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SaveBody {
  id?: string;
  title?: string;
  category?: Category;
  messages: ChatMessage[];
}

function uid(): string {
  // 12-char URL-safe id, plenty for per-user uniqueness
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-6);
}

function inferTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user")?.content?.trim();
  if (!first) return "New chat";
  return first.length > 60 ? `${first.slice(0, 57)}…` : first;
}

/**
 * GET /api/chats → list thread summaries for the signed-in user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = userIdFromEmail(session.user.email);
  const threads = await getChatStore().list(userId);
  return NextResponse.json({ threads });
}

/**
 * POST /api/chats → create or upsert a thread.
 * Body: { id?, title?, category, messages[] }
 * Returns the saved thread summary.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = userIdFromEmail(session.user.email);

  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  const now = Date.now();
  const store = getChatStore();
  const id = body.id ?? uid();
  const existing = body.id ? await store.get(userId, id) : null;

  const thread: ChatThread = {
    id,
    title: body.title?.trim() || existing?.title || inferTitle(body.messages),
    category: body.category ?? existing?.category ?? "all",
    messages: body.messages,
    ts: existing?.ts ?? now,
    updatedTs: now,
    messageCount: body.messages.length,
  };

  await store.save(userId, thread);
  return NextResponse.json({ thread });
}

/**
 * DELETE /api/chats → wipe ALL threads for the signed-in user.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = userIdFromEmail(session.user.email);
  await getChatStore().wipe(userId);
  return NextResponse.json({ ok: true });
}

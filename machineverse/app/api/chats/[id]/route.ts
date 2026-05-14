import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChatStore } from "@/lib/storage/chats";
import { userIdFromEmail } from "@/lib/storage/userid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/chats/[id] → full thread (with messages) for the signed-in user.
 */
export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const userId = userIdFromEmail(session.user.email);
  const thread = await getChatStore().get(userId, id);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ thread });
}

/**
 * DELETE /api/chats/[id] → delete a single thread for the signed-in user.
 */
export async function DELETE(_req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const userId = userIdFromEmail(session.user.email);
  await getChatStore().delete(userId, id);
  return NextResponse.json({ ok: true });
}

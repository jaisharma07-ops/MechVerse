import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { ChatMessage, Category } from "@/lib/types";

/**
 * Per-user chat-thread storage.
 *
 * Two backends, picked automatically at module load:
 *   - Upstash Redis  (when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set)
 *   - Local JSON file at .data/chats.json (everything else — perfect for `next dev`)
 *
 * Both implement the same ChatStore interface, so callers (the /api/chats
 * routes) don't care which is active.
 *
 * Key/path shape:
 *   Redis:  mv:chats:<userId>           → JSON array of thread summaries
 *           mv:thread:<userId>:<tid>    → JSON object of full thread
 *   File:   .data/chats.json            → { [userId]: { index: [...], threads: {...} } }
 */

export interface ChatThreadSummary {
  id: string;
  title: string;
  /** Created timestamp. */
  ts: number;
  /** Last-update timestamp. Sort threads by this in the UI. */
  updatedTs: number;
  category: Category;
  /** Total message count. Convenient for the sidebar. */
  messageCount: number;
}

export interface ChatThread extends ChatThreadSummary {
  messages: ChatMessage[];
}

export interface ChatStore {
  list(userId: string): Promise<ChatThreadSummary[]>;
  get(userId: string, threadId: string): Promise<ChatThread | null>;
  save(userId: string, thread: ChatThread): Promise<void>;
  delete(userId: string, threadId: string): Promise<void>;
  wipe(userId: string): Promise<void>;
}

// ─── Upstash backend ────────────────────────────────────────────────────

function indexKey(userId: string) {
  return `mv:chats:${userId}`;
}
function threadKey(userId: string, threadId: string) {
  return `mv:thread:${userId}:${threadId}`;
}

function summarize(t: ChatThread): ChatThreadSummary {
  return {
    id: t.id,
    title: t.title,
    ts: t.ts,
    updatedTs: t.updatedTs,
    category: t.category,
    messageCount: t.messages.length,
  };
}

class UpstashStore implements ChatStore {
  constructor(private readonly redis: Redis) {}

  async list(userId: string): Promise<ChatThreadSummary[]> {
    const raw = await this.redis.get<ChatThreadSummary[]>(indexKey(userId));
    const list = Array.isArray(raw) ? raw : [];
    return [...list].sort((a, b) => b.updatedTs - a.updatedTs);
  }

  async get(userId: string, threadId: string): Promise<ChatThread | null> {
    const t = await this.redis.get<ChatThread>(threadKey(userId, threadId));
    return t ?? null;
  }

  async save(userId: string, thread: ChatThread): Promise<void> {
    await this.redis.set(threadKey(userId, thread.id), thread);
    // Refresh the index in one go — simpler than a hash + per-thread upsert.
    const idx = (await this.redis.get<ChatThreadSummary[]>(indexKey(userId))) ?? [];
    const filtered = idx.filter((t) => t.id !== thread.id);
    filtered.push(summarize(thread));
    await this.redis.set(indexKey(userId), filtered);
  }

  async delete(userId: string, threadId: string): Promise<void> {
    await this.redis.del(threadKey(userId, threadId));
    const idx = (await this.redis.get<ChatThreadSummary[]>(indexKey(userId))) ?? [];
    await this.redis.set(
      indexKey(userId),
      idx.filter((t) => t.id !== threadId),
    );
  }

  async wipe(userId: string): Promise<void> {
    const idx = (await this.redis.get<ChatThreadSummary[]>(indexKey(userId))) ?? [];
    if (idx.length === 0) return;
    const keys = idx.map((t) => threadKey(userId, t.id));
    await Promise.all(keys.map((k) => this.redis.del(k)));
    await this.redis.del(indexKey(userId));
  }
}

// ─── Local JSON file backend ────────────────────────────────────────────

interface FileShape {
  [userId: string]: {
    threads: Record<string, ChatThread>;
  };
}

class FileStore implements ChatStore {
  private readonly file: string;
  /** Coalesce concurrent writes so we don't corrupt the JSON file. */
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(file: string) {
    this.file = file;
  }

  private async read(): Promise<FileShape> {
    try {
      const raw = await fs.readFile(this.file, "utf-8");
      return JSON.parse(raw) as FileShape;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw e;
    }
  }

  private async write(data: FileShape): Promise<void> {
    // Serialize writes — multiple concurrent /api/chats calls share one file.
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
      await fs.rename(tmp, this.file);
    });
    return this.writeQueue;
  }

  async list(userId: string): Promise<ChatThreadSummary[]> {
    const data = await this.read();
    const threads = Object.values(data[userId]?.threads ?? {});
    return threads
      .map(summarize)
      .sort((a, b) => b.updatedTs - a.updatedTs);
  }

  async get(userId: string, threadId: string): Promise<ChatThread | null> {
    const data = await this.read();
    return data[userId]?.threads?.[threadId] ?? null;
  }

  async save(userId: string, thread: ChatThread): Promise<void> {
    const data = await this.read();
    if (!data[userId]) data[userId] = { threads: {} };
    data[userId].threads[thread.id] = thread;
    await this.write(data);
  }

  async delete(userId: string, threadId: string): Promise<void> {
    const data = await this.read();
    if (data[userId]?.threads?.[threadId]) {
      delete data[userId].threads[threadId];
      await this.write(data);
    }
  }

  async wipe(userId: string): Promise<void> {
    const data = await this.read();
    if (data[userId]) {
      delete data[userId];
      await this.write(data);
    }
  }
}

// ─── Selector ───────────────────────────────────────────────────────────

let cached: ChatStore | null = null;

export function getChatStore(): ChatStore {
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    cached = new UpstashStore(new Redis({ url, token }));
  } else {
    // Local dev fallback. `.data/` is gitignored implicitly by the
    // `.env*` rule's neighbour patterns — we'll add it explicitly too.
    const file = path.join(process.cwd(), ".data", "chats.json");
    cached = new FileStore(file);
  }
  return cached;
}

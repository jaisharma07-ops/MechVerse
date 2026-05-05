"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookmarkPlus, Check, Copy, ExternalLink, Pencil, X } from "lucide-react";
import Image from "next/image";
import type { ChatMessage } from "@/lib/types";
import { useStore } from "@/store/useStore";
import { toast } from "@/store/useToastStore";
import SuggestionChips from "./SuggestionChips";
import { renderMarkdown } from "@/lib/renderMarkdown";

export default function MessageBubble({
  message,
  onSuggestionClick,
  onEdit,
  editingDisabled,
}: {
  message: ChatMessage;
  onSuggestionClick: (s: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  editingDisabled?: boolean;
}) {
  const addBookmark = useStore((s) => s.addBookmark);
  const activeCategory = useStore((s) => s.activeCategory);
  const isBot = message.role === "bot";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length,
      );
    }
  }, [editing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Could not copy", "error");
    }
  };

  const handleBookmark = () => {
    const snippet =
      message.content.length > 140
        ? message.content.slice(0, 140) + "…"
        : message.content;
    addBookmark({ text: snippet, category: message.category ?? activeCategory });
    toast("Bookmark saved", "success");
  };

  const startEdit = () => {
    if (editingDisabled) return;
    setDraft(message.content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(message.content);
  };

  const submitEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === message.content) {
      cancelEdit();
      return;
    }
    onEdit?.(message.id, trimmed);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4 group`}
    >
      <div
        className={`flex gap-3 max-w-[88%] ${isBot ? "flex-row" : "flex-row-reverse"}`}
      >
        {isBot && (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1 shadow shadow-accent/20">
            <span
              className="font-display font-bold text-user-bubble-text text-sm"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              M
            </span>
          </div>
        )}

        <div className={`flex flex-col ${isBot ? "items-start" : "items-end"} min-w-0`}>
          {!isBot && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((a) => (
                <div
                  key={a.id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-border bg-surface-2"
                >
                  <Image
                    src={a.previewUrl}
                    alt={a.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {editing ? (
            <div className="bg-user-bubble text-user-bubble-text rounded-2xl rounded-tr-sm px-3 py-2 w-full min-w-[260px]">
              <textarea
                ref={editRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitEdit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  }
                }}
                rows={Math.min(6, Math.max(2, draft.split("\n").length))}
                className="w-full bg-transparent border-none outline-none resize-none text-sm font-body placeholder:text-user-bubble-text/50"
                placeholder="Edit your message…"
              />
              <div className="flex justify-end gap-1 mt-1">
                <button
                  onClick={cancelEdit}
                  className="p-1.5 rounded-full hover:bg-black/10 text-user-bubble-text/80 hover:text-user-bubble-text"
                  aria-label="Cancel edit"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={submitEdit}
                  className="p-1.5 rounded-full bg-user-bubble-text text-user-bubble hover:opacity-90"
                  aria-label="Resubmit edited message"
                  title="Send"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-4 py-3 text-sm font-body break-words ${
                isBot
                  ? "bg-surface text-text-primary rounded-2xl rounded-tl-sm border border-border shadow-sm"
                  : "bg-user-bubble text-user-bubble-text rounded-2xl rounded-tr-sm shadow-sm"
              }`}
            >
              <div
                className="mv-prose leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />
            </div>
          )}

          {isBot && message.media && message.media.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 max-w-full">
              {message.media.map((url, i) => (
                <div
                  key={`${i}-${url}`}
                  className="relative h-[180px] min-w-[260px] rounded-xl overflow-hidden border border-border flex-shrink-0 bg-surface-2"
                >
                  <Image
                    src={url}
                    alt="related vehicle"
                    fill
                    sizes="260px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {isBot && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.sources.map((src, i) => (
                <a
                  key={`${i}-${src.url}`}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] bg-surface border border-border px-2 py-1 rounded-md hover:border-accent hover:text-accent transition-colors text-text-secondary"
                >
                  <span>{src.domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}

          {isBot && !editing && (
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={handleBookmark}
                className="text-text-secondary hover:text-accent transition-colors p-1"
                aria-label="Bookmark this response"
                title="Bookmark"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="text-text-secondary hover:text-accent transition-colors p-1"
                aria-label="Copy this response"
                title="Copy"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isBot && !editing && onEdit && (
            <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={startEdit}
                disabled={editingDisabled}
                className="text-text-secondary hover:text-accent transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Edit and resend"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                className="text-text-secondary hover:text-accent transition-colors p-1"
                aria-label="Copy message"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isBot && message.suggestions && message.suggestions.length > 0 && (
            <SuggestionChips
              suggestions={message.suggestions}
              onSelect={onSuggestionClick}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

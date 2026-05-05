"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star, Trash2, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CATEGORY_LABELS } from "@/lib/types";
import { toast } from "@/store/useToastStore";

export default function BookmarksPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const bookmarks = useStore((s) => s.bookmarks);
  const removeBookmark = useStore((s) => s.removeBookmark);
  const clearAllBookmarks = useStore((s) => s.clearAllBookmarks);

  const grouped = bookmarks.reduce<
    Record<string, { id: string; text: string; category: string; ts: number }[]>
  >((acc, b) => {
    const key = b.category;
    acc[key] ??= [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-[60px] border-b border-border">
              <h2
                className="text-lg font-bold uppercase tracking-wider flex items-center gap-2 text-text-primary"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                <Star className="w-5 h-5 text-accent" /> Bookmarks
              </h2>
              <button
                onClick={onClose}
                aria-label="Close bookmarks"
                className="text-text-secondary hover:text-accent p-2 rounded-full hover:bg-surface-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary gap-3 px-6">
                  <Star className="w-10 h-10 text-text-secondary/40" />
                  <p className="text-sm">
                    Bookmarks you save during chats will live here. Tap the
                    bookmark icon under any answer to start.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {Object.entries(grouped).map(([cat, items]) => {
                    const meta =
                      CATEGORY_LABELS[
                        cat as keyof typeof CATEGORY_LABELS
                      ];
                    return (
                      <div key={cat}>
                        <p
                          className="text-xs uppercase tracking-wider text-accent font-bold mb-2 flex items-center gap-2"
                          style={{ fontFamily: "var(--font-barlow)" }}
                        >
                          <span>{meta?.emoji ?? "•"}</span>
                          <span>{meta?.label ?? cat}</span>
                        </p>
                        <div className="flex flex-col gap-2">
                          {items.map((b) => (
                            <div
                              key={b.id}
                              className="bg-background border border-border rounded-lg p-3 flex items-start gap-3 group"
                            >
                              <p className="flex-1 text-sm text-text-primary leading-snug break-words">
                                {b.text}
                              </p>
                              <button
                                onClick={() => {
                                  removeBookmark(b.id);
                                  toast("Bookmark removed", "info");
                                }}
                                aria-label="Remove bookmark"
                                className="text-text-secondary hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {bookmarks.length > 0 && (
              <div className="border-t border-border p-4">
                <button
                  onClick={() => {
                    clearAllBookmarks();
                    toast("Bookmarks cleared", "info");
                  }}
                  className="w-full text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-lg py-2 transition-colors"
                >
                  Clear all bookmarks
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

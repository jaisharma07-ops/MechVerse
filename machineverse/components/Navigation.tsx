"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Moon, Newspaper, Star, Sun, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "@/store/useToastStore";
import {
  CATEGORY_LABELS,
  CATEGORY_LIST,
  type Category,
} from "@/lib/types";

export default function Navigation({
  onOpenBookmarks,
}: {
  onOpenBookmarks: () => void;
}) {
  const router = useRouter();
  const activeCategory = useStore((s) => s.activeCategory);
  const setCategory = useStore((s) => s.setCategory);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const chatHistory = useStore((s) => s.chatHistory);
  const clearChat = useStore((s) => s.clearChat);
  const toggleFactsTicker = useStore((s) => s.toggleFactsTicker);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  const active = CATEGORY_LABELS[activeCategory];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchCategory = (cat: Category) => {
    if (cat === activeCategory) {
      setDropdownOpen(false);
      setMobileOpen(false);
      return;
    }
    if (chatHistory.length > 0) {
      const ok = window.confirm(
        `Switching to ${CATEGORY_LABELS[cat].label} mode will clear the current chat. Continue?`,
      );
      if (!ok) {
        setDropdownOpen(false);
        setMobileOpen(false);
        return;
      }
      clearChat();
    }
    setCategory(cat);
    toast(`Switched to ${CATEGORY_LABELS[cat].label} mode`, "success");
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const goReset = () => {
    localStorage.removeItem("mv_visited");
    clearChat();
    setConfirmReset(false);
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 h-[60px] backdrop-blur-md bg-surface/85 border-b border-border flex items-center justify-between px-4 lg:px-6">
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1"
          aria-label="Return to splash"
        >
          <span
            className="font-display text-2xl lg:text-[28px] font-bold tracking-wider uppercase text-text-primary"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Machine
          </span>
          <span
            className="font-display text-2xl lg:text-[28px] font-bold tracking-wider uppercase text-accent"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Verse
          </span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent-soft border border-accent/30 px-3 py-1 rounded-full text-accent text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-medium">{active.emoji} {active.label}</span>
          </div>

          <button
            onClick={toggleFactsTicker}
            className="text-text-secondary hover:text-accent transition-colors p-2 rounded-full hover:bg-surface-2"
            aria-label="Toggle facts ticker"
          >
            <Newspaper className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenBookmarks}
            className="text-text-secondary hover:text-accent transition-colors p-2 rounded-full hover:bg-surface-2"
            aria-label="Bookmarks"
          >
            <Star className="w-5 h-5" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="text-text-secondary hover:text-accent transition-colors p-2 rounded-full hover:bg-surface-2"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative" ref={ddRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((v) => !v);
              }}
              className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg text-sm hover:border-accent/60 transition-colors text-text-primary"
            >
              <span>{active.emoji}</span>
              <span>{active.label}</span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-lg shadow-xl overflow-hidden py-1 z-50"
                >
                  {CATEGORY_LIST.map((id) => (
                    <button
                      key={id}
                      onClick={() => switchCategory(id)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent-soft hover:text-accent transition-colors ${
                        id === activeCategory
                          ? "text-accent"
                          : "text-text-primary"
                      }`}
                    >
                      <span>{CATEGORY_LABELS[id].emoji}</span>
                      <span>{CATEGORY_LABELS[id].label}</span>
                      {id === activeCategory && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="text-text-secondary hover:text-accent p-2 rounded"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[60px] left-0 right-0 bg-surface border-b border-border z-40 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-around border-b border-border pb-4">
                <button
                  onClick={() => {
                    toggleFactsTicker();
                    setMobileOpen(false);
                  }}
                  className="flex flex-col items-center text-text-secondary hover:text-accent gap-1"
                >
                  <Newspaper className="w-6 h-6" />
                  <span className="text-xs">Facts</span>
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenBookmarks();
                  }}
                  className="flex flex-col items-center text-text-secondary hover:text-accent gap-1"
                >
                  <Star className="w-6 h-6" />
                  <span className="text-xs">Bookmarks</span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="flex flex-col items-center text-text-secondary hover:text-accent gap-1"
                >
                  {darkMode ? (
                    <Sun className="w-6 h-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                  <span className="text-xs">Theme</span>
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-text-secondary uppercase mb-2 tracking-wide">
                  Switch category
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_LIST.map((id) => (
                    <button
                      key={id}
                      onClick={() => switchCategory(id)}
                      className={`p-2 rounded-lg flex items-center gap-2 text-sm border ${
                        id === activeCategory
                          ? "border-accent text-accent bg-accent-soft"
                          : "border-border text-text-primary"
                      }`}
                    >
                      <span>{CATEGORY_LABELS[id].emoji}</span>
                      <span>{CATEGORY_LABELS[id].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmReset(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="bg-surface border border-border rounded-xl p-6 shadow-2xl z-10 max-w-sm w-full"
            >
              <h3
                className="text-xl font-display font-bold mb-2 tracking-wide"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                Change vehicle mode?
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                You will be returned to the splash screen and can pick a different
                world to explore. Your bookmarks will be kept.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={goReset}
                  className="px-4 py-2 text-sm bg-accent text-user-bubble-text font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

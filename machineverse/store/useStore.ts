"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Bookmark, Category, ChatMessage } from "@/lib/types";

interface StoreState {
  hydrated: boolean;
  activeCategory: Category;
  darkMode: boolean;
  bookmarks: Bookmark[];
  chatHistory: ChatMessage[];
  factsTickerVisible: boolean;
  pendingPrompt: string | null;

  setHydrated: () => void;
  setCategory: (c: Category) => void;
  toggleDarkMode: () => void;
  addBookmark: (b: Omit<Bookmark, "id" | "ts">) => void;
  removeBookmark: (id: string) => void;
  clearAllBookmarks: () => void;

  appendMessage: (m: Omit<ChatMessage, "id" | "ts">) => string;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  truncateAfter: (id: string) => void;
  clearChat: () => void;

  toggleFactsTicker: () => void;
  setPendingPrompt: (text: string | null) => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      hydrated: false,
      activeCategory: "all",
      darkMode: true,
      bookmarks: [],
      chatHistory: [],
      factsTickerVisible: true,
      pendingPrompt: null,

      setHydrated: () => set({ hydrated: true }),
      setCategory: (c) => set({ activeCategory: c }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      addBookmark: (b) =>
        set((s) => ({
          bookmarks: [{ ...b, id: uid(), ts: Date.now() }, ...s.bookmarks],
        })),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      clearAllBookmarks: () => set({ bookmarks: [] }),

      appendMessage: (m) => {
        const id = uid();
        set((s) => ({
          chatHistory: [...s.chatHistory, { ...m, id, ts: Date.now() }],
        }));
        return id;
      },
      updateMessage: (id, patch) =>
        set((s) => ({
          chatHistory: s.chatHistory.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),
      truncateAfter: (id) =>
        set((s) => {
          const idx = s.chatHistory.findIndex((m) => m.id === id);
          if (idx === -1) return {};
          return { chatHistory: s.chatHistory.slice(0, idx + 1) };
        }),
      clearChat: () => set({ chatHistory: [] }),

      toggleFactsTicker: () =>
        set((s) => ({ factsTickerVisible: !s.factsTickerVisible })),
      setPendingPrompt: (text) => set({ pendingPrompt: text }),
    }),
    {
      name: "machineverse-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        activeCategory: s.activeCategory,
        darkMode: s.darkMode,
        bookmarks: s.bookmarks,
        factsTickerVisible: s.factsTickerVisible,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

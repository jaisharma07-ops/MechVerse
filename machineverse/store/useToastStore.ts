"use client";

import { create } from "zustand";

export type ToastKind = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (message: string, kind?: ToastKind) => void;
  dismiss: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, kind = "info") => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = (message: string, kind: ToastKind = "info") =>
  useToastStore.getState().push(message, kind);

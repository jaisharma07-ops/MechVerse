"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="pointer-events-auto bg-surface text-text-primary border border-border shadow-lg rounded-full pl-3 pr-2 py-2 flex items-center gap-2 text-sm"
          >
            {t.kind === "success" && (
              <CheckCircle2 className="w-4 h-4 text-accent" />
            )}
            {t.kind === "info" && <Info className="w-4 h-4 text-accent" />}
            {t.kind === "error" && (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span className="px-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-surface-2"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

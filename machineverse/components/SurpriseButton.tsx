"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dices, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { SurpriseApiResponse } from "@/lib/types";
import { toast } from "@/store/useToastStore";

export default function SurpriseButton({
  onAsk,
}: {
  onAsk: (prompt: string) => void;
}) {
  const activeCategory = useStore((s) => s.activeCategory);
  const [loading, setLoading] = useState(false);

  // Local fallback shapes used if the API doesn't return a questionShape
  // (e.g. older deployment). Round-robins through these client-side too.
  const fallbackShapes = [
    "Tell me everything fascinating about the {vehicle}.",
    "What makes the {vehicle} stand out in transport history?",
    "Walk me through the design and engineering of the {vehicle}.",
    "What's the story behind the {vehicle} — and why isn't it more famous?",
    "Compare the {vehicle} to its closest contemporary rival.",
  ];

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Defeat any intermediate HTTP cache (browser, CDN) — the server
          // already varies its prompt per request, but belt + suspenders.
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ category: activeCategory }),
      });
      const data = (await res.json()) as SurpriseApiResponse;
      if (!res.ok || data.error || !data.vehicle) {
        toast("Couldn't pick a surprise — try again", "error");
        return;
      }
      const shape =
        data.questionShape ??
        fallbackShapes[Math.floor(Math.random() * fallbackShapes.length)];
      const question = shape.replace(/\{vehicle\}/g, data.vehicle);
      onAsk(question);
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ rotate: 12, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleClick}
      className="fixed bottom-24 right-4 md:bottom-24 md:right-6 z-30 bg-accent text-user-bubble-text rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-accent/30"
      aria-label="Surprise me"
      title="Surprise me"
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Dices className="w-6 h-6" />
      )}
    </motion.button>
  );
}

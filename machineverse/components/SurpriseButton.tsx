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

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory }),
      });
      const data = (await res.json()) as SurpriseApiResponse;
      if (!res.ok || data.error || !data.vehicle) {
        toast("Couldn't pick a surprise — try again", "error");
        return;
      }
      onAsk(`Tell me everything fascinating about the ${data.vehicle}.`);
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

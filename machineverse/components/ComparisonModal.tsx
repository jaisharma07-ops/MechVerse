"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Check, Loader2, Scale, Share2, X, AlertCircle } from "lucide-react";
import type { CompareApiResponse, VehicleSpec } from "@/lib/types";
import { toast } from "@/store/useToastStore";

export default function ComparisonModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState<CompareApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setData(null);
    setError(null);
    setA("");
    setB("");
  };

  const submit = async () => {
    if (!a.trim() || !b.trim()) {
      toast("Enter two vehicles to compare", "info");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: a.trim(), b: b.trim() }),
      });
      const json = (await res.json()) as CompareApiResponse;
      if (!res.ok || json.error) {
        setError(json.error ?? "Comparison failed");
      } else {
        setData(json);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!data) return;
    const url = `${window.location.origin}/chat?compare=${encodeURIComponent(
      data.vehicleA.name,
    )}__${encodeURIComponent(data.vehicleB.name)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Share link copied", "success");
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              reset();
            }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed inset-4 md:inset-10 z-50 bg-background border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-border bg-surface">
              <h2
                className="font-bold tracking-wider uppercase text-lg flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                <Scale className="w-5 h-5 text-accent" /> Compare Vehicles
              </h2>
              <button
                onClick={() => {
                  onClose();
                  reset();
                }}
                aria-label="Close"
                className="text-text-secondary hover:text-accent p-2 rounded-full hover:bg-surface-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 grid md:grid-cols-2 gap-3 max-w-3xl mx-auto w-full">
                <input
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Vehicle A — e.g. Tesla Model S"
                  className="w-full bg-surface border border-border focus:border-accent text-text-primary px-4 py-2.5 rounded-lg outline-none text-sm"
                />
                <input
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Vehicle B — e.g. Porsche Taycan"
                  className="w-full bg-surface border border-border focus:border-accent text-text-primary px-4 py-2.5 rounded-lg outline-none text-sm"
                />
                <div className="md:col-span-2 flex justify-center">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="bg-accent text-user-bubble-text font-medium px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Comparing…
                      </>
                    ) : (
                      "Compare"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="max-w-3xl mx-auto px-5">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {data && (
                <div className="max-w-5xl mx-auto px-5 pb-8">
                  <div className="grid md:grid-cols-2 gap-4 relative">
                    <Card spec={data.vehicleA} />
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-accent/40 -translate-x-1/2" />
                    <Card spec={data.vehicleB} />
                  </div>

                  <div className="mt-6 bg-surface border border-border rounded-xl p-5">
                    <h3
                      className="text-accent font-bold uppercase tracking-wider text-sm mb-2"
                      style={{ fontFamily: "var(--font-barlow)" }}
                    >
                      Verdict
                    </h3>
                    <p className="text-text-primary text-sm leading-relaxed">
                      {data.verdict}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent border border-border hover:border-accent px-3 py-2 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Card({ spec }: { spec: VehicleSpec }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="relative h-44 bg-surface-2">
        {spec.imageUrl ? (
          <Image
            src={spec.imageUrl}
            alt={spec.name}
            fill
            sizes="400px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary text-xs">
            No image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3
            className="text-xl font-bold uppercase tracking-wide text-text-primary"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            {spec.name}
          </h3>
          <p className="text-xs text-text-secondary">
            {spec.manufacturer} · {spec.type} · {spec.yearIntroduced}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Spec label="Top speed" value={spec.topSpeed} />
          <Spec label="Range" value={spec.range} />
          <Spec label="Price" value={spec.price} />
          <Spec label="Weight" value={spec.weight} />
        </div>

        <p className="text-sm text-text-primary leading-relaxed">
          {spec.summary}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wide text-emerald-400 mb-1">
              Pros
            </p>
            <ul className="flex flex-col gap-1">
              {spec.pros.map((p, i) => (
                <li
                  key={i}
                  className="text-xs text-text-primary flex items-start gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wide text-red-400 mb-1">
              Cons
            </p>
            <ul className="flex flex-col gap-1">
              {spec.cons.map((c, i) => (
                <li
                  key={i}
                  className="text-xs text-text-primary flex items-start gap-1"
                >
                  <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-2">
      <p className="text-[10px] uppercase font-bold tracking-wide text-text-secondary">
        {label}
      </p>
      <p className="text-sm font-medium text-text-primary mt-0.5">{value}</p>
    </div>
  );
}

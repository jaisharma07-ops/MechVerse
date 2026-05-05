"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Plus, Send, Square, X } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import {
  CATEGORY_LABELS,
  type Attachment,
  type Category,
  type ChatApiResponse,
  type ChatMessage,
} from "@/lib/types";
import { toast } from "@/store/useToastStore";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const STARTER_QUESTIONS: Record<Category, string[]> = {
  all: [
    "What's the fastest land vehicle ever built?",
    "Compare hyperloop and high-speed rail",
    "How does autopilot really work?",
    "Which vehicle changed the world most?",
    "Most beautiful vehicle ever designed?",
    "What's next for personal transport?",
  ],
  cars: [
    "How does a transmission actually work?",
    "Best handling cars under $50k?",
    "History of the Porsche 911",
    "Hybrid vs full electric — which wins?",
    "What makes a Bugatti so fast?",
    "How crash safety has evolved",
  ],
  bikes: [
    "How do motorcycles stay upright?",
    "MotoGP vs Superbike — explain the difference",
    "Best beginner motorcycle in 2026?",
    "History of the Harley-Davidson",
    "Inside the Honda CBR engine",
    "Future of electric motorcycles",
  ],
  aircraft: [
    "How does a jet engine actually work?",
    "Why did the Concorde fail commercially?",
    "What makes the SR-71 unique?",
    "Compare the F-22 and F-35",
    "Future of supersonic flight",
    "How autopilot works on airliners",
  ],
  ships: [
    "How do submarines stay submerged?",
    "Largest container ship ever built?",
    "Why didn't the Titanic sink slowly?",
    "How aircraft carriers operate",
    "Future of autonomous shipping",
    "Diesel vs nuclear naval propulsion",
  ],
  trains: [
    "How do maglev trains work?",
    "Why is Shinkansen so reliable?",
    "Future of freight rail",
    "Inside a high-speed rail cab",
    "Steam to electric — the great shift",
    "Why hyperloop hasn't shipped yet",
  ],
  road: [
    "How do articulated buses turn?",
    "Future of electric trucking",
    "How trams differ from light rail",
    "Why BRT is overtaking metros in some cities",
    "Inside a fire engine pump",
    "Self-driving freight: where we are",
  ],
  experimental: [
    "How close are we to flying cars?",
    "What is an eVTOL really?",
    "Will hyperloop ever be built?",
    "Are jetpacks practical?",
    "How autonomous vehicles handle edge cases",
    "Future of personal urban air mobility",
  ],
};

interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
type SR = {
  continuous: boolean;
  interimResults: boolean;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

const MAX_ATTACHMENTS = 4;
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB per image
const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

async function fileToAttachment(file: File): Promise<Attachment> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  return {
    id: uid(),
    name: file.name,
    mimeType: file.type,
    data: base64,
    previewUrl: `data:${file.type};base64,${base64}`,
  };
}

export default function ChatInterface() {
  const activeCategory = useStore((s) => s.activeCategory);
  const chatHistory = useStore((s) => s.chatHistory);
  const appendMessage = useStore((s) => s.appendMessage);
  const truncateAfter = useStore((s) => s.truncateAfter);
  const pendingPrompt = useStore((s) => s.pendingPrompt);
  const setPendingPrompt = useStore((s) => s.setPendingPrompt);
  const hydrated = useStore((s) => s.hydrated);

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recRef = useRef<SR | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const greetingShownRef = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (chatHistory.length > 0) {
      greetingShownRef.current = true;
      return;
    }
    if (greetingShownRef.current) return;
    greetingShownRef.current = true;

    const cat = CATEGORY_LABELS[activeCategory];
    appendMessage({
      role: "bot",
      content: `Welcome to **${cat.label}** mode. Ask me anything about ${
        activeCategory === "all"
          ? "any machine that moves people or freight"
          : cat.label.toLowerCase()
      } — history, engineering, comparisons, or culture. ${cat.emoji}`,
      category: activeCategory,
    });
  }, [hydrated, activeCategory, appendMessage, chatHistory.length]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory.length, loading]);

  const sendMessage = useCallback(
    async (text: string, withAttachments?: Attachment[]) => {
      const trimmed = text.trim();
      const attached = withAttachments ?? [];
      if ((!trimmed && attached.length === 0) || sendingRef.current) return;

      sendingRef.current = true;
      setLoading(true);
      setInput("");
      setAttachments([]);

      const userMsg: Omit<ChatMessage, "id" | "ts"> = {
        role: "user",
        content: trimmed || "(image)",
        category: activeCategory,
        attachments: attached.length ? attached : undefined,
      };
      appendMessage(userMsg);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = useStore.getState().chatHistory.map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments?.map((a) => ({
            mimeType: a.mimeType,
            data: a.data,
          })),
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            category: activeCategory,
          }),
          signal: controller.signal,
        });

        const data = (await res.json()) as ChatApiResponse;
        if (!res.ok || data.error) {
          appendMessage({
            role: "bot",
            content: data.error
              ? data.error
              : "I couldn't reach the model. Please try again.",
            category: activeCategory,
          });
          if (res.status === 429) toast("Rate limit hit", "error");
          return;
        }

        appendMessage({
          role: "bot",
          content: data.answer || "I don't have an answer for that yet.",
          suggestions: data.suggestions,
          sources: data.sources,
          media: data.media,
          category: activeCategory,
        });
      } catch (e) {
        if ((e as Error)?.name === "AbortError") {
          appendMessage({
            role: "bot",
            content: "_Stopped._",
            category: activeCategory,
          });
          toast("Stopped", "info");
          return;
        }
        console.error(e);
        appendMessage({
          role: "bot",
          content: "Network error reaching the server. Please try again.",
          category: activeCategory,
        });
        toast("Network error", "error");
      } finally {
        setLoading(false);
        sendingRef.current = false;
        abortRef.current = null;
      }
    },
    [activeCategory, appendMessage],
  );

  // Pick up cross-component prompts (sidebar, ticker, surprise, timeline)
  useEffect(() => {
    if (!pendingPrompt) return;
    const prompt = pendingPrompt;
    setPendingPrompt(null);
    sendMessage(prompt);
  }, [pendingPrompt, sendMessage, setPendingPrompt]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleEdit = (messageId: string, newText: string) => {
    if (loading) return;
    const trimmed = newText.trim();
    if (!trimmed) return;
    truncateAfter(messageId);
    // Drop the edited user message itself; sendMessage will re-append it
    const history = useStore.getState().chatHistory;
    const filtered = history.filter((m) => m.id !== messageId);
    useStore.setState({ chatHistory: filtered });
    sendMessage(trimmed);
  };

  const toggleListen = () => {
    if (typeof window === "undefined") return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const W = window as unknown as {
      SpeechRecognition?: new () => SR;
      webkitSpeechRecognition?: new () => SR;
    };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      toast("Voice input not supported in this browser", "error");
      return;
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
    };
    rec.start();
    recRef.current = rec;
  };

  const handleAttachClick = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast(`Max ${MAX_ATTACHMENTS} images per message`, "info");
      return;
    }
    const accepted: Attachment[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (!ACCEPTED_MIME.includes(file.type)) {
        toast(`${file.name}: unsupported type`, "error");
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast(`${file.name}: must be under 4 MB`, "error");
        continue;
      }
      try {
        const att = await fileToAttachment(file);
        accepted.push(att);
      } catch {
        toast(`${file.name}: could not read`, "error");
      }
    }
    if (accepted.length) {
      setAttachments((prev) => [...prev, ...accepted].slice(0, MAX_ATTACHMENTS));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const submit = () => {
    sendMessage(input, attachments);
  };

  const showStarters = chatHistory.length <= 1 && !loading;
  const canSend = (!!input.trim() || attachments.length > 0) && !loading;

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto px-3 md:px-6 pt-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-1 pb-36">
          {chatHistory.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSuggestionClick={(s) => sendMessage(s)}
              onEdit={handleEdit}
              editingDisabled={loading}
            />
          ))}

          {loading && <TypingIndicator />}

          {showStarters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2"
            >
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">
                Try one of these
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS[activeCategory].slice(0, 6).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-sm bg-surface border border-border rounded-xl px-3 py-2.5 hover:border-accent hover:text-accent transition-colors text-text-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 md:px-6 pb-4 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-wrap gap-2 mb-2 px-1"
              >
                {attachments.map((a) => (
                  <div
                    key={a.id}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-surface-2 group"
                  >
                    <Image
                      src={a.previewUrl}
                      alt={a.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => removeAttachment(a.id)}
                      className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-surface border border-border rounded-full p-1.5 flex items-center shadow-lg gap-1">
            <button
              onClick={handleAttachClick}
              disabled={loading || attachments.length >= MAX_ATTACHMENTS}
              className="p-2.5 rounded-full text-text-secondary hover:text-accent hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Attach image"
              title="Attach image"
            >
              <Plus className="w-5 h-5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MIME.join(",")}
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) submit();
                }
              }}
              placeholder={
                attachments.length
                  ? `Ask about ${attachments.length === 1 ? "this image" : "these images"}…`
                  : `Ask anything about ${CATEGORY_LABELS[activeCategory].label.toLowerCase()}...`
              }
              className="flex-1 bg-transparent border-none text-text-primary px-2 py-2 outline-none text-sm min-w-0"
              disabled={loading}
            />

            <button
              onClick={toggleListen}
              disabled={loading && !listening}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                listening
                  ? "bg-red-500/15 text-red-400"
                  : "text-text-secondary hover:text-accent hover:bg-surface-2"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              title={listening ? "Stop voice" : "Voice input"}
            >
              {listening ? (
                <div className="relative">
                  <Square className="w-5 h-5" />
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {loading ? (
              <button
                onClick={handleStop}
                className="p-2.5 bg-red-500/90 text-white rounded-full hover:bg-red-500 transition-all flex-shrink-0 shadow shadow-red-500/30"
                aria-label="Stop generating"
                title="Stop"
              >
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canSend}
                className="p-2.5 bg-accent text-user-bubble-text rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow shadow-accent/20"
                aria-label="Send"
                title="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

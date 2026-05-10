"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import BookmarksPanel from "@/components/BookmarksPanel";
import FactsTicker from "@/components/FactsTicker";
import SurpriseButton from "@/components/SurpriseButton";
import Timeline from "@/components/Timeline";
import ComparisonModal from "@/components/ComparisonModal";
import { useStore } from "@/store/useStore";
import { CATEGORY_LIST, type Category } from "@/lib/types";

function CategoryQuerySync() {
  const params = useSearchParams();
  const setCategory = useStore((s) => s.setCategory);
  const clearChat = useStore((s) => s.clearChat);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const raw = params.get("cat");
    if (!raw) return;
    if (!CATEGORY_LIST.includes(raw as Category)) return;
    const current = useStore.getState().activeCategory;
    if (current !== raw) {
      clearChat();
      setCategory(raw as Category);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mv_visited", "1");
      const url = new URL(window.location.href);
      url.searchParams.delete("cat");
      window.history.replaceState({}, "", url.toString());
    }
  }, [params, hydrated, setCategory, clearChat]);

  return null;
}

export default function ChatPage() {
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const setPendingPrompt = useStore((s) => s.setPendingPrompt);

  const askInChat = (text: string) => setPendingPrompt(text);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Suspense fallback={null}>
        <CategoryQuerySync />
      </Suspense>
      <Navigation onOpenBookmarks={() => setBookmarksOpen(true)} />
      <FactsTicker onFactClick={(fact) => askInChat(`Tell me more about: ${fact}`)} />

      <main className="flex-1 flex overflow-hidden relative w-full">
        <Sidebar
          onTopicClick={askInChat}
          onOpenTimeline={() => setTimelineOpen(true)}
          onOpenCompare={() => setCompareOpen(true)}
        />
        <div className="flex-1 relative flex flex-col min-w-0 h-full overflow-hidden">
          <ChatInterface />
        </div>
      </main>

      <SurpriseButton onAsk={askInChat} />
      <BookmarksPanel
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
      />
      <Timeline
        isOpen={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        onAsk={askInChat}
      />
      <ComparisonModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}

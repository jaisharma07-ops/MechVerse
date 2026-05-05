"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import BookmarksPanel from "@/components/BookmarksPanel";
import FactsTicker from "@/components/FactsTicker";
import SurpriseButton from "@/components/SurpriseButton";
import Timeline from "@/components/Timeline";
import ComparisonModal from "@/components/ComparisonModal";
import { useStore } from "@/store/useStore";

export default function ChatPage() {
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const setPendingPrompt = useStore((s) => s.setPendingPrompt);

  const askInChat = (text: string) => setPendingPrompt(text);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
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

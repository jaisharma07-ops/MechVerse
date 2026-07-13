# MachineVerse — Product Requirements Document
**Version:** 1.0  
**Date:** April 2026  
**Author:** Draft for Review  

---

## 1. Product Overview

**MachineVerse** is an AI-powered, web-based knowledge platform dedicated entirely to machines and modes of transport. It serves as the world's most comprehensive, conversational, and visually rich encyclopedia for vehicles — from ancient sail ships to hypersonic aircraft. Any person — enthusiast, student, researcher, or curious mind — can arrive at MachineVerse and explore the entire world of transport through a guided, intelligent chatbot experience backed by real-time web intelligence.


---

## 2. Problem Statement

Transport knowledge is scattered across Wikipedia, Reddit, YouTube, forums, and manufacturer sites. There is no single, beautifully designed destination where someone can conversationally explore, compare, and learn about all modes of transport in one place. Existing encyclopedias are static, search engines return noise, and general-purpose AI chatbots lack the depth and context-aware guidance needed for this domain.

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Become the go-to transport knowledge destination | 10,000 MAU within 6 months of launch |
| High engagement per session | Avg. session > 8 minutes |
| Chatbot satisfaction | Thumbs-up rate > 80% |
| Return users | 40% of users return within 2 weeks |
| Breadth of coverage | All 7 major transport categories covered at launch |

---

## 4. Target Audience

- **Enthusiasts** — car fans, aviation geeks, rail buffs who want deep-dive knowledge
- **Students & Researchers** — looking for organized, citable information
- **Casual Explorers** — curious people who enjoy discovering facts
- **Professionals** — engineers, journalists, educators needing quick reference
- **Age range:** 13 and above; globally accessible

---

## 5. Core Features

### 5.1 Animated Loading / Onboarding Screen
- On first visit, a full-screen animated splash loads smoothly with the MachineVerse logo
- Background cycles through cinematic visuals of vehicles (car, aircraft, ship, etc.) with parallax motion
- A centered prompt appears: **"What world do you want to explore today?"**
- User is presented with vehicle category cards (icons + labels) to choose from, or a "Surprise Me" option
- Smooth fade/slide transition into the main chat interface after selection
- On repeat visits, onboarding is skipped unless user clicks "Change Mode"

### 5.2 Vehicle Category Selector (Dropdown + Mode System)
- Persistent dropdown in the top-right navigation bar
- Categories available:
  - 🚗 **Cars** — all passenger and performance automobiles
  - 🏍️ **Bikes** — motorcycles, scooters, bicycles, e-bikes
  - ✈️ **Aircraft** — commercial, military, private, drones, helicopters, spacecraft adjacent
  - 🚢 **Ships** — cargo vessels, naval ships, submarines, luxury liners, ferries
  - 🚂 **Trains** — metro, high-speed rail, freight, maglev, heritage rail
  - 🚌 **Road Transit** — buses, trams, trucks, vans, emergency vehicles
  - 🚀 **Experimental / Future** — hyperloop, flying cars, eVTOL, autonomous vehicles
- Default mode on first chat: **All Vehicles** (unrestricted)
- Switching category mid-chat restarts the context with a smooth transition animation
- Active category is always visually indicated in the header

### 5.3 AI Chatbot Core
- Gemini-powered conversational engine with domain-specific system prompt tuned for transport knowledge
- Supports natural language queries: specs, history, comparisons, safety records, engineering, culture
- On session start: warm greeting with context about the selected vehicle category
- **After the 2nd and 3rd user message**, the bot intelligently surfaces 3–4 follow-up question suggestions as clickable chips below its response
- Suggestions are generated dynamically based on what the user seems most interested in (e.g., if asking about a Ferrari's engine, suggest: *"How does the flat-plane crank work?", "Compare with Lamborghini V10", "Ferrari's F1 heritage"*)
- After 3rd message onward, suggestions appear only when the bot detects a natural exploration pivot point
- Responses include: text, bullet specs, embedded images, and source references

### 5.4 Real-Time Web Intelligence
- Chatbot augments its answers by scraping and summarizing:
  - **Wikipedia** — factual base, specs, history
  - **Reddit** (r/cars, r/aviation, r/trains, etc.) — community perspectives, ownership reviews
  - **Manufacturer official sites** — specs and press releases
  - **Enthusiast forums** (e.g., Pistonheads, PPRuNe, RailForums) — deep technical detail
  - **YouTube** — surfaces relevant video links (no embedding of full videos, just cards)
- Sources are always cited inline with expandable reference cards
- "Last updated" timestamp shown for factual claims

### 5.5 Vehicle Comparison Tool
- Accessible via "/compare" command in chat or a dedicated UI button
- User picks 2 vehicles of the same or different categories
- Side-by-side comparison card generated: specs, pros/cons, price range, top speed, range/fuel economy, safety rating
- AI provides a written verdict: *"Best for X because..."*
- Shareable as a link or downloadable as a PDF card

### 5.6 Timeline Explorer
- Each vehicle category has an interactive visual timeline
- Shows key milestones: inventions, record-breakers, iconic models, regulatory changes
- Clickable nodes open a mini deep-dive card
- Accessible from the sidebar as "History of [Category]"

### 5.7 Bookmark & Collections
- Users can bookmark any chat response snippet or vehicle page
- Collections organized by category automatically
- Stored in localStorage (no login required for basic use)
- Optional: Sign up to sync bookmarks across devices

### 5.8 "Did You Know?" Facts Ticker
- Animated scrolling ticker on the homepage and sidebar
- Rotates through curated and AI-generated transport facts
- Facts are category-aware (changes based on active mode)
- Clicking a fact opens a full chat thread about that topic

### 5.9 Random Explore
- A floating **"Surprise Me 🎲"** button
- Drops the user into a randomly selected vehicle deep-dive
- Bot introduces the vehicle with a fun hook and invites exploration
- Great for discovery and increasing time-on-site

### 5.10 Rich Media in Responses
- Responses can include:
  - **Image gallery** — sourced from Wikimedia Commons and manufacturer press kits
  - **Spec table cards** — auto-generated from structured data
  - **YouTube video cards** — thumbnail + link, not full embed
  - **Reddit thread previews** — community opinions surfaced cleanly

### 5.11 Voice Input
- Microphone button in the chat input bar
- Speech-to-text transcription (Web Speech API)
- Hands-free querying: ideal for mobile users
- Visual waveform animation while listening

### 5.12 Dark / Light Mode
- Toggle in top navigation
- Defaults to dark mode (vehicle aesthetic)
- Persists across sessions via localStorage

### 5.13 "Most Explored" Sidebar
- Shows trending topics and most-asked questions of the week
- Updated in real time or daily
- Clickable to start a chat thread on that topic
- Adds social proof and discovery value

---

## 6. User Flow

```
Landing Page (Animated Splash)
        ↓
Choose Vehicle Category (or All)
        ↓
Chat Interface Opens
  → User asks question [Prompt 1]
  → Bot answers with rich media + sources
  → User asks question [Prompt 2]
  → Bot answers + shows 3-4 suggested follow-ups
  → User asks [Prompt 3] or clicks a suggestion
  → Bot answers + suggestions continue contextually
        ↓
User can at any point:
  - Switch category (dropdown)
  - Use comparison tool
  - Bookmark a response
  - Open timeline explorer
  - Hit "Surprise Me"
  - Toggle dark/light mode
```

---

## 7. Design Direction

**Aesthetic:** Refined dark-industrial with kinetic energy. Think: the interior of a luxury car meets a flight deck. Not cartoonish, not sterile — confident and purposeful.

- **Color Palette:** Deep charcoal base (#0D0F14), electric amber accent (#F5A623), cool white text, subtle metallic gradients for category cards
- **Typography:** Display — a geometric, technical typeface (e.g., Bebas Neue or Barlow Condensed); Body — a clean humanist sans
- **Motion:** Smooth page transitions, hover micro-interactions on cards, subtle particle or grid background on the splash screen
- **Layout:** Wide-canvas chat with sidebar for tools; mobile-first responsive

---

## 8. Technical Architecture

### Frontend
- **Framework:** React (Next.js for SSR + SEO)
- **Styling:** Tailwind CSS + custom CSS variables
- **Animations:** Framer Motion
- **State:** Zustand for global state (mode, bookmarks, history)
- **Voice:** Web Speech API

### Backend / AI
- **Chatbot:** Gemini API (gemini-1.5-flash model) with a domain-specific system prompt
- **Web Search:** Tavily API (Free Tier) or Wikipedia API
- **Vector Store:** Supabase (pgvector) for embedding-based retrieval
- **API Layer:** Next.js Route Handlers (Edge Runtime)

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway or Fly.io (backend)
- **Database:** Supabase (PostgreSQL) for user accounts and bookmarks
- **CDN:** Cloudflare for images and static assets
- **Analytics:** PostHog (open-source, privacy-respecting)

---

## 9. Out of Scope (V1)

- User-generated content / community reviews
- E-commerce / affiliate links to vehicle purchases
- Native mobile app (web-responsive covers this)
- Full video streaming
- Multi-language support (English first, i18n ready)

---

## 10. Future Roadmap (V2+)

| Feature | Phase |
|---|---|
| User accounts + sync bookmarks | V2 |
| Multi-language support (Hindi, Spanish, French) | V2 |
| AR vehicle viewer (3D model in browser) | V2 |
| Community Q&A and upvoting | V3 |
| Native iOS/Android app | V3 |
| Vehicle news feed (daily digests) | V2 |
| Expert "deep dive" long-form articles | V2 |
| API access for developers | V3 |

---

## 11. Prompts to Start Building on Antigravity (Gemini)

Copy and paste these prompts **in order** into a new Antigravity project to build MachineVerse step by step.

---

### Prompt 1 — Project Scaffold & Design System

```
Build the foundational structure for a web app called "MachineVerse" — an AI-powered transport knowledge platform. Use React with Tailwind CSS.

Set up:
1. A global CSS design system with these variables:
   - Background: #0D0F14 (deep charcoal)
   - Accent: #F5A623 (electric amber)
   - Text primary: #F0F0F0
   - Text secondary: #8A8FA3
   - Card surface: #161A24
   - Border: rgba(255,255,255,0.08)
2. Import Google Fonts: "Barlow Condensed" for display text, "DM Sans" for body text
3. Create a main App component with:
   - A top navigation bar (logo left, category dropdown + dark/light toggle right)
   - A sidebar (collapsible on mobile)
   - A main content/chat area
4. Add a Zustand store with state for: activeCategory (default: "all"), darkMode (default: true), bookmarks (array)
5. The layout should be fully responsive.
```

---

### Prompt 2 — Animated Splash / Onboarding Screen

```
Create an animated onboarding splash screen component for MachineVerse.

Requirements:
- Full-screen overlay that shows on first visit (check localStorage for "hasVisited")
- Animated logo reveal at the top with a fade + slight upward motion
- Background: dark with a subtle animated grid or particle effect using CSS/canvas
- Tagline: "Explore Every Machine Ever Built" — appears letter by letter
- Below: a row of 7 animated vehicle category cards, each with:
  - An emoji icon (🚗 🏍️ ✈️ 🚢 🚂 🚌 🚀)
  - Category name
  - Hover: card lifts with amber glow
  - Click: stores selected category in Zustand, transitions out splash with a smooth fade, sets "hasVisited" in localStorage
- A "Explore All Vehicles" text link below the cards for the default all-mode
- All animations use CSS transitions or Framer Motion
- The entire screen should feel cinematic and confident, not playful or cartoony
```
---

### Prompt 3 — Vehicle Category Dropdown & Navigation

```
Build the top navigation bar for MachineVerse with these elements:

Left side:
- MachineVerse logo (stylized text in Barlow Condensed, amber accent color, with a small ⚙️ or custom SVG icon)

Right side:
- A custom dropdown for vehicle category selection with options:
  All Vehicles | Cars | Bikes | Aircraft | Ships | Trains | Road Transit | Experimental
- Dropdown styling: dark background, amber highlight on hover, smooth open/close animation
- Show the currently active category with an amber dot indicator
- When category changes: update Zustand activeCategory, show a brief toast notification ("Switched to Aircraft mode"), and clear chat history after user confirmation
- Dark/Light mode toggle button (moon/sun icon) that updates Zustand darkMode and applies a class to the root element
- A bookmark icon that opens a slide-in bookmarks panel from the right

Make the nav sticky, with a subtle backdrop blur on scroll.
```
---

### Prompt 4 — Core Chat Interface

```
Build the main chat interface component for MachineVerse.

Requirements:
- Chat history display area: scrollable, messages appear with a subtle slide-up animation
- User message bubbles: right-aligned, amber background, dark text
- Bot message bubbles: left-aligned, dark card surface, white text, with a small MachineVerse logo avatar
- Each bot message has:
  - A "Bookmark this" icon button (star icon) that saves to Zustand bookmarks
  - A "Copy" icon button
  - A "Sources" expandable section that lists cited URLs as clean pills
- Input area at the bottom:
  - Text input with placeholder: "Ask anything about [activeCategory]..."
  - Send button (amber, right side)
  - Microphone button (uses Web Speech API for voice input, shows waveform animation while listening)
- On session start, bot sends a welcome message based on activeCategory (e.g., "Welcome to Aircraft mode. Ask me anything about commercial jets, fighter planes, helicopters, or the future of flight.")
- After the user's 2nd message, render 3–4 clickable suggestion chips below the bot's response. These chips should be fetched from the AI based on conversation context.
- Chips are styled: pill shape, amber border, dark background, hover: amber fill
```

---

### Prompt 5 — AI Integration with Gemini API + Tavily Search

```
Integrate the Gemini API into MachineVerse's chat backend.

Create an API route (or serverless function) at /api/chat that:
1. Accepts: { messages: [], category: string }
2. Builds a system prompt:

"You are MachineVerse, the world's most knowledgeable guide to all machines and modes of transport. Your expertise covers cars, motorcycles, aircraft, ships, trains, buses, and experimental future vehicles. You provide accurate, engaging, and detailed information. Always cite your sources. When relevant, include key specs in a structured format. After your 2nd and 3rd response in a conversation, generate 3-4 smart follow-up question suggestions the user might want to explore next, formatted as a JSON array at the end of your response under the key 'suggestions'. Current mode: [category]."

3. Calls the Gemini API (gemini-1.5-flash) using the @google/generative-ai SDK.
4. Also enable search functionality using the Tavily API (or a basic Wikipedia/Google search wrapper) so the AI can fetch live information.
5. Parses the response: extract the main answer text and any 'suggestions' array.
6. Returns: { answer: string, suggestions: string[], sources: string[] }

On the frontend, display the answer text and render suggestions as clickable chips that auto-fill the chat input.
```

---

### Prompt 6 — Vehicle Comparison Tool

```
Build a Vehicle Comparison Tool for MachineVerse as a modal/panel component.

Trigger: A "Compare" button in the sidebar or the user types "/compare" in chat.

UI:
- Modal with two search inputs side by side: "Vehicle A" and "Vehicle B"
- Autocomplete suggestions as the user types (call the AI with a suggestion prompt)
- A "Compare" submit button

On submit:
- Call the Gemini API with prompt: "Compare [Vehicle A] vs [Vehicle B]. Return a JSON object with: { vehicleA: { name, type, topSpeed, range, price, pros: [], cons: [], summary }, vehicleB: {...}, verdict: string }"
- Render the result as a side-by-side card:
  - Vehicle name + image (sourced from Wikimedia)
  - Key specs as a mini table
  - Pros/Cons as green/red pills
  - A "Verdict" section at the bottom with the AI's recommendation
- Include a "Share" button that copies a URL with comparison params encoded
- Include a "Download" button that generates a simple PDF summary card

Style: dark card, amber divider line between the two vehicles, clean and readable.
```

---

### Prompt 7 — Timeline Explorer

```
Build a "Transport Timeline" feature for MachineVerse.

Accessible from the sidebar as "History of [Category]".

When opened (as a full-page panel or modal):
1. Call the Gemini API with: "Give me the 15 most important milestones in the history of [category]. Return as JSON: [{ year: number, title: string, description: string, significance: 'high'|'medium'|'low' }]"
2. Render an interactive vertical timeline:
   - Year markers on the left, event cards on the right
   - Cards alternate left-right on larger screens
   - High significance events have an amber glow
   - Clicking a card expands it with the full description and a "Learn More" button that opens a chat thread about that event
3. Add smooth scroll-triggered animations (cards fade in as user scrolls)
4. Style: dark background, amber timeline line, minimal and editorial
```

---

### Prompt 8 — "Did You Know?" Ticker + "Surprise Me" Button

```
Add two discovery features to MachineVerse:
Feature 1: Facts Ticker
- A horizontally scrolling ticker bar just below the navigation
- On load: call the Gemini API with "Give me 8 surprising, fascinating facts about [activeCategory] vehicles. Return as a JSON array of strings."
- Facts scroll left continuously with a smooth CSS animation
- Clicking a fact opens a chat thread: "Tell me more about: [fact]"
- Ticker updates when activeCategory changes

Feature 2: Surprise Me Button
- A floating circular button in the bottom-right of the screen (above the chat input)
- Icon: 🎲 or a dice SVG
- On click: call the Gemini API with "Pick a random, fascinating, lesser-known vehicle from [activeCategory] and introduce it to the user in an engaging way that makes them want to learn more. Start with 'Did you know about the [Vehicle Name]?'"
- Opens a new chat thread with this introduction
- Add a subtle rotation animation on hover
```

---

### Prompt 9 — Bookmarks Panel & Most Explored Sidebar

```
Build two sidebar features for MachineVerse:

Feature 1: Bookmarks Panel
- Slides in from the right when the bookmark icon in nav is clicked
- Lists all bookmarked chat snippets from Zustand state (persisted to localStorage)
- Each bookmark shows: first 80 chars of text, category tag, amber star icon to remove
- "Clear All" button at the bottom
- Clicking a bookmark scrolls to that message in chat history, or if in a new session, shows it as a standalone card

Feature 2: Most Explored Section (in left sidebar)
- Shows 5 trending topics, hardcoded for V1 but structured to be dynamic later
- Examples: "Tesla Model S Plaid", "Concorde History", "How Submarines Work", "Bullet Train Technology", "Formula 1 Aerodynamics"
- Each is a clickable pill that auto-sends that query to the chat
- Section header: "🔥 Trending Now"
- Below it: "💡 Suggested Starting Points" with 3 beginner-friendly prompts for the active category

Style both panels to match the dark design system with smooth slide animations.
```

---

### Prompt 10 — Polish, Responsive Design & Final Touches

```
Final polish pass for MachineVerse:

1. Responsive design:
   - Mobile: sidebar collapses to a bottom sheet, nav dropdown becomes a full-screen menu overlay, chat takes full width
   - Tablet: sidebar visible but narrow, chat area comfortable
   - Desktop: full three-column layout (sidebar | chat | tools panel)

2. Loading states:
   - Typing indicator (three animated dots) while bot is responding
   - Skeleton cards while comparison or timeline data loads
   - Smooth skeleton shimmer effect in amber/charcoal tones

3. Toast notifications:
   - Category switch confirmation
   - Bookmark saved/removed
   - Copy success

4. Empty states:
   - First time in chat: a grid of 6 suggested starter questions for the active category
   - Empty bookmarks: a friendly message with a prompt to start exploring

5. Accessibility:
   - All interactive elements have aria-labels
   - Keyboard navigable dropdown
   - Focus rings styled in amber

6. SEO (if using Next.js):
   - Meta tags per category page
   - OG image with MachineVerse branding

7. Performance:
   - Lazy load images
   - Debounce voice input
   - Memoize expensive components
```

---

## 12. Folder Structure (Suggested)

```
machineverse/
├── app/                    # Next.js app directory
│   ├── page.tsx            # Root (splash screen)
│   ├── chat/page.tsx       # Main chat interface
│   └── api/
│       ├── chat/route.ts   # Gemini API integration
│       └── search/route.ts # Tavily/Search integration
├── components/
│   ├── Splash.tsx
│   ├── Navigation.tsx
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   ├── SuggestionChips.tsx
│   ├── ComparisonModal.tsx
│   ├── Timeline.tsx
│   ├── FactsTicker.tsx
│   ├── BookmarksPanel.tsx
│   └── Sidebar.tsx
├── store/
│   └── useStore.ts         # Zustand global state
├── lib/
│   ├── gemini.ts           # Gemini API wrapper
│   └── search.ts           # Search utilities (Tavily/DDG)
├── styles/
│   └── globals.css         # Design tokens + base styles
└── public/
    └── icons/              # Vehicle category SVG icons
```
project about machines 
---

*End of PRD — MachineVerse v1.0*

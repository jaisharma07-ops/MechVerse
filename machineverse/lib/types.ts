export type Category =
  | "all"
  | "cars"
  | "bikes"
  | "aircraft"
  | "ships"
  | "trains"
  | "road"
  | "experimental";

export interface Source {
  url: string;
  domain: string;
  title?: string;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  /** base64 (no data: prefix) — used for sending to the API */
  data: string;
  /** data URL for rendering in the UI */
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  suggestions?: string[];
  sources?: Source[];
  media?: string[];
  attachments?: Attachment[];
  category?: Category;
  ts: number;
}

export interface Bookmark {
  id: string;
  text: string;
  category: Category;
  ts: number;
}

export interface ChatApiAttachment {
  mimeType: string;
  data: string; // base64 (no data: prefix)
}

export interface ChatApiMessage {
  role: "user" | "bot";
  content: string;
  attachments?: ChatApiAttachment[];
}

export interface ChatApiRequest {
  messages: ChatApiMessage[];
  category: Category;
}

export interface ChatApiResponse {
  answer: string;
  suggestions: string[];
  sources: Source[];
  media: string[];
  error?: string;
}

export interface VehicleSpec {
  name: string;
  type: string;
  manufacturer: string;
  yearIntroduced: string;
  topSpeed: string;
  range: string;
  price: string;
  weight: string;
  pros: string[];
  cons: string[];
  summary: string;
  imageQuery: string;
  imageUrl?: string | null;
}

export interface CompareApiResponse {
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
  verdict: string;
  error?: string;
}

export interface TimelineMilestone {
  year: number;
  title: string;
  description: string;
  significance: "high" | "medium" | "low";
}

export interface TimelineApiResponse {
  milestones: TimelineMilestone[];
  error?: string;
}

export interface FactsApiResponse {
  facts: string[];
  error?: string;
}

export interface SurpriseApiResponse {
  intro: string;
  vehicle: string;
  error?: string;
}

export const CATEGORY_LABELS: Record<Category, { label: string; emoji: string }> = {
  all: { label: "All Vehicles", emoji: "🌐" },
  cars: { label: "Cars", emoji: "🚗" },
  bikes: { label: "Bikes", emoji: "🏍️" },
  aircraft: { label: "Aircraft", emoji: "✈️" },
  ships: { label: "Ships", emoji: "🚢" },
  trains: { label: "Trains", emoji: "🚂" },
  road: { label: "Road Transit", emoji: "🚌" },
  experimental: { label: "Experimental", emoji: "🚀" },
};

export const CATEGORY_LIST: Category[] = [
  "all",
  "cars",
  "bikes",
  "aircraft",
  "ships",
  "trains",
  "road",
  "experimental",
];

export type FlowKey = "organizer" | "speaker" | "donor" | "admin" | "system" | "auth" | "booking";
export interface CaptainConfig {
  specPaths: { projectSpec: string; apiSpec: string };
  priority: FlowKey[];
  scores: Record<Exclude<FlowKey, "auth" | "booking">, number> & { organizer: number; speaker: number; donor: number; admin: number; system: number };
  thresholds: { deploy: number; warn: number };
  routes: Record<string, string>;
  razorpay: { enabled: boolean; modes: ("donation" | "booking")[] };
}
export interface ComplianceScore { flow: FlowKey; status: "missing" | "partial" | "complete"; score: number; notes?: string[]; }
export interface CaptainReport { timestamp: string; summary: string; totals: { score: number; status: "partial" | "ready" | "blocked" }; scores: ComplianceScore[]; actionsPlanned: string[]; actionsTaken: string[]; }


export type Tab = 'home' | 'compass' | 'identity' | 'defense' | 'review' | 'library' | 'settings';

export interface Identity {
  id: string;
  statement: string;
  proofs: string[];
  strength: number;
  votes: number;
  downvotes: number;
  streak: number;
  lastVoteDate?: number;
}

export interface Rule {
  id: string;
  category: 'rule' | 'principle' | 'value';
  text: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  description?: string; // Added description
  weight: number; // 0-10: IMPACT (How much this matters/affects your life)
  investment: number; // 0-10: EFFORT (Changed from 0-100 to 0-10 for consistency with other sliders)
  controllability: number; // 0-10: CONTROL (How much agency you have)
  lastUpdated: number;
}

export interface FailureMode {
  id: string;
  name: string;
  trigger: string;
  protocol: string[];
}

export interface DailyStackItem {
  id: string;
  type: 'identity' | 'trajectory' | 'portfolio' | 'prevention' | 'rule';
  title: string;
  subtitle?: string;
  completed: boolean;
}

export interface SmartStackOption {
  title: string;
  subtitle: string;
}

export interface SmartStackItem {
  id: string;
  type: 'identity' | 'trajectory' | 'portfolio' | 'prevention' | 'rule';
  title: string;
  subtitle?: string;
  completed: boolean;
  availableOptions: SmartStackOption[];
}

export interface InterrupterLog {
  id: string;
  timestamp: number;
  urge: string;
  intensity: number;
  success: boolean;
}

// AI Response Types
export interface DecisionResult {
  analysis: string;
  verdict: string;
  actionPlan: string[];
}

export interface WeeklyBriefing {
  governanceScore: number; // 0-100
  leakAnalysis: string;
  focusIdentity: string;
  tacticalAdjustment: string;
}

export interface RoadmapPhase {
  phaseName: string;
  steps: string[];
}

export interface Roadmap {
  goal: string;
  phases: RoadmapPhase[];
  nextAction: string;
}

export interface SimulationResult {
  oneDay: string;
  oneWeek: string;
  oneMonth: string;
  threeMonths: string;
  sixMonths: string;
  oneYear: string;
  tenYears: string;
}

export interface DeepDiveResult {
  title: string;
  items: { label: string; content: string }[];
  summary: string;
}

export interface SparkResult {
  title: string;
  content: string;
  category: string;
}

// Library / Saved Items
export type SavedItemType = 'decision' | 'simulation' | 'roadmap' | 'deepdive' | 'briefing' | 'spark';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  timestamp: number;
  data: DecisionResult | WeeklyBriefing | Roadmap | DeepDiveResult | SimulationResult | SparkResult;
  tags?: string[];
}
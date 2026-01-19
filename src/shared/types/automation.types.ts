export interface Point {
  x: number;
  y: number;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MatchResult {
  found: boolean;
  location?: Point;
  confidence?: number;
  region?: Region;
}

export interface ScreenCaptureResult {
  width: number;
  height: number;
  data: Buffer;
}

export interface Template {
  id: string;
  name: string;
  path: string;
  category: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export type AutomationStatus = 'idle' | 'running' | 'paused' | 'stopping';

export interface AutomationState {
  status: AutomationStatus;
  currentTaskId?: string;
  currentActionIndex?: number;
  totalActions?: number;
  startedAt?: string;
  executionCount: number;
  lastError?: string;
}

export interface AutomationConfig {
  defaultConfidence: number;
  defaultDelay: number;
  randomDelayVariation: number;
  emergencyStopKey: string;
  highlightMatches: boolean;
  captureRegion?: Region;
}

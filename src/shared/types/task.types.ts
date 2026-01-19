export type ActionType =
  | 'click'
  | 'double-click'
  | 'right-click'
  | 'type'
  | 'press-key'
  | 'hotkey'
  | 'wait'
  | 'find-image'
  | 'wait-for-image'
  | 'condition'
  | 'loop';

export type ClickTarget =
  | { type: 'coordinates'; x: number; y: number }
  | { type: 'image'; templateName: string }
  | { type: 'variable'; variableName: string };

export type LoopType = 'count' | 'while-image-visible' | 'until-image-visible' | 'infinite';

export interface BaseAction {
  id: string;
  type: ActionType;
  description?: string;
  delayBefore?: number;
  delayAfter?: number;
  continueOnError?: boolean;
}

export interface ClickAction extends BaseAction {
  type: 'click' | 'double-click' | 'right-click';
  target: ClickTarget;
  offsetX?: number;
  offsetY?: number;
  randomOffset?: number;
}

export interface TypeAction extends BaseAction {
  type: 'type';
  text: string;
  delayBetweenKeys?: number;
}

export interface PressKeyAction extends BaseAction {
  type: 'press-key';
  key: string;
}

export interface HotkeyAction extends BaseAction {
  type: 'hotkey';
  keys: string[];
}

export interface WaitAction extends BaseAction {
  type: 'wait';
  duration: number;
  randomVariation?: number;
}

export interface FindImageAction extends BaseAction {
  type: 'find-image';
  templateName: string;
  confidence?: number;
  region?: { x: number; y: number; width: number; height: number };
  storeResultIn?: string;
}

export interface WaitForImageAction extends BaseAction {
  type: 'wait-for-image';
  templateName: string;
  timeout: number;
  confidence?: number;
  storeResultIn?: string;
  waitForDisappear?: boolean;
}

export interface ConditionAction extends BaseAction {
  type: 'condition';
  conditionType: 'image-visible' | 'image-not-visible' | 'variable-equals';
  templateName?: string;
  variableName?: string;
  variableValue?: string;
  thenActions: Action[];
  elseActions?: Action[];
}

export interface LoopAction extends BaseAction {
  type: 'loop';
  loopType: LoopType;
  count?: number;
  templateName?: string;
  maxIterations?: number;
  actions: Action[];
}

export type Action =
  | ClickAction
  | TypeAction
  | PressKeyAction
  | HotkeyAction
  | WaitAction
  | FindImageAction
  | WaitForImageAction
  | ConditionAction
  | LoopAction;

export interface Task {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  actions: Action[];
  createdAt: string;
  updatedAt: string;
  runCount: number;
  lastRunAt?: string;
  lastRunSuccess?: boolean;
}

export type TaskStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'completed' | 'error';

export interface TaskExecutionContext {
  taskId: string;
  variables: Record<string, unknown>;
  currentActionIndex: number;
  status: TaskStatus;
  startedAt?: string;
  error?: string;
}

export interface ScheduledTask {
  id: string;
  taskId: string;
  scheduleType: 'once' | 'interval' | 'cron';
  scheduleValue: string | number;
  enabled: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
}

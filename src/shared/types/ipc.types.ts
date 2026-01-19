import type { Task, TaskExecutionContext, ScheduledTask } from './task.types';
import type { AutomationState, AutomationConfig, MatchResult, Template, Region } from './automation.types';

export type IpcChannel =
  // Automation control
  | 'automation:start'
  | 'automation:stop'
  | 'automation:pause'
  | 'automation:resume'
  | 'automation:get-status'
  | 'automation:status-update'

  // Task management
  | 'task:get-all'
  | 'task:get'
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'task:run'
  | 'task:execution-update'

  // Schedule management
  | 'schedule:get-all'
  | 'schedule:create'
  | 'schedule:update'
  | 'schedule:delete'

  // Screen & Vision
  | 'screen:capture'
  | 'screen:find-image'
  | 'screen:get-mouse-position'

  // Templates
  | 'template:get-all'
  | 'template:add'
  | 'template:delete'
  | 'template:capture-region'

  // Settings
  | 'settings:get'
  | 'settings:set'

  // Logs
  | 'log:get-recent'
  | 'log:new-entry'
  | 'log:clear';

export interface IpcRequest<T = unknown> {
  channel: IpcChannel;
  data?: T;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Request/Response type definitions
export interface AutomationStartRequest {
  taskId: string;
}

export interface ScreenCaptureRequest {
  region?: Region;
}

export interface FindImageRequest {
  templateName: string;
  confidence?: number;
  region?: Region;
}

export interface TaskRunRequest {
  taskId: string;
}

export interface TemplateAddRequest {
  name: string;
  category: string;
  region: Region;
}

export interface SettingsGetRequest {
  key: string;
}

export interface SettingsSetRequest {
  key: string;
  value: unknown;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
}

// Event payloads
export interface AutomationStatusUpdatePayload extends AutomationState {}

export interface TaskExecutionUpdatePayload extends TaskExecutionContext {}

export interface LogNewEntryPayload extends LogEntry {}

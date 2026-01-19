export const APP_NAME = 'ROX Bot';
export const APP_VERSION = '1.0.0';

export const DEFAULT_AUTOMATION_CONFIG = {
  defaultConfidence: 0.9,
  defaultDelay: 100,
  randomDelayVariation: 50,
  emergencyStopKey: 'F12',
  highlightMatches: true,
};

export const KEYS = {
  EMERGENCY_STOP: 'F12',
};

export const TEMPLATE_CATEGORIES = [
  'ui',
  'buttons',
  'dialogs',
  'inventory',
  'map',
  'quest',
  'shop',
  'other',
] as const;

export const IPC_CHANNELS = {
  // Automation
  AUTOMATION_START: 'automation:start',
  AUTOMATION_STOP: 'automation:stop',
  AUTOMATION_PAUSE: 'automation:pause',
  AUTOMATION_RESUME: 'automation:resume',
  AUTOMATION_GET_STATUS: 'automation:get-status',
  AUTOMATION_STATUS_UPDATE: 'automation:status-update',

  // Tasks
  TASK_GET_ALL: 'task:get-all',
  TASK_GET: 'task:get',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_RUN: 'task:run',
  TASK_EXECUTION_UPDATE: 'task:execution-update',

  // Schedules
  SCHEDULE_GET_ALL: 'schedule:get-all',
  SCHEDULE_CREATE: 'schedule:create',
  SCHEDULE_UPDATE: 'schedule:update',
  SCHEDULE_DELETE: 'schedule:delete',

  // Screen
  SCREEN_CAPTURE: 'screen:capture',
  SCREEN_FIND_IMAGE: 'screen:find-image',
  SCREEN_GET_MOUSE_POSITION: 'screen:get-mouse-position',

  // Templates
  TEMPLATE_GET_ALL: 'template:get-all',
  TEMPLATE_ADD: 'template:add',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_CAPTURE_REGION: 'template:capture-region',
  TEMPLATE_IMPORT_FILE: 'template:import-file',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Logs
  LOG_GET_RECENT: 'log:get-recent',
  LOG_NEW_ENTRY: 'log:new-entry',
  LOG_CLEAR: 'log:clear',
} as const;

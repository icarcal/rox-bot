import { create } from 'zustand';
import type { Task, Template, AutomationState, LogEntry, AutomationConfig } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';

interface AppState {
  // Navigation
  activeView: 'tasks' | 'templates' | 'logs' | 'settings';
  setActiveView: (view: AppState['activeView']) => void;

  // Tasks
  tasks: Task[];
  selectedTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  selectTask: (id: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;

  // Templates
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;

  // Automation
  automationState: AutomationState;
  setAutomationState: (state: Partial<AutomationState>) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  setLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;

  // Settings
  config: AutomationConfig;
  setConfig: (config: Partial<AutomationConfig>) => void;

  // Actions
  loadInitialData: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  activeView: 'tasks',
  setActiveView: (view) => set({ activeView: view }),

  // Tasks
  tasks: [],
  selectedTaskId: null,
  setTasks: (tasks) => set({ tasks }),
  selectTask: (id) => set({ selectedTaskId: id }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    })),

  // Templates
  templates: [],
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),

  // Automation
  automationState: {
    status: 'idle',
    executionCount: 0,
  },
  setAutomationState: (newState) =>
    set((state) => ({
      automationState: { ...state.automationState, ...newState },
    })),

  // Logs
  logs: [],
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 500),
    })),
  setLogs: (logs) => set({ logs }),
  clearLogs: () => set({ logs: [] }),

  // Settings
  config: {
    defaultConfidence: 0.9,
    defaultDelay: 100,
    randomDelayVariation: 50,
    emergencyStopKey: 'F12',
    highlightMatches: true,
  },
  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  // Load initial data
  loadInitialData: async () => {
    try {
      // Load tasks
      const tasksRes = await window.electronAPI.invoke(IPC_CHANNELS.TASK_GET_ALL);
      if (tasksRes.success && tasksRes.data) {
        set({ tasks: tasksRes.data as Task[] });
      }

      // Load templates
      const templatesRes = await window.electronAPI.invoke(IPC_CHANNELS.TEMPLATE_GET_ALL);
      if (templatesRes.success && templatesRes.data) {
        set({ templates: templatesRes.data as Template[] });
      }

      // Load config
      const configRes = await window.electronAPI.invoke(IPC_CHANNELS.SETTINGS_GET, { key: 'automationConfig' });
      if (configRes.success && configRes.data) {
        set({ config: configRes.data as AutomationConfig });
      }

      // Load recent logs
      const logsRes = await window.electronAPI.invoke(IPC_CHANNELS.LOG_GET_RECENT, { count: 100 });
      if (logsRes.success && logsRes.data) {
        set({ logs: logsRes.data as LogEntry[] });
      }

      // Subscribe to automation status updates
      window.electronAPI.on(IPC_CHANNELS.AUTOMATION_STATUS_UPDATE, (data) => {
        get().setAutomationState(data as Partial<AutomationState>);
      });

      // Subscribe to new log entries
      window.electronAPI.on(IPC_CHANNELS.LOG_NEW_ENTRY, (data) => {
        get().addLog(data as LogEntry);
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  },
}));

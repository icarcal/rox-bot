import Store from 'electron-store';
import type { Task, ScheduledTask, Template, AutomationConfig } from '../../shared/types';
import { DEFAULT_AUTOMATION_CONFIG } from '../../shared/constants';

interface StoreSchema {
  tasks: Record<string, Task>;
  scheduledTasks: Record<string, ScheduledTask>;
  templates: Record<string, Template>;
  automationConfig: AutomationConfig;
  settings: Record<string, unknown>;
}

class StorageServiceClass {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'rox-bot-data',
      defaults: {
        tasks: {},
        scheduledTasks: {},
        templates: {},
        automationConfig: DEFAULT_AUTOMATION_CONFIG,
        settings: {},
      },
    });
  }

  // Tasks
  getAllTasks(): Task[] {
    const tasks = this.store.get('tasks', {});
    return Object.values(tasks);
  }

  getTask(id: string): Task | undefined {
    return this.store.get(`tasks.${id}`);
  }

  saveTask(task: Task): void {
    this.store.set(`tasks.${task.id}`, task);
  }

  deleteTask(id: string): void {
    this.store.delete(`tasks.${id}` as keyof StoreSchema);
  }

  // Scheduled Tasks
  getAllScheduledTasks(): ScheduledTask[] {
    const tasks = this.store.get('scheduledTasks', {});
    return Object.values(tasks);
  }

  getScheduledTask(id: string): ScheduledTask | undefined {
    return this.store.get(`scheduledTasks.${id}`);
  }

  saveScheduledTask(task: ScheduledTask): void {
    this.store.set(`scheduledTasks.${task.id}`, task);
  }

  deleteScheduledTask(id: string): void {
    this.store.delete(`scheduledTasks.${id}` as keyof StoreSchema);
  }

  // Templates
  getAllTemplates(): Template[] {
    const templates = this.store.get('templates', {});
    return Object.values(templates);
  }

  getTemplate(id: string): Template | undefined {
    return this.store.get(`templates.${id}`);
  }

  saveTemplate(template: Template): void {
    this.store.set(`templates.${template.id}`, template);
  }

  deleteTemplate(id: string): void {
    this.store.delete(`templates.${id}` as keyof StoreSchema);
  }

  // Automation Config
  getAutomationConfig(): AutomationConfig {
    return this.store.get('automationConfig', DEFAULT_AUTOMATION_CONFIG);
  }

  setAutomationConfig(config: Partial<AutomationConfig>): void {
    const current = this.getAutomationConfig();
    this.store.set('automationConfig', { ...current, ...config });
  }

  // Generic Settings
  getSetting<T>(key: string, defaultValue?: T): T | undefined {
    return this.store.get(`settings.${key}`, defaultValue) as T | undefined;
  }

  setSetting(key: string, value: unknown): void {
    this.store.set(`settings.${key}`, value);
  }
}

export const StorageService = new StorageServiceClass();

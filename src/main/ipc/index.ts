import { ipcMain } from 'electron';
import type { AutomationEngine } from '../../automation/core/Engine';
import { registerAutomationHandlers } from './automation.ipc';
import { registerTaskHandlers } from './task.ipc';
import { registerScreenHandlers } from './screen.ipc';
import { registerTemplateHandlers } from './template.ipc';
import { registerSettingsHandlers } from './settings.ipc';
import { registerLogHandlers } from './log.ipc';

export function registerAllIpcHandlers(engine: AutomationEngine): void {
  registerAutomationHandlers(engine);
  registerTaskHandlers();
  registerScreenHandlers();
  registerTemplateHandlers();
  registerSettingsHandlers();
  registerLogHandlers();
}

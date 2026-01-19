import { ipcMain } from 'electron';
import type { IpcResponse, SettingsGetRequest, SettingsSetRequest, AutomationConfig } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { StorageService } from '../services/StorageService';
import { LogService } from '../services/LogService';

export function registerSettingsHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_GET,
    async (_event, data: SettingsGetRequest): Promise<IpcResponse> => {
      try {
        if (data.key === 'automationConfig') {
          const config = StorageService.getAutomationConfig();
          return { success: true, data: config };
        }
        const value = StorageService.getSetting(data.key);
        return { success: true, data: value };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to get setting', { error: message, key: data.key });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET,
    async (_event, data: SettingsSetRequest): Promise<IpcResponse> => {
      try {
        if (data.key === 'automationConfig') {
          StorageService.setAutomationConfig(data.value as Partial<AutomationConfig>);
        } else {
          StorageService.setSetting(data.key, data.value);
        }
        LogService.info('Setting updated', { key: data.key });
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to set setting', { error: message, key: data.key });
        return { success: false, error: message };
      }
    }
  );
}

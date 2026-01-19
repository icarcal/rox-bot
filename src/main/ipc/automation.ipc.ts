import { ipcMain } from 'electron';
import type { AutomationEngine } from '../../automation/core/Engine';
import type { IpcResponse, AutomationStartRequest } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { LogService } from '../services/LogService';

export function registerAutomationHandlers(engine: AutomationEngine): void {
  ipcMain.handle(
    IPC_CHANNELS.AUTOMATION_START,
    async (_event, data: AutomationStartRequest): Promise<IpcResponse> => {
      try {
        LogService.info('Starting automation', { taskId: data.taskId });
        await engine.startTask(data.taskId);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to start automation', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.AUTOMATION_STOP, async (): Promise<IpcResponse> => {
    try {
      LogService.info('Stopping automation');
      await engine.stop();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Failed to stop automation', { error: message });
      return { success: false, error: message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTOMATION_PAUSE, async (): Promise<IpcResponse> => {
    try {
      LogService.info('Pausing automation');
      engine.pause();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Failed to pause automation', { error: message });
      return { success: false, error: message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTOMATION_RESUME, async (): Promise<IpcResponse> => {
    try {
      LogService.info('Resuming automation');
      engine.resume();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Failed to resume automation', { error: message });
      return { success: false, error: message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AUTOMATION_GET_STATUS, async (): Promise<IpcResponse> => {
    try {
      const status = engine.getStatus();
      return { success: true, data: status };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  });
}

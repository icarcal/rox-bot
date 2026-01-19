import { ipcMain } from 'electron';
import type { IpcResponse, LogEntry } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { LogService } from '../services/LogService';

export function registerLogHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.LOG_GET_RECENT,
    async (_event, data?: { count?: number }): Promise<IpcResponse<LogEntry[]>> => {
      try {
        const logs = LogService.getRecentLogs(data?.count);
        return { success: true, data: logs };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.LOG_CLEAR, async (): Promise<IpcResponse> => {
    try {
      LogService.clearLogs();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  });
}

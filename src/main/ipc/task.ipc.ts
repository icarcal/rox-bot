import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import type { IpcResponse, Task } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { StorageService } from '../services/StorageService';
import { LogService } from '../services/LogService';

export function registerTaskHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.TASK_GET_ALL, async (): Promise<IpcResponse<Task[]>> => {
    try {
      const tasks = StorageService.getAllTasks();
      return { success: true, data: tasks };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Failed to get tasks', { error: message });
      return { success: false, error: message };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.TASK_GET,
    async (_event, data: { id: string }): Promise<IpcResponse<Task>> => {
      try {
        const task = StorageService.getTask(data.id);
        if (!task) {
          return { success: false, error: 'Task not found' };
        }
        return { success: true, data: task };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to get task', { error: message, taskId: data.id });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TASK_CREATE,
    async (_event, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Promise<IpcResponse<Task>> => {
      try {
        const now = new Date().toISOString();
        const task: Task = {
          ...data,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          runCount: 0,
        };
        StorageService.saveTask(task);
        LogService.info('Task created', { taskId: task.id, name: task.name });
        return { success: true, data: task };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to create task', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TASK_UPDATE,
    async (_event, data: Task): Promise<IpcResponse<Task>> => {
      try {
        const existing = StorageService.getTask(data.id);
        if (!existing) {
          return { success: false, error: 'Task not found' };
        }
        const updated: Task = {
          ...data,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveTask(updated);
        LogService.info('Task updated', { taskId: data.id, name: data.name });
        return { success: true, data: updated };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to update task', { error: message, taskId: data.id });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TASK_DELETE,
    async (_event, data: { id: string }): Promise<IpcResponse> => {
      try {
        StorageService.deleteTask(data.id);
        LogService.info('Task deleted', { taskId: data.id });
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to delete task', { error: message, taskId: data.id });
        return { success: false, error: message };
      }
    }
  );
}

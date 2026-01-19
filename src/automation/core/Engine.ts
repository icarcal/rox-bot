import type { Task, AutomationState, TaskExecutionContext } from '../../shared/types';
import { TaskRunner } from './TaskRunner';
import { StorageService } from '../../main/services/StorageService';
import { LogService } from '../../main/services/LogService';
import { sendToRenderer } from '../../main/window';
import { IPC_CHANNELS } from '../../shared/constants';

export class AutomationEngine {
  private state: AutomationState = {
    status: 'idle',
    executionCount: 0,
  };

  private taskRunner: TaskRunner | null = null;
  private currentContext: TaskExecutionContext | null = null;

  constructor() {
    this.taskRunner = new TaskRunner();
    this.taskRunner.on('actionStart', (index, total) => {
      this.updateState({
        currentActionIndex: index,
        totalActions: total,
      });
    });

    this.taskRunner.on('actionComplete', (index) => {
      this.updateState({ currentActionIndex: index + 1 });
    });

    this.taskRunner.on('error', (error) => {
      this.updateState({
        status: 'idle',
        lastError: error.message,
      });
    });

    this.taskRunner.on('complete', () => {
      this.state.executionCount++;
      this.updateState({
        status: 'idle',
        currentTaskId: undefined,
        currentActionIndex: undefined,
        totalActions: undefined,
      });
    });
  }

  async startTask(taskId: string): Promise<void> {
    if (this.state.status === 'running') {
      throw new Error('Automation is already running');
    }

    const task = StorageService.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (!task.enabled) {
      throw new Error(`Task is disabled: ${task.name}`);
    }

    LogService.info('Starting task', { taskId, name: task.name });

    this.currentContext = {
      taskId,
      variables: {},
      currentActionIndex: 0,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    this.updateState({
      status: 'running',
      currentTaskId: taskId,
      currentActionIndex: 0,
      totalActions: task.actions.length,
      startedAt: new Date().toISOString(),
      lastError: undefined,
    });

    try {
      await this.taskRunner!.run(task, this.currentContext);

      // Update task statistics
      const updatedTask: Task = {
        ...task,
        runCount: task.runCount + 1,
        lastRunAt: new Date().toISOString(),
        lastRunSuccess: true,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveTask(updatedTask);

      LogService.info('Task completed successfully', { taskId, name: task.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Task failed', { taskId, name: task.name, error: message });

      // Update task with failure
      const updatedTask: Task = {
        ...task,
        runCount: task.runCount + 1,
        lastRunAt: new Date().toISOString(),
        lastRunSuccess: false,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveTask(updatedTask);

      this.updateState({
        status: 'idle',
        lastError: message,
      });

      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.taskRunner) {
      this.taskRunner.stop();
    }

    this.updateState({
      status: 'stopping',
      currentTaskId: undefined,
      currentActionIndex: undefined,
      totalActions: undefined,
    });

    LogService.info('Automation stopped by user');
  }

  pause(): void {
    if (this.state.status !== 'running') {
      return;
    }

    if (this.taskRunner) {
      this.taskRunner.pause();
    }

    this.updateState({ status: 'paused' });
    LogService.info('Automation paused');
  }

  resume(): void {
    if (this.state.status !== 'paused') {
      return;
    }

    if (this.taskRunner) {
      this.taskRunner.resume();
    }

    this.updateState({ status: 'running' });
    LogService.info('Automation resumed');
  }

  emergencyStop(): void {
    if (this.taskRunner) {
      this.taskRunner.emergencyStop();
    }

    this.updateState({
      status: 'idle',
      currentTaskId: undefined,
      currentActionIndex: undefined,
      totalActions: undefined,
      lastError: 'Emergency stop activated',
    });

    LogService.warn('Emergency stop activated');
  }

  getStatus(): AutomationState {
    return { ...this.state };
  }

  private updateState(updates: Partial<AutomationState>): void {
    this.state = { ...this.state, ...updates };
    sendToRenderer(IPC_CHANNELS.AUTOMATION_STATUS_UPDATE, this.state);
  }
}

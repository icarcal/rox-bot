import { EventEmitter } from 'events';
import type { Task, Action, TaskExecutionContext } from '../../shared/types';
import { ActionExecutor } from '../actions/ActionExecutor';
import { LogService } from '../../main/services/LogService';
import { StorageService } from '../../main/services/StorageService';

export class TaskRunner extends EventEmitter {
  private executor: ActionExecutor;
  private isPaused = false;
  private shouldStop = false;

  constructor() {
    super();
    this.executor = new ActionExecutor();
  }

  async run(task: Task, context: TaskExecutionContext): Promise<void> {
    this.isPaused = false;
    this.shouldStop = false;

    const config = StorageService.getAutomationConfig();

    try {
      await this.executeActions(task.actions, context, config.defaultDelay);
      this.emit('complete');
    } catch (error) {
      this.emit('error', error);
      throw error;
    } finally {
      // Task execution complete
    }
  }

  private async executeActions(
    actions: Action[],
    context: TaskExecutionContext,
    defaultDelay: number
  ): Promise<void> {
    for (let i = 0; i < actions.length; i++) {
      // Check for stop/pause
      await this.checkPauseAndStop();

      if (this.shouldStop) {
        LogService.info('Task execution stopped');
        break;
      }

      const action = actions[i];
      context.currentActionIndex = i;

      this.emit('actionStart', i, actions.length);
      LogService.debug('Executing action', {
        index: i,
        type: action.type,
        description: action.description
      });

      try {
        // Delay before action
        const delayBefore = action.delayBefore ?? 0;
        if (delayBefore > 0) {
          await this.sleep(delayBefore);
        }

        // Execute the action
        await this.executor.execute(action, context);

        // Delay after action
        const delayAfter = action.delayAfter ?? defaultDelay;
        if (delayAfter > 0) {
          await this.sleep(this.addRandomVariation(delayAfter));
        }

        this.emit('actionComplete', i);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Action failed', {
          index: i,
          type: action.type,
          error: message
        });

        if (!action.continueOnError) {
          throw error;
        }

        LogService.warn('Continuing despite error (continueOnError=true)');
      }
    }
  }

  private async checkPauseAndStop(): Promise<void> {
    while (this.isPaused && !this.shouldStop) {
      await this.sleep(100);
    }
  }

  stop(): void {
    this.shouldStop = true;
    this.isPaused = false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  emergencyStop(): void {
    this.shouldStop = true;
    this.isPaused = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private addRandomVariation(delay: number): number {
    const config = StorageService.getAutomationConfig();
    const variation = Math.floor(Math.random() * config.randomDelayVariation * 2) - config.randomDelayVariation;
    return Math.max(10, delay + variation);
  }
}

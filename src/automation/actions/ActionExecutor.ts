import type {
  Action,
  TaskExecutionContext,
  ClickAction,
  TypeAction,
  PressKeyAction,
  HotkeyAction,
  WaitAction,
  FindImageAction,
  WaitForImageAction,
  ConditionAction,
  LoopAction,
  Point,
} from '../../shared/types';
import { MouseController } from '../input/MouseController';
import { KeyboardController } from '../input/KeyboardController';
import { ScreenService } from '../vision/ScreenService';
import { LogService } from '../../main/services/LogService';

export class ActionExecutor {
  async execute(action: Action, context: TaskExecutionContext): Promise<void> {
    switch (action.type) {
      case 'click':
      case 'double-click':
      case 'right-click':
        await this.executeClick(action as ClickAction, context);
        break;
      case 'type':
        await this.executeType(action as TypeAction);
        break;
      case 'press-key':
        await this.executePressKey(action as PressKeyAction);
        break;
      case 'hotkey':
        await this.executeHotkey(action as HotkeyAction);
        break;
      case 'wait':
        await this.executeWait(action as WaitAction);
        break;
      case 'find-image':
        await this.executeFindImage(action as FindImageAction, context);
        break;
      case 'wait-for-image':
        await this.executeWaitForImage(action as WaitForImageAction, context);
        break;
      case 'condition':
        await this.executeCondition(action as ConditionAction, context);
        break;
      case 'loop':
        await this.executeLoop(action as LoopAction, context);
        break;
      default:
        throw new Error(`Unknown action type: ${(action as Action).type}`);
    }
  }

  private async executeClick(action: ClickAction, context: TaskExecutionContext): Promise<void> {
    const point = await this.resolveClickTarget(action, context);

    // Apply offsets
    const finalPoint: Point = {
      x: point.x + (action.offsetX || 0),
      y: point.y + (action.offsetY || 0),
    };

    // Apply random offset if configured
    if (action.randomOffset) {
      finalPoint.x += Math.floor(Math.random() * action.randomOffset * 2) - action.randomOffset;
      finalPoint.y += Math.floor(Math.random() * action.randomOffset * 2) - action.randomOffset;
    }

    switch (action.type) {
      case 'click':
        await MouseController.click(finalPoint);
        break;
      case 'double-click':
        await MouseController.doubleClick(finalPoint);
        break;
      case 'right-click':
        await MouseController.rightClick(finalPoint);
        break;
    }

    LogService.debug('Click executed', { type: action.type, point: finalPoint });
  }

  private async resolveClickTarget(action: ClickAction, context: TaskExecutionContext): Promise<Point> {
    const { target } = action;

    switch (target.type) {
      case 'coordinates':
        return { x: target.x, y: target.y };

      case 'image': {
        const result = await ScreenService.findImage(target.templateName);
        if (!result.found || !result.location) {
          throw new Error(`Image not found: ${target.templateName}`);
        }
        return result.location;
      }

      case 'variable': {
        const value = context.variables[target.variableName];
        if (!value || typeof value !== 'object') {
          throw new Error(`Variable not found or invalid: ${target.variableName}`);
        }
        const point = value as Point;
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
          throw new Error(`Variable is not a valid point: ${target.variableName}`);
        }
        return point;
      }

      default:
        throw new Error(`Unknown target type`);
    }
  }

  private async executeType(action: TypeAction): Promise<void> {
    await KeyboardController.type(action.text, action.delayBetweenKeys);
    LogService.debug('Type executed', { text: action.text.substring(0, 20) + '...' });
  }

  private async executePressKey(action: PressKeyAction): Promise<void> {
    await KeyboardController.pressKey(action.key);
    LogService.debug('Key pressed', { key: action.key });
  }

  private async executeHotkey(action: HotkeyAction): Promise<void> {
    await KeyboardController.hotkey(action.keys);
    LogService.debug('Hotkey executed', { keys: action.keys });
  }

  private async executeWait(action: WaitAction): Promise<void> {
    let duration = action.duration;

    if (action.randomVariation) {
      const variation = Math.floor(Math.random() * action.randomVariation * 2) - action.randomVariation;
      duration = Math.max(0, duration + variation);
    }

    await this.sleep(duration);
    LogService.debug('Wait completed', { duration });
  }

  private async executeFindImage(action: FindImageAction, context: TaskExecutionContext): Promise<void> {
    const result = await ScreenService.findImage(
      action.templateName,
      action.confidence,
      action.region
    );

    if (action.storeResultIn) {
      if (result.found && result.location) {
        context.variables[action.storeResultIn] = result.location;
        LogService.debug('Image found and stored', {
          template: action.templateName,
          variable: action.storeResultIn,
          location: result.location
        });
      } else {
        context.variables[action.storeResultIn] = null;
        LogService.debug('Image not found', { template: action.templateName });
      }
    }
  }

  private async executeWaitForImage(action: WaitForImageAction, context: TaskExecutionContext): Promise<void> {
    const result = await ScreenService.waitForImage(
      action.templateName,
      action.timeout,
      action.confidence,
      action.waitForDisappear
    );

    if (!result.found && !action.waitForDisappear) {
      throw new Error(`Timeout waiting for image: ${action.templateName}`);
    }

    if (action.storeResultIn && result.location) {
      context.variables[action.storeResultIn] = result.location;
    }

    LogService.debug('Wait for image completed', {
      template: action.templateName,
      found: result.found,
      waitForDisappear: action.waitForDisappear
    });
  }

  private async executeCondition(action: ConditionAction, context: TaskExecutionContext): Promise<void> {
    let conditionMet = false;

    switch (action.conditionType) {
      case 'image-visible': {
        const result = await ScreenService.findImage(action.templateName!);
        conditionMet = result.found;
        break;
      }
      case 'image-not-visible': {
        const result = await ScreenService.findImage(action.templateName!);
        conditionMet = !result.found;
        break;
      }
      case 'variable-equals': {
        const value = context.variables[action.variableName!];
        conditionMet = String(value) === action.variableValue;
        break;
      }
    }

    LogService.debug('Condition evaluated', {
      conditionType: action.conditionType,
      result: conditionMet
    });

    const actionsToRun = conditionMet ? action.thenActions : (action.elseActions || []);

    for (const subAction of actionsToRun) {
      await this.execute(subAction, context);
    }
  }

  private async executeLoop(action: LoopAction, context: TaskExecutionContext): Promise<void> {
    const maxIterations = action.maxIterations || 1000;
    let iteration = 0;

    const shouldContinue = async (): Promise<boolean> => {
      if (iteration >= maxIterations) {
        LogService.warn('Loop reached max iterations', { max: maxIterations });
        return false;
      }

      switch (action.loopType) {
        case 'count':
          return iteration < (action.count || 0);

        case 'while-image-visible': {
          const result = await ScreenService.findImage(action.templateName!);
          return result.found;
        }

        case 'until-image-visible': {
          const result = await ScreenService.findImage(action.templateName!);
          return !result.found;
        }

        case 'infinite':
          return true;

        default:
          return false;
      }
    };

    while (await shouldContinue()) {
      LogService.debug('Loop iteration', { iteration, loopType: action.loopType });

      for (const subAction of action.actions) {
        await this.execute(subAction, context);
      }

      iteration++;
    }

    LogService.debug('Loop completed', { totalIterations: iteration });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

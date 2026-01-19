import { ipcMain } from 'electron';
import type { IpcResponse, ScreenCaptureRequest, FindImageRequest, FindAndClickRequest, MatchResult, Point } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { ScreenService } from '../../automation/vision/ScreenService';
import { LogService } from '../services/LogService';
import { mouse, Button, straightTo } from '@nut-tree-fork/nut-js';

export function registerScreenHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.SCREEN_CAPTURE,
    async (_event, data?: ScreenCaptureRequest): Promise<IpcResponse<string>> => {
      try {
        const screenshot = await ScreenService.captureScreen(data?.region);
        // Return as base64 for display in renderer
        const base64 = screenshot.toString('base64');
        return { success: true, data: base64 };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to capture screen', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.SCREEN_FIND_IMAGE,
    async (_event, data: FindImageRequest): Promise<IpcResponse<MatchResult>> => {
      try {
        const result = await ScreenService.findImage(
          data.templateName,
          data.confidence,
          data.region
        );
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to find image', { error: message, template: data.templateName });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.SCREEN_GET_MOUSE_POSITION,
    async (): Promise<IpcResponse<Point>> => {
      try {
        const position = await ScreenService.getMousePosition();
        return { success: true, data: position };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to get mouse position', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.SCREEN_FIND_AND_CLICK,
    async (_event, data: FindAndClickRequest): Promise<IpcResponse<MatchResult>> => {
      try {
        const result = await ScreenService.findImage(
          data.templateName,
          data.confidence,
          data.region
        );

        if (!result.found || !result.location) {
          return { success: true, data: result };
        }

        // Move and click center of found region
        await mouse.move(straightTo({ x: result.location.x, y: result.location.y }));
        await mouse.click(Button.LEFT);

        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to find and click image', { error: message, template: data.templateName });
        return { success: false, error: message };
      }
    }
  );
}

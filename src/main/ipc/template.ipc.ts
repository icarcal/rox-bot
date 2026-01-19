import { ipcMain, app, dialog } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import type { IpcResponse, Template, TemplateAddRequest, Region, TemplateImportRequest } from '../../shared/types';
import { IPC_CHANNELS } from '../../shared/constants';
import { StorageService } from '../services/StorageService';
import { ScreenService } from '../../automation/vision/ScreenService';
import { LogService } from '../services/LogService';
import { PNG } from 'pngjs';

const TEMPLATES_DIR = path.join(app.getPath('userData'), 'templates');

function ensureTemplatesDir() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
}

export function registerTemplateHandlers(): void {
  ensureTemplatesDir();

  ipcMain.handle(IPC_CHANNELS.TEMPLATE_GET_ALL, async (): Promise<IpcResponse<Template[]>> => {
    try {
      const templates = StorageService.getAllTemplates();
      return { success: true, data: templates };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      LogService.error('Failed to get templates', { error: message });
      return { success: false, error: message };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.TEMPLATE_ADD,
    async (_event, data: TemplateAddRequest): Promise<IpcResponse<Template>> => {
      try {
        ensureTemplatesDir();

        // Capture the region
        const imageBuffer = await ScreenService.captureRegion(data.region);

        // Generate filename and save
        const id = uuidv4();
        const filename = `${data.category}_${data.name.replace(/\s+/g, '-')}_${id.slice(0, 8)}.png`;
        const filePath = path.join(TEMPLATES_DIR, filename);

        fs.writeFileSync(filePath, imageBuffer);

        const template: Template = {
          id,
          name: data.name,
          path: filePath,
          category: data.category,
          width: data.region.width,
          height: data.region.height,
          createdAt: new Date().toISOString(),
        };

        StorageService.saveTemplate(template);
        LogService.info('Template created', { templateId: id, name: data.name });

        return { success: true, data: template };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to add template', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TEMPLATE_DELETE,
    async (_event, data: { id: string }): Promise<IpcResponse> => {
      try {
        const template = StorageService.getTemplate(data.id);
        if (template && fs.existsSync(template.path)) {
          fs.unlinkSync(template.path);
        }
        StorageService.deleteTemplate(data.id);
        LogService.info('Template deleted', { templateId: data.id });
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to delete template', { error: message, templateId: data.id });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TEMPLATE_CAPTURE_REGION,
    async (_event, data: { region: Region }): Promise<IpcResponse<string>> => {
      try {
        const imageBuffer = await ScreenService.captureRegion(data.region);
        const base64 = imageBuffer.toString('base64');
        return { success: true, data: base64 };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to capture region', { error: message });
        return { success: false, error: message };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.TEMPLATE_IMPORT_FILE,
    async (_event, data: TemplateImportRequest): Promise<IpcResponse<Template>> => {
      try {
        ensureTemplatesDir();

        const result = await dialog.showOpenDialog({
          title: 'Select template image',
          filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
          properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, error: 'No file selected' };
        }

        const sourcePath = result.filePaths[0];
        const id = uuidv4();
        const ext = path.extname(sourcePath) || '.png';
        const filename = `${data.category}_${data.name.replace(/\s+/g, '-')}_${id.slice(0, 8)}${ext}`;
        const destPath = path.join(TEMPLATES_DIR, filename);

        fs.copyFileSync(sourcePath, destPath);

        let width: number | undefined;
        let height: number | undefined;
        try {
          const buffer = fs.readFileSync(destPath);
          const png = PNG.sync.read(buffer);
          width = png.width;
          height = png.height;
        } catch {
          width = undefined;
          height = undefined;
        }

        const template: Template = {
          id,
          name: data.name,
          category: data.category,
          path: destPath,
          width,
          height,
          createdAt: new Date().toISOString(),
        };

        StorageService.saveTemplate(template);
        LogService.info('Template imported', { templateId: id, name: data.name });
        return { success: true, data: template };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        LogService.error('Failed to import template', { error: message });
        return { success: false, error: message };
      }
    }
  );
}

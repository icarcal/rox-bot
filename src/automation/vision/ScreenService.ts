import { screen, Region as NutRegion, imageResource, OptionalSearchParameters, mouse } from '@nut-tree-fork/nut-js';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import type { Point, Region, MatchResult } from '../../shared/types';
import { StorageService } from '../../main/services/StorageService';

class ScreenServiceClass {
  private templatesDir: string;

  constructor() {
    this.templatesDir = '';
  }

  initialize() {
    this.templatesDir = path.join(app.getPath('userData'), 'templates');
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  async captureScreen(region?: Region): Promise<Buffer> {
    try {
      if (region) {
        return this.captureRegion(region);
      }

      const screenshot = await screen.grab();
      return await screenshot.toRGB().then((img) => {
        // Convert to PNG buffer
        return this.rgbToPngBuffer(img.data, img.width, img.height);
      });
    } catch (error) {
      console.error('Screen capture failed:', error);
      throw error;
    }
  }

  /**
   * Captures a specific region of the screen.
   * Used for saving template images for later image matching.
   * 
   * @param region - The screen region to capture (x, y, width, height)
   * @returns PNG buffer of the captured region
   */
  async captureRegion(region: Region): Promise<Buffer> {
    try {
      const nutRegion = new NutRegion(region.x, region.y, region.width, region.height);
      const screenshot = await screen.grabRegion(nutRegion);
      return await screenshot.toRGB().then((img) => {
        return this.rgbToPngBuffer(img.data, img.width, img.height);
      });
    } catch (error) {
      console.error('Region capture failed:', error);
      throw error;
    }
  }

  /**
   * Finds an image template on the screen.
   * 
   * By default, searches the entire screen. Can optionally limit search to a specific region
   * for better performance on large images or when searching in a known area.
   * 
   * @param templateName - Name or path of the template image to find
   * @param confidence - Matching confidence threshold (0-1). Default from config.
   *                    Higher values = stricter matching (0.95 for exact matches)
   *                    Lower values = more flexible matching (0.7 for similar images)
   * @param region - Optional region to limit search (for performance). If not provided,
   *                searches the entire screen, finding the image wherever it appears.
   * @returns MatchResult with found status, location (center point), and bounding region
   * 
   * @example
   * // Find image anywhere on screen
   * const result = await ScreenService.findImage('button.png', 0.9);
   * if (result.found) {
   *   console.log(`Found at: ${result.location.x}, ${result.location.y}`);
   * }
   * 
   * @example
   * // Find image only in a specific region (faster)
   * const result = await ScreenService.findImage('button.png', 0.9, {
   *   x: 0, y: 0, width: 1920, height: 1080
   * });
   */
  async findImage(templateName: string, confidence?: number, region?: Region): Promise<MatchResult> {
    try {
      const config = StorageService.getAutomationConfig();
      const effectiveConfidence = confidence ?? config.defaultConfidence;

      // Find template path
      const templates = StorageService.getAllTemplates();
      const template = templates.find(t => t.name === templateName || t.path.includes(templateName));

      if (!template) {
        // Try resources/templates path
        const resourcePath = path.join(process.cwd(), 'resources', 'templates', templateName);
        if (!fs.existsSync(resourcePath)) {
          return { found: false };
        }
      }

      const templatePath = template?.path || path.join(process.cwd(), 'resources', 'templates', templateName);

      const searchParams: OptionalSearchParameters<any> = {
        confidence: effectiveConfidence,
      };

      if (region) {
        searchParams.searchRegion = new NutRegion(region.x, region.y, region.width, region.height);
      }

      const img = await imageResource(templatePath);
      const location = await screen.find(img, searchParams);

      if (location) {
        return {
          found: true,
          location: {
            x: location.left + location.width / 2,
            y: location.top + location.height / 2,
          },
          confidence: effectiveConfidence,
          region: {
            x: location.left,
            y: location.top,
            width: location.width,
            height: location.height,
          },
        };
      }

      return { found: false };
    } catch (error) {
      // nut.js throws when image is not found
      if (String(error).includes('not found')) {
        return { found: false };
      }
      console.error('Find image failed:', error);
      throw error;
    }
  }

  async waitForImage(
    templateName: string,
    timeout: number,
    confidence?: number,
    waitForDisappear = false
  ): Promise<MatchResult> {
    const startTime = Date.now();
    const pollInterval = 100;

    while (Date.now() - startTime < timeout) {
      const result = await this.findImage(templateName, confidence);

      if (waitForDisappear) {
        if (!result.found) {
          return { found: true };
        }
      } else {
        if (result.found) {
          return result;
        }
      }

      await this.sleep(pollInterval);
    }

    return { found: false };
  }

  async getMousePosition(): Promise<Point> {
    const pos = await mouse.getPosition();
    return { x: pos.x, y: pos.y };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private rgbToPngBuffer(data: Uint8Array, _width: number, _height: number): Buffer {
    // Simple BMP-like buffer creation (for basic usage)
    // In production, you'd use a proper PNG encoder like pngjs
    // For now, return raw RGB data that can be converted in renderer
    return Buffer.from(data);
  }
}

export const ScreenService = new ScreenServiceClass();

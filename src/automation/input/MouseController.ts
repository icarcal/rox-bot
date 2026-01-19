import { mouse, Point as NutPoint, Button, straightTo } from '@nut-tree/nut-js';
import type { Point } from '../../shared/types';

class MouseControllerClass {
  private baseDelay = 50;
  private randomVariation = 25;

  setDelay(baseDelay: number, randomVariation: number = 25) {
    this.baseDelay = baseDelay;
    this.randomVariation = randomVariation;
  }

  async moveTo(point: Point, humanize = true): Promise<void> {
    const target = new NutPoint(point.x, point.y);

    if (humanize) {
      // Use curved movement for more natural behavior
      await mouse.move(straightTo(target));
    } else {
      await mouse.setPosition(target);
    }
  }

  async click(point?: Point): Promise<void> {
    if (point) {
      await this.moveTo(this.addRandomOffset(point));
      await this.delay();
    }
    await mouse.click(Button.LEFT);
  }

  async doubleClick(point?: Point): Promise<void> {
    if (point) {
      await this.moveTo(this.addRandomOffset(point));
      await this.delay();
    }
    await mouse.doubleClick(Button.LEFT);
  }

  async rightClick(point?: Point): Promise<void> {
    if (point) {
      await this.moveTo(this.addRandomOffset(point));
      await this.delay();
    }
    await mouse.click(Button.RIGHT);
  }

  async drag(from: Point, to: Point): Promise<void> {
    await this.moveTo(from);
    await this.delay();
    await mouse.pressButton(Button.LEFT);
    await this.delay();
    await this.moveTo(to);
    await this.delay();
    await mouse.releaseButton(Button.LEFT);
  }

  async scroll(amount: number): Promise<void> {
    await mouse.scrollDown(Math.abs(amount));
  }

  async scrollUp(amount: number): Promise<void> {
    await mouse.scrollUp(amount);
  }

  async scrollDown(amount: number): Promise<void> {
    await mouse.scrollDown(amount);
  }

  private addRandomOffset(point: Point, maxOffset = 3): Point {
    const offsetX = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
    const offsetY = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
    return {
      x: point.x + offsetX,
      y: point.y + offsetY,
    };
  }

  private async delay(): Promise<void> {
    const variation = Math.floor(Math.random() * this.randomVariation * 2) - this.randomVariation;
    const actualDelay = Math.max(10, this.baseDelay + variation);
    await new Promise((resolve) => setTimeout(resolve, actualDelay));
  }
}

export const MouseController = new MouseControllerClass();

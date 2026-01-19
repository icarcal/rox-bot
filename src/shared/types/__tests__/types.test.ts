import type { Point, Region, Template, AutomationState, MatchResult } from '@shared/types';

describe('Shared Types', () => {
  describe('Point', () => {
    it('should define x and y coordinates', () => {
      const point: Point = { x: 10, y: 20 };
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });
  });

  describe('Region', () => {
    it('should define x, y, width, and height', () => {
      const region: Region = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      expect(region.x).toBe(0);
      expect(region.y).toBe(0);
      expect(region.width).toBe(100);
      expect(region.height).toBe(100);
    });
  });

  describe('Template', () => {
    it('should define template properties', () => {
      const template: Template = {
        id: 'test-1',
        name: 'Test Template',
        path: '/path/to/template.png',
        category: 'ui',
        createdAt: new Date().toISOString(),
      };
      expect(template.id).toBe('test-1');
      expect(template.name).toBe('Test Template');
      expect(template.path).toBe('/path/to/template.png');
      expect(template.category).toBe('ui');
    });
  });

  describe('AutomationState', () => {
    it('should define automation status and execution info', () => {
      const state: AutomationState = {
        status: 'idle',
        executionCount: 0,
      };
      expect(state.status).toBe('idle');
      expect(state.executionCount).toBe(0);
    });

    it('should support running status', () => {
      const state: AutomationState = {
        status: 'running',
        currentTaskId: 'task-1',
        currentActionIndex: 0,
        totalActions: 5,
        executionCount: 1,
      };
      expect(state.status).toBe('running');
      expect(state.currentTaskId).toBe('task-1');
    });
  });

  describe('MatchResult', () => {
    it('should define found flag and location', () => {
      const result: MatchResult = {
        found: true,
        location: { x: 100, y: 200 },
        confidence: 0.95,
      };
      expect(result.found).toBe(true);
      expect(result.location?.x).toBe(100);
      expect(result.confidence).toBe(0.95);
    });

    it('should support not found result', () => {
      const result: MatchResult = {
        found: false,
      };
      expect(result.found).toBe(false);
      expect(result.location).toBeUndefined();
    });
  });
});

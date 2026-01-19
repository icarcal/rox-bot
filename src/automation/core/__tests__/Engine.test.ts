import { AutomationEngine } from '../Engine';
import { LogService } from '../../../main/services/LogService';
import { StorageService } from '../../../main/services/StorageService';

jest.mock('../../../main/services/LogService');
jest.mock('../../../main/services/StorageService');
jest.mock('../../../main/window', () => ({
  sendToRenderer: jest.fn(),
}));

describe('AutomationEngine', () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new AutomationEngine();
  });

  describe('initialization', () => {
    it('should initialize with idle status', () => {
      const status = engine.getStatus();
      expect(status.status).toBe('idle');
      expect(status.executionCount).toBe(0);
    });
  });

  describe('emergency stop', () => {
    it('should stop automation with error message', () => {
      engine.emergencyStop();
      const status = engine.getStatus();
      expect(status.status).toBe('idle');
      expect(status.lastError).toBe('Emergency stop activated');
    });
  });

  describe('getStatus', () => {
    it('should return current automation state', () => {
      const status = engine.getStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('executionCount');
    });

    it('should return independent copy of state', () => {
      const status1 = engine.getStatus();
      const status2 = engine.getStatus();
      expect(status1).not.toBe(status2);
      expect(status1).toEqual(status2);
    });
  });
});

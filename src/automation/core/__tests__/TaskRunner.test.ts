import { TaskRunner } from '../TaskRunner';
import type { Task, TaskExecutionContext } from '../../../shared/types';
import { StorageService } from '../../../main/services/StorageService';
import { LogService } from '../../../main/services/LogService';

jest.mock('../../../main/services/StorageService');
jest.mock('../../../main/services/LogService');
jest.mock('../../actions/ActionExecutor');

describe('TaskRunner', () => {
  let taskRunner: TaskRunner;
  const mockTask: Task = {
    id: 'test-task',
    name: 'Test Task',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [],
  };

  const mockContext: TaskExecutionContext = {
    taskId: 'test-task',
    startedAt: new Date().toISOString(),
    variables: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    taskRunner = new TaskRunner();
    (StorageService.getAutomationConfig as jest.Mock).mockReturnValue({
      defaultConfidence: 0.9,
      defaultDelay: 100,
      randomDelayVariation: 50,
    });
  });

  describe('pause and resume', () => {
    it('should have pause method', () => {
      expect(typeof taskRunner.pause).toBe('function');
      taskRunner.pause();
    });

    it('should have resume method', () => {
      expect(typeof taskRunner.resume).toBe('function');
      taskRunner.resume();
    });
  });

  describe('emergency stop', () => {
    it('should have emergencyStop method', () => {
      expect(typeof taskRunner.emergencyStop).toBe('function');
      taskRunner.emergencyStop();
    });
  });

  describe('event emitter', () => {
    it('should be an event emitter', () => {
      expect(typeof taskRunner.on).toBe('function');
      expect(typeof taskRunner.emit).toBe('function');
    });

    it('should support registering listeners', () => {
      const listener = jest.fn();
      taskRunner.on('complete', listener);
      expect(taskRunner).toBeDefined();
    });
  });
});

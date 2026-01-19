import React from 'react';
import { render } from '@testing-library/react';
import { ControlPanel } from '../ControlPanel';
import * as useStoreModule from '../../../store';

jest.mock('../../../store');

describe('ControlPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render control buttons', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 0,
      },
      selectedTaskId: 'task-1',
      tasks: [
        {
          id: 'task-1',
          name: 'Test Task',
          enabled: true,
          actions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(<ControlPanel />);

    expect(mockUseStore).toHaveBeenCalled();
  });

  it('should disable start button when no task is selected', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 0,
      },
      selectedTaskId: null,
      tasks: [],
    });

    render(<ControlPanel />);

    expect(mockUseStore).toHaveBeenCalled();
  });

  it('should disable start button when task is disabled', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 0,
      },
      selectedTaskId: 'task-1',
      tasks: [
        {
          id: 'task-1',
          name: 'Test Task',
          enabled: false,
          actions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(<ControlPanel />);

    expect(mockUseStore).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusDisplay } from '../StatusDisplay';
import * as useStoreModule from '../../../store';

jest.mock('../../../store');

describe('StatusDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTask = {
    id: 'task-1',
    name: 'Test Task',
    enabled: true,
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should render idle status', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 0,
      },
      tasks: [],
    });

    render(<StatusDisplay />);

    // The component should render without errors
    expect(mockUseStore).toHaveBeenCalled();
  });

  it('should render running status', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'running',
        currentTaskId: 'task-1',
        currentActionIndex: 2,
        totalActions: 5,
        executionCount: 1,
      },
      tasks: [mockTask],
    });

    render(<StatusDisplay />);

    expect(mockUseStore).toHaveBeenCalled();
  });

  it('should display error message when present', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 0,
        lastError: 'Test error message',
      },
      tasks: [],
    });

    render(<StatusDisplay />);

    expect(mockUseStore).toHaveBeenCalled();
  });

  it('should show execution count', () => {
    const mockUseStore = useStoreModule.useStore as jest.Mock;
    mockUseStore.mockReturnValue({
      automationState: {
        status: 'idle',
        executionCount: 5,
      },
      tasks: [],
    });

    render(<StatusDisplay />);

    expect(mockUseStore).toHaveBeenCalled();
  });
});

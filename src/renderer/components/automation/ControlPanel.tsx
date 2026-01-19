import { useStore } from '../../store';
import { IPC_CHANNELS } from '../../../shared/constants';

export function ControlPanel() {
  const { automationState, selectedTaskId, tasks } = useStore();
  const { status } = automationState;

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const canStart = status === 'idle' && selectedTaskId && selectedTask?.enabled;
  const canStop = status === 'running' || status === 'paused';
  const canPause = status === 'running';
  const canResume = status === 'paused';

  const handleStart = async () => {
    if (!selectedTaskId) return;
    try {
      await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_START, { taskId: selectedTaskId });
    } catch (error) {
      console.error('Failed to start automation:', error);
    }
  };

  const handleStop = async () => {
    try {
      await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_STOP);
    } catch (error) {
      console.error('Failed to stop automation:', error);
    }
  };

  const handlePause = async () => {
    try {
      await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_PAUSE);
    } catch (error) {
      console.error('Failed to pause automation:', error);
    }
  };

  const handleResume = async () => {
    try {
      await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_RESUME);
    } catch (error) {
      console.error('Failed to resume automation:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canStart && (
        <button onClick={handleStart} className="btn btn-success btn-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Start
        </button>
      )}

      {canPause && (
        <button onClick={handlePause} className="btn btn-secondary btn-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Pause
        </button>
      )}

      {canResume && (
        <button onClick={handleResume} className="btn btn-success btn-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Resume
        </button>
      )}

      {canStop && (
        <button onClick={handleStop} className="btn btn-danger btn-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
            />
          </svg>
          Stop
        </button>
      )}
    </div>
  );
}

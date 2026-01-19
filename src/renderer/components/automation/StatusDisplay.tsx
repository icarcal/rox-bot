import React from 'react';
import { useStore } from '../../store';

const statusColors = {
  idle: 'bg-gray-500',
  running: 'bg-green-500',
  paused: 'bg-yellow-500',
  stopping: 'bg-orange-500',
  stopped: 'bg-red-500',
};

const statusLabels = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
  stopping: 'Stopping',
  stopped: 'Stopped',
};

export function StatusDisplay() {
  const { automationState, tasks } = useStore();
  const { status, currentTaskId, currentActionIndex, totalActions } = automationState;

  const currentTask = currentTaskId ? tasks.find((t) => t.id === currentTaskId) : null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${statusColors[status]} ${
            status === 'running' ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-gray-300">{statusLabels[status]}</span>
      </div>

      {currentTask && (
        <>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">{currentTask.name}</span>
        </>
      )}

      {status === 'running' && totalActions !== undefined && currentActionIndex !== undefined && (
        <>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Action {currentActionIndex + 1}/{totalActions}
          </span>
          <div className="w-24 h-1.5 bg-dark-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((currentActionIndex + 1) / totalActions) * 100}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

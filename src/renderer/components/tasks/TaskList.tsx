import React, { useState } from 'react';
import { useStore } from '../../store';
import { IPC_CHANNELS } from '../../../shared/constants';
import type { Task } from '../../../shared/types';

export function TaskList() {
  const { tasks, selectedTaskId, selectTask, addTask, removeTask } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const handleCreateTask = async () => {
    if (!newTaskName.trim()) return;

    try {
      const res = await window.electronAPI.invoke<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>, Task>(
        IPC_CHANNELS.TASK_CREATE,
        {
          name: newTaskName.trim(),
          enabled: true,
          actions: [],
        }
      );

      if (res.success && res.data) {
        addTask(res.data);
        selectTask(res.data.id);
        setNewTaskName('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TASK_DELETE, { id });
      if (res.success) {
        removeTask(id);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Tasks</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary btn-sm"
        >
          + New
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 p-3 bg-dark-300 rounded-lg">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            placeholder="Task name..."
            className="input mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleCreateTask} className="btn btn-primary btn-sm">
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTaskName('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Create one to get started!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => selectTask(task.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTaskId === task.id
                  ? 'bg-primary-600/20 border border-primary-500'
                  : 'bg-dark-300 border border-transparent hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      task.enabled ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                  <span className="font-medium">{task.name}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {task.actions.length} actions • Run {task.runCount} times
                {task.lastRunAt && (
                  <> • Last: {new Date(task.lastRunAt).toLocaleDateString()}</>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

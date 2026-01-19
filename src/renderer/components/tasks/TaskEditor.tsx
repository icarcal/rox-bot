import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { IPC_CHANNELS } from '../../../shared/constants';
import type { Task, Action, ActionType } from '../../../shared/types';
import { ActionItem } from './ActionItem';
import { ActionForm } from './ActionForm';
import { v4 as uuidv4 } from 'uuid';

const actionTypes: { type: ActionType; label: string; icon: string }[] = [
  { type: 'click', label: 'Click', icon: '👆' },
  { type: 'double-click', label: 'Double Click', icon: '👆👆' },
  { type: 'right-click', label: 'Right Click', icon: '👉' },
  { type: 'type', label: 'Type Text', icon: '⌨️' },
  { type: 'press-key', label: 'Press Key', icon: '🔤' },
  { type: 'hotkey', label: 'Hotkey', icon: '⌨️' },
  { type: 'wait', label: 'Wait', icon: '⏱️' },
  { type: 'find-image', label: 'Find Image', icon: '🔍' },
  { type: 'wait-for-image', label: 'Wait for Image', icon: '👁️' },
  { type: 'condition', label: 'Condition', icon: '❓' },
  { type: 'loop', label: 'Loop', icon: '🔁' },
];

export function TaskEditor() {
  const { tasks, selectedTaskId, updateTask } = useStore();
  const task = tasks.find((t) => t.id === selectedTaskId);

  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isAddingAction, setIsAddingAction] = useState(false);

  if (!task) return null;

  const handleToggleEnabled = async () => {
    const updated = { ...task, enabled: !task.enabled };
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TASK_UPDATE, updated);
      if (res.success) {
        updateTask(updated);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddAction = (type: ActionType) => {
    const newAction = createDefaultAction(type);
    setEditingAction(newAction);
    setIsAddingAction(true);
  };

  const handleSaveAction = async (action: Action) => {
    let newActions: Action[];

    if (isAddingAction) {
      newActions = [...task.actions, action];
    } else {
      newActions = task.actions.map((a) => (a.id === action.id ? action : a));
    }

    const updated = { ...task, actions: newActions };
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TASK_UPDATE, updated);
      if (res.success) {
        updateTask(updated);
      }
    } catch (error) {
      console.error('Failed to save action:', error);
    }

    setEditingAction(null);
    setIsAddingAction(false);
  };

  const handleDeleteAction = async (actionId: string) => {
    const newActions = task.actions.filter((a) => a.id !== actionId);
    const updated = { ...task, actions: newActions };
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TASK_UPDATE, updated);
      if (res.success) {
        updateTask(updated);
      }
    } catch (error) {
      console.error('Failed to delete action:', error);
    }
  };

  const handleMoveAction = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= task.actions.length) return;

    const newActions = [...task.actions];
    [newActions[index], newActions[newIndex]] = [newActions[newIndex], newActions[index]];

    const updated = { ...task, actions: newActions };
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TASK_UPDATE, updated);
      if (res.success) {
        updateTask(updated);
      }
    } catch (error) {
      console.error('Failed to move action:', error);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Task Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">{task.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {task.actions.length} actions • Created {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-400">Enabled</span>
            <button
              onClick={handleToggleEnabled}
              className={`w-12 h-6 rounded-full transition-colors ${
                task.enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  task.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Action List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Actions</h3>
        {task.actions.length === 0 ? (
          <div className="text-center py-8 bg-dark-300 rounded-lg border border-dashed border-gray-600">
            <p className="text-gray-400">No actions yet. Add actions to build your automation.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {task.actions.map((action, index) => (
              <ActionItem
                key={action.id}
                action={action}
                index={index}
                total={task.actions.length}
                onEdit={() => {
                  setEditingAction(action);
                  setIsAddingAction(false);
                }}
                onDelete={() => handleDeleteAction(action.id)}
                onMoveUp={() => handleMoveAction(index, 'up')}
                onMoveDown={() => handleMoveAction(index, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Action */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Add Action</h3>
        <div className="grid grid-cols-4 gap-2">
          {actionTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => handleAddAction(type)}
              className="p-3 bg-dark-300 rounded-lg hover:bg-dark-100 transition-colors text-left"
            >
              <span className="text-lg mr-2">{icon}</span>
              <span className="text-sm text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Editor Modal */}
      {editingAction && (
        <ActionForm
          action={editingAction}
          onSave={handleSaveAction}
          onCancel={() => {
            setEditingAction(null);
            setIsAddingAction(false);
          }}
        />
      )}
    </div>
  );
}

function createDefaultAction(type: ActionType): Action {
  const base = {
    id: uuidv4(),
    type,
    delayBefore: 0,
    delayAfter: 100,
    continueOnError: false,
  };

  switch (type) {
    case 'click':
    case 'double-click':
    case 'right-click':
      return {
        ...base,
        type,
        target: { type: 'coordinates', x: 0, y: 0 },
      };
    case 'type':
      return { ...base, type: 'type', text: '' };
    case 'press-key':
      return { ...base, type: 'press-key', key: 'enter' };
    case 'hotkey':
      return { ...base, type: 'hotkey', keys: ['ctrl', 'c'] };
    case 'wait':
      return { ...base, type: 'wait', duration: 1000 };
    case 'find-image':
      return { ...base, type: 'find-image', templateName: '' };
    case 'wait-for-image':
      return { ...base, type: 'wait-for-image', templateName: '', timeout: 5000 };
    case 'condition':
      return {
        ...base,
        type: 'condition',
        conditionType: 'image-visible',
        thenActions: [],
        elseActions: [],
      };
    case 'loop':
      return {
        ...base,
        type: 'loop',
        loopType: 'count',
        count: 3,
        actions: [],
      };
    default:
      return base as Action;
  }
}

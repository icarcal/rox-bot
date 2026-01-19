import { useCallback } from 'react';
import { useStore } from '../store';
import { IPC_CHANNELS } from '../../shared/constants';

export function useAutomation() {
  const { automationState, selectedTaskId, tasks, setAutomationState } = useStore();

  const startTask = useCallback(async (taskId?: string) => {
    const id = taskId || selectedTaskId;
    if (!id) {
      console.error('No task selected');
      return false;
    }

    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_START, { taskId: id });
      return res.success;
    } catch (error) {
      console.error('Failed to start task:', error);
      return false;
    }
  }, [selectedTaskId]);

  const stopAutomation = useCallback(async () => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_STOP);
      return res.success;
    } catch (error) {
      console.error('Failed to stop automation:', error);
      return false;
    }
  }, []);

  const pauseAutomation = useCallback(async () => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_PAUSE);
      return res.success;
    } catch (error) {
      console.error('Failed to pause automation:', error);
      return false;
    }
  }, []);

  const resumeAutomation = useCallback(async () => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_RESUME);
      return res.success;
    } catch (error) {
      console.error('Failed to resume automation:', error);
      return false;
    }
  }, []);

  const getStatus = useCallback(async () => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.AUTOMATION_GET_STATUS);
      if (res.success && res.data) {
        setAutomationState(res.data);
      }
      return res.data;
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }, [setAutomationState]);

  return {
    status: automationState.status,
    isRunning: automationState.status === 'running',
    isPaused: automationState.status === 'paused',
    currentTaskId: automationState.currentTaskId,
    progress: automationState.totalActions
      ? ((automationState.currentActionIndex || 0) + 1) / automationState.totalActions
      : 0,
    startTask,
    stopAutomation,
    pauseAutomation,
    resumeAutomation,
    getStatus,
  };
}

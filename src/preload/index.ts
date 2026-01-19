import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { IpcChannel, IpcResponse } from '../shared/types';

export interface ElectronAPI {
  invoke: <T = unknown, R = unknown>(channel: IpcChannel, data?: T) => Promise<IpcResponse<R>>;
  on: (channel: IpcChannel, callback: (data: unknown) => void) => () => void;
  off: (channel: IpcChannel, callback: (data: unknown) => void) => void;
}

const electronAPI: ElectronAPI = {
  invoke: async <T = unknown, R = unknown>(channel: IpcChannel, data?: T): Promise<IpcResponse<R>> => {
    return ipcRenderer.invoke(channel, data);
  },

  on: (channel: IpcChannel, callback: (data: unknown) => void) => {
    const subscription = (_event: IpcRendererEvent, data: unknown) => callback(data);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  off: (channel: IpcChannel, callback: (data: unknown) => void) => {
    ipcRenderer.removeListener(channel, callback as (...args: unknown[]) => void);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

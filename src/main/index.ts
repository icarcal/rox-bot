import { app, BrowserWindow, globalShortcut } from 'electron';
import { createWindow, sendToRenderer, getMainWindow } from './window';
import { registerAllIpcHandlers } from './ipc';
import { AutomationEngine } from '../automation/core/Engine';
import { LogService } from './services/LogService';
import { KEYS, IPC_CHANNELS } from '../shared/constants';

let automationEngine: AutomationEngine | null = null;

// Ensure single instance to avoid duplicate windows
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  const existing = getMainWindow();
  if (existing) {
    if (existing.isMinimized()) existing.restore();
    existing.focus();
  } else {
    createWindow();
  }
});

async function initialize() {
  // Initialize services
  LogService.initialize();
  LogService.info('Application starting...');

  // Create automation engine
  automationEngine = new AutomationEngine();

  // Register IPC handlers
  registerAllIpcHandlers(automationEngine);

  // Create main window
  createWindow();

  // Register emergency stop hotkey
  registerEmergencyStop();

  LogService.info('Application initialized successfully');
}

function registerEmergencyStop() {
  const registered = globalShortcut.register(KEYS.EMERGENCY_STOP, () => {
    LogService.warn('Emergency stop triggered!');
    if (automationEngine) {
      automationEngine.emergencyStop();
    }
    sendToRenderer(IPC_CHANNELS.AUTOMATION_STATUS_UPDATE, {
      status: 'stopped',
      lastError: 'Emergency stop triggered by user',
    });
  });

  if (!registered) {
    LogService.error('Failed to register emergency stop hotkey');
  } else {
    LogService.info(`Emergency stop hotkey registered: ${KEYS.EMERGENCY_STOP}`);
  }
}

// App lifecycle
app.whenReady().then(initialize);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();

  // Stop automation if running
  if (automationEngine) {
    automationEngine.emergencyStop();
  }

  LogService.info('Application shutting down');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  LogService.error('Uncaught exception', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason) => {
  LogService.error('Unhandled rejection', { reason: String(reason) });
});

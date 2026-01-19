import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import type { LogEntry } from '../../shared/types';
import { sendToRenderer } from '../window';
import { IPC_CHANNELS } from '../../shared/constants';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LogServiceClass {
  private logDir: string = '';
  private logFile: string = '';
  private recentLogs: LogEntry[] = [];
  private maxRecentLogs = 500;

  initialize() {
    this.logDir = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `rox-bot-${date}.log`);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    // Add to recent logs
    this.recentLogs.unshift(entry);
    if (this.recentLogs.length > this.maxRecentLogs) {
      this.recentLogs.pop();
    }

    // Write to file
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFile(this.logFile, logLine, (err) => {
      if (err) console.error('Failed to write log:', err);
    });

    // Send to renderer
    sendToRenderer(IPC_CHANNELS.LOG_NEW_ENTRY, entry);

    // Also log to console in development
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '');
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  getRecentLogs(count?: number): LogEntry[] {
    return count ? this.recentLogs.slice(0, count) : this.recentLogs;
  }

  clearLogs() {
    this.recentLogs = [];
  }
}

export const LogService = new LogServiceClass();

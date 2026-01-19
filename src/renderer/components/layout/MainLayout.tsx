import React, { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TaskList } from '../tasks/TaskList';
import { TaskEditor } from '../tasks/TaskEditor';
import { TemplateManager } from '../settings/TemplateManager';
import { LogViewer } from '../logs/LogViewer';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useStore } from '../../store';

export function MainLayout() {
  const { activeView, selectedTaskId, loadInitialData } = useStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'tasks':
        return (
          <div className="flex h-full">
            <div className="w-80 border-r border-gray-700 overflow-y-auto">
              <TaskList />
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedTaskId ? <TaskEditor /> : <EmptyState />}
            </div>
          </div>
        );
      case 'templates':
        return <TemplateManager />;
      case 'logs':
        return <LogViewer />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <svg
        className="w-16 h-16 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p className="text-lg">Select a task to edit</p>
      <p className="text-sm mt-2">Or create a new task to get started</p>
    </div>
  );
}

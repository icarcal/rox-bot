import type { Action } from '../../../shared/types';

interface ActionItemProps {
  action: Action;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const actionIcons: Record<string, string> = {
  'click': '👆',
  'double-click': '👆👆',
  'right-click': '👉',
  'type': '⌨️',
  'press-key': '🔤',
  'hotkey': '⌨️',
  'wait': '⏱️',
  'find-image': '🔍',
  'wait-for-image': '👁️',
  'condition': '❓',
  'loop': '🔁',
};

export function ActionItem({
  action,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ActionItemProps) {
  const getActionSummary = (): string => {
    switch (action.type) {
      case 'click':
      case 'double-click':
      case 'right-click':
        if (action.target.type === 'coordinates') {
          return `at (${action.target.x}, ${action.target.y})`;
        } else if (action.target.type === 'image') {
          return `on "${action.target.templateName}"`;
        } else {
          return `on variable "${action.target.variableName}"`;
        }
      case 'type':
        return `"${action.text.substring(0, 30)}${action.text.length > 30 ? '...' : ''}"`;
      case 'press-key':
        return action.key;
      case 'hotkey':
        return action.keys.join(' + ');
      case 'wait':
        return `${action.duration}ms`;
      case 'find-image':
        return `"${action.templateName}"${action.storeResultIn ? ` → ${action.storeResultIn}` : ''}`;
      case 'wait-for-image':
        return `"${action.templateName}" (${action.timeout}ms timeout)`;
      case 'condition':
        return `if ${action.conditionType}`;
      case 'loop':
        return action.loopType === 'count' ? `${action.count} times` : action.loopType;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-dark-300 rounded-lg group">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <span className="w-6 text-center text-gray-500 text-sm">{index + 1}</span>

      <span className="text-lg">{actionIcons[action.type] || '•'}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-200 capitalize">
            {action.type.replace('-', ' ')}
          </span>
          <span className="text-gray-400 text-sm truncate">{getActionSummary()}</span>
        </div>
        {action.description && (
          <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-primary-400 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

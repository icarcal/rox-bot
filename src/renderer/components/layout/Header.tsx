import { ControlPanel } from '../automation/ControlPanel';
import { StatusDisplay } from '../automation/StatusDisplay';

export function Header() {
  return (
    <header className="h-14 bg-dark-300 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">RX</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-100">ROX Bot</h1>
      </div>

      <div className="flex items-center gap-4">
        <StatusDisplay />
        <ControlPanel />
      </div>
    </header>
  );
}

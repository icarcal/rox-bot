import React, { useState } from 'react';
import { useStore } from '../../store';
import { IPC_CHANNELS } from '../../../shared/constants';

export function SettingsPanel() {
  const { config, setConfig } = useStore();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.SETTINGS_SET, {
        key: 'automationConfig',
        value: localConfig,
      });

      if (res.success) {
        setConfig(localConfig);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Settings</h2>

        {/* Automation Settings */}
        <section className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Automation</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Default Confidence Threshold
              </label>
              <input
                type="number"
                value={localConfig.defaultConfidence}
                onChange={(e) =>
                  setLocalConfig((c) => ({
                    ...c,
                    defaultConfidence: parseFloat(e.target.value) || 0.9,
                  }))
                }
                className="input w-full max-w-xs"
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-gray-500 mt-1">
                How closely an image must match the template (0.0 - 1.0). Higher = stricter matching.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Default Delay (ms)</label>
              <input
                type="number"
                value={localConfig.defaultDelay}
                onChange={(e) =>
                  setLocalConfig((c) => ({
                    ...c,
                    defaultDelay: parseInt(e.target.value) || 100,
                  }))
                }
                className="input w-full max-w-xs"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                Default delay between actions if not specified.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Random Delay Variation (ms)
              </label>
              <input
                type="number"
                value={localConfig.randomDelayVariation}
                onChange={(e) =>
                  setLocalConfig((c) => ({
                    ...c,
                    randomDelayVariation: parseInt(e.target.value) || 0,
                  }))
                }
                className="input w-full max-w-xs"
                min={0}
              />
              <p className="text-xs text-gray-500 mt-1">
                Random variation added to delays for more natural behavior.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.highlightMatches}
                  onChange={(e) =>
                    setLocalConfig((c) => ({ ...c, highlightMatches: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-500"
                />
                <span className="text-sm text-gray-300">Highlight matched images</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Briefly highlight areas where images were found (useful for debugging).
              </p>
            </div>
          </div>
        </section>

        {/* Hotkeys */}
        <section className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Hotkeys</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Emergency Stop Key</label>
              <input
                type="text"
                value={localConfig.emergencyStopKey}
                onChange={(e) =>
                  setLocalConfig((c) => ({ ...c, emergencyStopKey: e.target.value }))
                }
                className="input w-full max-w-xs"
                placeholder="F12"
              />
              <p className="text-xs text-gray-500 mt-1">
                Press this key to immediately stop all automation. Default: F12
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">About</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              <strong className="text-gray-300">ROX Bot</strong> - Ragnarok X Next Gen Automation
            </p>
            <p>Version 1.0.0</p>
            <p className="text-xs text-gray-500 mt-4">
              This bot uses image recognition to automate repetitive tasks in Ragnarok X Next Gen.
              Use responsibly and at your own risk.
            </p>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

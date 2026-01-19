import { useState } from 'react';
import type { Action, ClickAction, TypeAction, WaitAction, FindImageAction, WaitForImageAction, PressKeyAction, HotkeyAction, ConditionAction, LoopAction } from '../../../shared/types';
import { useStore } from '../../store';

interface ActionFormProps {
  action: Action;
  onSave: (action: Action) => void;
  onCancel: () => void;
}

export function ActionForm({ action, onSave, onCancel }: ActionFormProps) {
  const [formData, setFormData] = useState<Action>(action);
  const { templates } = useStore();

  const updateField = <K extends keyof Action>(field: K, value: Action[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-200 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4 capitalize">
          Edit {action.type.replace('-', ' ')} Action
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="What does this action do?"
              className="input"
            />
          </div>

          {/* Type-specific fields */}
          {renderTypeSpecificFields(formData, setFormData, templates)}

          {/* Common delay fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Delay Before (ms)</label>
              <input
                type="number"
                value={formData.delayBefore || 0}
                onChange={(e) => updateField('delayBefore', parseInt(e.target.value) || 0)}
                className="input"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Delay After (ms)</label>
              <input
                type="number"
                value={formData.delayAfter || 0}
                onChange={(e) => updateField('delayAfter', parseInt(e.target.value) || 0)}
                className="input"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.continueOnError || false}
                onChange={(e) => updateField('continueOnError', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300">Continue on error</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderTypeSpecificFields(
  formData: Action,
  setFormData: React.Dispatch<React.SetStateAction<Action>>,
  templates: { id: string; name: string }[]
) {
  switch (formData.type) {
    case 'click':
    case 'double-click':
    case 'right-click':
      return <ClickFields action={formData as ClickAction} setAction={setFormData} templates={templates} />;
    case 'type':
      return <TypeFields action={formData as TypeAction} setAction={setFormData} />;
    case 'press-key':
      return <PressKeyFields action={formData as PressKeyAction} setAction={setFormData} />;
    case 'hotkey':
      return <HotkeyFields action={formData as HotkeyAction} setAction={setFormData} />;
    case 'wait':
      return <WaitFields action={formData as WaitAction} setAction={setFormData} />;
    case 'find-image':
      return <FindImageFields action={formData as FindImageAction} setAction={setFormData} templates={templates} />;
    case 'wait-for-image':
      return <WaitForImageFields action={formData as WaitForImageAction} setAction={setFormData} templates={templates} />;
    case 'condition':
      return <ConditionFields action={formData as ConditionAction} setAction={setFormData} templates={templates} />;
    case 'loop':
      return <LoopFields action={formData as LoopAction} setAction={setFormData} templates={templates} />;
    default:
      return null;
  }
}

function ClickFields({
  action,
  setAction,
  templates,
}: {
  action: ClickAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  templates: { id: string; name: string }[];
}) {
  const targetType = action.target.type;

  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Target Type</label>
        <select
          value={targetType}
          onChange={(e) => {
            const type = e.target.value as 'coordinates' | 'image' | 'variable';
            let target: ClickAction['target'];
            if (type === 'coordinates') {
              target = { type: 'coordinates', x: 0, y: 0 };
            } else if (type === 'image') {
              target = { type: 'image', templateName: '' };
            } else {
              target = { type: 'variable', variableName: '' };
            }
            setAction((prev) => ({ ...prev, target }));
          }}
          className="input"
        >
          <option value="coordinates">Coordinates</option>
          <option value="image">Image Template</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      {targetType === 'coordinates' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">X</label>
            <input
              type="number"
              value={(action.target as { x: number }).x}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  target: { ...(prev as ClickAction).target, x: parseInt(e.target.value) || 0 },
                }))
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Y</label>
            <input
              type="number"
              value={(action.target as { y: number }).y}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  target: { ...(prev as ClickAction).target, y: parseInt(e.target.value) || 0 },
                }))
              }
              className="input"
            />
          </div>
        </div>
      )}

      {targetType === 'image' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Template</label>
          <select
            value={(action.target as { templateName: string }).templateName}
            onChange={(e) =>
              setAction((prev) => ({
                ...prev,
                target: { type: 'image', templateName: e.target.value },
              }))
            }
            className="input"
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {targetType === 'variable' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Variable Name</label>
          <input
            type="text"
            value={(action.target as { variableName: string }).variableName}
            onChange={(e) =>
              setAction((prev) => ({
                ...prev,
                target: { type: 'variable', variableName: e.target.value },
              }))
            }
            placeholder="e.g., foundLocation"
            className="input"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Offset X</label>
          <input
            type="number"
            value={action.offsetX || 0}
            onChange={(e) =>
              setAction((prev) => ({ ...prev, offsetX: parseInt(e.target.value) || 0 }))
            }
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Offset Y</label>
          <input
            type="number"
            value={action.offsetY || 0}
            onChange={(e) =>
              setAction((prev) => ({ ...prev, offsetY: parseInt(e.target.value) || 0 }))
            }
            className="input"
          />
        </div>
      </div>
    </>
  );
}

function TypeFields({
  action,
  setAction,
}: {
  action: TypeAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
}) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Text to type</label>
        <textarea
          value={action.text}
          onChange={(e) => setAction((prev) => ({ ...prev, text: e.target.value }))}
          className="input min-h-[100px]"
          placeholder="Enter text to type..."
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Delay between keys (ms)</label>
        <input
          type="number"
          value={action.delayBetweenKeys || 50}
          onChange={(e) =>
            setAction((prev) => ({ ...prev, delayBetweenKeys: parseInt(e.target.value) || 50 }))
          }
          className="input"
          min={0}
        />
      </div>
    </>
  );
}

function PressKeyFields({
  action,
  setAction,
}: {
  action: PressKeyAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">Key</label>
      <input
        type="text"
        value={action.key}
        onChange={(e) => setAction((prev) => ({ ...prev, key: e.target.value }))}
        placeholder="e.g., enter, tab, f1"
        className="input"
      />
      <p className="text-xs text-gray-500 mt-1">
        Common keys: enter, tab, escape, space, backspace, f1-f12, up, down, left, right
      </p>
    </div>
  );
}

function HotkeyFields({
  action,
  setAction,
}: {
  action: HotkeyAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">Keys (comma separated)</label>
      <input
        type="text"
        value={action.keys.join(', ')}
        onChange={(e) =>
          setAction((prev) => ({
            ...prev,
            keys: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
          }))
        }
        placeholder="e.g., ctrl, c"
        className="input"
      />
      <p className="text-xs text-gray-500 mt-1">
        Modifiers: ctrl, alt, shift, win. Example: ctrl, shift, s
      </p>
    </div>
  );
}

function WaitFields({
  action,
  setAction,
}: {
  action: WaitAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
}) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Duration (ms)</label>
        <input
          type="number"
          value={action.duration}
          onChange={(e) =>
            setAction((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))
          }
          className="input"
          min={0}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Random variation (ms)</label>
        <input
          type="number"
          value={action.randomVariation || 0}
          onChange={(e) =>
            setAction((prev) => ({ ...prev, randomVariation: parseInt(e.target.value) || 0 }))
          }
          className="input"
          min={0}
        />
      </div>
    </>
  );
}

function FindImageFields({
  action,
  setAction,
  templates,
}: {
  action: FindImageAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  templates: { id: string; name: string }[];
}) {
  const [useSearchRegion, setUseSearchRegion] = useState(!!action.region);

  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Template</label>
        <select
          value={action.templateName}
          onChange={(e) => setAction((prev) => ({ ...prev, templateName: e.target.value }))}
          className="input"
        >
          <option value="">Select template...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Will search the entire screen for this image
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Confidence (0-1)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            value={action.confidence || 0.9}
            onChange={(e) =>
              setAction((prev) => ({ ...prev, confidence: parseFloat(e.target.value) || 0.9 }))
            }
            className="flex-1"
            min={0}
            max={1}
            step={0.05}
          />
          <span className="text-sm font-mono bg-dark-300 px-2 py-1 rounded min-w-12">
            {(action.confidence || 0.9).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Higher = stricter matching (0.95 for exact matches, 0.7 for flexible)
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSearchRegion}
            onChange={(e) => {
              setUseSearchRegion(e.target.checked);
              if (!e.target.checked) {
                setAction((prev) => ({ ...prev, region: undefined }));
              } else {
                setAction((prev) => ({
                  ...prev,
                  region: { x: 0, y: 0, width: 1920, height: 1080 },
                }));
              }
            }}
            className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-500"
          />
          <span className="text-sm text-gray-300">Limit search to specific screen region (optional)</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Leave unchecked to search entire screen (recommended)
        </p>
      </div>

      {useSearchRegion && action.region && (
        <div className="grid grid-cols-2 gap-2 bg-dark-300 p-3 rounded">
          <div>
            <label className="block text-xs text-gray-400 mb-1">X</label>
            <input
              type="number"
              value={action.region.x}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  region: { ...(prev as FindImageAction).region!, x: parseInt(e.target.value) || 0 },
                }))
              }
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Y</label>
            <input
              type="number"
              value={action.region.y}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  region: { ...(prev as FindImageAction).region!, y: parseInt(e.target.value) || 0 },
                }))
              }
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Width</label>
            <input
              type="number"
              value={action.region.width}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  region: { ...(prev as FindImageAction).region!, width: parseInt(e.target.value) || 100 },
                }))
              }
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Height</label>
            <input
              type="number"
              value={action.region.height}
              onChange={(e) =>
                setAction((prev) => ({
                  ...prev,
                  region: { ...(prev as FindImageAction).region!, height: parseInt(e.target.value) || 100 },
                }))
              }
              className="input text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Store result in variable (optional)</label>
        <input
          type="text"
          value={action.storeResultIn || ''}
          onChange={(e) => setAction((prev) => ({ ...prev, storeResultIn: e.target.value }))}
          placeholder="e.g., buttonLocation"
          className="input"
        />
        <p className="text-xs text-gray-500 mt-1">
          Save the found coordinates to use in later actions
        </p>
      </div>
    </>
  );
}

function WaitForImageFields({
  action,
  setAction,
  templates,
}: {
  action: WaitForImageAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  templates: { id: string; name: string }[];
}) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Template</label>
        <select
          value={action.templateName}
          onChange={(e) => setAction((prev) => ({ ...prev, templateName: e.target.value }))}
          className="input"
        >
          <option value="">Select template...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          💡 Will search the entire screen for this image
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Timeout (ms)</label>
        <input
          type="number"
          value={action.timeout}
          onChange={(e) =>
            setAction((prev) => ({ ...prev, timeout: parseInt(e.target.value) || 5000 }))
          }
          className="input"
          min={0}
        />
        <p className="text-xs text-gray-500 mt-1">
          How long to wait before giving up (in milliseconds)
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Confidence (0-1)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            value={action.confidence || 0.9}
            onChange={(e) =>
              setAction((prev) => ({ ...prev, confidence: parseFloat(e.target.value) || 0.9 }))
            }
            className="flex-1"
            min={0}
            max={1}
            step={0.05}
          />
          <span className="text-sm font-mono bg-dark-300 px-2 py-1 rounded min-w-12">
            {(action.confidence || 0.9).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Higher = stricter matching (0.95 for exact matches, 0.7 for flexible)
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={action.waitForDisappear || false}
            onChange={(e) => setAction((prev) => ({ ...prev, waitForDisappear: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-600 bg-dark-300 text-primary-500"
          />
          <span className="text-sm text-gray-300">Wait for image to disappear instead</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          When checked, waits until the image is no longer visible
        </p>
      </div>
    </>
  );
}

function ConditionFields({
  action,
  setAction,
  templates,
}: {
  action: ConditionAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  templates: { id: string; name: string }[];
}) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Condition Type</label>
        <select
          value={action.conditionType}
          onChange={(e) =>
            setAction((prev) => ({
              ...prev,
              conditionType: e.target.value as ConditionAction['conditionType'],
            }))
          }
          className="input"
        >
          <option value="image-visible">Image is visible</option>
          <option value="image-not-visible">Image is not visible</option>
          <option value="variable-equals">Variable equals</option>
        </select>
      </div>

      {(action.conditionType === 'image-visible' || action.conditionType === 'image-not-visible') && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Template</label>
          <select
            value={action.templateName || ''}
            onChange={(e) => setAction((prev) => ({ ...prev, templateName: e.target.value }))}
            className="input"
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {action.conditionType === 'variable-equals' && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Variable Name</label>
            <input
              type="text"
              value={action.variableName || ''}
              onChange={(e) => setAction((prev) => ({ ...prev, variableName: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Expected Value</label>
            <input
              type="text"
              value={action.variableValue || ''}
              onChange={(e) => setAction((prev) => ({ ...prev, variableValue: e.target.value }))}
              className="input"
            />
          </div>
        </>
      )}

      <p className="text-sm text-gray-500">
        Note: Nested actions (then/else) can be edited after saving by editing this action again.
      </p>
    </>
  );
}

function LoopFields({
  action,
  setAction,
  templates,
}: {
  action: LoopAction;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  templates: { id: string; name: string }[];
}) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Loop Type</label>
        <select
          value={action.loopType}
          onChange={(e) =>
            setAction((prev) => ({
              ...prev,
              loopType: e.target.value as LoopAction['loopType'],
            }))
          }
          className="input"
        >
          <option value="count">Fixed count</option>
          <option value="while-image-visible">While image visible</option>
          <option value="until-image-visible">Until image visible</option>
          <option value="infinite">Infinite (use with caution)</option>
        </select>
      </div>

      {action.loopType === 'count' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Count</label>
          <input
            type="number"
            value={action.count || 1}
            onChange={(e) =>
              setAction((prev) => ({ ...prev, count: parseInt(e.target.value) || 1 }))
            }
            className="input"
            min={1}
          />
        </div>
      )}

      {(action.loopType === 'while-image-visible' || action.loopType === 'until-image-visible') && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Template</label>
          <select
            value={action.templateName || ''}
            onChange={(e) => setAction((prev) => ({ ...prev, templateName: e.target.value }))}
            className="input"
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Max iterations (safety limit)</label>
        <input
          type="number"
          value={action.maxIterations || 1000}
          onChange={(e) =>
            setAction((prev) => ({ ...prev, maxIterations: parseInt(e.target.value) || 1000 }))
          }
          className="input"
          min={1}
        />
      </div>

      <p className="text-sm text-gray-500">
        Note: Nested loop actions can be edited after saving.
      </p>
    </>
  );
}

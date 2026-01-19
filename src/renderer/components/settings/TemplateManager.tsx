import { useState } from 'react';
import { useStore } from '../../store';
import { IPC_CHANNELS, TEMPLATE_CATEGORIES } from '../../../shared/constants';
import type { Region } from '../../../shared/types';

export function TemplateManager() {
  const { templates, addTemplate, removeTemplate } = useStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureRegion, setCaptureRegion] = useState<Region>({ x: 0, y: 0, width: 100, height: 100 });
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>(TEMPLATE_CATEGORIES[0]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates =
    filterCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === filterCategory);

  const handleCapturePreview = async () => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TEMPLATE_CAPTURE_REGION, {
        region: captureRegion,
      });
      if (res.success && res.data) {
        setPreviewImage(`data:image/png;base64,${res.data}`);
      }
    } catch (error) {
      console.error('Failed to capture preview:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TEMPLATE_ADD, {
        name: newTemplateName.trim(),
        category: newTemplateCategory,
        region: captureRegion,
      });

      if (res.success && res.data) {
        // Type assertion since we know the IPC handler returns a valid Template
        addTemplate(res.data as any);
        setNewTemplateName('');
        setPreviewImage(null);
        setIsCapturing(false);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.TEMPLATE_DELETE, { id });
      if (res.success) {
        removeTemplate(id);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Image Templates</h2>
        <button
          onClick={() => setIsCapturing(true)}
          className="btn btn-primary"
        >
          + Capture New
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Filter:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All categories</option>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Capture Modal */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-200 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Capture Template Image</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., accept-button"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="input"
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X</label>
                  <input
                    type="number"
                    value={captureRegion.x}
                    onChange={(e) =>
                      setCaptureRegion((r) => ({ ...r, x: parseInt(e.target.value) || 0 }))
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Y</label>
                  <input
                    type="number"
                    value={captureRegion.y}
                    onChange={(e) =>
                      setCaptureRegion((r) => ({ ...r, y: parseInt(e.target.value) || 0 }))
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Width</label>
                  <input
                    type="number"
                    value={captureRegion.width}
                    onChange={(e) =>
                      setCaptureRegion((r) => ({ ...r, width: parseInt(e.target.value) || 0 }))
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Height</label>
                  <input
                    type="number"
                    value={captureRegion.height}
                    onChange={(e) =>
                      setCaptureRegion((r) => ({ ...r, height: parseInt(e.target.value) || 0 }))
                    }
                    className="input"
                  />
                </div>
              </div>

              <button onClick={handleCapturePreview} className="btn btn-secondary w-full">
                Capture Preview
              </button>

              {previewImage && (
                <div className="bg-dark-400 p-4 rounded-lg text-center">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full max-h-48 mx-auto border border-gray-600"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsCapturing(false);
                  setPreviewImage(null);
                  setNewTemplateName('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="btn btn-primary"
                disabled={!newTemplateName.trim()}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No templates yet.</p>
            <p className="text-sm mt-2">Capture screen regions to create templates for image recognition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-dark-300 rounded-lg p-3 border border-gray-700"
              >
                <div className="aspect-video bg-dark-400 rounded mb-2 flex items-center justify-center text-gray-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-200">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

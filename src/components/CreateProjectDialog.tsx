import React, { useState } from 'react';
import { X, Film, Gamepad2 } from 'lucide-react';

interface CreateProjectDialogProps {
  onClose: () => void;
  onSubmit: (name: string, type: 'video' | 'game') => Promise<void>;
}

export default function CreateProjectDialog({ onClose, onSubmit }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'video' | 'game'>('video');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(name.trim(), type);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('video')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                  type === 'video'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <Film className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                  <span className="block text-sm font-medium">Video Project</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('game')}
                className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                  type === 'game'
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <Gamepad2 className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                  <span className="block text-sm font-medium">Game Project</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md
                ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogOverlay, DialogContent } from '@radix-ui/react-dialog'; // or use any dialog lib you use
import type { Project } from '../types/database';

interface Props {
  project: Project;
  onClose: () => void;
  onSubmit: (id: string, name: string) => void;
}

export default function EditProjectDialog({
  project,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(project.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(project.id, name);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-30 z-40" />
      <DialogContent className="fixed z-50 inset-0 m-auto max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm border-gray-300"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

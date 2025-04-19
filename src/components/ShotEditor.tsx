import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Whiteboard from './Whiteboard';
import { supabase } from '../lib/supabase';
import type { Shot } from '../types/database';

interface ShotEditorProps {
  shot: Shot;
  onSave: () => void;
  onClose: () => void;
}

export default function ShotEditor({ shot, onSave, onClose }: ShotEditorProps) {
  const [title, setTitle] = useState(shot.title);
  const [type, setType] = useState(shot.type);
  const [description, setDescription] = useState(shot.description || '');
  const [duration, setDuration] = useState(shot.duration || '');
  const [whiteboardData, setWhiteboardData] = useState(shot.whiteboard_data || '');
  const [saving, setSaving] = useState(false);
  const [whiteboardSaved, setWhiteboardSaved] = useState(false);

  const handleSaveWhiteboard = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('shots')
      .update({ whiteboard_data: whiteboardData })
      .eq('id', shot.id);
    setSaving(false);
    setWhiteboardSaved(!error);
  };

  const handleSaveShot = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('shots')
      .update({
        title,
        type,
        description,
        duration: duration.trim() === '' ? null : duration,
        whiteboard_data: whiteboardData,
      })
      .eq('id', shot.id);

    setSaving(false);
    if (!error) onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Shot</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>

          <div className="space-y-6">
            {/* Title and Type */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {[
                    'Wide Shot', 'Medium Shot', 'Close-Up', 'Extreme Close-Up',
                    'Point of View', 'Over the Shoulder', 'Aerial Shot',
                    'Tracking Shot', 'Dolly Shot', 'Crane Shot',
                    'Dutch Angle', 'Two Shot',
                  ].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 00:01:30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Whiteboard */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storyboard</label>
              <Whiteboard
                initialData={whiteboardData}
                onChange={setWhiteboardData}
              />
              <div className="mt-2 text-right">
                <button
                  onClick={handleSaveWhiteboard}
                  disabled={saving}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {whiteboardSaved ? 'Whiteboard Saved' : 'Save Whiteboard'}
                </button>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShot}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Shot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

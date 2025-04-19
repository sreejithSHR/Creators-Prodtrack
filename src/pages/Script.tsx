import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';

export default function Script() {
  const { projectId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScript() {
      try {
        const { data, error } = await supabase
          .from('scripts')
          .select('content')
          .eq('project_id', projectId)
          .single();

        if (error) throw error;
        setContent(data?.content || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load script');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadScript();
    } else {
      setLoading(false);
    }
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('scripts')
        .upsert({ project_id: projectId, content })
        .select()
        .single();

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save script');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Script Editor</h1>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="bg-white shadow rounded-lg">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[calc(100vh-300px)] p-6 rounded-lg focus:outline-none"
                placeholder="Start writing your script..."
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
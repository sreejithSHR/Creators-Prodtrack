import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavBar from '../components/NavBar';
import MindMap from '../components/MindMap';

export default function MindMapPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [mindmapData, setMindmapData] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('name, mindmap_data')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        
        setProjectName(project.name);
        setMindmapData(project.mindmap_data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  const handleSave = async (data: string) => {
    if (!projectId) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ mindmap_data: data })
        .eq('id', projectId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mindmap');
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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/projects/${projectId}/scenes`)}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back to Project
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  {projectName} - Mind Map
                </h1>
              </div>
              {saving && (
                <div className="flex items-center text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-4">
            <MindMap
              initialData={mindmapData || undefined}
              onChange={handleSave}
            />
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavBar from '../components/NavBar';
import type { Scene } from '../types/database';

export default function Scenes() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadScenes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('order');
      if (error) console.error(error);
      setScenes(data || []);
      setLoading(false);
    };

    loadScenes();
  }, [projectId]);

  const createScene = async () => {
    if (!projectId) return;
    const newOrder = scenes.length;
    const { data, error } = await supabase
      .from('scenes')
      .insert({
        project_id: projectId,
        title: `Scene ${newOrder + 1}`,
        order: newOrder,
      })
      .select()
      .single();
    if (!error) setScenes([...scenes, data]);
  };

  const handleSceneClick = (sceneId: string) => {
    navigate(`/scenes/${sceneId}/shots`); // Navigate to shot list for the scene
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Scenes</h1>
            <div className="flex gap-4">
              <button
                onClick={createScene}
                className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Scene
              </button>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            {scenes.length === 0 ? (
              <div className="p-6 text-gray-500">No scenes created yet.</div>
            ) : (
              <ul className="divide-y">
                {scenes.map((scene) => (
                  <li
                    key={scene.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleSceneClick(scene.id)} // Click to go to Shot List page
                  >
                    <span className="font-medium text-gray-900">{scene.title}</span>
                    <ChevronRight className="text-gray-400" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

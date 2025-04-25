import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Play, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import ShotEditor from '../components/ShotEditor';
import SlideshowViewer from '../components/SlideshowViewer';
import { supabase } from '../lib/supabase';
import type { Shot, Scene } from '../types/database';

export default function ShotsPage() {
  const { sceneId } = useParams();
  const [scene, setScene] = useState<Scene | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!sceneId) return;
      setLoading(true);
      try {
        const [sceneResp, shotsResp] = await Promise.all([
          supabase.from('scenes').select('*').eq('id', sceneId).single(),
          supabase
            .from('shots')
            .select('*')
            .eq('scene_id', sceneId)
            .order('order'),
        ]);
        if (sceneResp.error) throw sceneResp.error;
        if (shotsResp.error) throw shotsResp.error;

        setScene(sceneResp.data);
        setShots(shotsResp.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sceneId]);

  const createShot = async () => {
    if (!sceneId) return;
    try {
      const newOrder = shots.length;
      const { data, error } = await supabase
        .from('shots')
        .insert({
          scene_id: sceneId,
          title: `Shot ${newOrder + 1}`,
          type: 'Standard',
          order: newOrder,
        })
        .select()
        .single();
      if (error) throw error;
      setShots((prev) => [...prev, data]);
      setSelectedShot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shot');
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {scene?.title || 'Scene'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {scene?.description || 'No description'}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createShot}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Shot
                </button>

                {shots.length > 0 && (
                  <button
                    onClick={() => setShowSlideshow(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Slideshow View
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {shots.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No shots yet
                </h3>
                <p className="text-gray-500">
                  Create your first shot to start planning your scene.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shots.map((shot) => (
                  <div
                    key={shot.id}
                    onClick={() => setSelectedShot(shot)}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {shot.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{shot.type}</p>
                    {shot.duration && (
                      <p className="mt-2 text-sm text-gray-500">
                        Duration: {shot.duration}
                      </p>
                    )}
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shot.is_completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {shot.is_completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedShot && (
        <ShotEditor
          shot={selectedShot}
          onSave={() => {
            setSelectedShot(null);
            // reload shots
            (async () => {
              const { data, error } = await supabase
                .from('shots')
                .select('*')
                .eq('scene_id', sceneId)
                .order('order');
              if (!error) setShots(data || []);
            })();
          }}
          onClose={() => setSelectedShot(null)}
        />
      )}

      {showSlideshow && (
        <SlideshowViewer
          shots={shots}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}
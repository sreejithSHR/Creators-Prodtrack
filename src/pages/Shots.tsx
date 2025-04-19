import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import { supabase } from '../lib/supabase';
import type { Shot, Scene } from '../types/database';

interface ShotWithScene extends Shot {
  scene: Scene;
}

export default function Shots() {
  const { projectId } = useParams();
  const [shots, setShots] = useState<ShotWithScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShots() {
      try {
        const { data, error } = await supabase
          .from('shots')
          .select(`
            *,
            scene:scenes(*)
          `)
          .order('order', { ascending: true });

        if (error) throw error;
        setShots(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shots');
      } finally {
        setLoading(false);
      }
    }

    loadShots();
  }, [projectId]);

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
              <h1 className="text-2xl font-bold text-gray-900">Shots</h1>
              <button
                onClick={() => {/* TODO: Implement shot creation */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Shot
              </button>
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
                  Create your first shot to start planning your scenes.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {shots.map((shot) => (
                    <li key={shot.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {shot.title}
                            </p>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Scene: {shot.scene.title}
                            </span>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              shot.is_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {shot.is_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {shot.type}
                            </p>
                            {shot.duration && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                Duration: {shot.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
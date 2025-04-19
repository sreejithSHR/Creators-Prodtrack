import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalProjects: number;
  totalScenes: number;
  completedShots: number;
  totalDuration: string;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    totalProjects: 0,
    totalScenes: 0,
    completedShots: 0,
    totalDuration: '0h 0m',
  },
  loading: false,
  error: null,
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const [projectsCount, scenesCount, shotsCount] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('scenes').select('id', { count: 'exact' }),
        supabase.from('shots').select('id').eq('is_completed', true),
      ]);

      set({
        stats: {
          totalProjects: projectsCount.count || 0,
          totalScenes: scenesCount.count || 0,
          completedShots: shotsCount.data?.length || 0,
          totalDuration: '0h 0m', // We'll implement duration calculation later
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        loading: false,
      });
    }
  },
}));
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Project } from '../types/database';
import { useAuthStore } from './auth';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (name: string, type: 'video' | 'game') => Promise<Project | null>;
  fetchProjects: () => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  createProject: async (name: string, type: 'video' | 'game') => {
    try {
      const { user } = useAuthStore.getState();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([{ name, type, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        projects: [...state.projects, data],
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
      });
      return null;
    }
  },

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ projects: data || [], loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        loading: false,
      });
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
      });
    }
  },

  deleteProject: async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
      });
    }
  },
}));
import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CreateProjectDialog from '../components/CreateProjectDialog';
import EditProjectDialog from '../components/EditProjectDialog';
import ProjectCard from '../components/ProjectCard';
import { useProjectsStore } from '../store/projects';
import type { Project } from '../types/database';

export default function Projects() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectsStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (name: string, type: 'video' | 'game') => {
    try {
      const newProject = await createProject(name, type);
      if (newProject) {
        navigate(`/projects/${newProject.id}/scenes`);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}/scenes`);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
  };

  const handleUpdateProject = async (id: string, name: string) => {
    await updateProject(id, { name });
    setProjectToEdit(null);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(project.id);
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
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500">
                  Create your first project to get started with shot planning.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer">
                    <ProjectCard
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreateDialog && (
        <CreateProjectDialog
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {projectToEdit && (
        <EditProjectDialog
          project={projectToEdit}
          onClose={() => setProjectToEdit(null)}
          onSubmit={handleUpdateProject}
        />
      )}
    </>
  );
}
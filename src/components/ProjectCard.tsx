import React, { useState } from 'react';
import { Film, Gamepad2, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react';
import type { Project } from '../types/database';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onMindMap: (e: React.MouseEvent) => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onMindMap }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const ProjectIcon = project.type === 'video' ? Film : Gamepad2;

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
    setShowMenu(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project);
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <ProjectIcon className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{project.type} Project</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu">
                  <button
                    onClick={handleEditClick}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Pencil className="h-4 w-4 mr-3" />
                    Edit Project
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete Project
                  </button>
                  {project.public_share_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/share/${project.public_share_id}`);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Share2 className="h-4 w-4 mr-3" />
                      Copy Share Link
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-gray-500">
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            project.is_completed
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {project.is_completed ? 'Completed' : 'In Progress'}
          </div>
        </div>
      </div>
    </div>
  );
}
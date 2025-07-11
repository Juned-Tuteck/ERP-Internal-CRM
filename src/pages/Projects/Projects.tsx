import React, { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import { Filter, Download, Calendar } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { addNotification } = useCRM();

  const handleApprovalAction = (projectId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} project:`, projectId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Project ${action}d successfully!`,
    });
  };

  const handleExportProjects = () => {
    console.log('Exporting projects...');
    addNotification({
      type: 'info',
      message: 'Project export initiated. Download will start shortly.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportProjects}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProjectList
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onApprovalAction={handleApprovalAction}
          />
        </div>
        <div className="lg:col-span-2">
          <ProjectDetails project={selectedProject} />
        </div>
      </div>
    </div>
  );
};

export default Projects;
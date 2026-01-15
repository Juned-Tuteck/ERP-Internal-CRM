import React from 'react';
import { useState } from 'react';
import { Calendar, Building2, Tag, Clock, ThumbsUp, ThumbsDown, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getProjectTypeColor } from '../../../utils/projectUtils';

interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  projectType: string;
  templateName: string;
  createdAt: string;
  customer: string;
  estStartDate: string;
  estEndDate: string;
  lastUpdated: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'on_hold';
  customerAvatar: string;
}

interface ProjectListProps {
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onApprovalAction: (projectId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ selectedProject, onSelectProject, onApprovalAction }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [projectToAction, setProjectToAction] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: '1',
      projectNumber: 'PRJ-2024-001',
      projectName: 'Mumbai Metro Ventilation System',
      projectType: 'Basement Ventilation',
      templateName: 'Standard Ventilation Project',
      createdAt: '2024-01-15',
      customer: 'TechCorp Solutions Pvt Ltd',
      estStartDate: '2024-02-01',
      estEndDate: '2024-06-30',
      lastUpdated: '2024-01-16',
      status: 'pending_approval',
      customerAvatar: 'TC',
    },
    {
      id: '2',
      projectNumber: 'PRJ-2024-002',
      projectName: 'Corporate Office HVAC Upgrade',
      projectType: 'HVAC Systems',
      templateName: 'Commercial HVAC Project',
      createdAt: '2024-01-10',
      customer: 'Innovate India Limited',
      estStartDate: '2024-02-15',
      estEndDate: '2024-05-15',
      lastUpdated: '2024-01-14',
      status: 'approved',
      customerAvatar: 'II',
    },
    {
      id: '3',
      projectNumber: 'PRJ-2024-003',
      projectName: 'Hospital AMC System',
      projectType: 'construction',
      templateName: 'Healthcare AMC Project',
      createdAt: '2024-01-05',
      customer: 'Digital Solutions Enterprise',
      estStartDate: '2024-03-01',
      estEndDate: '2024-08-20',
      lastUpdated: '2024-01-12',
      status: 'in_progress',
      customerAvatar: 'DS',
    },
    {
      id: '4',
      projectNumber: 'PRJ-2023-045',
      projectName: 'Residential Complex Retrofit',
      projectType: 'Retrofit',
      templateName: 'Residential Retrofit Project',
      createdAt: '2023-12-28',
      customer: 'Manufacturing Industries Co',
      estStartDate: '2024-01-15',
      estEndDate: '2024-07-10',
      lastUpdated: '2024-01-10',
      status: 'pending_approval',
      customerAvatar: 'MI',
    },
    {
      id: '5',
      projectNumber: 'PRJ-2023-044',
      projectName: 'Shopping Mall Chiller System',
      projectType: 'Chiller',
      templateName: 'Commercial Chiller Project',
      createdAt: '2023-12-20',
      customer: 'FinTech Innovations Pvt Ltd',
      estStartDate: '2024-01-10',
      estEndDate: '2024-04-25',
      lastUpdated: '2024-01-05',
      status: 'rejected',
      customerAvatar: 'FI',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 mr-1" />;
      case 'pending_approval':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600 mr-1" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />;
      case 'on_hold':
        return <Clock className="h-4 w-4 text-orange-600 mr-1" />;
      default:
        return null;
    }
  };

  const handleApprovalClick = (e: React.MouseEvent, project: Project, action: 'approve' | 'reject') => {
    e.stopPropagation();
    setProjectToAction(project);
    setActionType(action);
    
    if (action === 'approve') {
      onApprovalAction(project.id, 'approve');
    } else {
      setShowReasonModal(true);
    }
  };

  const handleConfirmReject = () => {
    if (projectToAction && reason.trim()) {
      onApprovalAction(projectToAction.id, 'reject', reason);
      setShowReasonModal(false);
      setReason('');
      setProjectToAction(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        <p className="text-sm text-gray-500">{projects.length} total projects</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr 
                key={project.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedProject?.id === project.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectProject(project)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                      <div className="text-xs text-gray-500">
                        {project.projectNumber}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getProjectTypeColor(project.projectType)}`}>
                          {project.projectType}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{project.customerAvatar}</span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{project.customer}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created At: {new Date(project.estStartDate).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Start: {new Date(project.estStartDate).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      End: {new Date(project.estEndDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(project.lastUpdated).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button> */}
                    
                    {project.status === 'pending_approval' && (
                      <>
                        <button 
                          onClick={(e) => handleApprovalClick(e, project, 'approve')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => handleApprovalClick(e, project, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Project</h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {projectToAction?.projectName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Please provide a reason for rejecting this project
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Please provide reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!reason.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
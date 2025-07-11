import React, { useState } from 'react';
import { Calendar, Building2, Tag, Clock, FileText, Users, DollarSign, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { getProjectTypeColor } from '../../../utils/projectUtils';

interface ProjectDetailsProps {
  project: any;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a project</h3>
          <p className="text-sm">Choose a project from the list to view details</p>
        </div>
      </div>
    );
  }

  // Enhanced project data with additional details
  const enhancedProject = {
    ...project,
    description: 'This project involves the installation of a comprehensive ventilation system for the Mumbai Metro underground stations. The system will ensure proper air circulation, temperature control, and emergency smoke extraction capabilities.',
    budget: '₹2,45,00,000',
    actualCost: '₹0',
    progress: 0,
    team: [
      { name: 'Rajesh Kumar', role: 'Project Manager', email: 'rajesh@example.com', phone: '+91 98765 43210' },
      { name: 'Priya Sharma', role: 'Lead Engineer', email: 'priya@example.com', phone: '+91 87654 32109' },
      { name: 'Vikram Singh', role: 'Site Supervisor', email: 'vikram@example.com', phone: '+91 76543 21098' }
    ],
    milestones: [
      { name: 'Project Kickoff', dueDate: '2024-02-01', status: 'pending' },
      { name: 'Design Approval', dueDate: '2024-02-15', status: 'pending' },
      { name: 'Material Procurement', dueDate: '2024-03-01', status: 'pending' },
      { name: 'Installation Phase 1', dueDate: '2024-04-15', status: 'pending' },
      { name: 'Testing & Commissioning', dueDate: '2024-06-01', status: 'pending' },
      { name: 'Project Handover', dueDate: '2024-06-30', status: 'pending' }
    ],
    documents: [
      { name: 'Project_Charter.pdf', size: '2.4 MB', uploadDate: '2024-01-15' },
      { name: 'Technical_Specifications.pdf', size: '5.8 MB', uploadDate: '2024-01-15' },
      { name: 'Contract_Agreement.pdf', size: '3.2 MB', uploadDate: '2024-01-15' }
    ],
    customerDetails: {
      name: project.customer,
      contactPerson: 'Amit Patel',
      email: 'amit.patel@techcorp.in',
      phone: '+91 98765 43210',
      address: 'Andheri East, Mumbai, Maharashtra - 400069'
    },
    approvalHistory: [
      { action: 'Created from Lead', by: 'Sneha Gupta', date: '2024-01-15', notes: 'Project created from won lead' },
      { action: 'Submitted for Approval', by: 'Sneha Gupta', date: '2024-01-15', notes: 'Project details completed and submitted for approval' }
    ]
  };

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

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'team', name: 'Team' },
    { id: 'milestones', name: 'Milestones' },
    { id: 'documents', name: 'Documents' },
    { id: 'customer', name: 'Customer' },
    { id: 'approval', name: 'Approval History' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Project Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">{project.projectName}</h2>
              <span className="ml-3 text-sm text-gray-500">{project.projectNumber}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProjectTypeColor(project.projectType)}`}>
                {project.projectType}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Template</div>
            <div className="text-sm font-medium text-gray-900">{project.templateName}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Description</h3>
                  <p className="text-sm text-gray-600">{enhancedProject.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Start Date
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(project.estStartDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        End Date
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(project.estEndDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Duration
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.ceil((new Date(project.estEndDate).getTime() - new Date(project.estStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Financials</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        Budget
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {enhancedProject.budget}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        Actual Cost
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {enhancedProject.actualCost}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Progress</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Overall Completion</div>
                      <div className="text-sm font-medium text-gray-900">{enhancedProject.progress}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${enhancedProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Key Milestones</h3>
                  <div className="space-y-2">
                    {enhancedProject.milestones.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">{milestone.name}</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(milestone.dueDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    ))}
                    {enhancedProject.milestones.length > 3 && (
                      <div className="text-sm text-blue-600 font-medium">
                        +{enhancedProject.milestones.length - 3} more milestones
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{enhancedProject.team.length}</p>
                <p className="text-sm text-gray-500">Team Members</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{enhancedProject.milestones.length}</p>
                <p className="text-sm text-gray-500">Milestones</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{enhancedProject.documents.length}</p>
                <p className="text-sm text-gray-500">Documents</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Team</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedProject.team.map((member: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {member.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {member.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Milestone</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedProject.milestones.map((milestone: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{milestone.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(milestone.dueDate).toLocaleDateString('en-IN')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedProject.documents.map((document: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{document.name}</p>
                      <p className="text-xs text-gray-500">{document.size}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Uploaded: {new Date(document.uploadDate).toLocaleDateString('en-IN')}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customer' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-medium text-white">{project.customerAvatar}</span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{enhancedProject.customerDetails.name}</h4>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedProject.customerDetails.contactPerson}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedProject.customerDetails.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedProject.customerDetails.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedProject.customerDetails.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approval' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approval History</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Action</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">By</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedProject.approvalHistory.map((history: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{history.action}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{history.by}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(history.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">{history.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
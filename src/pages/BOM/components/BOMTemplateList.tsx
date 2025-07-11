import React from 'react';
import { FileText, Calendar, Tag, Edit, Trash2, Copy, Download } from 'lucide-react';

interface BOMTemplate {
  id: string;
  name: string;
  workType: string;
  itemCount: number;
  createdBy: string;
  createdDate: string;
  status: 'active' | 'inactive' | 'draft';
}

interface BOMTemplateListProps {
  selectedTemplate: BOMTemplate | null;
  onSelectTemplate: (template: BOMTemplate) => void;
}

const BOMTemplateList: React.FC<BOMTemplateListProps> = ({ selectedTemplate, onSelectTemplate }) => {
  const templates: BOMTemplate[] = [
    {
      id: '1',
      name: 'Basement Ventilation System - Standard',
      workType: 'Basement Ventilation',
      itemCount: 24,
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'HVAC System - Commercial Office',
      workType: 'HVAC Systems',
      itemCount: 36,
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      status: 'active',
    },
    {
      id: '3',
      name: 'Fire Safety System - Residential',
      workType: 'Fire Safety',
      itemCount: 18,
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      status: 'active',
    },
    {
      id: '4',
      name: 'Electrical System - Industrial',
      workType: 'Electrical',
      itemCount: 42,
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      status: 'active',
    },
    {
      id: '5',
      name: 'Plumbing System - Commercial',
      workType: 'Plumbing',
      itemCount: 29,
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
      status: 'draft',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'Basement Ventilation':
        return 'bg-blue-100 text-blue-800';
      case 'HVAC Systems':
        return 'bg-purple-100 text-purple-800';
      case 'Fire Safety':
        return 'bg-red-100 text-red-800';
      case 'Electrical':
        return 'bg-amber-100 text-amber-800';
      case 'Plumbing':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">BOM Templates</h3>
        <p className="text-sm text-gray-500">{templates.length} total templates</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr 
                key={template.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedTemplate?.id === template.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectTemplate(template)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(template.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(template.workType)}`}>
                    {template.workType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.itemCount} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{template.createdBy}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(template.status)}`}>
                    {template.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BOMTemplateList;
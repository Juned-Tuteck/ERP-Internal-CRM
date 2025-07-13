import React, { useState } from 'react';
import { FileText, Calendar, Tag, Edit, Trash2, Copy, Download } from 'lucide-react';
import CreateBOMTemplate from './CreateBOMTemplate';

interface Item {
  itemCode: string;
  itemName: string;
  uom: string;
  rate: number;
  qty: number;
  price: number;
}

interface BOMTemplate {
  id: string;
  name: string;
  workType: string;
  itemCount: number;
  createdBy: string;
  createdDate: string;
  status: 'active' | 'inactive' | 'draft';
  items: Item[];
}

interface BOMTemplateListProps {
  selectedTemplate: BOMTemplate | null;
  onSelectTemplate: (template: BOMTemplate) => void;
}

const BOMTemplateList: React.FC<BOMTemplateListProps> = ({ selectedTemplate, onSelectTemplate }) => {
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<BOMTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<BOMTemplate | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const templates: BOMTemplate[] = [
    {
      id: '1',
      name: 'Basement Ventilation System - Standard',
      workType: 'Basement Ventilation',
      itemCount: 24,
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      status: 'active',
      items: [
        {
          itemCode: 'BV-001',
          itemName: 'Ventilation Fan',
          uom: 'Nos',
          rate: 3500,
          qty: 2,
          price: 7000,
        },
        {
          itemCode: 'BV-002',
          itemName: 'Duct Pipe',
          uom: 'Meter',
          rate: 250,
          qty: 10,
          price: 2500,
        },
      ],
    },
    {
      id: '2',
      name: 'HVAC System - Commercial Office',
      workType: 'HVAC Systems',
      itemCount: 36,
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      status: 'active',
      items: [
        {
          itemCode: 'HVAC-101',
          itemName: 'Air Conditioner',
          uom: 'Nos',
          rate: 45000,
          qty: 3,
          price: 135000,
        },
        {
          itemCode: 'HVAC-102',
          itemName: 'Thermostat',
          uom: 'Nos',
          rate: 1200,
          qty: 5,
          price: 6000,
        },
      ],
    },
    {
      id: '3',
      name: 'Fire Safety System - Residential',
      workType: 'Fire Safety',
      itemCount: 18,
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      status: 'active',
      items: [
        {
          itemCode: 'FS-201',
          itemName: 'Smoke Detector',
          uom: 'Nos',
          rate: 800,
          qty: 6,
          price: 4800,
        },
        {
          itemCode: 'FS-202',
          itemName: 'Fire Extinguisher',
          uom: 'Nos',
          rate: 2500,
          qty: 2,
          price: 5000,
        },
      ],
    },
    {
      id: '4',
      name: 'Electrical System - Industrial',
      workType: 'Electrical',
      itemCount: 42,
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      status: 'active',
      items: [
        {
          itemCode: 'EL-301',
          itemName: 'Circuit Breaker',
          uom: 'Nos',
          rate: 1500,
          qty: 8,
          price: 12000,
        },
        {
          itemCode: 'EL-302',
          itemName: 'Cable',
          uom: 'Meter',
          rate: 60,
          qty: 100,
          price: 6000,
        },
      ],
    },
    {
      id: '5',
      name: 'Plumbing System - Commercial',
      workType: 'Plumbing',
      itemCount: 29,
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
      status: 'draft',
      items: [
        {
          itemCode: 'PL-401',
          itemName: 'PVC Pipe',
          uom: 'Meter',
          rate: 90,
          qty: 50,
          price: 4500,
        },
        {
          itemCode: 'PL-402',
          itemName: 'Valve',
          uom: 'Nos',
          rate: 350,
          qty: 10,
          price: 3500,
        },
      ],
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

  const handleEditTemplate = (template: BOMTemplate) => {
    setEditTemplate(template);
    setShowBOMModal(true);
  };

  const handleCloseModal = () => {
    setShowBOMModal(false);
    setEditTemplate(null);
  };

  const handleSubmitTemplate = (template: BOMTemplate) => {
    // Handle template submission logic here
    console.log('Template submitted:', template);
    handleCloseModal();
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
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={e => {
                        e.stopPropagation();
                        handleEditTemplate(template); // use local handler
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteTemplate(template);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateBOMTemplate
        isOpen={showBOMModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTemplate}
        initialData={editTemplate}
      />

      {showDeleteModal && deleteTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Delete BOM Template</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{deleteTemplate.name}</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  // TODO: Remove from your templates state or call API
                  setShowDeleteModal(false);
                  setDeleteTemplate(null);
                  // You may want to update your templates array here
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTemplateList;
import React from 'react';
import { FileText, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';
import CreateBOM from './CreateBOM';

interface BOM {
  id: string;
  leadName: string;
  workType: string;
  itemCount: number;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
}

interface BOMListProps {
  selectedBOM: BOM | null;
  onSelectBOM: (bom: BOM) => void;
}

const BOMList: React.FC<BOMListProps> = ({ selectedBOM, onSelectBOM }) => {
  const [boms, setBoms] = React.useState<BOM[]>([
    {
      id: '1',
      leadName: 'Mumbai Metro Ventilation System',
      workType: 'Basement Ventilation',
      itemCount: 24,
      totalValue: '₹18,75,000',
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      status: 'approved',
    },
    {
      id: '2',
      leadName: 'Corporate Office HVAC Upgrade',
      workType: 'HVAC Systems',
      itemCount: 36,
      totalValue: '₹12,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      status: 'pending_approval',
    },
    {
      id: '3',
      leadName: 'Hospital Fire Safety System',
      workType: 'Fire Safety',
      itemCount: 18,
      totalValue: '₹22,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      status: 'draft',
    },
    {
      id: '4',
      leadName: 'Residential Complex Electrical',
      workType: 'Electrical',
      itemCount: 42,
      totalValue: '₹8,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      status: 'approved',
    },
    {
      id: '5',
      leadName: 'Shopping Mall Plumbing System',
      workType: 'Plumbing',
      itemCount: 29,
      totalValue: '₹14,30,000',
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
      status: 'rejected',
    },
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bomToDelete, setBomToDelete] = React.useState<BOM | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editInitialData, setEditInitialData] = React.useState<any>(null);
  const [viewBOM, setViewBOM] = React.useState<any | null>(null);

  // BOMItem and BOMTemplate types
  type BOMItem = {
    id: string;
    itemCode: string;
    itemName: string;
    uomName: string;
    rate: number;
    quantity: number;
    price: number;
    specifications?: string;
  };

  type BOMTemplate = {
    id: string;
    name: string;
    workType: string;
    items: BOMItem[];
  };

  // Templates data (should match CreateBOM)
  const templates: BOMTemplate[] = [
    {
      id: '1',
      name: 'Basement Ventilation System - Standard',
      workType: 'Basement Ventilation',
      items: [
        { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', rate: 12500, quantity: 4, price: 50000, specifications: 'High efficiency, low noise' },
        { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', rate: 850, quantity: 120, price: 102000, specifications: 'Corrosion resistant, fire retardant' },
        { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', rate: 3200, quantity: 6, price: 19200 },
        { id: '104', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', rate: 1800, quantity: 8, price: 14400 },
      ]
    },
    {
      id: '2',
      name: 'HVAC System - Commercial Office',
      workType: 'HVAC Systems',
      items: [
        { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
        { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
        { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
      ]
    },
    {
      id: '3',
      name: 'Fire Safety System - Residential',
      workType: 'Fire Safety',
      items: [
        { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
        { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
        { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
      ]
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
      case 'draft':
        return 'bg-gray-100 text-gray-800';
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
        return <Calendar className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600 mr-1" />;
      default:
        return null;
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

  const handleDeleteClick = (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    setBomToDelete(bom);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bomToDelete) {
      setBoms(prev => prev.filter(b => b.id !== bomToDelete.id));
      setDeleteDialogOpen(false);
      setBomToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBomToDelete(null);
  };

  // Helper to format BOM data for CreateBOM modal
  const formatBOMForEdit = (bom: BOM) => {
    // Find the template that matches the BOM's workType
    const template = templates.find(t => t.workType === bom.workType);

    return {
      id: bom.id,
      leadId: bom.id, // or map to actual leadId if available
      leadName: bom.leadName,
      workType: bom.workType,
      date: bom.createdDate,
      note: '', // Fill if you have notes
      status: bom.status.toUpperCase(),
      selectedTemplate: template ? template.id : '',
      items: template ? template.items : [],
      // Add other fields as needed
    };
  };

  // Handler for edit button
  const handleEditClick = (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    setEditInitialData(formatBOMForEdit(bom));
    setEditModalOpen(true);
  };

  // Handler for saving edited BOM
  const handleEditSave = (updatedBOM: any) => {
    setBoms(prev =>
      prev.map(b => (b.id === updatedBOM.id ? { ...b, ...updatedBOM } : b))
    );
    setEditModalOpen(false);
    setEditInitialData(null);
  };

  // Handler for viewing BOM details
  const handleRowClick = (bom: BOM) => {
    // Find the template and items for this BOM
    const template = templates.find(t => t.workType === bom.workType);
    setViewBOM({
      ...bom,
      templateName: template?.name || '',
      items: template?.items || [],
    });
    onSelectBOM(bom);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Bills of Materials</h3>
        <p className="text-sm text-gray-500">{boms.length} total BOMs</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
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
            {boms.map((bom) => (
              <tr 
                key={bom.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedBOM?.id === bom.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(bom)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{bom.leadName}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(bom.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(bom.workType)}`}>
                    {bom.workType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bom.itemCount} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">{bom.totalValue}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(bom.status)}`}>
                    {getStatusIcon(bom.status)}
                    {bom.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={e => { e.stopPropagation(); handleEditClick(e, bom); }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={e => { e.stopPropagation(); handleDeleteClick(e, bom); }}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">Delete BOM</h4>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">{bomToDelete?.leadName}</span> BOM? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create BOM Modal */}
      {editModalOpen && (
        <CreateBOM
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditInitialData(null);
          }}
          onSubmit={handleEditSave}
          initialData={editInitialData}
        />
      )}

      {/* View BOM Modal */}
      {viewBOM && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setViewBOM(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative border border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewBOM.leadName}</h2>
                    <div className="text-xs text-gray-500 mt-1">
                      BOM ID: <span className="font-mono">{viewBOM.id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewBOM.status)}`}>
                    {getStatusIcon(viewBOM.status)}
                    {viewBOM.status.replace('_', ' ')}
                  </span>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(viewBOM.createdDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Work Type:</span>
                    <span className={`ml-2 px-2 py-1 rounded ${getWorkTypeColor(viewBOM.workType)}`}>{viewBOM.workType}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Template:</span>
                    <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-800">{viewBOM.templateName}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Created By:</span>
                    <span className="ml-2">{viewBOM.createdBy}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Total Value:</span>
                    <span className="ml-2 text-green-700 font-bold">{viewBOM.totalValue}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Total Items:</span>
                    <span className="ml-2">{viewBOM.items.length}</span>
                  </div>
                </div>
              </div>

              {/* BOM Items Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3 mt-2 text-gray-800 border-b pb-2">BOM Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Code</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate (₹)</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (₹)</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specs</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {viewBOM.items.length > 0 ? (
                        viewBOM.items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm font-mono text-gray-700">{item.itemCode}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.uomName}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">₹{item.rate.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900 font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{item.specifications || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                            No items found for this BOM.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {viewBOM.items.length > 0 && (
                      <tfoot>
                        <tr>
                          <td colSpan={5}></td>
                          <td className="px-4 py-2 text-right font-bold text-base text-green-700 border-t">
                            ₹{viewBOM.items.reduce((sum: number, i: any) => sum + i.price, 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 border-t"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- BOMViewModal Component ---
interface BOMViewModalProps {
  viewBOM: any;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getWorkTypeColor: (workType: string) => string;
}

const BOMViewModal: React.FC<BOMViewModalProps> = ({
  viewBOM,
  onClose,
  getStatusColor,
  getStatusIcon,
  getWorkTypeColor,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative border border-gray-200"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{viewBOM.leadName}</h2>
              <div className="text-xs text-gray-500 mt-1">
                BOM ID: <span className="font-mono">{viewBOM.id}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewBOM.status)}`}>
              {getStatusIcon(viewBOM.status)}
              {viewBOM.status.replace('_', ' ')}
            </span>
            <div className="mt-2 text-xs text-gray-500">
              {new Date(viewBOM.createdDate).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Work Type:</span>
              <span className={`ml-2 px-2 py-1 rounded ${getWorkTypeColor(viewBOM.workType)}`}>{viewBOM.workType}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Template:</span>
              <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-800">{viewBOM.templateName}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Created By:</span>
              <span className="ml-2">{viewBOM.createdBy}</span>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Total Value:</span>
              <span className="ml-2 text-green-700 font-bold">{viewBOM.totalValue}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Total Items:</span>
              <span className="ml-2">{viewBOM.items.length}</span>
            </div>
          </div>
        </div>

        {/* BOM Items Table */}
        <div>
          <h3 className="text-lg font-semibold mb-3 mt-2 text-gray-800 border-b pb-2">BOM Items</h3>
          <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Code</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate (₹)</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specs</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {viewBOM.items.length > 0 ? (
                  viewBOM.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm font-mono text-gray-700">{item.itemCode}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{item.uomName}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-700">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-900 font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{item.specifications || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                      No items found for this BOM.
                    </td>
                  </tr>
                )}
              </tbody>
              {viewBOM.items.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5}></td>
                    <td className="px-4 py-2 text-right font-bold text-base text-green-700 border-t">
                      ₹{viewBOM.items.reduce((sum: number, i: any) => sum + i.price, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2 border-t"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BOMList;
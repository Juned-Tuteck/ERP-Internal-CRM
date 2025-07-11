import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, FileText, Download } from 'lucide-react';

interface BOMApprovalProps {
  onApprovalAction: (bomId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const BOMApproval: React.FC<BOMApprovalProps> = ({ onApprovalAction }) => {
  const [selectedBOM, setSelectedBOM] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Mock data for pending BOMs
  const pendingBOMs = [
    {
      id: '1',
      leadName: 'Corporate Office HVAC Upgrade',
      workType: 'HVAC Systems',
      itemCount: 36,
      totalValue: '₹12,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      status: 'pending_approval',
      items: [
        { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
        { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
        { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
      ]
    },
    {
      id: '2',
      leadName: 'Hospital Fire Safety System',
      workType: 'Fire Safety',
      itemCount: 18,
      totalValue: '₹22,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      status: 'pending_approval',
      items: [
        { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
        { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
        { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
      ]
    },
    {
      id: '3',
      leadName: 'Residential Complex Electrical',
      workType: 'Electrical',
      itemCount: 42,
      totalValue: '₹8,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      status: 'pending_approval',
      items: [
        { id: '401', itemCode: 'CABLE-001', itemName: 'Electrical Cable', uomName: 'Meter', rate: 120, quantity: 500, price: 60000 },
        { id: '402', itemCode: 'PANEL-001', itemName: 'Distribution Panel', uomName: 'Nos', rate: 18000, quantity: 4, price: 72000 },
        { id: '403', itemCode: 'SWITCH-001', itemName: 'MCB Switch', uomName: 'Nos', rate: 350, quantity: 48, price: 16800 },
      ]
    }
  ];

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

  const handleApprovalClick = (bom: any, action: 'approve' | 'reject') => {
    setSelectedBOM(bom);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedBOM) {
      onApprovalAction(selectedBOM.id, actionType, reason);
      setShowReasonModal(false);
      setReason('');
      setSelectedBOM(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending BOM Approvals</h3>
              <p className="text-sm text-gray-500">{pendingBOMs.length} BOMs awaiting approval</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Engineering Approval</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingBOMs.map((bom) => (
                <tr key={bom.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
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
                    <div className="text-sm text-gray-900">{bom.createdBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBOM(bom)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(bom, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(bom, 'reject')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingBOMs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No BOMs pending approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOM Details Modal */}
      {selectedBOM && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">BOM Details</h3>
              <button
                onClick={() => setSelectedBOM(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">BOM Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Name:</span> {selectedBOM.leadName}
                    </div>
                    <div>
                      <span className="text-gray-500">Work Type:</span> {selectedBOM.workType}
                    </div>
                    <div>
                      <span className="text-gray-500">Created By:</span> {selectedBOM.createdBy}
                    </div>
                    <div>
                      <span className="text-gray-500">Created Date:</span> {new Date(selectedBOM.createdDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Items:</span> {selectedBOM.itemCount}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Value:</span> {selectedBOM.totalValue}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">BOM Items</h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBOM.items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                {item.itemName}
                                {item.specifications && (
                                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                    Spec: {item.specifications}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₹{selectedBOM.items.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedBOM(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedBOM, 'reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedBOM, 'approve')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === 'approve' ? 'Approve BOM' : 'Reject BOM'}
              </h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {actionType === 'approve' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedBOM?.leadName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this BOM?' : 'Reject this BOM?'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required={actionType === 'reject'}
                  placeholder={actionType === 'approve' ? 'Add any notes...' : 'Please provide reason for rejection...'}
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
                onClick={handleConfirmAction}
                disabled={actionType === 'reject' && !reason.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve BOM
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject BOM
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMApproval;
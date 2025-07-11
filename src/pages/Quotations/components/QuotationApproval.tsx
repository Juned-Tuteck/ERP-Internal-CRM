import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, FileSpreadsheet, Download, Building2 } from 'lucide-react';

interface QuotationApprovalProps {
  onApprovalAction: (quotationId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const QuotationApproval: React.FC<QuotationApprovalProps> = ({ onApprovalAction }) => {
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Mock data for pending quotations
  const pendingQuotations = [
    {
      id: '1',
      leadName: 'Corporate Office HVAC Upgrade',
      businessName: 'Innovate India Limited',
      workType: 'HVAC Systems',
      totalValue: '₹18,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      expiryDate: '2024-02-10',
      status: 'pending_approval',
      items: [
        { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', supplyRate: 85000, installationRate: 15000, quantity: 2, supplyPrice: 170000, installationPrice: 30000 },
        { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', supplyRate: 1200, installationRate: 500, quantity: 80, supplyPrice: 96000, installationPrice: 40000 },
        { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', supplyRate: 4500, installationRate: 800, quantity: 6, supplyPrice: 27000, installationPrice: 4800 },
      ]
    },
    {
      id: '2',
      leadName: 'Hospital Fire Safety System',
      businessName: 'Digital Solutions Enterprise',
      workType: 'Fire Safety',
      totalValue: '₹32,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      expiryDate: '2024-02-05',
      status: 'pending_approval',
      items: [
        { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', supplyRate: 35000, installationRate: 8000, quantity: 1, supplyPrice: 35000, installationPrice: 8000 },
        { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', supplyRate: 1200, installationRate: 300, quantity: 24, supplyPrice: 28800, installationPrice: 7200 },
        { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', supplyRate: 800, installationRate: 200, quantity: 36, supplyPrice: 28800, installationPrice: 7200 },
      ]
    },
    {
      id: '3',
      leadName: 'Residential Complex Electrical',
      businessName: 'Manufacturing Industries Co',
      workType: 'Electrical',
      totalValue: '₹12,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      expiryDate: '2024-01-28',
      status: 'pending_approval',
      items: [
        { id: '401', itemCode: 'CABLE-001', itemName: 'Electrical Cable', uomName: 'Meter', supplyRate: 120, installationRate: 40, quantity: 500, supplyPrice: 60000, installationPrice: 20000 },
        { id: '402', itemCode: 'PANEL-001', itemName: 'Distribution Panel', uomName: 'Nos', supplyRate: 18000, installationRate: 4000, quantity: 4, supplyPrice: 72000, installationPrice: 16000 },
        { id: '403', itemCode: 'SWITCH-001', itemName: 'MCB Switch', uomName: 'Nos', supplyRate: 350, installationRate: 150, quantity: 48, supplyPrice: 16800, installationPrice: 7200 },
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

  const handleApprovalClick = (quotation: any, action: 'approve' | 'reject') => {
    setSelectedQuotation(quotation);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedQuotation) {
      onApprovalAction(selectedQuotation.id, actionType, reason);
      setShowReasonModal(false);
      setReason('');
      setSelectedQuotation(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Quotation Approvals</h3>
              <p className="text-sm text-gray-500">{pendingQuotations.length} quotations awaiting approval</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Sales Manager Approval</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
              {pendingQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quotation.leadName}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWorkTypeColor(quotation.workType)}`}>
                        {quotation.workType}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {new Date(quotation.expiryDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-900">{quotation.businessName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{quotation.totalValue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quotation.createdBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedQuotation(quotation)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(quotation, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(quotation, 'reject')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Details Modal */}
      {selectedQuotation && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quotation Details</h3>
              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quotation Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Name:</span> {selectedQuotation.leadName}
                    </div>
                    <div>
                      <span className="text-gray-500">Business Name:</span> {selectedQuotation.businessName}
                    </div>
                    <div>
                      <span className="text-gray-500">Work Type:</span> {selectedQuotation.workType}
                    </div>
                    <div>
                      <span className="text-gray-500">Created By:</span> {selectedQuotation.createdBy}
                    </div>
                    <div>
                      <span className="text-gray-500">Created Date:</span> {new Date(selectedQuotation.createdDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <span className="text-gray-500">Expiry Date:</span> {new Date(selectedQuotation.expiryDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Value:</span> <span className="font-medium text-green-600">{selectedQuotation.totalValue}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quotation Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedQuotation.items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.supplyRate.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.supplyPrice.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.installationRate.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.installationPrice.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}</td>
                          <td></td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Margin Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Supply Cost:</span>
                        <span className="text-sm text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + (item.supplyRate * 0.7 * item.quantity), 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Supply Selling:</span>
                        <span className="text-sm text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Supply Margin:</span>
                        <span className="text-sm font-medium text-green-600">30%</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installation Cost:</span>
                        <span className="text-sm text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + (item.installationRate * 0.65 * item.quantity), 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installation Selling:</span>
                        <span className="text-sm text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installation Margin:</span>
                        <span className="text-sm font-medium text-green-600">35%</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Overall Margin:</span>
                        <span className="text-sm font-medium text-green-600">31.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">GST Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High Side Supply:</span>
                        <span className="text-sm text-gray-900">₹{(selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 0.4).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High Side GST (18%):</span>
                        <span className="text-sm text-gray-900">₹{(selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 0.4 * 0.18).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Low Side Supply:</span>
                        <span className="text-sm text-gray-900">₹{(selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 0.6).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Low Side GST (18%):</span>
                        <span className="text-sm text-gray-900">₹{(selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 0.6 * 0.18).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installation:</span>
                        <span className="text-sm text-gray-900">₹{selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installation GST (18%):</span>
                        <span className="text-sm text-gray-900">₹{(selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0) * 0.18).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Total GST:</span>
                        <span className="text-sm font-medium text-gray-900">₹{(
                          selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 0.18 +
                          selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0) * 0.18
                        ).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Grand Total (with GST):</span>
                        <span className="text-sm font-medium text-green-600">₹{(
                          selectedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0) * 1.18 +
                          selectedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0) * 1.18
                        ).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedQuotation, 'reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedQuotation, 'approve')}
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
                {actionType === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}
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
                    {selectedQuotation?.leadName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this quotation?' : 'Reject this quotation?'}
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
                    Approve Quotation
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Quotation
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

export default QuotationApproval;
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, ShoppingCart, Building2, Calendar } from 'lucide-react';
import { getAllSalesOrders, approveSalesOrder, rejectSalesOrder } from '../../../utils/salesOrderApi';

interface SalesOrderApprovalProps {
  onApprovalAction: (salesOrderId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const SalesOrderApproval: React.FC<SalesOrderApprovalProps> = ({ onApprovalAction }) => {
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [pendingSalesOrders, setPendingSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSalesOrders();
  }, []);

  const fetchPendingSalesOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllSalesOrders();
      const pending = allOrders.filter(
        (order: any) => order.approval_status === 'PENDING'
      ).map((order: any) => ({
        id: order.sales_order_id,
        orderNumber: order.sales_order_number,
        businessName: order.business_name,
        quotationNumber: order.quotation_number,
        bomNumber: order.bom_number,
        totalValue: order.total_cost,
        createdBy: order.created_by,
        createdDate: order.created_at,
        status: 'pending_approval',
        customerBranch: order.customer_branch || '',
        contactPerson: order.contact_person || '',
        workOrderNumber: order.work_order_number || '',
        projectCategory: order.project_category || '',
        projectAddress: order.project_address || ''
      }));
      setPendingSalesOrders(pending);
    } catch (error) {
      console.error('Error fetching pending sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (salesOrderId: string, approvalReason?: string) => {
    try {
      await approveSalesOrder(salesOrderId, approvalReason);
      onApprovalAction(salesOrderId, 'approve', approvalReason);
      fetchPendingSalesOrders();
    } catch (error) {
      console.error('Error approving sales order:', error);
      alert('Error approving sales order');
    }
  };

  const handleReject = async (salesOrderId: string, rejectionReason: string) => {
    try {
      await rejectSalesOrder(salesOrderId, rejectionReason);
      onApprovalAction(salesOrderId, 'reject', rejectionReason);
      fetchPendingSalesOrders();
    } catch (error) {
      console.error('Error rejecting sales order:', error);
      alert('Error rejecting sales order');
    }
  };

  // Mock data preserved for UI structure reference
  const mockPendingSalesOrders = [
    {
      id: '1',
      orderNumber: 'SO-2024-002',
      businessName: 'Innovate India Limited',
      quotationNumber: 'QT-2024-002',
      bomNumber: 'BOM-2024-002',
      totalValue: '₹18,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      projectStartDate: '2024-02-15',
      projectEndDate: '2024-05-15',
      status: 'pending_approval',
      customerBranch: 'Pune Main',
      contactPerson: 'Vikram Singh',
      workOrderNumber: 'WO-2024-002',
      projectCategory: 'Commercial',
      projectAddress: 'Hinjewadi, Pune, Maharashtra - 411057'
    },
    {
      id: '2',
      orderNumber: 'SO-2023-045',
      businessName: 'Manufacturing Industries Co',
      quotationNumber: 'QT-2023-045',
      bomNumber: 'BOM-2023-045',
      totalValue: '₹12,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      projectStartDate: '2024-01-15',
      projectEndDate: '2024-07-10',
      status: 'pending_approval',
      customerBranch: 'Mumbai Plant',
      contactPerson: 'Rajesh Kumar',
      workOrderNumber: 'WO-2023-045',
      projectCategory: 'Industrial',
      projectAddress: 'MIDC Industrial Area, Andheri East, Mumbai, Maharashtra - 400093'
    },
    {
      id: '3',
      orderNumber: 'SO-2024-004',
      businessName: 'Healthcare Plus Ltd',
      quotationNumber: 'QT-2024-004',
      bomNumber: 'BOM-2024-004',
      totalValue: '₹22,35,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-18',
      projectStartDate: '2024-02-20',
      projectEndDate: '2024-06-15',
      status: 'pending_approval',
      customerBranch: 'Delhi HQ',
      contactPerson: 'Neha Gupta',
      workOrderNumber: 'WO-2024-004',
      projectCategory: 'Healthcare',
      projectAddress: 'Saket, New Delhi, Delhi - 110017'
    }
  ];

  const handleApprovalClick = (salesOrder: any, action: 'approve' | 'reject') => {
    setSelectedSalesOrder(salesOrder);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedSalesOrder) {
      if (actionType === 'approve') {
        await handleApprove(selectedSalesOrder.id, reason);
      } else {
        await handleReject(selectedSalesOrder.id, reason);
      }
      setShowReasonModal(false);
      setReason('');
      setSelectedSalesOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Sales Order Approvals</h3>
              <p className="text-sm text-gray-500">{pendingSalesOrders.length} sales orders awaiting approval</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Manager Approval</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
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
              {pendingSalesOrders.map((salesOrder) => (
                <tr key={salesOrder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{salesOrder.orderNumber}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created: {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{salesOrder.businessName}</p>
                      <p className="text-xs text-gray-500">{salesOrder.customerBranch}</p>
                      <p className="text-xs text-gray-500">{salesOrder.contactPerson}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{salesOrder.projectCategory}</p>
                      <p className="text-xs text-gray-500">WO: {salesOrder.workOrderNumber}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Start: {new Date(salesOrder.projectStartDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{salesOrder.totalValue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{salesOrder.createdBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSalesOrder(salesOrder)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(salesOrder, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(salesOrder, 'reject')}
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

      {/* Sales Order Details Modal */}
      {selectedSalesOrder && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sales Order Details</h3>
              <button
                onClick={() => setSelectedSalesOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sales Order Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Order Number:</span> {selectedSalesOrder.orderNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Business Name:</span> {selectedSalesOrder.businessName}
                    </div>
                    <div>
                      <span className="text-gray-500">Branch:</span> {selectedSalesOrder.customerBranch}
                    </div>
                    <div>
                      <span className="text-gray-500">Contact Person:</span> {selectedSalesOrder.contactPerson}
                    </div>
                    <div>
                      <span className="text-gray-500">Quotation Number:</span> {selectedSalesOrder.quotationNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">BOM Number:</span> {selectedSalesOrder.bomNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Created By:</span> {selectedSalesOrder.createdBy}
                    </div>
                    <div>
                      <span className="text-gray-500">Created Date:</span> {new Date(selectedSalesOrder.createdDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Value:</span> <span className="font-medium text-green-600">{selectedSalesOrder.totalValue}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Project Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Work Order Number:</span> {selectedSalesOrder.workOrderNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Project Category:</span> {selectedSalesOrder.projectCategory}
                    </div>
                    <div>
                      <span className="text-gray-500">Project Start Date:</span> {new Date(selectedSalesOrder.projectStartDate).toLocaleDateString('en-IN')}
                    </div>
                    <div>
                      <span className="text-gray-500">Project End Date:</span> {new Date(selectedSalesOrder.projectEndDate).toLocaleDateString('en-IN')}
                    </div>
                    <div className="col-span-3">
                      <span className="text-gray-500">Project Address:</span> {selectedSalesOrder.projectAddress}
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Decision</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Please review the sales order details carefully before making your decision. Once approved, the sales order will be released to the Procurement and Inventory teams for fulfillment.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleApprovalClick(selectedSalesOrder, 'reject')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovalClick(selectedSalesOrder, 'approve')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
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
                {actionType === 'approve' ? 'Approve Sales Order' : 'Reject Sales Order'}
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
                    {selectedSalesOrder?.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this sales order?' : 'Reject this sales order?'}
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
                    Approve Sales Order
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Sales Order
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

export default SalesOrderApproval;
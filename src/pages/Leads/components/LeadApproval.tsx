import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle } from 'lucide-react';

interface LeadApprovalProps {
  onApprovalAction: (leadId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const LeadApproval: React.FC<LeadApprovalProps> = ({ onApprovalAction }) => {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Mock data for pending leads
  const pendingLeads = [
    {
      id: '1',
      projectName: 'Mumbai Metro Ventilation System',
      businessName: 'TechCorp Solutions Pvt Ltd',
      contactPerson: 'Rajesh Kumar',
      projectValue: '₹25,00,000',
      leadType: 'Government',
      leadCriticality: 'Critical',
      leadStage: 'New Lead',
      submittedBy: 'Priya Sharma',
      submittedDate: '2024-01-15',
      leadDetails: 'Basement ventilation system for Mumbai Metro Line 3. Requires specialized HVAC equipment and installation.',
      workType: 'Basement Ventilation',
      eta: '2024-06-30',
      approximateResponseTime: '7',
      involvedAssociates: ['Architect A', 'Engineer C']
    },
    {
      id: '2',
      projectName: 'Corporate Office HVAC Upgrade',
      businessName: 'Innovate India Limited',
      contactPerson: 'Amit Singh',
      projectValue: '₹15,75,000',
      leadType: 'Corporate',
      leadCriticality: 'High',
      leadStage: 'Qualified',
      submittedBy: 'Vikram Gupta',
      submittedDate: '2024-01-14',
      leadDetails: 'Complete HVAC system upgrade for 10-floor corporate office building in Pune.',
      workType: 'HVAC Systems',
      eta: '2024-05-15',
      approximateResponseTime: '5',
      involvedAssociates: ['Consultant B']
    },
    {
      id: '3',
      projectName: 'Hospital Fire Safety System',
      businessName: 'Digital Solutions Enterprise',
      contactPerson: 'Sneha Patel',
      projectValue: '₹35,50,000',
      leadType: 'Private',
      leadCriticality: 'Critical',
      leadStage: 'Meeting',
      submittedBy: 'Kavita Reddy',
      submittedDate: '2024-01-13',
      leadDetails: 'Fire safety and suppression system for 200-bed hospital in Gurgaon.',
      workType: 'Fire Safety',
      eta: '2024-08-20',
      approximateResponseTime: '10',
      involvedAssociates: ['Engineer C', 'Designer D']
    }
  ];

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead':
        return 'bg-blue-100 text-blue-800';
      case 'Qualified':
        return 'bg-purple-100 text-purple-800';
      case 'Meeting':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprovalClick = (lead: any, action: 'approve' | 'reject') => {
    setSelectedLead(lead);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedLead) {
      onApprovalAction(selectedLead.id, actionType, reason);
      setShowReasonModal(false);
      setReason('');
      setSelectedLead(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Lead Approvals</h3>
              <p className="text-sm text-gray-500">{pendingLeads.length} leads awaiting approval</p>
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
                  Project Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.projectName}</p>
                      <p className="text-sm text-gray-600">{lead.workType}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.leadStage)}`}>
                          {lead.leadStage}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(lead.leadCriticality)}`}>
                          {lead.leadCriticality}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.businessName}</p>
                      <p className="text-sm text-gray-600">{lead.contactPerson}</p>
                      <p className="text-xs text-gray-500">{lead.leadType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-green-600">{lead.projectValue}</p>
                      <p className="text-xs text-gray-500">ETA: {new Date(lead.eta).toLocaleDateString('en-IN')}</p>
                      <p className="text-xs text-gray-500">Response: {lead.approximateResponseTime} days</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.submittedBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.submittedDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(lead, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(lead, 'reject')}
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

      {/* Lead Details Modal */}
      {selectedLead && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="text-sm text-gray-900">{selectedLead.projectName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Value</label>
                    <p className="text-sm text-green-600 font-medium">{selectedLead.projectValue}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <p className="text-sm text-gray-900">{selectedLead.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="text-sm text-gray-900">{selectedLead.contactPerson}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lead Type</label>
                    <p className="text-sm text-gray-900">{selectedLead.leadType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Work Type</label>
                    <p className="text-sm text-gray-900">{selectedLead.workType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Criticality</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(selectedLead.leadCriticality)}`}>
                      {selectedLead.leadCriticality}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Stage</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(selectedLead.leadStage)}`}>
                      {selectedLead.leadStage}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Details</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedLead.leadDetails}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Involved Associates</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedLead.involvedAssociates.map((associate: string) => (
                      <span key={associate} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {associate}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedLead, 'reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedLead, 'approve')}
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
                {actionType === 'approve' ? 'Approve Lead' : 'Reject Lead'}
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
                    {selectedLead?.projectName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this lead for further processing?' : 'Reject this lead?'}
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
                    Approve Lead
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Lead
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

export default LeadApproval;
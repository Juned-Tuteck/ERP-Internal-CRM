import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  Phone, Mail, Building, Globe, Star, TrendingUp, UserCheck, Calendar, 
  AlertTriangle, Clock, FileText, Users, Edit, CheckCircle, XCircle, 
  GitPullRequestArrow,
  Link,
  History,
  Edit2,
  Trash2
} from 'lucide-react';
import AddLeadModal from './AddLeadModal'; // Make sure this import exists
import axios from 'axios';

interface LeadDetailsProps {
  lead: any;
  onConvert: (leadId: string) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onConvert }) => {
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showWinLossModal, setShowWinLossModal] = useState(false);
  const [winLossReason, setWinLossReason] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<'Won' | 'Lost'>('Won');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
   console.log('Lead Details Component Mounted', lead);
  });

  // Fetch detailed lead information when lead is selected
  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!lead?.id) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/lead/${lead.id}`);
        const apiLead = response.data.data;
        
        // Map API response to UI format
        const mappedLead = {
          id: apiLead.lead_id?.toString() || lead.id,
          businessName: apiLead.business_name || lead.businessName,
          avatar: lead.avatar || 'LD',
          customerBranch: apiLead.customer_branch || null,
          currency: 'INR',
          contactPerson: lead.contactPersonName,
          contactNo: apiLead.contact_no || lead.contactNo,
          phone: apiLead.contact_no || lead.contactNo, // For compatibility
          leadGeneratedDate: apiLead.lead_date_generated_on || lead.leadGeneratedDate,
          referencedBy: apiLead.referenced_by || null,
          projectName: apiLead.project_name || lead.projectName,
          projectValue: `₹${(apiLead.project_value || 0).toLocaleString('en-IN')}`,
          leadType: apiLead.lead_type || lead.leadType,
          workType: apiLead.work_type || null,
          leadCriticality: apiLead.lead_criticality || lead.leadCriticality,
          leadSource: apiLead.lead_source || lead.leadSource,
          leadStage: apiLead.lead_stage || lead.leadStage,
          approximateResponseTime: apiLead.approximate_response_time_day?.toString() || '0',
          eta: apiLead.eta || null,
          leadDetails: apiLead.lead_details || null,
          approvalStatus: apiLead.approval_status?.toLowerCase() || 'pending',
          submittedDate: apiLead.created_at || lead.leadGeneratedDate,
          involvedAssociates: lead.involvedAssociates || [],
          uploadedFiles: lead.uploadedFiles || [],
          followUpComments: lead.followUpComments || [],
        };
        
        setLeadDetails(mappedLead);
      } catch (error) {
        console.error('Error fetching lead details:', error);
        // Fallback to the lead data passed as prop
        setLeadDetails(lead);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
  }, [lead]);

  // Dummy history data for modal
  const historyData = [
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '05-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '05-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '05-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '05-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '06-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '06-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '06-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '06-07-2025', stage: 'LEAD' },
    { user: 'js.qa@tuteck.com', type: 'UPDATE', date: '06-07-2025', stage: 'LEAD' }
  ];

  if (!lead && !leadDetails) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <UserCheck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a lead</h3>
          <p className="text-sm">Choose a lead from the list to view their details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <UserCheck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading lead details...</h3>
        </div>
      </div>
    );
  }

  // Use detailed lead data if available, otherwise fallback to prop data
  const displayLead = leadDetails || lead;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead':
        return 'bg-gray-100 text-gray-800';
      case 'Qualified':
        return 'bg-blue-100 text-blue-800';
      case 'Meeting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Quotation Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWinLossSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Call PUT API to update lead status with lead ID in path params
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/lead/${displayLead.id}`, {
        reason: winLossReason,
        lead_stage: selectedOutcome
      });

      console.log('Lead status updated successfully:', response.data);

      // If marked as Won, trigger conversion
      if (selectedOutcome === 'Won') {
        onConvert(displayLead.id);
      }

      console.log(`Lead marked as ${selectedOutcome}:`, winLossReason);
      
      // Close modal and reset form
      setShowWinLossModal(false);
      setWinLossReason('');
      
      // Optionally refresh the lead details or trigger a re-fetch
      // You might want to call a refresh function here
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      // You might want to show an error message to the user here
      alert('Failed to update lead status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-white">{displayLead.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayLead.projectName}</h2>
              <p className="text-sm text-gray-600">{displayLead.businessName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(displayLead.leadStage)}`}>
                  {displayLead.leadStage}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(displayLead.approvalStatus || 'pending')}`}>
                  {displayLead.approvalStatus || 'pending'}
                </span>
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 mr-1 ${getCriticalityColor(displayLead.leadCriticality)}`} />
                  <span className={`text-sm font-medium ${getCriticalityColor(displayLead.leadCriticality)}`}>
                    {displayLead.leadCriticality}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-lg font-bold text-green-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              {displayLead.projectValue}
            </div>
            <div className="flex space-x-2 mt-2">
              {/* Update Status */}
              {displayLead.leadStage !== 'Won' && displayLead.leadStage !== 'Lost' && (
                <button
                  onClick={() => setShowWinLossModal(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition"
                  title="Update Status"
                >
                  <GitPullRequestArrow className="h-5 w-5" />
                </button>
              )}
              {/* History Button */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="rounded-full p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition"
                title="View History"
              >
                <History className="h-5 w-5" />
              </button>
              {/* Edit Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="rounded-full p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 transition"
                title="Edit Lead"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-full p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                title="Delete Lead"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              {/* Create Project Button */}
              {displayLead.leadStage === 'Won' && (
                <button
                  onClick={() => onConvert(displayLead.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="text-sm font-medium text-gray-900">{displayLead.contactPerson}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{displayLead.phone || displayLead.contactNo}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Lead Type</p>
                  <p className="text-sm font-medium text-gray-900">{displayLead.leadType}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="text-sm font-medium text-gray-900">{displayLead.leadSource}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ETA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {displayLead?.projectName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-sm font-medium text-gray-900">{displayLead.approximateResponseTime} days</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Work Type</p>
              <p className="text-sm font-medium text-gray-900">{displayLead.workType || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Stage</span>
              <span className="font-medium">{displayLead.leadStage}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: displayLead.leadStage === 'New Lead' ? '20%' :
                         displayLead.leadStage === 'Qualified' ? '40%' :
                         displayLead.leadStage === 'Meeting' ? '60%' :
                         displayLead.leadStage === 'Quotation Submitted' ? '80%' :
                         displayLead.leadStage === 'Won' ? '100%' : '0%'
                }}
              ></div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted Date</span>
                <span>{displayLead.submittedDate ? new Date(displayLead.submittedDate).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days in Pipeline</span>
                <span>{displayLead.submittedDate ? Math.floor((new Date().getTime() - new Date(displayLead.submittedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayLead?.uploadedFiles?.map((file: any, index: number) => (
            <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size} • {file.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Lead Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Customer Branch</span>
            <div className="font-medium text-gray-900 ml-2">{displayLead.customerBranch || '-'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-500">Currency</span>
            <div className="font-medium text-gray-900 ml-2">{displayLead.currency || '-'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Link className="h-4 w-4 text-blue-500" />
            <span className="text-gray-500">Referenced By</span>
            <div className="font-medium text-gray-900 ml-2">{displayLead.referencedBy || '-'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Lead Generated Date</span>
            <div className="font-medium text-gray-900 ml-2">
              {displayLead.leadGeneratedDate ? new Date(displayLead.leadGeneratedDate).toLocaleDateString('en-IN') : '-'}
            </div>
          </div>
          <div className="md:col-span-2 flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-gray-500">Involved Associates</span>
            {displayLead.involvedAssociates && displayLead.involvedAssociates.length > 0 ? (
              <div className="flex flex-wrap gap-2 ml-2">
                {displayLead.involvedAssociates.map((a: any, idx: number) => (
                  <div
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium"
                  >
                    <span className="mr-1">{a.designation}</span>
                    <span className="font-semibold">{a.associateName}</span>
                    {a.otherInfo && (
                      <span className="ml-1 text-gray-500">({a.otherInfo})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-medium text-gray-900 ml-2">-</div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Comments</h3>
        {displayLead.followUpComments && displayLead.followUpComments.length > 0 ? (
          <div className="space-y-4">
            {displayLead.followUpComments.map((comment: any, index: number) => (
              <div key={comment.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-2">{comment.text}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {comment.timestamp 
                            ? new Date(comment.timestamp).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'No timestamp'
                          }
                        </span>
                      </div>
                      {comment.author && (
                        <div className="flex items-center space-x-1">
                          {/* <Users className="h-3 w-3" />
                          <span>By: {comment.author}</span> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No follow-up comments yet</p>
            <p className="text-xs mt-1">Comments will appear here when added</p>
          </div>
        )}
      </div>

      {/* Win/Loss Modal */}
      {showWinLossModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Update Lead Status</h3>
              <button
                onClick={() => setShowWinLossModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Outcome
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Won"
                        checked={selectedOutcome === 'Won'}
                        onChange={(e) => setSelectedOutcome(e.target.value as 'Won' | 'Lost')}
                        className="mr-2"
                      />
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Won</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Lost"
                        checked={selectedOutcome === 'Lost'}
                        onChange={(e) => setSelectedOutcome(e.target.value as 'Won' | 'Lost')}
                        className="mr-2"
                      />
                      <XCircle className="h-4 w-4 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">Lost</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={winLossReason}
                    onChange={(e) => setWinLossReason(e.target.value)}
                    rows={3}
                    required
                    placeholder={selectedOutcome === 'Won' ? 'Why did we win this lead?' : 'Why did we lose this lead?'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowWinLossModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWinLossSubmit}
                disabled={!winLossReason.trim() || isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  selectedOutcome === 'Won' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedOutcome === 'Won' ? 'Marking as Won...' : 'Marking as Lost...'}
                  </>
                ) : selectedOutcome === 'Won' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Won
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Lost
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">History Details</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50 flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 rounded px-3 py-1 w-1/3 text-sm"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">User Name</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Operation Type</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Operation Date</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Lead Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">{row.user}</td>
                          <td className="px-4 py-2">{row.type}</td>
                          <td className="px-4 py-2">{row.date}</td>
                          <td className="px-4 py-2">{row.stage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
                  <span className="text-xs text-gray-500"></span>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Lead</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this lead? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add your delete logic here (same as AddVendorModal)
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <AddLeadModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={(_updatedLead) => {
            // Handle update logic here (e.g., call API or update state)
            setShowEditModal(false);
          }}
          initialData={displayLead}
        />
      )}
    </div>
  );
};

export default LeadDetails;
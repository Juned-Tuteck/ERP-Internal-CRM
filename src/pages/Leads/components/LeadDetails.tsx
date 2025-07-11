import React, { useState } from 'react';
import { 
  Phone, Mail, Building, Globe, Star, TrendingUp, UserCheck, Calendar, 
  AlertTriangle, Clock, FileText, Users, Edit, CheckCircle, XCircle 
} from 'lucide-react';

interface LeadDetailsProps {
  lead: any;
  onConvert: (leadId: string) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onConvert }) => {
  const [showWinLossModal, setShowWinLossModal] = useState(false);
  const [winLossReason, setWinLossReason] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<'Won' | 'Lost'>('Won');

  if (!lead) {
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

  const handleWinLossSubmit = () => {
    if (selectedOutcome === 'Won') {
      onConvert(lead.id);
    }
    console.log(`Lead marked as ${selectedOutcome}:`, winLossReason);
    setShowWinLossModal(false);
    setWinLossReason('');
  };

  const mockFollowUps = [
    {
      id: 1,
      author: 'Priya Sharma',
      timestamp: '2024-01-16T10:30:00',
      text: 'Initial call completed. Client is interested in basement ventilation solution. Scheduled site visit for next week.',
      type: 'call'
    },
    {
      id: 2,
      author: 'Rajesh Kumar',
      timestamp: '2024-01-14T15:45:00',
      text: 'Received RFQ documents. Technical specifications reviewed. Need to prepare detailed quotation.',
      type: 'email'
    },
    {
      id: 3,
      author: 'Amit Singh',
      timestamp: '2024-01-12T09:15:00',
      text: 'Lead created from government tender portal. High priority project with tight deadline.',
      type: 'note'
    }
  ];

  const mockFiles = [
    { name: 'RFQ_Mumbai_Metro_Ventilation.pdf', size: '2.4 MB', type: 'PDF' },
    { name: 'Technical_Drawings.dwg', size: '5.1 MB', type: 'DWG' },
    { name: 'Site_Photos.zip', size: '8.7 MB', type: 'ZIP' }
  ];

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-white">{lead.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.projectName}</h2>
              <p className="text-sm text-gray-600">{lead.businessName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.leadStage)}`}>
                  {lead.leadStage}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(lead.approvalStatus)}`}>
                  {lead.approvalStatus}
                </span>
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 mr-1 ${getCriticalityColor(lead.leadCriticality)}`} />
                  <span className={`text-sm font-medium ${getCriticalityColor(lead.leadCriticality)}`}>
                    {lead.leadCriticality}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-lg font-bold text-green-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              {lead.projectValue}
            </div>
            <div className="flex space-x-2 mt-2">
              {lead.leadStage !== 'Won' && lead.leadStage !== 'Lost' && (
                <button
                  onClick={() => setShowWinLossModal(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Update Status
                </button>
              )}
              {lead.leadStage === 'Won' && (
                <button
                  onClick={() => onConvert(lead.id)}
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
                  <p className="text-sm font-medium text-gray-900">{lead.contactPerson}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Lead Type</p>
                  <p className="text-sm font-medium text-gray-900">{lead.leadType}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="text-sm font-medium text-gray-900">{lead.leadSource}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ETA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lead.eta).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-sm font-medium text-gray-900">{lead.approximateResponseTime} days</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Work Type</p>
              <p className="text-sm font-medium text-gray-900">{lead.workType}</p>
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Stage</span>
              <span className="font-medium">{lead.leadStage}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: lead.leadStage === 'New Lead' ? '20%' :
                         lead.leadStage === 'Qualified' ? '40%' :
                         lead.leadStage === 'Meeting' ? '60%' :
                         lead.leadStage === 'Quotation Submitted' ? '80%' :
                         lead.leadStage === 'Won' ? '100%' : '0%'
                }}
              ></div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted Date</span>
                <span>{new Date(lead.submittedDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days in Pipeline</span>
                <span>{Math.floor((new Date().getTime() - new Date(lead.submittedDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockFiles.map((file, index) => (
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

      {/* Follow-up History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication History</h3>
        <div className="space-y-4">
          {mockFollowUps.map((followUp) => (
            <div key={followUp.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-1 rounded-full ${
                followUp.type === 'call' ? 'bg-green-100' :
                followUp.type === 'email' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {followUp.type === 'call' ? (
                  <Phone className={`h-4 w-4 ${
                    followUp.type === 'call' ? 'text-green-600' :
                    followUp.type === 'email' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                ) : followUp.type === 'email' ? (
                  <Mail className="h-4 w-4 text-blue-600" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{followUp.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(followUp.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{followUp.text}</p>
              </div>
            </div>
          ))}
        </div>
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
                disabled={!winLossReason.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  selectedOutcome === 'Won' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {selectedOutcome === 'Won' ? (
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
    </div>
  );
};

export default LeadDetails;
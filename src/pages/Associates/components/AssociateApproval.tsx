import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, HardHat, Phone, Mail, MapPin, Tag } from 'lucide-react';

interface AssociateApprovalProps {
  onApprovalAction: (associateId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const AssociateApproval: React.FC<AssociateApprovalProps> = ({ onApprovalAction }) => {
  const [selectedAssociate, setSelectedAssociate] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Mock data for pending associates
  const pendingAssociates = [
    {
      id: '1',
      businessName: 'Sharma & Associates',
      associateCategory: 'Architect',
      associateType: 'Consultant',
      contactNo: '+91 98765 43210',
      email: 'contact@sharmaarchitects.in',
      country: 'India',
      currency: 'INR',
      state: 'Maharashtra',
      district: 'Mumbai',
      city: 'Mumbai',
      pincode: '400001',
      submittedBy: 'Rajesh Kumar',
      submittedDate: '2024-01-15',
      panNumber: 'ABCDE1234F',
      gstNumber: '27ABCDE1234F1Z5',
      bankName: 'HDFC Bank',
      contactPersons: [
        { name: 'Vikram Sharma', phone: '+91 98765 43211', email: 'vikram@sharmaarchitects.in' },
        { name: 'Priya Patel', phone: '+91 98765 43212', email: 'priya@sharmaarchitects.in' }
      ],
      branches: [
        {
          branchName: 'Mumbai Head Office',
          contactNumber: '+91 98765 43210',
          email: 'mumbai@sharmaarchitects.in',
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        {
          branchName: 'Pune Branch',
          contactNumber: '+91 98765 43213',
          email: 'pune@sharmaarchitects.in',
          city: 'Pune',
          state: 'Maharashtra'
        }
      ],
      uploadedFiles: [
        { name: 'Portfolio_2023.pdf', size: '8.2 MB' },
        { name: 'Architecture_License.pdf', size: '1.5 MB' },
        { name: 'Professional_Certificates.pdf', size: '3.8 MB' }
      ]
    },
    {
      id: '2',
      businessName: 'Patel Engineering Consultants',
      associateCategory: 'Engineer',
      associateType: 'Consultant',
      contactNo: '+91 87654 32109',
      email: 'info@patelengineering.com',
      country: 'India',
      currency: 'INR',
      state: 'Gujarat',
      district: 'Ahmedabad',
      city: 'Ahmedabad',
      pincode: '380001',
      submittedBy: 'Sneha Gupta',
      submittedDate: '2024-01-14',
      panNumber: 'FGHIJ5678K',
      gstNumber: '24FGHIJ5678K1A2',
      bankName: 'ICICI Bank',
      contactPersons: [
        { name: 'Amit Patel', phone: '+91 87654 32110', email: 'amit@patelengineering.com' }
      ],
      branches: [
        {
          branchName: 'Ahmedabad Main Office',
          contactNumber: '+91 87654 32109',
          email: 'ahmedabad@patelengineering.com',
          city: 'Ahmedabad',
          state: 'Gujarat'
        }
      ],
      uploadedFiles: [
        { name: 'Engineering_Projects.pdf', size: '5.1 MB' },
        { name: 'Certifications.pdf', size: '2.7 MB' }
      ]
    },
    {
      id: '3',
      businessName: 'Mehta Interior Designs',
      associateCategory: 'Interior Designer',
      associateType: 'Designer',
      contactNo: '+91 76543 21098',
      email: 'contact@mehtadesigns.in',
      country: 'India',
      currency: 'INR',
      state: 'Delhi',
      district: 'South Delhi',
      city: 'Delhi',
      pincode: '110001',
      submittedBy: 'Kavita Reddy',
      submittedDate: '2024-01-13',
      panNumber: 'LMNOP9012Q',
      gstNumber: '07LMNOP9012Q1B3',
      bankName: 'Axis Bank',
      contactPersons: [
        { name: 'Neha Mehta', phone: '+91 76543 21099', email: 'neha@mehtadesigns.in' },
        { name: 'Rahul Joshi', phone: '+91 76543 21100', email: 'rahul@mehtadesigns.in' }
      ],
      branches: [
        {
          branchName: 'Delhi Design Studio',
          contactNumber: '+91 76543 21098',
          email: 'delhi@mehtadesigns.in',
          city: 'Delhi',
          state: 'Delhi'
        }
      ],
      uploadedFiles: [
        { name: 'Design_Portfolio.pdf', size: '12.9 MB' },
        { name: 'Client_Projects.pdf', size: '7.2 MB' }
      ]
    }
  ];

  const getAssociateCategoryColor = (category: string) => {
    switch (category) {
      case 'Architect':
        return 'bg-blue-100 text-blue-800';
      case 'Engineer':
        return 'bg-purple-100 text-purple-800';
      case 'Interior Designer':
        return 'bg-pink-100 text-pink-800';
      case 'Structural Engineer':
        return 'bg-indigo-100 text-indigo-800';
      case 'Contractor':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssociateTypeColor = (type: string) => {
    switch (type) {
      case 'Consultant':
        return 'bg-green-100 text-green-800';
      case 'Designer':
        return 'bg-blue-100 text-blue-800';
      case 'Service Provider':
        return 'bg-purple-100 text-purple-800';
      case 'Contractor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprovalClick = (associate: any, action: 'approve' | 'reject') => {
    setSelectedAssociate(associate);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedAssociate) {
      onApprovalAction(selectedAssociate.id, actionType, reason);
      setShowReasonModal(false);
      setReason('');
      setSelectedAssociate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Associate Registrations</h3>
              <p className="text-sm text-gray-500">{pendingAssociates.length} associates awaiting approval</p>
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
                  Associate Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Type
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
              {pendingAssociates.map((associate) => (
                <tr key={associate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{associate.businessName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssociateCategoryColor(associate.associateCategory)}`}>
                          {associate.associateCategory}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssociateTypeColor(associate.associateType)}`}>
                          {associate.associateType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PAN: {associate.panNumber} | GST: {associate.gstNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.contactNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {associate.contactPersons.length} contact person(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.city}, {associate.state}
                      </div>
                      <p className="text-sm text-gray-600">{associate.pincode}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {associate.branches.length} branch(es)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{associate.submittedBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(associate.submittedDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAssociate(associate)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(associate, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(associate, 'reject')}
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

      {/* Associate Details Modal */}
      {selectedAssociate && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Associate Registration Details</h3>
              <button
                onClick={() => setSelectedAssociate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Business Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.businessName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Associate Category</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssociateCategoryColor(selectedAssociate.associateCategory)}`}>
                        {selectedAssociate.associateCategory}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Associate Type</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssociateTypeColor(selectedAssociate.associateType)}`}>
                        {selectedAssociate.associateType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.contactNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.city}, {selectedAssociate.state} - {selectedAssociate.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.panNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.gstNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <p className="text-sm text-gray-900">{selectedAssociate.bankName}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Persons */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Persons</h4>
                  <div className="space-y-3">
                    {selectedAssociate.contactPersons.map((person: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Name</label>
                            <p className="text-sm text-gray-900">{person.name}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Phone</label>
                            <p className="text-sm text-gray-900">{person.phone}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Email</label>
                            <p className="text-sm text-gray-900">{person.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branches */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Branch Information</h4>
                  <div className="space-y-4">
                    {selectedAssociate.branches.map((branch: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">{branch.branchName}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Contact Number</label>
                            <p className="text-sm text-gray-900">{branch.contactNumber}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Email</label>
                            <p className="text-sm text-gray-900">{branch.email}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">City</label>
                            <p className="text-sm text-gray-900">{branch.city}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">State</label>
                            <p className="text-sm text-gray-900">{branch.state}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Files */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedAssociate.uploadedFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedAssociate(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedAssociate, 'reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedAssociate, 'approve')}
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
                {actionType === 'approve' ? 'Approve Associate' : 'Reject Associate'}
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
                    {selectedAssociate?.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this associate registration?' : 'Reject this associate registration?'}
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
                    Approve Associate
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Associate
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

export default AssociateApproval;
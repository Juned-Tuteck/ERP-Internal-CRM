import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Building2, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerApprovalProps {
  onApprovalAction: (customerId: string, action: 'approve' | 'reject', reason?: string) => void;
}

const CustomerApproval: React.FC<CustomerApprovalProps> = ({ onApprovalAction }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  // Mock data for pending customers
  const pendingCustomers = [
    {
      id: '1',
      businessName: 'TechCorp Solutions Pvt Ltd',
      contactNo: '+91 98765 43210',
      email: 'contact@techcorp.in',
      country: 'India',
      currency: 'INR',
      state: 'Maharashtra',
      district: 'Mumbai',
      city: 'Mumbai',
      customerType: 'Enterprise',
      customerPotential: 'High',
      pincode: '400001',
      submittedBy: 'Rajesh Kumar',
      submittedDate: '2024-01-15',
      panNumber: 'ABCDE1234F',
      gstNumber: '27ABCDE1234F1Z5',
      bankName: 'State Bank of India',
      contactPersons: [
        { name: 'Amit Sharma', phone: '+91 98765 43211', email: 'amit@techcorp.in' },
        { name: 'Priya Patel', phone: '+91 98765 43212', email: 'priya@techcorp.in' }
      ],
      branches: [
        {
          branchName: 'Mumbai Head Office',
          contactNumber: '+91 98765 43210',
          email: 'mumbai@techcorp.in',
          city: 'Mumbai',
          state: 'Maharashtra'
        },
        {
          branchName: 'Pune Branch',
          contactNumber: '+91 98765 43213',
          email: 'pune@techcorp.in',
          city: 'Pune',
          state: 'Maharashtra'
        }
      ],
      uploadedFiles: [
        { name: 'Business_Registration.pdf', size: '2.4 MB' },
        { name: 'GST_Certificate.pdf', size: '1.8 MB' },
        { name: 'PAN_Card.jpg', size: '0.5 MB' }
      ]
    },
    {
      id: '2',
      businessName: 'Innovate India Limited',
      contactNo: '+91 87654 32109',
      email: 'info@innovateindia.com',
      country: 'India',
      currency: 'INR',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      city: 'Bangalore',
      customerType: 'SME',
      customerPotential: 'Medium',
      pincode: '560001',
      submittedBy: 'Sneha Gupta',
      submittedDate: '2024-01-14',
      panNumber: 'FGHIJ5678K',
      gstNumber: '29FGHIJ5678K1A2',
      bankName: 'HDFC Bank',
      contactPersons: [
        { name: 'Vikram Singh', phone: '+91 87654 32110', email: 'vikram@innovateindia.com' }
      ],
      branches: [
        {
          branchName: 'Bangalore Main Office',
          contactNumber: '+91 87654 32109',
          email: 'bangalore@innovateindia.com',
          city: 'Bangalore',
          state: 'Karnataka'
        }
      ],
      uploadedFiles: [
        { name: 'Company_Certificate.pdf', size: '3.1 MB' },
        { name: 'Tax_Documents.pdf', size: '2.7 MB' }
      ]
    },
    {
      id: '3',
      businessName: 'Digital Solutions Enterprise',
      contactNo: '+91 76543 21098',
      email: 'contact@digitalsolutions.in',
      country: 'India',
      currency: 'INR',
      state: 'Delhi',
      district: 'Central Delhi',
      city: 'Delhi',
      customerType: 'Startup',
      customerPotential: 'High',
      pincode: '110001',
      submittedBy: 'Kavita Reddy',
      submittedDate: '2024-01-13',
      panNumber: 'LMNOP9012Q',
      gstNumber: '07LMNOP9012Q1B3',
      bankName: 'ICICI Bank',
      contactPersons: [
        { name: 'Arjun Mehta', phone: '+91 76543 21099', email: 'arjun@digitalsolutions.in' },
        { name: 'Deepika Joshi', phone: '+91 76543 21100', email: 'deepika@digitalsolutions.in' }
      ],
      branches: [
        {
          branchName: 'Delhi Head Office',
          contactNumber: '+91 76543 21098',
          email: 'delhi@digitalsolutions.in',
          city: 'Delhi',
          state: 'Delhi'
        }
      ],
      uploadedFiles: [
        { name: 'Startup_Registration.pdf', size: '1.9 MB' },
        { name: 'Incorporation_Certificate.pdf', size: '2.2 MB' }
      ]
    }
  ];

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'Enterprise':
        return 'bg-blue-100 text-blue-800';
      case 'SME':
        return 'bg-green-100 text-green-800';
      case 'Startup':
        return 'bg-purple-100 text-purple-800';
      case 'Government':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprovalClick = (customer: any, action: 'approve' | 'reject') => {
    setSelectedCustomer(customer);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedCustomer) {
      onApprovalAction(selectedCustomer.id, actionType, reason);
      setShowReasonModal(false);
      setReason('');
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Customer Registrations</h3>
              <p className="text-sm text-gray-500">{pendingCustomers.length} customers awaiting approval</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Sales Head Approval</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Details
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
              {pendingCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.businessName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.customerType)}`}>
                          {customer.customerType}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(customer.customerPotential)}`}>
                          {customer.customerPotential} Potential
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PAN: {customer.panNumber} | GST: {customer.gstNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.contactNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.contactPersons.length} contact person(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.city}, {customer.state}
                      </div>
                      <p className="text-sm text-gray-600">{customer.pincode}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.branches.length} branch(es)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.submittedBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(customer.submittedDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(customer, 'approve')}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(customer, 'reject')}
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

      {/* Customer Details Modal */}
      {selectedCustomer && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Registration Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
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
                      <p className="text-sm text-gray-900">{selectedCustomer.businessName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Type</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(selectedCustomer.customerType)}`}>
                        {selectedCustomer.customerType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Potential</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(selectedCustomer.customerPotential)}`}>
                        {selectedCustomer.customerPotential}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.contactNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.panNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Number</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.gstNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                      <p className="text-sm text-gray-900">{selectedCustomer.bankName}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Persons */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Persons</h4>
                  <div className="space-y-3">
                    {selectedCustomer.contactPersons.map((person: any, index: number) => (
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
                    {selectedCustomer.branches.map((branch: any, index: number) => (
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
                    {selectedCustomer.uploadedFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <Building2 className="h-8 w-8 text-blue-600 mr-3" />
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
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedCustomer, 'reject')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedCustomer, 'approve')}
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
                {actionType === 'approve' ? 'Approve Customer' : 'Reject Customer'}
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
                    {selectedCustomer?.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === 'approve' ? 'Approve this customer registration?' : 'Reject this customer registration?'}
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
                    Approve Customer
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Customer
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

export default CustomerApproval;
import React, { useState } from 'react';
import { HardHat, MapPin, DollarSign, Calendar, Tag, Phone, Mail, FileText, CreditCard, Globe, Building2, Trash2, Power, SquarePen } from 'lucide-react';
import AddAssociateModal from './AddAssociateModal';

interface AssociateDetailsProps {
  associate: any;
}

const AssociateDetails: React.FC<AssociateDetailsProps> = ({ associate }) => {
  if (!associate) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <HardHat className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select an associate</h3>
          <p className="text-sm">Choose an associate from the list to view their details</p>
        </div>
      </div>
    );
  }

  // State for modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Transform associate data for edit modal (if needed)
  const transformToFormData = (associate: any) => ({
    // Step 1: General Information
    associateCategory: associate.associateCategory || associate.category || '',
    associateType: associate.associateType || associate.type || '',
    businessName: associate.businessName || associate.name || '',
    name: associate.name || '',
    contactNo: associate.contactNo || associate.phone || '',
    email: associate.email || '',
    country: associate.country || 'India',
    currency: associate.currency || 'INR',
    state: associate.state || '',
    district: associate.district || '',
    city: associate.city || '',
    pincode: associate.pincode || '',
    active: typeof associate.active === 'boolean' ? associate.active : (associate.status ? associate.status === 'active' : true),
    // Bank Details
    panNumber: associate.panNumber || '',
    tanNumber: associate.tanNumber || '',
    gstNumber: associate.gstNumber || '',
    bankName: associate.bankName || '',
    bankAccountNumber: associate.bankAccountNumber || '',
    branchName: associate.branchName || '',
    ifscCode: associate.ifscCode || '',
    // Contact Persons
    contactPersons: associate.contactPersons || [],
    // Step 2: Branch Information
    branches: associate.branches || [],
    // Step 3: Upload Files
    uploadedFiles: associate.uploadedFiles || [],
  });

  // Enhanced associate data with additional details
  const enhancedAssociate = {
    ...associate,
    panNumber: 'ABCDE1234F',
    tanNumber: 'ABCD12345E',
    gstNumber: '27ABCDE1234F1Z5',
    bankName: 'HDFC Bank',
    bankAccountNumber: '1234567890123456',
    branchName: 'Mumbai Main Branch',
    ifscCode: 'HDFC0001234',
    contactPersons: [
      { name: 'Rajesh Sharma', phone: '+91 98765 43210', email: 'rajesh@example.com', designation: 'Principal Architect' },
      { name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@example.com', designation: 'Project Manager' }
    ],
    branches: [
      {
        branchName: 'Head Office',
        contactNumber: '+91 98765 43210',
        email: 'info@example.com',
        address: 'Andheri East, Mumbai, Maharashtra - 400069',
        contactPersons: [
          { name: 'Vikram Singh', phone: '+91 76543 21098', email: 'vikram@example.com' }
        ]
      },
      {
        branchName: 'Design Studio',
        contactNumber: '+91 65432 10987',
        email: 'studio@example.com',
        address: 'Bandra West, Mumbai, Maharashtra - 400050',
        contactPersons: [
          { name: 'Amit Patel', phone: '+91 54321 09876', email: 'amit@example.com' }
        ]
      }
    ],
    uploadedFiles: [
      { name: 'Portfolio_2023.pdf', size: '8.2 MB', uploadDate: '2023-09-15' },
      { name: 'Architecture_License.pdf', size: '1.5 MB', uploadDate: '2023-09-15' },
      { name: 'Professional_Certificates.pdf', size: '3.8 MB', uploadDate: '2023-09-15' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General Information', icon: HardHat },
    { id: 'branches', name: 'Branch Information', icon: Building2 },
    { id: 'documents', name: 'Documents', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Associate Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-medium text-white">{associate.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{associate.name}</h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600 mr-2">{associate.type}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(associate.status)}`}>
                  {associate.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
            <div className="flex flex-col items-right">
              <p className="text-sm text-gray-500">Associate since</p>
              <span className="text-sm font-medium text-gray-900">
                {new Date(associate.joinDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                title="Edit Associate"
              >
                <SquarePen className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsDeactivateModalOpen(true)}
                className="rounded-full p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition"
                title="Deactivate Associate"
              >
                <Power className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-full p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete Associate"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            {/* Edit Associate Modal (AddAssociateModal in edit mode) */}
            {isEditModalOpen && (
              <AddAssociateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={(updatedAssociateData) => {
                  // Replace with actual update logic, e.g., API call or state update
                  console.log('Updated Associate:', updatedAssociateData);
                  setIsEditModalOpen(false);
                }}
                initialData={transformToFormData(enhancedAssociate)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Associate</h3>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to <span className="font-semibold text-red-600">permanently delete</span> this associate? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  // TODO: Replace with actual delete logic
                  alert('Associate deleted!');
                  setIsDeleteModalOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Power className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Deactivate Associate</h3>
            </div>
            <p className="text-gray-700 mb-6">Are you sure you want to <span className="font-semibold text-yellow-600">deactivate</span> this associate? You can reactivate them later.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeactivateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                onClick={() => {
                  // TODO: Replace with actual deactivate logic
                  alert('Associate deactivated!');
                  setIsDeactivateModalOpen(false);
                }}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Placeholder (implement your own edit modal if needed) */}
      {/* {isEditModalOpen && (
        <YourEditAssociateModal ... />
      )} */}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-8">
            {/* Associate Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Associate Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">{associate.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <HardHat className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900">{associate.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{associate.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{associate.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{associate.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-sm font-medium text-gray-900">www.{associate.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.panNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.tanNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.gstNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.bankName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.bankAccountNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedAssociate.ifscCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Persons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Persons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enhancedAssociate.contactPersons.map((person: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {person.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.designation}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {person.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {person.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Information</h3>
            
            {enhancedAssociate.branches.map((branch: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{branch.branchName}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{branch.contactNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{branch.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{branch.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Branch Contact Persons</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {branch.contactPersons.map((person: any, personIndex: number) => (
                      <div key={personIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 bg-teal-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {person.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{person.name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {person.phone}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {person.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Associate Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedAssociate.uploadedFiles.map((file: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Uploaded: {new Date(file.uploadDate).toLocaleDateString('en-IN')}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociateDetails;
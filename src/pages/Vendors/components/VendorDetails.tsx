import React, { useState } from 'react';
import { Truck, MapPin, DollarSign, Calendar, Tag, Phone, Mail, FileText, CreditCard, Globe, Building2 } from 'lucide-react';

interface VendorDetailsProps {
  vendor: any;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ vendor }) => {
  if (!vendor) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Truck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a vendor</h3>
          <p className="text-sm">Choose a vendor from the list to view their details</p>
        </div>
      </div>
    );
  }

  // Enhanced vendor data with additional details
  const enhancedVendor = {
    ...vendor,
    panNumber: 'ABCDE1234F',
    tanNumber: 'ABCD12345E',
    gstNumber: '27ABCDE1234F1Z5',
    bankName: 'State Bank of India',
    bankAccountNumber: '1234567890123456',
    branchName: 'Mumbai Main Branch',
    ifscCode: 'SBIN0001234',
    contactPersons: [
      { name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@example.com', designation: 'Procurement Manager' },
      { name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@example.com', designation: 'Account Manager' }
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
        branchName: 'Manufacturing Unit',
        contactNumber: '+91 65432 10987',
        email: 'factory@example.com',
        address: 'MIDC Industrial Area, Pune, Maharashtra - 411057',
        contactPersons: [
          { name: 'Amit Patel', phone: '+91 54321 09876', email: 'amit@example.com' }
        ]
      }
    ],
    uploadedFiles: [
      { name: 'Company_Profile.pdf', size: '3.2 MB', uploadDate: '2023-09-15' },
      { name: 'ISO_Certificate.pdf', size: '1.5 MB', uploadDate: '2023-09-15' },
      { name: 'GST_Registration.pdf', size: '0.8 MB', uploadDate: '2023-09-15' }
    ],
    products: [
      { name: 'Industrial Motors', category: 'Machinery', leadTime: '15-20 days' },
      { name: 'Control Panels', category: 'Electronics', leadTime: '7-10 days' },
      { name: 'Power Cables', category: 'Electrical', leadTime: '3-5 days' }
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
    { id: 'general', name: 'General Information', icon: Truck },
    { id: 'branches', name: 'Branch Information', icon: Building2 },
    { id: 'products', name: 'Products & Services', icon: Tag },
    { id: 'documents', name: 'Documents', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Vendor Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-medium text-white">{vendor.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600 mr-2">{vendor.type}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Vendor since</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(vendor.joinDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

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
            {/* Vendor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-sm font-medium text-gray-900">www.{vendor.name.toLowerCase().replace(/\s+/g, '')}.com</p>
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
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.panNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.tanNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.gstNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.bankName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.bankAccountNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedVendor.ifscCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Persons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Persons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enhancedVendor.contactPersons.map((person: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
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
            
            {enhancedVendor.branches.map((branch: any, index: number) => (
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
                        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
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

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products & Services</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product/Service</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedVendor.products.map((product: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{product.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.category}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.leadTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedVendor.uploadedFiles.map((file: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-indigo-600" />
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

export default VendorDetails;
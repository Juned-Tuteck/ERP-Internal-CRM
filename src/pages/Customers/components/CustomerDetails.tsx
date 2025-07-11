import React from 'react';
import { useState } from 'react';
import { Building2, MapPin, DollarSign, Calendar, Users, Phone, Mail, Globe, FileText, CreditCard } from 'lucide-react';

interface CustomerDetailsProps {
  customer: any;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a customer</h3>
          <p className="text-sm">Choose a customer from the list to view their details</p>
        </div>
      </div>
    );
  }

  // Mock enhanced customer data
  const enhancedCustomer = {
    ...customer,
    panNumber: 'ABCDE1234F',
    gstNumber: '27ABCDE1234F1Z5',
    bankName: 'State Bank of India',
    bankAccountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    contactPersons: [
      { name: 'Amit Sharma', phone: '+91 98765 43211', email: 'amit@company.in', designation: 'CEO' },
      { name: 'Priya Patel', phone: '+91 98765 43212', email: 'priya@company.in', designation: 'CTO' }
    ],
    branches: [
      {
        branchName: 'Mumbai Head Office',
        contactNumber: '+91 98765 43210',
        email: 'mumbai@company.in',
        address: 'Andheri East, Mumbai, Maharashtra - 400069',
        contactPersons: [
          { name: 'Rajesh Kumar', phone: '+91 98765 43213', email: 'rajesh@company.in' }
        ]
      },
      {
        branchName: 'Pune Branch',
        contactNumber: '+91 98765 43214',
        email: 'pune@company.in',
        address: 'Hinjewadi, Pune, Maharashtra - 411057',
        contactPersons: [
          { name: 'Sneha Gupta', phone: '+91 98765 43215', email: 'sneha@company.in' }
        ]
      }
    ],
    uploadedFiles: [
      { name: 'Business_Registration.pdf', size: '2.4 MB', uploadDate: '2024-01-15' },
      { name: 'GST_Certificate.pdf', size: '1.8 MB', uploadDate: '2024-01-15' },
      { name: 'PAN_Card.jpg', size: '0.5 MB', uploadDate: '2024-01-15' }
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
    { id: 'general', name: 'General Information', icon: Building2 },
    { id: 'branches', name: 'Branch Information', icon: MapPin },
    { id: 'documents', name: 'Documents', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Customer Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-medium text-white">{customer.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-600">{customer.industry}</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{customer.revenue}</div>
            <p className="text-sm text-gray-500">Total Revenue</p>
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
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="text-sm font-medium text-gray-900">{customer.industry}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{customer.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(customer.joinDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">contact@{customer.avatar.toLowerCase()}.in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Deals</p>
                    <p className="text-sm font-medium text-gray-900">{customer.dealCount} deals</p>
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
                    <p className="text-sm font-medium text-gray-900">{enhancedCustomer.panNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedCustomer.gstNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedCustomer.bankName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedCustomer.bankAccountNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedCustomer.ifscCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Persons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Persons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enhancedCustomer.contactPersons.map((person: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{customer.revenue}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{customer.dealCount}</p>
                <p className="text-sm text-gray-500">Total Deals</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                </p>
                <p className="text-sm text-gray-500">Months Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Information</h3>
            
            {enhancedCustomer.branches.map((branch: any, index: number) => (
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
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedCustomer.uploadedFiles.map((file: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-blue-600" />
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

export default CustomerDetails;
import React, { useState } from 'react';
import { HardHat, MapPin, DollarSign, Calendar, Tag, Phone, Mail, FileText, CreditCard, Globe, Building2 } from 'lucide-react';

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
    ],
    projects: [
      { name: 'Commercial Complex Design', category: 'Architecture', completionTime: '6 months' },
      { name: 'Residential Layout Planning', category: 'Urban Planning', completionTime: '3 months' },
      { name: 'Interior Design Consultation', category: 'Interior Design', completionTime: '2 months' }
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
    { id: 'projects', name: 'Projects & Services', icon: Tag },
    { id: 'documents', name: 'Documents', icon: FileText },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Associate Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <p className="text-sm text-gray-500">Associate since</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(associate.joinDate).toLocaleDateString('en-IN', {
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

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects & Services</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Project/Service</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Completion Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedAssociate.projects.map((project: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{project.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.category}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.completionTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
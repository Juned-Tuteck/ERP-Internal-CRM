import React, { useState } from 'react';
import { ShoppingCart, Calendar, Building2, User, DollarSign, Tag, Clock, Download, Printer, FileText, Phone, Mail, MapPin, Edit, Trash2, AlertTriangle } from 'lucide-react';
import CreateSalesOrderModal from './CreateSalesOrderModal';

interface SalesOrderDetailsProps {
  salesOrder: any;
}

const SalesOrderDetails: React.FC<SalesOrderDetailsProps> = ({ salesOrder }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!salesOrder) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a sales order</h3>
          <p className="text-sm">Choose a sales order from the list to view details</p>
        </div>
      </div>
    );
  }

  // Mock data for sales order details
  const enhancedSalesOrder = {
    ...salesOrder,
    customerBranch: 'Mumbai Head Office',
    contactPerson: 'Amit Patel',
    contactEmail: 'amit.patel@techcorp.in',
    contactPhone: '+91 98765 43210',
    workOrderNumber: 'WO-2024-001',
    workOrderAmount: '₹24,75,000',
    workOrderDate: '2024-01-20',
    projectCategory: 'Commercial',
    projectTemplate: 'Standard Ventilation Project',
    projectAddress: 'Andheri East, Mumbai, Maharashtra - 400069',
    bgInformation: {
      beneficiary: {
        name: 'TechCorp Solutions Pvt Ltd',
        address: 'Andheri East, Mumbai, Maharashtra - 400069',
        contactNumber: '+91 98765 43210',
        email: 'finance@techcorp.in'
      },
      applicant: {
        name: 'TuTeck Engineering Ltd',
        address: 'Powai, Mumbai, Maharashtra - 400076',
        contactNumber: '+91 22 2857 3000',
        email: 'finance@tutech.in'
      },
      bank: {
        name: 'State Bank of India',
        address: 'Andheri Branch, Mumbai, Maharashtra - 400069',
        contactNumber: '+91 22 2836 9000',
        email: 'andheri.mumbai@sbi.co.in'
      },
      guaranteeNumber: 'BG-2024-0045',
      currency: 'INR',
      guaranteeAmount: '₹2,47,500',
      effectiveDate: '2024-01-25',
      expiryDate: '2024-07-30',
      purpose: 'Performance Guarantee',
      exemptionType: 'None'
    },
    materialCosts: [
      { type: 'High Side Supply', gstPercentage: 18, amountBasic: 1000000, amountWithGst: 1180000 },
      { type: 'Low Side Supply', gstPercentage: 18, amountBasic: 800000, amountWithGst: 944000 },
      { type: 'Installation', gstPercentage: 18, amountBasic: 675000, amountWithGst: 796500 }
    ],
    paymentTerms: [
      { description: 'Advance Payment', termType: 'On Order', percentage: 30, amount: 742500 },
      { description: 'On Material Delivery', termType: 'On Delivery', percentage: 40, amount: 990000 },
      { description: 'On Installation', termType: 'On Installation', percentage: 20, amount: 495000 },
      { description: 'After Commissioning', termType: 'After Commissioning', percentage: 10, amount: 247500 }
    ],
    contacts: [
      { name: 'Amit Patel', designation: 'Project Manager', email: 'amit.patel@techcorp.in', phone: '+91 98765 43210' },
      { name: 'Priya Sharma', designation: 'Finance Manager', email: 'priya.sharma@techcorp.in', phone: '+91 87654 32109' },
      { name: 'Vikram Singh', designation: 'Site Engineer', email: 'vikram.singh@techcorp.in', phone: '+91 76543 21098' }
    ],
    comments: [
      { author: 'Rajesh Kumar', timestamp: '2024-01-15T10:30:00', text: 'Sales Order created from accepted quotation QT-2024-001.' },
      { author: 'Priya Sharma', timestamp: '2024-01-16T14:45:00', text: 'Payment terms confirmed with client. Advance payment expected by Jan 25.' },
      { author: 'Amit Singh', timestamp: '2024-01-17T09:15:00', text: 'Project timeline reviewed and approved by engineering team.' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'general', name: 'General Information' },
    { id: 'project', name: 'Project Details' },
    { id: 'bg', name: 'BG Information' },
    { id: 'materials', name: 'Material Costs' },
    { id: 'payment', name: 'Payment Terms' },
    { id: 'contacts', name: 'Contacts' },
    { id: 'comments', name: 'Comments' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Sales Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{salesOrder.orderNumber}</h2>
            <p className="text-sm text-gray-600">{salesOrder.businessName}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(salesOrder.status)}`}>
                {salesOrder.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                Created: {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-2xl font-bold text-green-600">{salesOrder.totalValue}</div>
            <div className="flex space-x-2 mt-2 items-center">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-3 w-3 mr-1" />
                Export
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Printer className="h-3 w-3 mr-1" />
                Print
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Order Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Sales Order Number</div>
                      <div className="text-sm font-medium text-gray-900">{salesOrder.orderNumber}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Business Name</div>
                      <div className="text-sm font-medium text-gray-900">{salesOrder.businessName}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Customer Branch</div>
                      <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.customerBranch}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Contact Person</div>
                      <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.contactPerson}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Quotation Number</div>
                      <div className="text-sm font-medium text-gray-900">{salesOrder.quotationNumber}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">BOM Number</div>
                      <div className="text-sm font-medium text-gray-900">{salesOrder.bomNumber}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Total Cost</div>
                      <div className="text-sm font-medium text-green-600">{salesOrder.totalValue}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">SO Date</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Order Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Order Date
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Project Start
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(salesOrder.projectStartDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Project End
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(salesOrder.projectEndDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        Duration
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.ceil((new Date(salesOrder.projectEndDate).getTime() - new Date(salesOrder.projectStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'project' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Work Order Number</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.workOrderNumber}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Work Order Amount</div>
                  <div className="text-sm font-medium text-green-600">{enhancedSalesOrder.workOrderAmount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Work Order Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(enhancedSalesOrder.workOrderDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Project Category</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.projectCategory}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Project Template</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.projectTemplate}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Project Start Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(salesOrder.projectStartDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Project End Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(salesOrder.projectEndDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Project Address</p>
                    <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.projectAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bg' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Guarantee Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Beneficiary Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.beneficiary.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.beneficiary.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.beneficiary.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.beneficiary.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Applicant Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.applicant.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.applicant.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.applicant.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.applicant.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Bank Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.bank.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.bank.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.bank.contactNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.bank.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Guarantee Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Guarantee Number</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.guaranteeNumber}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Currency</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.currency}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Guarantee Amount</div>
                  <div className="text-sm font-medium text-green-600">{enhancedSalesOrder.bgInformation.guaranteeAmount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Effective Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(enhancedSalesOrder.bgInformation.effectiveDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Expiry Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(enhancedSalesOrder.bgInformation.expiryDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Purpose</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.purpose}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Exemption Type</div>
                  <div className="text-sm font-medium text-gray-900">{enhancedSalesOrder.bgInformation.exemptionType}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Material Type Cost</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Material Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">GST %</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount (Basic)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount with GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedSalesOrder.materialCosts.map((cost: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{cost.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{cost.gstPercentage}%</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">₹{cost.amountBasic.toLocaleString('en-IN')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">₹{cost.amountWithGst.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">Total:</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                      ₹{enhancedSalesOrder.materialCosts.reduce((sum: number, cost: any) => sum + cost.amountBasic, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-green-600">
                      ₹{enhancedSalesOrder.materialCosts.reduce((sum: number, cost: any) => sum + cost.amountWithGst, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Order Payment Terms</h3>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Description</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Term Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Percentage</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enhancedSalesOrder.paymentTerms.map((term: any, index: number) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{term.description}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{term.termType}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{term.percentage}%</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">₹{term.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">Total:</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                      {enhancedSalesOrder.paymentTerms.reduce((sum: number, term: any) => sum + term.percentage, 0)}%
                    </td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-green-600">
                      ₹{enhancedSalesOrder.paymentTerms.reduce((sum: number, term: any) => sum + term.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Order Contacts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedSalesOrder.contacts.map((contact: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {contact.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.designation}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {contact.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Order Comments</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {enhancedSalesOrder.comments.map((comment: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {comment.author.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a comment..."
                    ></textarea>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-end">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && (
        <CreateSalesOrderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(updatedSalesOrder) => {
            console.log('Updated sales order:', updatedSalesOrder);
            // In a real app, this would update the sales order in the database
            setIsEditModalOpen(false);
          }}
          initialData={salesOrder}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Sales Order</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this sales order? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">{salesOrder.orderNumber}</span> - {salesOrder.totalValue}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Deleting sales order:', salesOrder.id);
                  // In a real app, this would delete the sales order from the database
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Sales Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderDetails;
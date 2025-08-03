import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Building2, User, DollarSign, Tag, Clock, Download, Printer, FileText, Phone, Mail, MapPin, Edit, Trash2, AlertTriangle } from 'lucide-react';
import CreateQuotationModal from './CreateQuotationModal';

interface QuotationDetailsProps {
  quotation: any;
}

const QuotationDetails: React.FC<QuotationDetailsProps> = ({ quotation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!quotation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a quotation</h3>
          <p className="text-sm">Choose a quotation from the list to view details</p>
        </div>
      </div>
    );
  }

  // Mock enhanced quotation data
  const enhancedQuotation = {
    ...quotation,
    customerBranch: 'Mumbai Head Office',
    contactPerson: 'Amit Patel',
    contactEmail: 'amit.patel@company.in',
    contactPhone: '+91 98765 43210',
    projectAddress: 'Andheri East, Mumbai, Maharashtra - 400069',
    items: [
      { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', supplyRate: 85000, installationRate: 15000, quantity: 2, supplyPrice: 170000, installationPrice: 30000 },
      { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', supplyRate: 1200, installationRate: 500, quantity: 80, supplyPrice: 96000, installationPrice: 40000 },
      { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', supplyRate: 4500, installationRate: 800, quantity: 6, supplyPrice: 27000, installationPrice: 4800 },
    ],
    gstBreakdown: {
      highSideSupply: { amount: 150000, gst: 27000, total: 177000 },
      lowSideSupply: { amount: 120000, gst: 21600, total: 141600 },
      installation: { amount: 74800, gst: 13464, total: 88264 }
    },
    comments: [
      { author: 'Priya Sharma', timestamp: '2024-01-10T10:30:00', text: 'Quotation created from approved BOM BOM-2024-002.' },
      { author: 'Amit Singh', timestamp: '2024-01-11T14:45:00', text: 'Margin calculations reviewed and approved by finance team.' },
      { author: 'Rajesh Kumar', timestamp: '2024-01-12T09:15:00', text: 'Customer requested minor modifications to installation timeline.' }
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
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'items', name: 'Items' },
    { id: 'gst', name: 'GST Breakdown' },
    { id: 'comments', name: 'Comments' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Quotation Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{quotation.leadName}</h2>
            <div>
              <p className="text-sm text-gray-600">{quotation.businessName}</p>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm font-bold text-blue-600">Quotation #: {quotation.quotationNumber || '-'}</p>
                <p className="text-sm font-bold text-green-600">Lead #: {quotation.leadNumber || '-'}</p>
                <p className="text-sm font-bold text-purple-600">BOM #: {quotation.bomNumber || '-'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                {quotation.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                Created: {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
              </span>
              <span className="text-xs text-gray-500">
                Expires: {new Date(quotation.expiryDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-2xl font-bold text-green-600">{quotation.totalValue}</div>
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
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Lead Name</div>
                      <div className="text-sm font-medium text-gray-900">{quotation.leadName}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Business Name</div>
                      <div className="text-sm font-medium text-gray-900">{quotation.businessName}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Work Type</div>
                      <div className="text-sm font-medium text-gray-900">{quotation.workType}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Total Value</div>
                      <div className="text-sm font-medium text-green-600">{quotation.totalValue}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Created By</div>
                      <div className="text-sm font-medium text-gray-900">{quotation.createdBy}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Created Date</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Expiry Date</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(quotation.expiryDate).toLocaleDateString('en-IN')}
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
                        <p className="text-sm font-medium text-gray-900">{enhancedQuotation.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedQuotation.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedQuotation.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Project Address</p>
                        <p className="text-sm font-medium text-gray-900">{enhancedQuotation.projectAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Stats</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                      <FileSpreadsheet className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900">{enhancedQuotation.items.length}</p>
                      <p className="text-xs text-gray-500">Total Items</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                      <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900">
                        {Math.ceil((new Date(quotation.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-gray-500">Days to Expire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Items</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enhancedQuotation.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.supplyRate.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.supplyPrice.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.installationRate.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.installationPrice.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{enhancedQuotation.items.reduce((sum: number, item: any) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}</td>
                    <td></td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{enhancedQuotation.items.reduce((sum: number, item: any) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gst' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">GST Breakdown</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (Basic)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total with GST</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">High Side Supply</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.highSideSupply.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.highSideSupply.gst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">₹{enhancedQuotation.gstBreakdown.highSideSupply.total.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">Low Side Supply</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.lowSideSupply.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.lowSideSupply.gst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">₹{enhancedQuotation.gstBreakdown.lowSideSupply.total.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">Installation</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.installation.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">₹{enhancedQuotation.gstBreakdown.installation.gst.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">₹{enhancedQuotation.gstBreakdown.installation.total.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td className="px-4 py-2 text-sm font-bold text-gray-900">Grand Total</td>
                    <td className="px-4 py-2 text-sm font-bold text-gray-900">
                      ₹{(enhancedQuotation.gstBreakdown.highSideSupply.amount + enhancedQuotation.gstBreakdown.lowSideSupply.amount + enhancedQuotation.gstBreakdown.installation.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2 text-sm font-bold text-gray-900">
                      ₹{(enhancedQuotation.gstBreakdown.highSideSupply.gst + enhancedQuotation.gstBreakdown.lowSideSupply.gst + enhancedQuotation.gstBreakdown.installation.gst).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2 text-sm font-bold text-green-600">
                      ₹{(enhancedQuotation.gstBreakdown.highSideSupply.total + enhancedQuotation.gstBreakdown.lowSideSupply.total + enhancedQuotation.gstBreakdown.installation.total).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Comments</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {enhancedQuotation.comments.map((comment: any, index: number) => (
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
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && (
        <CreateQuotationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(updatedQuotation) => {
            console.log('Updated quotation:', updatedQuotation);
            setIsEditModalOpen(false);
          }}
          initialData={quotation}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Quotation</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this quotation? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">{quotation.quotationNumber || 'N/A'}</span> - {quotation.totalValue}
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
                  console.log('Deleting quotation:', quotation.id);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetails;
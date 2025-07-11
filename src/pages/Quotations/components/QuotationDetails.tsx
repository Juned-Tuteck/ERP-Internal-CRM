import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Building2, User, DollarSign, Tag, Clock, Download, Printer } from 'lucide-react';

interface QuotationDetailsProps {
  quotation: any;
}

const QuotationDetails: React.FC<QuotationDetailsProps> = ({ quotation }) => {
  const [activeTab, setActiveTab] = useState('summary');

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

  // Mock data for quotation details
  const quotationItems = [
    { id: 1, itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', supplyRate: 12500, installationRate: 2500, quantity: 4, supplyPrice: 50000, installationPrice: 10000 },
    { id: 2, itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', supplyRate: 850, installationRate: 350, quantity: 120, supplyPrice: 102000, installationPrice: 42000 },
    { id: 3, itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', supplyRate: 3200, installationRate: 800, quantity: 6, supplyPrice: 19200, installationPrice: 4800 },
    { id: 4, itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', supplyRate: 1800, installationRate: 400, quantity: 8, supplyPrice: 14400, installationPrice: 3200 },
  ];

  const costingSummary = {
    supplySubtotal: 185600,
    supplyMargin: 15,
    supplySellingAmount: 213440,
    installationSubtotal: 60000,
    installationMargin: 20,
    installationSellingAmount: 72000,
    totalSellingAmount: 285440,
    gstRate: 18,
    gstAmount: 51379.2,
    grandTotal: 336819.2
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
    { id: 'summary', name: 'Summary' },
    { id: 'costingSheet', name: 'Costing Sheet' },
    { id: 'poc', name: 'POC' },
    { id: 'finalCosting', name: 'Final Costing' },
    { id: 'comments', name: 'Comments' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Quotation Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{quotation.leadName}</h2>
            <p className="text-sm text-gray-600">{quotation.businessName}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                {quotation.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                Created: {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{quotation.totalValue}</div>
            <p className="text-xs text-gray-500">
              Expires: {new Date(quotation.expiryDate).toLocaleDateString('en-IN')}
            </p>
            <div className="flex space-x-2 mt-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-3 w-3 mr-1" />
                Export
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Printer className="h-3 w-3 mr-1" />
                Print
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
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Subtotal:</span>
                    <span className="text-sm font-medium">₹{costingSummary.supplySubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Margin ({costingSummary.supplyMargin}%):</span>
                    <span className="text-sm font-medium">₹{(costingSummary.supplySubtotal * costingSummary.supplyMargin / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Selling Amount:</span>
                    <span className="text-sm font-medium">₹{costingSummary.supplySellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Subtotal:</span>
                    <span className="text-sm font-medium">₹{costingSummary.installationSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Margin ({costingSummary.installationMargin}%):</span>
                    <span className="text-sm font-medium">₹{(costingSummary.installationSubtotal * costingSummary.installationMargin / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Selling Amount:</span>
                    <span className="text-sm font-medium">₹{costingSummary.installationSellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Selling Amount:</span>
                    <span className="text-sm font-medium">₹{costingSummary.totalSellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">GST ({costingSummary.gstRate}%):</span>
                    <span className="text-sm font-medium">₹{costingSummary.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-sm text-gray-900">Grand Total:</span>
                    <span className="text-sm text-green-600">₹{costingSummary.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Business</p>
                      <p className="text-sm font-medium text-gray-900">{quotation.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Work Type</p>
                      <p className="text-sm font-medium text-gray-900">{quotation.workType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-medium text-gray-900">{quotation.createdBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.expiryDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UOM
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply Rate
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Install Rate
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Install Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationItems.map((item) => (
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
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{quotationItems.reduce((sum, item) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}</td>
                      <td></td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{quotationItems.reduce((sum, item) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'costingSheet' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Costing Sheet</h3>
              <p className="text-sm text-gray-600">Detailed breakdown of costs for this quotation.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Supply Cost Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Discount:</span>
                    <span className="text-sm font-medium">5% (₹9,280)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Wastage:</span>
                    <span className="text-sm font-medium">2% (₹3,712)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Transportation:</span>
                    <span className="text-sm font-medium">3% (₹5,568)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Contingency:</span>
                    <span className="text-sm font-medium">2% (₹3,712)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Miscellaneous:</span>
                    <span className="text-sm font-medium">1% (₹1,856)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Outstation:</span>
                    <span className="text-sm font-medium">0% (₹0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Office Overhead:</span>
                    <span className="text-sm font-medium">3% (₹5,568)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply PO-variance:</span>
                    <span className="text-sm font-medium">1% (₹1,856)</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mb-4">
                <div className="flex justify-between font-medium">
                  <span className="text-sm text-gray-900">Total Supply Own Cost:</span>
                  <span className="text-sm text-gray-900">₹185,600</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Installation Cost Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Wastage:</span>
                    <span className="text-sm font-medium">2% (₹1,200)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Transportation:</span>
                    <span className="text-sm font-medium">3% (₹1,800)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Contingency:</span>
                    <span className="text-sm font-medium">2% (₹1,200)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Miscellaneous:</span>
                    <span className="text-sm font-medium">1% (₹600)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Outstation:</span>
                    <span className="text-sm font-medium">0% (₹0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Office Overhead:</span>
                    <span className="text-sm font-medium">3% (₹1,800)</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mb-4">
                <div className="flex justify-between font-medium">
                  <span className="text-sm text-gray-900">Total Installation Own Cost:</span>
                  <span className="text-sm text-gray-900">₹60,000</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'poc' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management & Site Establishment Cost</h3>
              <p className="text-sm text-gray-600">Overhead costs associated with this project.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Supervision Costs</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOS / %
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Expense
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Months
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diversity
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Project Manager</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">1</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹60,000</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">3</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">50%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹90,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Site Engineer</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">2</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹35,000</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">3</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">100%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹210,000</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Supervision Cost:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹300,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Finance Costs</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Bank Guarantee</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">2%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹5,709</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Insurance</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">1%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹2,854</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-right">Total Finance Cost:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹8,563</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Contingencies</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Project Contingency</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">3%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹8,563</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-right">Total Contingency:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹8,563</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between font-medium">
                <span className="text-md text-gray-900">Total Overheads Cost:</span>
                <span className="text-md text-gray-900">₹317,126</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finalCosting' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Final Costing Sheet</h3>
              <p className="text-sm text-gray-600">Customer-facing summary of costs.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Itemized List</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UOM
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply Rate
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Install Rate
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Install Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationItems.map((item) => (
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
                      <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{quotationItems.reduce((sum, item) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}</td>
                      <td></td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{quotationItems.reduce((sum, item) => sum + item.installationPrice, 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">GST Summary</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST %
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">High Side Supply</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹83,600</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">18%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹15,048</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹98,648</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Low Side Supply</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹102,000</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">18%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹18,360</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹120,360</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹60,000</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">18%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹10,800</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹70,800</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Grand Total:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">₹44,208</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">₹289,808</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Comments</h3>
              <p className="text-sm text-gray-600">Internal communication regarding this quotation.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">RK</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Rajesh Kumar</span>
                      <span className="text-xs text-gray-500">2024-01-15 10:30 AM</span>
                    </div>
                    <p className="text-sm text-gray-700">Initial quotation created based on client requirements. Adjusted margins to be competitive while maintaining profitability.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">PS</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Priya Sharma</span>
                      <span className="text-xs text-gray-500">2024-01-16 02:15 PM</span>
                    </div>
                    <p className="text-sm text-gray-700">Reviewed the quotation. Please check the installation rates for the fire dampers - they seem a bit low considering the complexity of installation at this site.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">RK</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">Rajesh Kumar</span>
                      <span className="text-xs text-gray-500">2024-01-16 04:45 PM</span>
                    </div>
                    <p className="text-sm text-gray-700">Adjusted the installation rates for fire dampers. Also added a note about the warranty period in the terms and conditions.</p>
                  </div>
                </div>
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
    </div>
  );
};

export default QuotationDetails;
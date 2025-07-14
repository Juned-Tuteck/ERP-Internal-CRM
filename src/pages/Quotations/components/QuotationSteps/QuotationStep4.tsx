import React from 'react';
import { useState } from 'react';
import { Eye, X, Calculator } from 'lucide-react';

interface QuotationStep4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep4: React.FC<QuotationStep4Props> = ({ formData, setFormData }) => {
  const [showCostModal, setShowCostModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Mock data for quotation items if none are provided
  const mockItems = [
    { id: 1, itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', supplyRate: 12500, installationRate: 2500, quantity: 4, supplyPrice: 50000, installationPrice: 10000 },
    { id: 2, itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', supplyRate: 850, installationRate: 350, quantity: 120, supplyPrice: 102000, installationPrice: 42000 },
    { id: 3, itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', supplyRate: 3200, installationRate: 800, quantity: 6, supplyPrice: 19200, installationPrice: 4800 },
  ];
  
  // Use formData.items if available, otherwise use mock data
  const displayItems = formData.items && formData.items.length > 0 ? formData.items : mockItems;
  
  const handleGSTRateChange = (category: 'highSideSupply' | 'lowSideSupply' | 'installation', value: string) => {
    setFormData({
      ...formData,
      gstRates: {
        ...formData.gstRates,
        [category]: parseFloat(value) || 0
      }
    });
  };

  // Calculate high side and low side supply amounts (example: 40% high side, 60% low side)
  const totalSupplyAmount = formData.supplyData?.sellingAmount || 0;
  const highSideSupplyAmount = totalSupplyAmount * 0.4;
  const lowSideSupplyAmount = totalSupplyAmount * 0.6;
  const installationAmount = formData.labourData?.sellingAmount || 0;

  // Calculate GST amounts
  const highSideGSTAmount = ((formData.gstRates?.highSideSupply || 18) / 100) * highSideSupplyAmount;
  const lowSideGSTAmount = ((formData.gstRates?.lowSideSupply || 18) / 100) * lowSideSupplyAmount;
  const installationGSTAmount = ((formData.gstRates?.installation || 18) / 100) * installationAmount;
  
  // Calculate totals with GST
  const highSideTotalWithGST = highSideSupplyAmount + highSideGSTAmount;
  const lowSideTotalWithGST = lowSideSupplyAmount + lowSideGSTAmount;
  const installationTotalWithGST = installationAmount + installationGSTAmount;
  
  // Grand total
  const totalGSTAmount = highSideGSTAmount + lowSideGSTAmount + installationGSTAmount;
  const grandTotalWithGST = highSideTotalWithGST + lowSideTotalWithGST + installationTotalWithGST;

  const openCostModal = (item: any) => {
    setSelectedItem(item);
    setShowCostModal(true);
  };

  const calculateCosts = () => {
    if (!selectedItem) return null;

    // Get the base amounts
    const supplyBaseAmount = selectedItem.supplyOwnAmount;
    const installationBaseAmount = selectedItem.installationOwnAmount;

    // Get the cost details from the item or use default values
    const costDetails = selectedItem.costDetails || {
      supplyDiscount: 0,
      supplyWastagePercentage: 2,
      supplyTransportationPercentage: 3,
      supplyContingencyPercentage: 2,
      supplyMiscellaneousPercentage: 1,
      supplyOutstationPercentage: 0,
      supplyOfficeOverheadPercentage: 3,
      supplyPOVariancePercentage: 1,
      installationWastagePercentage: 2,
      installationTransportationPercentage: 3,
      installationContingencyPercentage: 2,
      installationMiscellaneousPercentage: 1,
      installationOutstationPercentage: 0,
      installationOfficeOverheadPercentage: 3,
      installationPOVariancePercentage: 1,
    };

    // Calculate all the supply costs
    const supplyDiscount = (costDetails.supplyDiscount / 100) * supplyBaseAmount;
    const supplyWastage = (costDetails.supplyWastagePercentage / 100) * supplyBaseAmount;
    const supplyTransportation = (costDetails.supplyTransportationPercentage / 100) * supplyBaseAmount;
    const supplyContingency = (costDetails.supplyContingencyPercentage / 100) * supplyBaseAmount;
    const supplyMiscellaneous = (costDetails.supplyMiscellaneousPercentage / 100) * supplyBaseAmount;
    const supplyOutstation = (costDetails.supplyOutstationPercentage / 100) * supplyBaseAmount;
    const supplyOfficeOverhead = (costDetails.supplyOfficeOverheadPercentage / 100) * supplyBaseAmount;
    const supplyPOVariance = (costDetails.supplyPOVariancePercentage / 100) * supplyBaseAmount;

    // Calculate all the installation costs
    const installationWastage = (costDetails.installationWastagePercentage / 100) * installationBaseAmount;
    const installationTransportation = (costDetails.installationTransportationPercentage / 100) * installationBaseAmount;
    const installationContingency = (costDetails.installationContingencyPercentage / 100) * installationBaseAmount;
    const installationMiscellaneous = (costDetails.installationMiscellaneousPercentage / 100) * installationBaseAmount;
    const installationOutstation = (costDetails.installationOutstationPercentage / 100) * installationBaseAmount;
    const installationOfficeOverhead = (costDetails.installationOfficeOverheadPercentage / 100) * installationBaseAmount;
    const installationPOVariance = (costDetails.installationPOVariancePercentage / 100) * installationBaseAmount;

    // Calculate totals
    const totalSupplyCost = supplyWastage + supplyTransportation + supplyContingency + 
                           supplyMiscellaneous + supplyOutstation + supplyOfficeOverhead + supplyPOVariance;
    
    const totalInstallationCost = installationWastage + installationTransportation + installationContingency + 
                                 installationMiscellaneous + installationOutstation + installationOfficeOverhead + installationPOVariance;

    const finalSupplyAmount = supplyBaseAmount - supplyDiscount + totalSupplyCost;
    const finalInstallationAmount = installationBaseAmount + totalInstallationCost;

    return {
      supplyDiscount,
      supplyWastage,
      supplyTransportation,
      supplyContingency,
      supplyMiscellaneous,
      supplyOutstation,
      supplyOfficeOverhead,
      supplyPOVariance,
      totalSupplyCost,
      finalSupplyAmount,
      installationWastage,
      installationTransportation,
      installationContingency,
      installationMiscellaneous,
      installationOutstation,
      installationOfficeOverhead,
      installationPOVariance,
      totalInstallationCost,
      finalInstallationAmount,
      costDetails
    };
  };

  const costs = selectedItem ? calculateCosts() : null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Final Costing Sheet</h3>
        <p className="text-sm text-gray-600">Customer-facing summary of costs.</p>
      </div>
      
      {/* Itemized List */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Itemized List</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayItems.map((item: any) => {
                // Calculate selling rates based on MF (markup factor)
                const supplyRate = item.supplyRate || item.rate || 0;
                const installationRate = item.installationRate || (item.rate * 0.3) || 0;
                const quantity = item.quantity || 0;
                
                const supplySellingRate = supplyRate * (formData.supplyData.mf || 1);
                const installSellingRate = installationRate * (formData.labourData.mf || 1);
                const supplySellingPrice = supplySellingRate * quantity;
                const installSellingPrice = installSellingRate * quantity;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{supplySellingRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{supplySellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installSellingRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{installSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openCostModal(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Cost Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{(formData.supplyData?.sellingAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td></td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{(formData.labourData?.sellingAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* GST Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">GST Summary</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">High Side Supply</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{highSideSupplyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.highSideSupply}
                  onChange={(e) => handleGSTRateChange('highSideSupply', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{highSideGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{highSideTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Low Side Supply</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{lowSideSupplyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.lowSideSupply}
                  onChange={(e) => handleGSTRateChange('lowSideSupply', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{lowSideGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{lowSideTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installationAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.installation}
                  onChange={(e) => handleGSTRateChange('installation', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installationGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{installationTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Grand Total:</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{totalGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 text-sm font-medium text-green-600">₹{grandTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Cost Details Modal */}
      {showCostModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cost Details: {selectedItem.itemName}</h3>
              <button
                onClick={() => setShowCostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supply Cost Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Supply Cost Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Base Amount:</label>
                      <span className="text-sm font-medium">₹{selectedItem.supplyOwnAmount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Discount (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyDiscount || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyDiscount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Wastage (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyWastagePercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyWastage.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Transportation (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyTransportationPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyTransportation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Contingency (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyContingencyPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyContingency.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Miscellaneous (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyMiscellaneousPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyMiscellaneous.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Outstation (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyOutstationPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyOutstation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Office Overhead (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyOfficeOverheadPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyOfficeOverhead.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply PO-variance (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.supplyPOVariancePercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyPOVariance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Total Supply Cost:</label>
                        <span className="text-sm font-medium">₹{costs?.totalSupplyCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <label className="text-sm font-medium text-gray-700">Final Supply Amount:</label>
                        <span className="text-sm font-medium text-green-600">₹{costs?.finalSupplyAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Installation Cost Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Installation Cost Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Base Amount:</label>
                      <span className="text-sm font-medium">₹{selectedItem.installationOwnAmount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Wastage (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationWastagePercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationWastage.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Transportation (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationTransportationPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationTransportation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Contingency (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationContingencyPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationContingency.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Miscellaneous (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationMiscellaneousPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationMiscellaneous.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Outstation (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationOutstationPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationOutstation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Office Overhead (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationOfficeOverheadPercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationOfficeOverhead.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation PO-variance (%):</label>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {costs?.costDetails.installationPOVariancePercentage || 0}%
                        </span>
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationPOVariance.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">Total Installation Cost:</label>
                        <span className="text-sm font-medium">₹{costs?.totalInstallationCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <label className="text-sm font-medium text-gray-700">Final Installation Amount:</label>
                        <span className="text-sm font-medium text-green-600">₹{costs?.finalInstallationAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCostModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationStep4;
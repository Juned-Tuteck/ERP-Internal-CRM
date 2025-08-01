import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

// Mock data for leads
export const leads = [
  { id: '1', name: 'Mumbai Metro Ventilation System', businessName: 'TechCorp Solutions Pvt Ltd', bomId: 'BOM-2024-001' },
  { id: '2', name: 'Corporate Office HVAC Upgrade', businessName: 'Innovate India Limited', bomId: 'BOM-2024-002' },
  { id: '3', name: 'Hospital Fire Safety System', businessName: 'Digital Solutions Enterprise', bomId: 'BOM-2024-003' },
];

// Mock data for BOMs
export const boms = [
  { 
    id: 'BOM-2024-001', 
    items: [
      { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', itemType: 'INSTALLATION', uomName: 'Nos', rate: 12500, quantity: 4, price: 50000 },
      { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', itemType: 'INSTALLATION', uomName: 'Meter', rate: 850, quantity: 120, price: 102000 },
      { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', itemType: 'INSTALLATION', uomName: 'Nos', rate: 3200, quantity: 6, price: 19200 },
    ]
  },
  { 
    id: 'BOM-2024-002', 
    items: [
      { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', itemType: 'INSTALLATION', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
      { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', itemType: 'INSTALLATION', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
      { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', itemType: 'INSTALLATION', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
    ]
  },
  { 
    id: 'BOM-2024-003', 
    items: [
      { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', itemType: 'INSTALLATION', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
      { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', itemType: 'INSTALLATION', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
      { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', itemType: 'INSTALLATION', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
    ]
  },
];

interface QuotationStep1Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep1: React.FC<QuotationStep1Props> = ({ formData, setFormData }) => {
  const [showCostModal, setShowCostModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [costDetails, setCostDetails] = useState<any>({
    // Supply section
    supplyDiscount: 0,
    supplyWastage: 0,
    supplyTransportation: 0,
    supplyContingency: 0,
    supplyMiscellaneous: 0,
    supplyOutstation: 0,
    supplyOfficeOverhead: 0,
    supplyPOVariance: 0,
    // Installation section
    installationWastage: 0,
    installationTransportation: 0,
    installationContingency: 0,
    installationMiscellaneous: 0,
    installationOutstation: 0,
    installationOfficeOverhead: 0,
    installationPOVariance: 0,
  });

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const selectedLead = leads.find(lead => lead.id === leadId);
    
    if (selectedLead) {
      const bomId = selectedLead.bomId;
      const selectedBom = boms.find(bom => bom.id === bomId);
      
      const updatedItems = selectedBom ? selectedBom.items.map(item => ({
        ...item,
        itemType: 'INSTALLATION',
        basicSupplyRate: item.rate,
        basicInstallationRate: item.rate * 0.3,
        supplyRate: item.rate, // Initially equals basic rate
        installationRate: item.rate * 0.3, // Initially equals basic rate
        supplyOwnAmount: item.quantity * item.rate,
        installationOwnAmount: item.quantity * (item.rate * 0.3),
        finalSupplyAmount: 0, // Variance only
        finalInstallationAmount: 0, // Variance only
        costDetails: {
          supplyDiscount: 0,
          supplyWastage: 0,
          supplyTransportation: 0,
          supplyContingency: 0,
          supplyMiscellaneous: 0,
          supplyOutstation: 0,
          supplyOfficeOverhead: 0,
          supplyPOVariance: 0,
          installationWastage: 0,
          installationTransportation: 0,
          installationContingency: 0,
          installationMiscellaneous: 0,
          installationOutstation: 0,
          installationOfficeOverhead: 0,
          installationPOVariance: 0,
        }
      })) : [];
      
      setFormData({
        ...formData,
        leadId: leadId,
        leadName: selectedLead.name,
        businessName: selectedLead.businessName,
        bomId: bomId,
        items: updatedItems
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    const numValue = parseFloat(value) || 0;
    updatedItems[index][field] = numValue;
    
    // Recalculate based on field changes
    if (field === 'quantity') {
      // Recalculate Supply Own Amount = Quantity × Supply Rate
      updatedItems[index].supplyOwnAmount = updatedItems[index].quantity * (updatedItems[index].supplyRate || 0);
      // Recalculate Installation Own Amount = Quantity × Installation Rate  
      updatedItems[index].installationOwnAmount = updatedItems[index].quantity * (updatedItems[index].installationRate || 0);
    }
    
    if (field === 'basicSupplyRate') {
      // Supply Rate comes from cost calculations, but starts with basic rate
      if (!updatedItems[index].costDetails || Object.values(updatedItems[index].costDetails).every(v => v === 0)) {
        updatedItems[index].supplyRate = numValue;
        updatedItems[index].supplyOwnAmount = updatedItems[index].quantity * numValue;
      }
    }
    
    if (field === 'basicInstallationRate') {
      // Installation Rate comes from cost calculations, but starts with basic rate
      if (!updatedItems[index].costDetails || Object.values(updatedItems[index].costDetails).every(v => v === 0)) {
        updatedItems[index].installationRate = numValue;
        updatedItems[index].installationOwnAmount = updatedItems[index].quantity * numValue;
      }
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const openCostModal = (item: any, index: number) => {
    setSelectedItem({ ...item, index });
    setCostDetails(item.costDetails || {
      supplyDiscount: 0,
      supplyWastage: 0,
      supplyTransportation: 0,
      supplyContingency: 0,
      supplyMiscellaneous: 0,
      supplyOutstation: 0,
      supplyOfficeOverhead: 0,
      supplyPOVariance: 0,
      installationWastage: 0,
      installationTransportation: 0,
      installationContingency: 0,
      installationMiscellaneous: 0,
      installationOutstation: 0,
      installationOfficeOverhead: 0,
      installationPOVariance: 0,
    });
    setShowCostModal(true);
  };

  const handleCostDetailChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCostDetails({
      ...costDetails,
      [field]: numValue
    });
  };

  const calculateFinalAmounts = () => {
    if (!selectedItem) return { 
      finalSupplyAmount: 0, 
      finalInstallationAmount: 0,
      supplyRate: 0,
      installationRate: 0,
      discountedBaseSupplyRate: 0,
      totalSupplyCost: 0,
      totalSupplyOwnCost: 0,
      totalInstallationCost: 0,
      totalInstallationOwnCost: 0
    };

    const basicSupplyRate = selectedItem.basicSupplyRate || 0;
    const basicInstallationRate = selectedItem.basicInstallationRate || 0;

    // A. Supply Cost Breakdown
    const supplyDiscountPercent = costDetails.supplyDiscount || 0;
    const discountedBaseSupplyRate = basicSupplyRate * (1 - supplyDiscountPercent / 100);
    
    const supplyWastageAmount = discountedBaseSupplyRate * (costDetails.supplyWastage / 100);
    const supplyTransportationAmount = discountedBaseSupplyRate * (costDetails.supplyTransportation / 100);
    const supplyContingencyAmount = discountedBaseSupplyRate * (costDetails.supplyContingency / 100);
    const supplyMiscellaneousAmount = discountedBaseSupplyRate * (costDetails.supplyMiscellaneous / 100);
    const supplyOutstationAmount = discountedBaseSupplyRate * (costDetails.supplyOutstation / 100);
    const supplyOfficeOverheadAmount = discountedBaseSupplyRate * (costDetails.supplyOfficeOverhead / 100);
    
    const totalSupplyCost = supplyWastageAmount + supplyTransportationAmount + supplyContingencyAmount + 
                           supplyMiscellaneousAmount + supplyOutstationAmount + supplyOfficeOverheadAmount;
    
    const totalSupplyOwnCost = discountedBaseSupplyRate + totalSupplyCost;
    
    // Supply PO - Variance Amount = (Supply PO - Variance Percentage / 100) × Discounted Base Supply Rate
    const supplyPOVarianceAmount = discountedBaseSupplyRate * (costDetails.supplyPOVariance / 100);
    const finalSupplyAmount = supplyPOVarianceAmount; // Final Supply Amount = Supply PO - Variance Amount

    // B. Installation Cost Breakdown
    const installationWastageAmount = basicInstallationRate * (costDetails.installationWastage / 100);
    const installationTransportationAmount = basicInstallationRate * (costDetails.installationTransportation / 100);
    const installationContingencyAmount = basicInstallationRate * (costDetails.installationContingency / 100);
    const installationMiscellaneousAmount = basicInstallationRate * (costDetails.installationMiscellaneous / 100);
    const installationOutstationAmount = basicInstallationRate * (costDetails.installationOutstation / 100);
    const installationOfficeOverheadAmount = basicInstallationRate * (costDetails.installationOfficeOverhead / 100);
    
    const totalInstallationCost = installationWastageAmount + installationTransportationAmount + installationContingencyAmount + 
                                 installationMiscellaneousAmount + installationOutstationAmount + installationOfficeOverheadAmount;
    
    const totalInstallationOwnCost = basicInstallationRate + totalInstallationCost;
    
    // Installation Povariance Amount = (Installation Povariance Percentage / 100) × Total Installation Cost
    const installationPOVarianceAmount = totalInstallationCost * (costDetails.installationPOVariance / 100);
    const finalInstallationAmount = installationPOVarianceAmount; // Final Installation Amount = Installation Povariance Amount

    return { 
      finalSupplyAmount, 
      finalInstallationAmount,
      supplyRate: totalSupplyOwnCost, // Supply Rate = Total Supply Own Cost
      installationRate: totalInstallationOwnCost, // Installation Rate = Total Installation Own Cost
      discountedBaseSupplyRate,
      totalSupplyCost,
      totalSupplyOwnCost,
      totalInstallationCost,
      totalInstallationOwnCost,
      supplyWastageAmount,
      supplyTransportationAmount,
      supplyContingencyAmount,
      supplyMiscellaneousAmount,
      supplyOutstationAmount,
      supplyOfficeOverheadAmount,
      supplyPOVarianceAmount,
      installationWastageAmount,
      installationTransportationAmount,
      installationContingencyAmount,
      installationMiscellaneousAmount,
      installationOutstationAmount,
      installationOfficeOverheadAmount,
      installationPOVarianceAmount
    };
  };

  const handleSaveCostDetails = () => {
    if (selectedItem) {
      const updatedItems = [...formData.items];
      const calculations = calculateFinalAmounts();
      
      updatedItems[selectedItem.index] = {
        ...updatedItems[selectedItem.index],
        costDetails: { ...costDetails },
        supplyRate: calculations.supplyRate, // Total Supply Own Cost
        installationRate: calculations.installationRate, // Total Installation Own Cost
        supplyOwnAmount: updatedItems[selectedItem.index].quantity * calculations.supplyRate,
        installationOwnAmount: updatedItems[selectedItem.index].quantity * calculations.installationRate,
        finalSupplyAmount: calculations.finalSupplyAmount, // Only variance amount
        finalInstallationAmount: calculations.finalInstallationAmount // Only variance amount
      };
      
      setFormData({ ...formData, items: updatedItems });
      setShowCostModal(false);
    }
  };

  // Calculate totals
  const totalSupplyOwnAmount = formData.items?.reduce((sum: number, item: any) => sum + (item.supplyOwnAmount || 0), 0) || 0;
  const totalInstallationOwnAmount = formData.items?.reduce((sum: number, item: any) => sum + (item.installationOwnAmount || 0), 0) || 0;
  const totalFinalSupplyAmount = formData.items?.reduce((sum: number, item: any) => sum + (item.finalSupplyAmount || 0), 0) || 0;
  const totalFinalInstallationAmount = formData.items?.reduce((sum: number, item: any) => sum + (item.finalInstallationAmount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lead *
          </label>
          <select
            name="leadId"
            value={formData.leadId || ''}
            onChange={handleLeadChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Lead</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BOM
          </label>
          <input
            type="text"
            value={formData.bomId || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quotation Date *
          </label>
          <input
            type="date"
            name="quotationDate"
            value={formData.quotationDate || ''}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate || ''}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Table */}
      {formData.items && formData.items.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Supply Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Installation Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Own Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Own Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.itemType || 'INSTALLATION'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.itemCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity || 0}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.uomName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.basicSupplyRate || 0}
                        onChange={(e) => handleItemChange(index, 'basicSupplyRate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.basicInstallationRate || 0}
                        onChange={(e) => handleItemChange(index, 'basicInstallationRate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(item.supplyRate || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(item.supplyOwnAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(item.installationRate || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(item.installationOwnAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openCostModal(item, index)}
                        className="inline-flex items-center px-2 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-sm font-medium text-right">Totals:</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Supply Own Cost: {totalSupplyOwnAmount.toLocaleString('en-IN')}/-</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{totalSupplyOwnAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Total Installation Own Cost: {totalInstallationOwnAmount.toLocaleString('en-IN')}/-</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{totalInstallationOwnAmount.toLocaleString('en-IN')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Final Amounts Summary */}
      {formData.items && formData.items.length > 0 && (totalFinalSupplyAmount > 0 || totalFinalInstallationAmount > 0) && (
        <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Final Variance Amounts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Final Supply Amount (Variance):</span>
              <span className="text-sm font-medium text-green-600">₹{totalFinalSupplyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Final Installation Amount (Variance):</span>
              <span className="text-sm font-medium text-green-600">₹{totalFinalInstallationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quotation Note
        </label>
        <textarea
          name="note"
          value={formData.note || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter any notes specific to this quotation..."
        />
      </div>

      {/* Cost Details Modal */}
      {showCostModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Cost Details: {selectedItem.itemName}</h3>
              <button
                onClick={() => setShowCostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SUPPLY Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Supply Cost</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Basic Supply Rate:</span>
                      <span className="text-sm font-medium">{(selectedItem.basicSupplyRate || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    {/* Supply Discount */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Discount %</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={costDetails.supplyDiscount || 0}
                          onChange={(e) => handleCostDetailChange('supplyDiscount', e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>

                    {/* Discounted Base Supply Rate */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Discounted Base Supply Rate:</span>
                      <span className="text-sm font-medium">{calculateFinalAmounts().discountedBaseSupplyRate.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Supply fields with percentage and amount */}
                    {[
                      { key: 'supplyWastage', percentageLabel: 'Supply Wastage %', amountLabel: 'Supply Wastage Amount' },
                      { key: 'supplyTransportation', percentageLabel: 'Supply Transportation %', amountLabel: 'Supply Transportation Amount' },
                      { key: 'supplyContingency', percentageLabel: 'Supply Contingency %', amountLabel: 'Supply Contingency Amount' },
                      { key: 'supplyMiscellaneous', percentageLabel: 'Supply Miscellaneous %', amountLabel: 'Supply Miscellaneous Amount' },
                      { key: 'supplyOutstation', percentageLabel: 'Supply Outstation %', amountLabel: 'Supply Outstation Amount' },
                      { key: 'supplyOfficeOverhead', percentageLabel: 'Supply Office Overhead %', amountLabel: 'Supply Office Overhead Amount' },
                    ].map(({ key, percentageLabel, amountLabel }) => {
                      const value = costDetails[key] || 0;
                      const calculations = calculateFinalAmounts();
                      let amount = 0;
                      
                      switch(key) {
                        case 'supplyWastage': amount = calculations.supplyWastageAmount || 0; break;
                        case 'supplyTransportation': amount = calculations.supplyTransportationAmount || 0; break;
                        case 'supplyContingency': amount = calculations.supplyContingencyAmount || 0; break;
                        case 'supplyMiscellaneous': amount = calculations.supplyMiscellaneousAmount || 0; break;
                        case 'supplyOutstation': amount = calculations.supplyOutstationAmount || 0; break;
                        case 'supplyOfficeOverhead': amount = calculations.supplyOfficeOverheadAmount || 0; break;
                      }

                      const isReadOnly = key === 'supplyOfficeOverhead';
                      
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-gray-600">{percentageLabel}</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => handleCostDetailChange(key, e.target.value)}
                                min="0"
                                max="100"
                                step="0.01"
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={`w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                }`}
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <label className="text-sm text-gray-600">{amountLabel}</label>
                            <span className="text-sm text-gray-700">{amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Supply Cost:</span>
                        <span className="text-sm font-medium">{calculateFinalAmounts().totalSupplyCost.toLocaleString('en-IN')} /-</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-900">Total Supply Own Cost:</span>
                        <span className="text-sm font-medium">{calculateFinalAmounts().totalSupplyOwnCost.toLocaleString('en-IN')} /-</span>
                      </div>
                    </div>
                    
                    {/* Supply PO Variance */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-600">Supply PO - Variance %</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={costDetails.supplyPOVariance || 0}
                            onChange={(e) => handleCostDetailChange('supplyPOVariance', e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <label className="text-sm text-gray-600">Supply PO - Variance Amount</label>
                        <span className="text-sm text-gray-700">{(calculateFinalAmounts().supplyPOVarianceAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Supply Amount:</span>
                        <span className="text-sm font-medium text-green-600">{calculateFinalAmounts().finalSupplyAmount.toLocaleString('en-IN')} /-</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INSTALLATION Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Installation Cost</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Basic Installation Rate:</span>
                      <span className="text-sm font-medium">{(selectedItem.basicInstallationRate || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    {/* Installation fields with percentage and amount */}
                    {[
                      { key: 'installationWastage', percentageLabel: 'Installation Wastage %', amountLabel: 'Installation Wastage Amount' },
                      { key: 'installationTransportation', percentageLabel: 'Installation Transportation %', amountLabel: 'Installation Transportation Amount' },
                      { key: 'installationContingency', percentageLabel: 'Installation Contingency %', amountLabel: 'Installation Contingency Amount' },
                      { key: 'installationMiscellaneous', percentageLabel: 'Installation Miscellaneous %', amountLabel: 'Installation Miscellaneous Amount' },
                      { key: 'installationOutstation', percentageLabel: 'Installation Outstation %', amountLabel: 'Installation Outstation Amount' },
                      { key: 'installationOfficeOverhead', percentageLabel: 'Installation Office Overhead %', amountLabel: 'Installation Office Overhead Amount' },
                    ].map(({ key, percentageLabel, amountLabel }) => {
                      const value = costDetails[key] || 0;
                      const calculations = calculateFinalAmounts();
                      let amount = 0;
                      
                      switch(key) {
                        case 'installationWastage': amount = calculations.installationWastageAmount || 0; break;
                        case 'installationTransportation': amount = calculations.installationTransportationAmount || 0; break;
                        case 'installationContingency': amount = calculations.installationContingencyAmount || 0; break;
                        case 'installationMiscellaneous': amount = calculations.installationMiscellaneousAmount || 0; break;
                        case 'installationOutstation': amount = calculations.installationOutstationAmount || 0; break;
                        case 'installationOfficeOverhead': amount = calculations.installationOfficeOverheadAmount || 0; break;
                      }

                      const isReadOnly = key === 'installationOfficeOverhead';
                      
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-gray-600">{percentageLabel}</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => handleCostDetailChange(key, e.target.value)}
                                min="0"
                                max="100"
                                step="0.01"
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                                className={`w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                }`}
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <label className="text-sm text-gray-600">{amountLabel}</label>
                            <span className="text-sm text-gray-700">{amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Installation Cost:</span>
                        <span className="text-sm font-medium">{calculateFinalAmounts().totalInstallationCost.toLocaleString('en-IN')} /-</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-900">Total Installation Own Cost:</span>
                        <span className="text-sm font-medium">{calculateFinalAmounts().totalInstallationOwnCost.toLocaleString('en-IN')} /-</span>
                      </div>
                    </div>
                    
                    {/* Installation PO Variance */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-gray-600">Installation Povariance %</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={costDetails.installationPOVariance || 0}
                            onChange={(e) => handleCostDetailChange('installationPOVariance', e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <label className="text-sm text-gray-600">Installation Povariance Amount</label>
                        <span className="text-sm text-gray-700">{(calculateFinalAmounts().installationPOVarianceAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Installation Amount:</span>
                        <span className="text-sm font-medium text-green-600">{calculateFinalAmounts().finalInstallationAmount.toLocaleString('en-IN')} /-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCostModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCostDetails}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationStep1;
import React, { useState, useEffect } from 'react';
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
      { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', rate: 12500, quantity: 4, price: 50000 },
      { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', rate: 850, quantity: 120, price: 102000 },
      { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', rate: 3200, quantity: 6, price: 19200 },
    ]
  },
  { 
    id: 'BOM-2024-002', 
    items: [
      { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
      { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
      { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
    ]
  },
  { 
    id: 'BOM-2024-003', 
    items: [
      { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
      { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
      { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
    ]
  },
];

interface QuotationStep1Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isEditMode?: boolean;
}

const QuotationStep1: React.FC<QuotationStep1Props> = ({ formData, setFormData, isEditMode = false }) => {
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
        supplyRate: item.rate,
        installationRate: item.rate * 0.3,
        supplyOwnAmount: item.quantity * item.rate,
        installationOwnAmount: item.quantity * (item.rate * 0.3),
        finalSupplyAmount: item.quantity * item.rate,
        finalInstallationAmount: item.quantity * (item.rate * 0.3),
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
    
    // Recalculate own amounts
    if (field === 'quantity' || field === 'supplyRate') {
      updatedItems[index].supplyOwnAmount = updatedItems[index].quantity * updatedItems[index].supplyRate;
      updatedItems[index].finalSupplyAmount = updatedItems[index].supplyOwnAmount;
    }
    if (field === 'quantity' || field === 'installationRate') {
      updatedItems[index].installationOwnAmount = updatedItems[index].quantity * updatedItems[index].installationRate;
      updatedItems[index].finalInstallationAmount = updatedItems[index].installationOwnAmount;
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
    if (!selectedItem) return { finalSupplyAmount: 0, finalInstallationAmount: 0 };

    const supplyBase = selectedItem.supplyOwnAmount;
    const installationBase = selectedItem.installationOwnAmount;

    // Supply calculations
    const supplyDiscount = supplyBase * (costDetails.supplyDiscount / 100);
    const supplyWastage = supplyBase * (costDetails.supplyWastage / 100);
    const supplyTransportation = supplyBase * (costDetails.supplyTransportation / 100);
    const supplyContingency = supplyBase * (costDetails.supplyContingency / 100);
    const supplyMiscellaneous = supplyBase * (costDetails.supplyMiscellaneous / 100);
    const supplyOutstation = supplyBase * (costDetails.supplyOutstation / 100);
    const supplyOfficeOverhead = supplyBase * (costDetails.supplyOfficeOverhead / 100);
    
    const supplyIntermediate = supplyBase - supplyDiscount + supplyWastage + supplyTransportation + 
                              supplyContingency + supplyMiscellaneous + supplyOutstation + supplyOfficeOverhead;
    const supplyPOVariance = supplyIntermediate * (costDetails.supplyPOVariance / 100);
    const finalSupplyAmount = supplyIntermediate + supplyPOVariance;

    // Installation calculations
    const installationWastage = installationBase * (costDetails.installationWastage / 100);
    const installationTransportation = installationBase * (costDetails.installationTransportation / 100);
    const installationContingency = installationBase * (costDetails.installationContingency / 100);
    const installationMiscellaneous = installationBase * (costDetails.installationMiscellaneous / 100);
    const installationOutstation = installationBase * (costDetails.installationOutstation / 100);
    const installationOfficeOverhead = installationBase * (costDetails.installationOfficeOverhead / 100);
    
    const installationIntermediate = installationBase + installationWastage + installationTransportation + 
                                   installationContingency + installationMiscellaneous + installationOutstation + installationOfficeOverhead;
    const installationPOVariance = installationIntermediate * (costDetails.installationPOVariance / 100);
    const finalInstallationAmount = installationIntermediate + installationPOVariance;

    return { finalSupplyAmount, finalInstallationAmount };
  };

  const { finalSupplyAmount, finalInstallationAmount } = calculateFinalAmounts();

  const handleSaveCostDetails = () => {
    if (selectedItem) {
      const updatedItems = [...formData.items];
      const { finalSupplyAmount, finalInstallationAmount } = calculateFinalAmounts();
      
      updatedItems[selectedItem.index] = {
        ...updatedItems[selectedItem.index],
        costDetails: { ...costDetails },
        finalSupplyAmount,
        finalInstallationAmount
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Own Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Own Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Supply Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Installation Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-xs text-gray-500">{item.itemCode} • {item.uomName}</div>
                      </div>
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
                      <input
                        type="number"
                        value={item.supplyRate || 0}
                        onChange={(e) => handleItemChange(index, 'supplyRate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.installationRate || 0}
                        onChange={(e) => handleItemChange(index, 'installationRate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{(item.supplyOwnAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{(item.installationOwnAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">₹{(item.finalSupplyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">₹{(item.finalInstallationAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openCostModal(item, index)}
                        className="inline-flex items-center px-2 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Add Cost Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm font-medium text-right">Totals:</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{totalSupplyOwnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{totalInstallationOwnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">₹{totalFinalSupplyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">₹{totalFinalInstallationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
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
                  <h4 className="text-lg font-medium text-gray-900 mb-4">SUPPLY</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Amount:</span>
                      <span className="text-sm font-medium">₹{selectedItem.supplyOwnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    {[
                      { key: 'supplyDiscount', label: 'Discount %' },
                      { key: 'supplyWastage', label: 'Wastage %' },
                      { key: 'supplyTransportation', label: 'Transportation %' },
                      { key: 'supplyContingency', label: 'Contingency %' },
                      { key: 'supplyMiscellaneous', label: 'Miscellaneous %' },
                      { key: 'supplyOutstation', label: 'Outstation %' },
                      { key: 'supplyOfficeOverhead', label: 'Office Overhead %' },
                      { key: 'supplyPOVariance', label: 'PO Variance %' },
                    ].map(({ key, label }) => {
                      const value = costDetails[key] || 0;
                      const amount = key === 'supplyDiscount' 
                        ? selectedItem.supplyOwnAmount * (value / 100)
                        : key === 'supplyPOVariance'
                        ? (selectedItem.supplyOwnAmount - (selectedItem.supplyOwnAmount * (costDetails.supplyDiscount / 100)) + 
                           (selectedItem.supplyOwnAmount * (costDetails.supplyWastage / 100)) +
                           (selectedItem.supplyOwnAmount * (costDetails.supplyTransportation / 100)) +
                           (selectedItem.supplyOwnAmount * (costDetails.supplyContingency / 100)) +
                           (selectedItem.supplyOwnAmount * (costDetails.supplyMiscellaneous / 100)) +
                           (selectedItem.supplyOwnAmount * (costDetails.supplyOutstation / 100)) +
                           (selectedItem.supplyOwnAmount * (costDetails.supplyOfficeOverhead / 100))) * (value / 100)
                        : selectedItem.supplyOwnAmount * (value / 100);
                      
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">{label}:</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleCostDetailChange(key, e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 w-24 text-right">
                              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Supply Amount:</span>
                        <span className="text-sm font-medium text-green-600">₹{finalSupplyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INSTALLATION Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">INSTALLATION</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Amount:</span>
                      <span className="text-sm font-medium">₹{selectedItem.installationOwnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    {[
                      { key: 'installationWastage', label: 'Wastage %' },
                      { key: 'installationTransportation', label: 'Transportation %' },
                      { key: 'installationContingency', label: 'Contingency %' },
                      { key: 'installationMiscellaneous', label: 'Miscellaneous %' },
                      { key: 'installationOutstation', label: 'Outstation %' },
                      { key: 'installationOfficeOverhead', label: 'Office Overhead %' },
                      { key: 'installationPOVariance', label: 'PO Variance %' },
                    ].map(({ key, label }) => {
                      const value = costDetails[key] || 0;
                      const amount = key === 'installationPOVariance'
                        ? (selectedItem.installationOwnAmount + 
                           (selectedItem.installationOwnAmount * (costDetails.installationWastage / 100)) +
                           (selectedItem.installationOwnAmount * (costDetails.installationTransportation / 100)) +
                           (selectedItem.installationOwnAmount * (costDetails.installationContingency / 100)) +
                           (selectedItem.installationOwnAmount * (costDetails.installationMiscellaneous / 100)) +
                           (selectedItem.installationOwnAmount * (costDetails.installationOutstation / 100)) +
                           (selectedItem.installationOwnAmount * (costDetails.installationOfficeOverhead / 100))) * (value / 100)
                        : selectedItem.installationOwnAmount * (value / 100);
                      
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">{label}:</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleCostDetailChange(key, e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 w-24 text-right">
                              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Installation Amount:</span>
                        <span className="text-sm font-medium text-green-600">₹{finalInstallationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
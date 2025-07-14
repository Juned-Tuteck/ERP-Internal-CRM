import React, { useState, useEffect } from 'react';
import { Calculator, Search, X } from 'lucide-react';

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
  const [itemCosts, setItemCosts] = useState<any>({
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
  });

  // Effect to auto-select lead when in edit mode
  useEffect(() => {
    if (isEditMode && formData.leadName && !formData.leadId) {
      const lead = leads.find(l => l.name === formData.leadName);
      if (lead) {
        setFormData(prev => ({
          ...prev,
          leadId: lead.id,
          bomId: lead.bomId
        }));
      }
    }
    
    // If we have a bomId but no items, load the items from the BOM
    if (formData.bomId && (!formData.items || formData.items.length === 0)) {
      const selectedBom = boms.find(bom => bom.id === formData.bomId);
      if (selectedBom) {
        const updatedItems = selectedBom.items.map(item => ({
          ...item,
          supplyRate: item.rate,
          installationRate: item.rate * 0.3, // Example: installation rate is 30% of supply rate
          supplyOwnAmount: item.price,
          installationOwnAmount: item.price * 0.3,
          // Add cost details with default values
          costDetails: {
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
          }
        }));
        
        setFormData(prev => ({
          ...prev,
          items: updatedItems
        }));
      }
    }
  }, [isEditMode, formData.leadName, formData.bomId]);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const selectedLead = leads.find(lead => lead.id === leadId);
    
    if (selectedLead) {
      // Auto-select the BOM associated with this lead
      const bomId = selectedLead.bomId;
      const selectedBom = boms.find(bom => bom.id === bomId);
      
      // If we're in edit mode, preserve existing items but update lead info
      const updatedItems = isEditMode ? formData.items : (selectedBom ? selectedBom.items.map(item => ({
        ...item,
        supplyRate: item.rate,
        installationRate: item.rate * 0.3, // Example: installation rate is 30% of supply rate
        supplyOwnAmount: item.price,
        installationOwnAmount: item.price * 0.3,
        // Add cost details with default values
        costDetails: {
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
        }
      })) : []);
      
      // Update form data with lead and BOM details
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

  const handleItemCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemCosts({
      ...itemCosts,
      [name]: parseFloat(value) || 0
    });
  };

  const calculateCosts = () => {
    if (!selectedItem) return;

    // Get the base amounts with fallbacks
    const supplyBaseAmount = selectedItem.supplyOwnAmount || selectedItem.price || 0;
    const installationBaseAmount = selectedItem.installationOwnAmount || (selectedItem.price * 0.3) || 0;

    // Calculate all the supply costs
    const supplyDiscount = (itemCosts.supplyDiscount / 100) * supplyBaseAmount;
    const supplyWastage = (itemCosts.supplyWastagePercentage / 100) * supplyBaseAmount;
    const supplyTransportation = (itemCosts.supplyTransportationPercentage / 100) * supplyBaseAmount;
    const supplyContingency = (itemCosts.supplyContingencyPercentage / 100) * supplyBaseAmount;
    const supplyMiscellaneous = (itemCosts.supplyMiscellaneousPercentage / 100) * supplyBaseAmount;
    const supplyOutstation = (itemCosts.supplyOutstationPercentage / 100) * supplyBaseAmount;
    const supplyOfficeOverhead = (itemCosts.supplyOfficeOverheadPercentage / 100) * supplyBaseAmount;
    const supplyPOVariance = (itemCosts.supplyPOVariancePercentage / 100) * supplyBaseAmount;

    // Calculate all the installation costs
    const installationWastage = (itemCosts.installationWastagePercentage / 100) * installationBaseAmount;
    const installationTransportation = (itemCosts.installationTransportationPercentage / 100) * installationBaseAmount;
    const installationContingency = (itemCosts.installationContingencyPercentage / 100) * installationBaseAmount;
    const installationMiscellaneous = (itemCosts.installationMiscellaneousPercentage / 100) * installationBaseAmount;
    const installationOutstation = (itemCosts.installationOutstationPercentage / 100) * installationBaseAmount;
    const installationOfficeOverhead = (itemCosts.installationOfficeOverheadPercentage / 100) * installationBaseAmount;
    const installationPOVariance = (itemCosts.installationPOVariancePercentage / 100) * installationBaseAmount;

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
      finalInstallationAmount
    };
  };

  const costs = selectedItem ? calculateCosts() : null;

  const handleSaveCosts = () => {
    if (!selectedItem) return;

    // Update the item with the new cost details
    const updatedItems = formData.items.map((item: any) => 
      item.id === selectedItem.id ? {
        ...item,
        costDetails: { ...itemCosts }
      } : item
    );

    setFormData({
      ...formData,
      items: updatedItems
    });

    setShowCostModal(false);
  };

  const openCostModal = (item: any) => {
    setSelectedItem(item);
    // Load the item's existing cost details or use defaults
    setItemCosts(item.costDetails || {
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
    });
    setShowCostModal(true);
  };

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
            value={formData.leadId}
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

      {/* Item Table */}
      {formData.items && formData.items.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">BOM Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Supply Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Supply Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Install Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Install Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Amount</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{(item.supplyRate || item.rate).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(item.supplyOwnAmount || item.price).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{((item.rate || 0) * 0.3).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{((item.rate || 0) * 0.3).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{(item.installationRate || (item.rate * 0.3)).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(item.installationOwnAmount || (item.price * 0.3)).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openCostModal(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Cost Details"
                      >
                        <Calculator className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={9} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    ₹{formData.items.reduce((sum: number, item: any) => sum + (item.supplyOwnAmount || item.price || 0), 0).toLocaleString('en-IN')}
                  </td>
                  <td></td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    ₹{formData.items.reduce((sum: number, item: any) => sum + (item.installationOwnAmount || (item.price * 0.3) || 0), 0).toLocaleString('en-IN')}
                  </td>
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
                      <span className="text-sm font-medium">₹{(selectedItem.supplyOwnAmount || selectedItem.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Discount (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyDiscount"
                          value={itemCosts.supplyDiscount}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyDiscount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Wastage (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyWastagePercentage"
                          value={itemCosts.supplyWastagePercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyWastage.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Transportation (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyTransportationPercentage"
                          value={itemCosts.supplyTransportationPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyTransportation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Contingency (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyContingencyPercentage"
                          value={itemCosts.supplyContingencyPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyContingency.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Miscellaneous (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyMiscellaneousPercentage"
                          value={itemCosts.supplyMiscellaneousPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyMiscellaneous.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Outstation (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyOutstationPercentage"
                          value={itemCosts.supplyOutstationPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyOutstation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply Office Overhead (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyOfficeOverheadPercentage"
                          value={itemCosts.supplyOfficeOverheadPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.supplyOfficeOverhead.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Supply PO-variance (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="supplyPOVariancePercentage"
                          value={itemCosts.supplyPOVariancePercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
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
                      <span className="text-sm font-medium">₹{(selectedItem.installationOwnAmount || (selectedItem.price * 0.3) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Wastage (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationWastagePercentage"
                          value={itemCosts.installationWastagePercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationWastage.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Transportation (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationTransportationPercentage"
                          value={itemCosts.installationTransportationPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationTransportation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Contingency (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationContingencyPercentage"
                          value={itemCosts.installationContingencyPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationContingency.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Miscellaneous (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationMiscellaneousPercentage"
                          value={itemCosts.installationMiscellaneousPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationMiscellaneous.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Outstation (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationOutstationPercentage"
                          value={itemCosts.installationOutstationPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationOutstation.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation Office Overhead (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationOfficeOverheadPercentage"
                          value={itemCosts.installationOfficeOverheadPercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
                        <span className="ml-2 text-sm">
                          ₹{costs?.installationOfficeOverhead.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">Installation PO-variance (%):</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="installationPOVariancePercentage"
                          value={itemCosts.installationPOVariancePercentage}
                          onChange={handleItemCostChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                        />
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
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCosts}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Cost Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationStep1;
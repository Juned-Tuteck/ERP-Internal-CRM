import React, { useState, useEffect } from 'react';
import { Calculator, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getLeads, getBOMByLeadId, getBOMDetailsById } from '../../../../utils/quotationApi';

interface QuotationStep1Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isEditMode?: boolean;
}

const QuotationStep1: React.FC<QuotationStep1Props> = ({ formData, setFormData, isEditMode }) => {
  const [showCostModal, setShowCostModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch leads on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getLeads();
        const apiLeads = response.data || [];
        
        // Map API response to UI format
        const mappedLeads = apiLeads.map((lead: any) => ({
          id: lead.lead_id,
          name: lead.project_name,
          businessName: lead.business_name,
          workType: lead.work_type
        }));
        
        setLeads(mappedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Fetch BOM details with specs when lead is selected
  const fetchBOMDetails = async (leadId: string) => {
    try {
      console.log('Fetching BOM for lead ID:', leadId);
      
      // Step 1: Get BOM by lead ID
      const bomResponse = await getBOMByLeadId(leadId);
      const bomArray = bomResponse.data || [];
      
      if (bomArray.length === 0) {
        console.log('No BOM found for lead ID:', leadId);
        return { bomId: null, specs: [] };
      }
      
      // Take the first BOM from the array
      const bomRecord = bomArray[0];
      const bomId = bomRecord.id;
      
      console.log('Found BOM ID:', bomId);
      
      // Step 2: Get detailed BOM data
      const bomDetailsResponse = await getBOMDetailsById(bomId);
      const bomData = bomDetailsResponse.data;
      
      console.log('Fetched BOM details:', bomData);
      
      if (!bomData || !bomData.specs) {
        console.log('No specs found in BOM data');
        return { bomId, specs: [] };
      }
      
      // Step 3: Map API response to specs structure
      const mappedSpecs = bomData.specs.map((spec: any) => ({
        id: spec.spec_id,
        name: spec.spec_description,
        isExpanded: true,
        price: spec.spec_price || 0,
        items: (spec.details || []).map((detail: any) => ({
          id: detail.detail_id,
          itemId: detail.item_id,
          itemCode: detail.item_code || '',
          itemName: detail.item_name || '',
          materialType: detail.material_type || 'INSTALLATION',
          uomName: '-',
          uomId: detail.uom_id || null,
          hsnCode: detail.hsn_code || '',
          description: detail.description || '',
          dimensions: detail.dimensions || '',
          unitPrice: detail.unit_price || 0,
          uomValue: detail.uom_value || 1,
          isCapitalItem: detail.is_capital_item || false,
          isScrapItem: detail.is_scrap_item || false,
          basicSupplyRate: detail.supply_rate || 0,
          basicInstallationRate: detail.installation_rate || 0,
          supplyRate: detail.supply_rate || 0,
          installationRate: detail.installation_rate || 0,
          netRate: detail.net_rate || 0,
          quantity: detail.required_quantity || 1,
          supplyOwnAmount: (detail.required_quantity || 1) * (detail.supply_rate || 0),
          installationOwnAmount: (detail.required_quantity || 1) * (detail.installation_rate || 0),
          finalSupplyAmount: 0,
          finalInstallationAmount: 0,
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
        }))
      }));
      
      console.log('Mapped specs:', mappedSpecs);
      return { bomId, specs: mappedSpecs };
    } catch (error) {
      console.error('Error fetching BOM details:', error);
      return { bomId: null, specs: [] };
    }
  };

  const handleLeadChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leadId = e.target.value;
    const selectedLead = leads.find(lead => lead.id === leadId);
    
    if (selectedLead) {
      setLoading(true);
      
      // Fetch BOM specs and items
      const { bomId, specs } = await fetchBOMDetails(leadId);
      
      setFormData({
        ...formData,
        leadId: leadId,
        leadName: selectedLead.name,
        businessName: selectedLead.businessName,
        workType: selectedLead.workType,
        bomId: bomId,
        specs: specs,
        items: [] // Keep for backward compatibility
      });
      
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleSpecExpansion = (specId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: prev.specs?.map((spec: any) => 
        spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
      ) || []
    }));
  };

  const handleSpecItemChange = (specId: string, itemId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setFormData((prev: any) => ({
      ...prev,
      specs: prev.specs?.map((spec: any) => 
        spec.id === specId ? {
          ...spec,
          items: spec.items.map((item: any) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: numValue };
              
              // Recalculate based on field changes
              if (field === 'quantity') {
                updatedItem.supplyOwnAmount = updatedItem.quantity * (updatedItem.supplyRate || 0);
                updatedItem.installationOwnAmount = updatedItem.quantity * (updatedItem.installationRate || 0);
              }
              
              if (field === 'basicSupplyRate') {
                if (!updatedItem.costDetails || Object.values(updatedItem.costDetails).every(v => v === 0)) {
                  updatedItem.supplyRate = numValue;
                  updatedItem.supplyOwnAmount = updatedItem.quantity * numValue;
                }
              }
              
              if (field === 'basicInstallationRate') {
                if (!updatedItem.costDetails || Object.values(updatedItem.costDetails).every(v => v === 0)) {
                  updatedItem.installationRate = numValue;
                  updatedItem.installationOwnAmount = updatedItem.quantity * numValue;
                }
              }
              
              return updatedItem;
            }
            return item;
          })
        } : spec
      ) || []
    }));
  };

  const openCostModal = (specId: string, item: any, itemIndex: number) => {
    setSelectedItem({ ...item, specId, itemIndex });
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
    
    const supplyPOVarianceAmount = discountedBaseSupplyRate * (costDetails.supplyPOVariance / 100);
    const finalSupplyAmount = supplyPOVarianceAmount;

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
    
    const installationPOVarianceAmount = totalInstallationCost * (costDetails.installationPOVariance / 100);
    const finalInstallationAmount = installationPOVarianceAmount;

    return { 
      finalSupplyAmount, 
      finalInstallationAmount,
      supplyRate: totalSupplyOwnCost,
      installationRate: totalInstallationOwnCost,
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
      const calculations = calculateFinalAmounts();
      
      setFormData((prev: any) => ({
        ...prev,
        specs: prev.specs?.map((spec: any) => 
          spec.id === selectedItem.specId ? {
            ...spec,
            items: spec.items.map((item: any, index: number) => 
              index === selectedItem.itemIndex ? {
                ...item,
                costDetails: { ...costDetails },
                supplyRate: calculations.supplyRate,
                installationRate: calculations.installationRate,
                supplyOwnAmount: item.quantity * calculations.supplyRate,
                installationOwnAmount: item.quantity * calculations.installationRate,
                finalSupplyAmount: calculations.finalSupplyAmount,
                finalInstallationAmount: calculations.finalInstallationAmount
              } : item
            )
          } : spec
        ) || []
      }));
      
      setShowCostModal(false);
    }
  };

  // Calculate totals across all specs
  const calculateTotals = () => {
    if (!formData.specs) return {
      totalSupplyOwnAmount: 0,
      totalInstallationOwnAmount: 0,
      totalFinalSupplyAmount: 0,
      totalFinalInstallationAmount: 0
    };

    let totalSupplyOwnAmount = 0;
    let totalInstallationOwnAmount = 0;
    let totalFinalSupplyAmount = 0;
    let totalFinalInstallationAmount = 0;

    formData.specs.forEach((spec: any) => {
      spec.items.forEach((item: any) => {
        totalSupplyOwnAmount += item.supplyOwnAmount || 0;
        totalInstallationOwnAmount += item.installationOwnAmount || 0;
        totalFinalSupplyAmount += item.finalSupplyAmount || 0;
        totalFinalInstallationAmount += item.finalInstallationAmount || 0;
      });
    });

    return {
      totalSupplyOwnAmount,
      totalInstallationOwnAmount,
      totalFinalSupplyAmount,
      totalFinalInstallationAmount
    };
  };

  const totals = calculateTotals();

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
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Lead</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name}</option>
            ))}
          </select>
          {loading && (
            <p className="text-xs text-blue-500 mt-1">Loading leads...</p>
          )}
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
            Work Type
          </label>
          <input
            type="text"
            value={formData.workType || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BOM ID
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

      {/* Specifications and Items */}
      {formData.specs && formData.specs.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700">Quotation Specifications</h4>
          
          {formData.specs.map((spec: any) => (
            <div key={spec.id} className="border border-gray-200 rounded-lg">
              {/* Spec Header */}
              <div 
                className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSpecExpansion(spec.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {spec.isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <h4 className="text-md font-medium text-gray-900">{spec.name}</h4>
                      <p className="text-sm text-gray-500">
                        {spec.items.length} item(s) • 
                        Supply: ₹{spec.items.reduce((sum: number, item: any) => sum + (item.supplyOwnAmount || 0), 0).toLocaleString('en-IN')} • 
                        Installation: ₹{spec.items.reduce((sum: number, item: any) => sum + (item.installationOwnAmount || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spec Content */}
              {spec.isExpanded && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Supply Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Install Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Own Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Own Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {spec.items.map((item: any, itemIndex: number) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500">{item.description}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{item.itemCode}</div>
                              {item.hsnCode && (
                                <div className="text-xs text-gray-500">HSN: {item.hsnCode}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.materialType === 'HIGH SIDE SUPPLY' ? 'bg-blue-100 text-blue-800' :
                                item.materialType === 'LOW SIDE SUPPLY' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {item.materialType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.quantity || 0}
                                onChange={(e) => handleSpecItemChange(spec.id, item.id, 'quantity', e.target.value)}
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
                                onChange={(e) => handleSpecItemChange(spec.id, item.id, 'basicSupplyRate', e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.basicInstallationRate || 0}
                                onChange={(e) => handleSpecItemChange(spec.id, item.id, 'basicInstallationRate', e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.supplyRate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.supplyOwnAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.installationRate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.installationOwnAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openCostModal(spec.id, item, itemIndex)}
                                className="inline-flex items-center px-2 py-1 border border-blue-300 rounded text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
                              >
                                <Calculator className="h-3 w-3 mr-1" />
                                Cost
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-sm font-medium text-right">Spec Totals:</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Supply: ₹{spec.items.reduce((sum: number, item: any) => sum + (item.supplyOwnAmount || 0), 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ₹{spec.items.reduce((sum: number, item: any) => sum + (item.supplyOwnAmount || 0), 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Install: ₹{spec.items.reduce((sum: number, item: any) => sum + (item.installationOwnAmount || 0), 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ₹{spec.items.reduce((sum: number, item: any) => sum + (item.installationOwnAmount || 0), 0).toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Grand Totals */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Grand Totals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Supply Own Cost:</span>
                <span className="text-sm font-medium text-green-600">₹{totals.totalSupplyOwnAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Installation Own Cost:</span>
                <span className="text-sm font-medium text-green-600">₹{totals.totalInstallationOwnAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Final Amounts Summary */}
          {(totals.totalFinalSupplyAmount > 0 || totals.totalFinalInstallationAmount > 0) && (
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Final Variance Amounts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Final Supply Amount (Variance):</span>
                  <span className="text-sm font-medium text-green-600">₹{totals.totalFinalSupplyAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Final Installation Amount (Variance):</span>
                  <span className="text-sm font-medium text-green-600">₹{totals.totalFinalInstallationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {formData.leadId && (!formData.specs || formData.specs.length === 0) && !loading && (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <p className="text-sm">No BOM found for the selected lead or BOM has no specifications.</p>
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
                      <span className="text-sm font-medium">₹{(selectedItem.basicSupplyRate || 0).toLocaleString('en-IN')}</span>
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
                      <span className="text-sm font-medium">₹{calculateFinalAmounts().discountedBaseSupplyRate.toLocaleString('en-IN')}</span>
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
                            <span className="text-sm text-gray-700">₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Supply Cost:</span>
                        <span className="text-sm font-medium">₹{calculateFinalAmounts().totalSupplyCost.toLocaleString('en-IN')} /-</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-900">Total Supply Own Cost:</span>
                        <span className="text-sm font-medium">₹{calculateFinalAmounts().totalSupplyOwnCost.toLocaleString('en-IN')} /-</span>
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
                        <span className="text-sm text-gray-700">₹{(calculateFinalAmounts().supplyPOVarianceAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Supply Amount:</span>
                        <span className="text-sm font-medium text-green-600">₹{calculateFinalAmounts().finalSupplyAmount.toLocaleString('en-IN')} /-</span>
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
                      <span className="text-sm font-medium">₹{(selectedItem.basicInstallationRate || 0).toLocaleString('en-IN')}</span>
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
                            <span className="text-sm text-gray-700">₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Total Installation Cost:</span>
                        <span className="text-sm font-medium">₹{calculateFinalAmounts().totalInstallationCost.toLocaleString('en-IN')} /-</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-gray-900">Total Installation Own Cost:</span>
                        <span className="text-sm font-medium">₹{calculateFinalAmounts().totalInstallationOwnCost.toLocaleString('en-IN')} /-</span>
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
                        <span className="text-sm text-gray-700">₹{(calculateFinalAmounts().installationPOVarianceAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Final Installation Amount:</span>
                        <span className="text-sm font-medium text-green-600">₹{calculateFinalAmounts().finalInstallationAmount.toLocaleString('en-IN')} /-</span>
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
import React, { useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Calculator } from 'lucide-react';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Costing Sheet
    leadId: '',
    leadName: '',
    businessName: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    bomId: '',
    items: [] as any[],
    supplyDiscount: 0,
    supplyWastagePercentage: 0,
    supplyTransportationPercentage: 0,
    supplyContingencyPercentage: 0,
    supplyMiscellaneousPercentage: 0,
    supplyOutstationPercentage: 0,
    supplyOfficeOverheadPercentage: 0,
    supplyPOVariancePercentage: 0,
    installationWastagePercentage: 0,
    installationTransportationPercentage: 0,
    installationContingencyPercentage: 0,
    installationMiscellaneousPercentage: 0,
    installationOutstationPercentage: 0,
    installationOfficeOverheadPercentage: 0,
    installationPOVariancePercentage: 0,
    note: '',
    
    // Step 2: POC
    supervisionCosts: [] as any[],
    financeCosts: [] as any[],
    contingencyCosts: [] as any[],
    
    // Step 3: Summary
    supplyMarginPercentage: 0,
    installationMarginPercentage: 0,
    sitcMarginPercentage: 0,
    
    // Step 4: Final Costing
    highSideSupplyGST: 18,
    lowSideSupplyGST: 18,
    installationGST: 18,
    
    // Step 5: Comments
    comments: [] as any[]
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showAddDescriptionModal, setShowAddDescriptionModal] = useState(false);
  const [costCategory, setCostCategory] = useState('');
  const [newComment, setNewComment] = useState('');

  // Mock data for dropdowns
  const leads = [
    { id: '1', name: 'Mumbai Metro Ventilation System', businessName: 'TechCorp Solutions Pvt Ltd' },
    { id: '2', name: 'Corporate Office HVAC Upgrade', businessName: 'Innovate India Limited' },
    { id: '3', name: 'Hospital Fire Safety System', businessName: 'Digital Solutions Enterprise' },
    { id: '4', name: 'Residential Complex Electrical', businessName: 'Manufacturing Industries Co' },
    { id: '5', name: 'Shopping Mall Plumbing System', businessName: 'FinTech Innovations Pvt Ltd' },
  ];
  
  const boms = [
    { id: '1', name: 'Mumbai Metro Ventilation System BOM', leadId: '1' },
    { id: '2', name: 'Corporate Office HVAC Upgrade BOM', leadId: '2' },
    { id: '3', name: 'Hospital Fire Safety System BOM', leadId: '3' },
    { id: '4', name: 'Residential Complex Electrical BOM', leadId: '4' },
    { id: '5', name: 'Shopping Mall Plumbing System BOM', leadId: '5' },
  ];

  const bomItems = [
    { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', itemType: 'High Side', uomName: 'Nos', basicSupplyRate: 10000, basicInstallationRate: 2000, quantity: 4 },
    { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', itemType: 'Low Side', uomName: 'Meter', basicSupplyRate: 700, basicInstallationRate: 300, quantity: 120 },
    { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', itemType: 'High Side', uomName: 'Nos', basicSupplyRate: 2500, basicInstallationRate: 700, quantity: 6 },
    { id: '104', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', itemType: 'High Side', uomName: 'Nos', basicSupplyRate: 1500, basicInstallationRate: 300, quantity: 8 },
  ];

  const descriptionOptions = {
    supervision: ['Project Manager', 'Site Engineer', 'Safety Officer', 'Quality Control Engineer'],
    finance: ['Bank Guarantee', 'Insurance', 'Performance Bond'],
    contingency: ['Project Contingency', 'Design Contingency', 'Execution Contingency']
  };

  const steps = [
    { id: 1, name: 'Costing Sheet' },
    { id: 2, name: 'POC' },
    { id: 3, name: 'Summary' },
    { id: 4, name: 'Final Costing' },
    { id: 5, name: 'Comments' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If lead is selected, update lead name and business name
    if (name === 'leadId') {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          leadName: selectedLead.name,
          businessName: selectedLead.businessName
        }));
      }
    }

    // If BOM is selected, load BOM items
    if (name === 'bomId') {
      setFormData(prev => ({
        ...prev,
        items: bomItems.map(item => ({
          ...item,
          supplyRate: item.basicSupplyRate,
          installationRate: item.basicInstallationRate,
          supplyAmount: item.basicSupplyRate * item.quantity,
          installationAmount: item.basicInstallationRate * item.quantity
        }))
      }));
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleAddCostDetail = (itemId: string) => {
    setSelectedItem(formData.items.find(item => item.id === itemId));
    setShowCostModal(true);
  };

  const handleSaveCostDetail = () => {
    // In a real app, this would update the selected item with additional costs
    setShowCostModal(false);
    setSelectedItem(null);
  };

  const handleAddDescription = (category: string) => {
    setCostCategory(category);
    setShowAddDescriptionModal(true);
  };

  const handleSaveDescription = () => {
    // In a real app, this would add a new cost line item to the selected category
    setShowAddDescriptionModal(false);
    setCostCategory('');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setFormData(prev => ({
        ...prev,
        comments: [
          ...prev.comments,
          {
            id: Date.now(),
            text: newComment,
            author: 'Current User',
            timestamp: new Date().toISOString()
          }
        ]
      }));
      setNewComment('');
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate totals
    const totalSupplyAmount = formData.items.reduce((sum, item) => sum + item.supplyAmount, 0);
    const totalInstallationAmount = formData.items.reduce((sum, item) => sum + item.installationAmount, 0);
    
    const quotationData = {
      ...formData,
      totalSupplyAmount,
      totalInstallationAmount,
      totalAmount: totalSupplyAmount + totalInstallationAmount,
      status: 'pending_approval',
      createdDate: new Date().toISOString()
    };
    
    onSubmit(quotationData);
    
    // Reset form
    setCurrentStep(1);
    setFormData({
      leadId: '',
      leadName: '',
      businessName: '',
      quotationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      bomId: '',
      items: [],
      supplyDiscount: 0,
      supplyWastagePercentage: 0,
      supplyTransportationPercentage: 0,
      supplyContingencyPercentage: 0,
      supplyMiscellaneousPercentage: 0,
      supplyOutstationPercentage: 0,
      supplyOfficeOverheadPercentage: 0,
      supplyPOVariancePercentage: 0,
      installationWastagePercentage: 0,
      installationTransportationPercentage: 0,
      installationContingencyPercentage: 0,
      installationMiscellaneousPercentage: 0,
      installationOutstationPercentage: 0,
      installationOfficeOverheadPercentage: 0,
      installationPOVariancePercentage: 0,
      note: '',
      supervisionCosts: [],
      financeCosts: [],
      contingencyCosts: [],
      supplyMarginPercentage: 0,
      installationMarginPercentage: 0,
      sitcMarginPercentage: 0,
      highSideSupplyGST: 18,
      lowSideSupplyGST: 18,
      installationGST: 18,
      comments: []
    });
  };

  if (!isOpen) return null;

  // Calculate totals for display
  const totalSupplyBasic = formData.items.reduce((sum, item) => sum + (item.basicSupplyRate * item.quantity), 0);
  const totalInstallationBasic = formData.items.reduce((sum, item) => sum + (item.basicInstallationRate * item.quantity), 0);
  
  const supplyAdditionalCosts = 
    (totalSupplyBasic * formData.supplyWastagePercentage / 100) +
    (totalSupplyBasic * formData.supplyTransportationPercentage / 100) +
    (totalSupplyBasic * formData.supplyContingencyPercentage / 100) +
    (totalSupplyBasic * formData.supplyMiscellaneousPercentage / 100) +
    (totalSupplyBasic * formData.supplyOutstationPercentage / 100) +
    (totalSupplyBasic * formData.supplyOfficeOverheadPercentage / 100) +
    (totalSupplyBasic * formData.supplyPOVariancePercentage / 100);
  
  const installationAdditionalCosts = 
    (totalInstallationBasic * formData.installationWastagePercentage / 100) +
    (totalInstallationBasic * formData.installationTransportationPercentage / 100) +
    (totalInstallationBasic * formData.installationContingencyPercentage / 100) +
    (totalInstallationBasic * formData.installationMiscellaneousPercentage / 100) +
    (totalInstallationBasic * formData.installationOutstationPercentage / 100) +
    (totalInstallationBasic * formData.installationOfficeOverheadPercentage / 100) +
    (totalInstallationBasic * formData.installationPOVariancePercentage / 100);
  
  const totalSupplyCost = totalSupplyBasic + supplyAdditionalCosts;
  const totalInstallationCost = totalInstallationBasic + installationAdditionalCosts;
  
  const totalSupplySellingPrice = totalSupplyCost * (1 + formData.supplyMarginPercentage / 100);
  const totalInstallationSellingPrice = totalInstallationCost * (1 + formData.installationMarginPercentage / 100);
  
  const totalSellingPrice = totalSupplySellingPrice + totalInstallationSellingPrice;
  
  const highSideSupplyGSTAmount = totalSupplySellingPrice * 0.4 * formData.highSideSupplyGST / 100; // Assuming 40% is high side
  const lowSideSupplyGSTAmount = totalSupplySellingPrice * 0.6 * formData.lowSideSupplyGST / 100; // Assuming 60% is low side
  const installationGSTAmount = totalInstallationSellingPrice * formData.installationGST / 100;
  
  const grandTotal = totalSellingPrice + highSideSupplyGSTAmount + lowSideSupplyGSTAmount + installationGSTAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Quotation</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id ? 'bg-blue-100 text-blue-600' :
                  currentStep > step.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.id}
                </div>
                <span className={`text-xs mt-1 ${
                  currentStep === step.id ? 'text-blue-600' :
                  currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mt-4 hidden md:block ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Costing Sheet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead *
                  </label>
                  <select
                    name="leadId"
                    value={formData.leadId}
                    onChange={handleInputChange}
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
                    Quotation Date *
                  </label>
                  <input
                    type="date"
                    name="quotationDate"
                    value={formData.quotationDate}
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
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {formData.leadId && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Name:</span> {formData.leadName}
                    </div>
                    <div>
                      <span className="text-gray-500">Business Name:</span> {formData.businessName}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BOM *
                </label>
                <select
                  name="bomId"
                  value={formData.bomId}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.leadId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select BOM</option>
                  {boms
                    .filter(bom => !formData.leadId || bom.leadId === formData.leadId)
                    .map(bom => (
                      <option key={bom.id} value={bom.id}>{bom.name}</option>
                    ))
                  }
                </select>
              </div>

              {formData.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Item Table</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.itemType}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.basicSupplyRate.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(item.basicSupplyRate * item.quantity).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.basicInstallationRate.toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(item.basicInstallationRate * item.quantity).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleAddCostDetail(item.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={6} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{totalSupplyBasic.toLocaleString('en-IN')}</td>
                          <td></td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{totalInstallationBasic.toLocaleString('en-IN')}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Supply Cost</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Supply Discount:</label>
                      <div className="col-span-1">
                        <input
                          type="number"
                          name="supplyDiscount"
                          value={formData.supplyDiscount}
                          onChange={handlePercentageChange}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalSupplyBasic * formData.supplyDiscount / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Supply Wastage:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="supplyWastagePercentage"
                            value={formData.supplyWastagePercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalSupplyBasic * formData.supplyWastagePercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Supply Transportation:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="supplyTransportationPercentage"
                            value={formData.supplyTransportationPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalSupplyBasic * formData.supplyTransportationPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Supply Contingency:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="supplyContingencyPercentage"
                            value={formData.supplyContingencyPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalSupplyBasic * formData.supplyContingencyPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Supply Office Overhead:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="supplyOfficeOverheadPercentage"
                            value={formData.supplyOfficeOverheadPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalSupplyBasic * formData.supplyOfficeOverheadPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <label className="text-sm font-medium text-gray-700">Total Supply Cost:</label>
                        <div className="col-span-2 text-sm font-medium text-gray-900">₹{totalSupplyCost.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Installation Cost</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Installation Wastage:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="installationWastagePercentage"
                            value={formData.installationWastagePercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalInstallationBasic * formData.installationWastagePercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Installation Transportation:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="installationTransportationPercentage"
                            value={formData.installationTransportationPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalInstallationBasic * formData.installationTransportationPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Installation Contingency:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="installationContingencyPercentage"
                            value={formData.installationContingencyPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalInstallationBasic * formData.installationContingencyPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <label className="text-sm text-gray-600">Installation Office Overhead:</label>
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="installationOfficeOverheadPercentage"
                            value={formData.installationOfficeOverheadPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">₹{(totalInstallationBasic * formData.installationOfficeOverheadPercentage / 100).toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <label className="text-sm font-medium text-gray-700">Total Installation Cost:</label>
                        <div className="col-span-2 text-sm font-medium text-gray-900">₹{totalInstallationCost.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any notes for this quotation..."
                />
              </div>
            </div>
          )}

          {/* Step 2: POC */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Project Management & Site Establishment Cost</h4>
                <p className="text-xs text-gray-500">Add overhead costs related to project management and site establishment.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Supervision</h4>
                  <button
                    type="button"
                    onClick={() => handleAddDescription('supervision')}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Project Manager</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹60,000</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">3</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">50%</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹90,000</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Site Engineer</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">2</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹35,000</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">3</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">100%</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹210,000</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">₹300,000</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Finance Cost</h4>
                  <button
                    type="button"
                    onClick={() => handleAddDescription('finance')}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Bank Guarantee</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">2%</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹5,709</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Insurance</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">1%</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹2,854</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">₹8,563</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Contingencies</h4>
                  <button
                    type="button"
                    onClick={() => handleAddDescription('contingency')}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Project Contingency</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">3%</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹8,563</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">₹8,563</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-medium">
                  <span className="text-md text-gray-900">Total Overheads Cost:</span>
                  <span className="text-md text-gray-900">₹317,126</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Value:</span>
                    <span className="font-medium">₹285,440</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material Cost:</span>
                    <span className="font-medium">₹185,600</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labour Cost:</span>
                    <span className="font-medium">₹60,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quotation Summary</h4>
                <p className="text-xs text-gray-500">Apply margins and view the final selling price breakdown.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Supply</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Cost:</span>
                      <span className="text-sm text-gray-900">₹{totalSupplyBasic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Additional Costs:</span>
                      <span className="text-sm text-gray-900">₹{supplyAdditionalCosts.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Own Cost:</span>
                      <span className="text-sm font-medium text-gray-900">₹{totalSupplyCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Margin %:</label>
                        <div className="w-20">
                          <input
                            type="number"
                            name="supplyMarginPercentage"
                            value={formData.supplyMarginPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-900">Selling Amount:</span>
                      <span className="text-sm text-green-600">₹{totalSupplySellingPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Installation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Cost:</span>
                      <span className="text-sm text-gray-900">₹{totalInstallationBasic.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Additional Costs:</span>
                      <span className="text-sm text-gray-900">₹{installationAdditionalCosts.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Own Cost:</span>
                      <span className="text-sm font-medium text-gray-900">₹{totalInstallationCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Margin %:</label>
                        <div className="w-20">
                          <input
                            type="number"
                            name="installationMarginPercentage"
                            value={formData.installationMarginPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-900">Selling Amount:</span>
                      <span className="text-sm text-green-600">₹{totalInstallationSellingPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">SITC</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Supply Selling:</span>
                      <span className="text-sm text-gray-900">₹{totalSupplySellingPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Installation Selling:</span>
                      <span className="text-sm text-gray-900">₹{totalInstallationSellingPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Selling:</span>
                      <span className="text-sm font-medium text-gray-900">₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">SITC Margin %:</label>
                        <div className="w-20">
                          <input
                            type="number"
                            name="sitcMarginPercentage"
                            value={formData.sitcMarginPercentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-900">Final Amount:</span>
                      <span className="text-sm text-green-600">₹{(totalSellingPrice * (1 + formData.sitcMarginPercentage / 100)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-medium">
                  <span className="text-md text-gray-900">Total Selling Price (Before GST):</span>
                  <span className="text-md text-green-600">₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Costing Sheet */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Final Costing Sheet</h4>
                <p className="text-xs text-gray-500">Customer-facing summary of the final costs.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Itemized List</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item) => {
                        const supplyRate = item.basicSupplyRate * (1 + formData.supplyMarginPercentage / 100);
                        const installRate = item.basicInstallationRate * (1 + formData.installationMarginPercentage / 100);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.itemType}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{supplyRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(supplyRate * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{installRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(installRate * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-sm font-medium text-right">Subtotal:</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{totalSupplySellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td></td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{totalInstallationSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">GST Application</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">High Side Supply</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{(totalSupplySellingPrice * 0.4).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              name="highSideSupplyGST"
                              value={formData.highSideSupplyGST}
                              onChange={handlePercentageChange}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Low Side Supply</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{(totalSupplySellingPrice * 0.6).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              name="lowSideSupplyGST"
                              value={formData.lowSideSupplyGST}
                              onChange={handlePercentageChange}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{totalInstallationSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              name="installationGST"
                              value={formData.installationGST}
                              onChange={handlePercentageChange}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total with GST</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">High Side Supply</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{highSideSupplyGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(totalSupplySellingPrice * 0.4 + highSideSupplyGSTAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Low Side Supply</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{lowSideSupplyGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(totalSupplySellingPrice * 0.6 + lowSideSupplyGSTAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{installationGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{(totalInstallationSellingPrice + installationGSTAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-3 py-2 text-sm font-medium text-right">Grand Total:</td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{(highSideSupplyGSTAmount + lowSideSupplyGSTAmount + installationGSTAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-sm font-medium text-green-600">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Quotation Comments */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quotation Comments</h4>
                <p className="text-xs text-gray-500">Add internal comments and notes about this quotation.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Comment
                  </label>
                  <div className="flex space-x-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your comments or notes about this quotation..."
                    ></textarea>
                    <button
                      type="button"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed self-end"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.comments.length > 0 ? (
                    formData.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
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
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No comments yet. Add the first comment above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Cost Details Modal */}
        {showCostModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Cost Details</h3>
                <button
                  onClick={() => setShowCostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Item: {selectedItem.itemName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Item Code:</span> {selectedItem.itemCode}
                    </div>
                    <div>
                      <span className="text-gray-500">UOM:</span> {selectedItem.uomName}
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span> {selectedItem.quantity}
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span> {selectedItem.itemType}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Supply Rate
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        value={selectedItem.basicSupplyRate}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supply Rate
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        value={selectedItem.supplyRate || selectedItem.basicSupplyRate}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Installation Rate
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        value={selectedItem.basicInstallationRate}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Rate
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">₹</span>
                      <input
                        type="number"
                        value={selectedItem.installationRate || selectedItem.basicInstallationRate}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Specifications
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional specifications or notes for this item..."
                  ></textarea>
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
                  onClick={handleSaveCostDetail}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="h-4 w-4 mr-2 inline" />
                  Apply Costs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Description Modal */}
        {showAddDescriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add {costCategory.charAt(0).toUpperCase() + costCategory.slice(1)} Cost</h3>
                <button
                  onClick={() => setShowAddDescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Description</option>
                      {costCategory === 'supervision' && descriptionOptions.supervision.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                      {costCategory === 'finance' && descriptionOptions.finance.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                      {costCategory === 'contingency' && descriptionOptions.contingency.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  {costCategory === 'supervision' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          NOS *
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Expense (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Months *
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diversity (%) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Percentage (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddDescriptionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Cost
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Quotation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Edit, Calculator } from 'lucide-react';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
  initialData?: any;
}

interface QuotationItem {
  id: string;
  itemCode: string;
  itemName: string;
  uomName: string;
  supplyRate: number;
  installationRate: number;
  quantity: number;
  supplyPrice: number;
  installationPrice: number;
  specifications?: string;
  supplyCosts?: {
    discount: number;
    wastage: number;
    transportation: number;
    contingency: number;
    miscellaneous: number;
    outstation: number;
    officeOverhead: number;
    poVariance: number;
  };
  installationCosts?: {
    wastage: number;
    transportation: number;
    contingency: number;
    miscellaneous: number;
    outstation: number;
    officeOverhead: number;
    poVariance: number;
  };
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    // Step 1: Costing Sheet
    leadId: '',
    leadName: '',
    businessName: '',
    workType: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    bomId: '',
    bomName: '',
    items: [] as QuotationItem[],
    note: '',
    // Step 2: POC
    projectManagementCosts: [],
    supervisionCosts: [],
    financeCosts: [],
    contingencyCosts: [],
    // Step 3: Summary
    supplyMargin: 15,
    installationMargin: 20,
    // Step 4: Final Costing
    gstRate: 18,
    // Step 5: Comments
    comments: []
  });
  
  const [selectedItemForCosts, setSelectedItemForCosts] = useState<QuotationItem | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Breadcrumb steps
  const steps = [
    { id: 1, name: 'Costing Sheet', description: 'Item costs' },
    { id: 2, name: 'POC', description: 'Project costs' },
    { id: 3, name: 'Summary', description: 'Margin application' },
    { id: 4, name: 'Final Costing', description: 'GST calculation' },
    { id: 5, name: 'Comments', description: 'Internal notes' }
  ];

  // Mock data for dropdowns
  const leads = [
    { id: '1', name: 'Mumbai Metro Ventilation System', businessName: 'TechCorp Solutions Pvt Ltd', workType: 'Basement Ventilation', bomId: 'BOM-2024-001' },
    { id: '2', name: 'Corporate Office HVAC Upgrade', businessName: 'Innovate India Limited', workType: 'HVAC Systems', bomId: 'BOM-2024-002' },
    { id: '3', name: 'Hospital Fire Safety System', businessName: 'Digital Solutions Enterprise', workType: 'Fire Safety', bomId: 'BOM-2024-003' },
    { id: '4', name: 'Residential Complex Electrical', businessName: 'Manufacturing Industries Co', workType: 'Electrical', bomId: 'BOM-2023-045' },
    { id: '5', name: 'Shopping Mall Plumbing System', businessName: 'FinTech Innovations Pvt Ltd', workType: 'Plumbing', bomId: 'BOM-2023-044' },
  ];

  // Mock BOM data
  const bomItems = {
    'BOM-2024-001': [
      { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', rate: 12500, quantity: 4, price: 50000, specifications: 'High efficiency, low noise' },
      { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', rate: 850, quantity: 120, price: 102000, specifications: 'Corrosion resistant, fire retardant' },
      { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', rate: 3200, quantity: 6, price: 19200 },
      { id: '104', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', rate: 1800, quantity: 8, price: 14400 },
    ],
    'BOM-2024-002': [
      { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
      { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
      { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
    ],
    'BOM-2024-003': [
      { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
      { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
      { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
    ],
  };

  // POC description options
  const supervisionDescriptions = ['Project Manager', 'Site Engineer', 'Safety Officer', 'Quality Control'];
  const financeDescriptions = ['Bank Guarantee', 'Insurance', 'Letter of Credit'];
  const contingencyDescriptions = ['Project Contingency', 'Weather Contingency', 'Material Price Fluctuation'];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If lead is selected, auto-select the BOM and populate items
    if (name === 'leadId') {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        const bomId = selectedLead.bomId;
        const bomItems = getBOMItems(bomId);
        
        setFormData(prev => ({
          ...prev,
          leadName: selectedLead.name,
          businessName: selectedLead.businessName,
          workType: selectedLead.workType,
          bomId: bomId,
          items: bomItems.map(item => ({
            id: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            uomName: item.uomName,
            supplyRate: item.rate,
            installationRate: Math.round(item.rate * 0.3), // Example: installation rate is 30% of supply rate
            quantity: item.quantity,
            supplyPrice: item.price,
            installationPrice: Math.round(item.rate * 0.3 * item.quantity),
            specifications: item.specifications,
            supplyCosts: {
              discount: 0,
              wastage: 2,
              transportation: 3,
              contingency: 2,
              miscellaneous: 1,
              outstation: 0,
              officeOverhead: 3,
              poVariance: 1
            },
            installationCosts: {
              wastage: 2,
              transportation: 3,
              contingency: 2,
              miscellaneous: 1,
              outstation: 0,
              officeOverhead: 3,
              poVariance: 1
            }
          }))
        }));
      }
    }
  };

  const getBOMItems = (bomId: string) => {
    return bomItems[bomId as keyof typeof bomItems] || [];
  };

  const handleCostChange = (field: string, value: string, costType: 'supply' | 'installation') => {
    if (!selectedItemForCosts) return;
    
    const numValue = parseFloat(value) || 0;
    
    setSelectedItemForCosts(prev => {
      if (!prev) return null;
      
      if (costType === 'supply') {
        return {
          ...prev,
          supplyCosts: {
            ...prev.supplyCosts,
            [field]: numValue
          }
        };
      } else {
        return {
          ...prev,
          installationCosts: {
            ...prev.installationCosts,
            [field]: numValue
          }
        };
      }
    });
  };

  const saveCostChanges = () => {
    if (!selectedItemForCosts) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === selectedItemForCosts.id ? selectedItemForCosts : item
      )
    }));
    
    setShowCostModal(false);
    setSelectedItemForCosts(null);
  };

  const openCostModal = (item: QuotationItem) => {
    setSelectedItemForCosts(item);
    setShowCostModal(true);
  };

  const addCostItem = (category: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category as keyof typeof prev], item]
    }));
  };

  const removeCostItem = (category: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: 'Current User',
        timestamp: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }));
      
      setNewComment('');
    }
  };

  const calculateItemCosts = (item: QuotationItem) => {
    if (!item.supplyCosts || !item.installationCosts) return { supplyOwnCost: 0, installationOwnCost: 0 };
    
    const supplyBaseAmount = item.supplyRate * item.quantity;
    const installationBaseAmount = item.installationRate * item.quantity;
    
    // Calculate supply own cost
    const supplyDiscount = supplyBaseAmount * (item.supplyCosts.discount / 100);
    const supplyWastage = supplyBaseAmount * (item.supplyCosts.wastage / 100);
    const supplyTransportation = supplyBaseAmount * (item.supplyCosts.transportation / 100);
    const supplyContingency = supplyBaseAmount * (item.supplyCosts.contingency / 100);
    const supplyMiscellaneous = supplyBaseAmount * (item.supplyCosts.miscellaneous / 100);
    const supplyOutstation = supplyBaseAmount * (item.supplyCosts.outstation / 100);
    const supplyOfficeOverhead = supplyBaseAmount * (item.supplyCosts.officeOverhead / 100);
    const supplyPoVariance = supplyBaseAmount * (item.supplyCosts.poVariance / 100);
    
    const supplyOwnCost = supplyBaseAmount - supplyDiscount + supplyWastage + supplyTransportation + 
                          supplyContingency + supplyMiscellaneous + supplyOutstation + 
                          supplyOfficeOverhead + supplyPoVariance;
    
    // Calculate installation own cost
    const installationWastage = installationBaseAmount * (item.installationCosts.wastage / 100);
    const installationTransportation = installationBaseAmount * (item.installationCosts.transportation / 100);
    const installationContingency = installationBaseAmount * (item.installationCosts.contingency / 100);
    const installationMiscellaneous = installationBaseAmount * (item.installationCosts.miscellaneous / 100);
    const installationOutstation = installationBaseAmount * (item.installationCosts.outstation / 100);
    const installationOfficeOverhead = installationBaseAmount * (item.installationCosts.officeOverhead / 100);
    const installationPoVariance = installationBaseAmount * (item.installationCosts.poVariance / 100);
    
    const installationOwnCost = installationBaseAmount + installationWastage + installationTransportation + 
                               installationContingency + installationMiscellaneous + installationOutstation + 
                               installationOfficeOverhead + installationPoVariance;
    
    return { supplyOwnCost, installationOwnCost };
  };

  const calculateTotalCosts = () => {
    let totalSupplyOwnCost = 0;
    let totalInstallationOwnCost = 0;
    
    formData.items.forEach(item => {
      const { supplyOwnCost, installationOwnCost } = calculateItemCosts(item);
      totalSupplyOwnCost += supplyOwnCost;
      totalInstallationOwnCost += installationOwnCost;
    });
    
    return { totalSupplyOwnCost, totalInstallationOwnCost };
  };

  const calculateSellingAmounts = () => {
    const { totalSupplyOwnCost, totalInstallationOwnCost } = calculateTotalCosts();
    
    const supplySellingAmount = totalSupplyOwnCost * (1 + formData.supplyMargin / 100);
    const installationSellingAmount = totalInstallationOwnCost * (1 + formData.installationMargin / 100);
    const totalSellingAmount = supplySellingAmount + installationSellingAmount;
    const gstAmount = totalSellingAmount * (formData.gstRate / 100);
    const grandTotal = totalSellingAmount + gstAmount;
    
    return {
      supplySellingAmount,
      installationSellingAmount,
      totalSellingAmount,
      gstAmount,
      grandTotal
    };
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
    const { totalSupplyOwnCost, totalInstallationOwnCost } = calculateTotalCosts();
    const { supplySellingAmount, installationSellingAmount, totalSellingAmount, gstAmount, grandTotal } = calculateSellingAmounts();
    
    const quotationData = {
      ...formData,
      totalSupplyOwnCost,
      totalInstallationOwnCost,
      supplySellingAmount,
      installationSellingAmount,
      totalSellingAmount,
      gstAmount,
      grandTotal,
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
      workType: '',
      quotationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      bomId: '',
      bomName: '',
      items: [],
      note: '',
      projectManagementCosts: [],
      supervisionCosts: [],
      financeCosts: [],
      contingencyCosts: [],
      supplyMargin: 15,
      installationMargin: 20,
      gstRate: 18,
      comments: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create Quotation</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep === step.id ? 'text-blue-600' : 
                  currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id ? 'bg-blue-100 text-blue-600' :
                    currentStep > step.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Costing Sheet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {formData.leadId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
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
                        value={formData.workType}
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
                        value={formData.bomId}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </>
                )}

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

              {formData.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Item List</h4>
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
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.items.map(item => {
                          const { supplyOwnCost, installationOwnCost } = calculateItemCosts(item);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.supplyRate.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.supplyPrice.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.installationRate.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.installationPrice.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openCostModal(item)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit Cost Details"
                                >
                                  <Calculator className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₹{formData.items.reduce((sum, item) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}
                          </td>
                          <td></td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₹{formData.items.reduce((sum, item) => sum + item.installationPrice, 0).toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

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
                  placeholder="Enter any notes specific to this quotation..."
                />
              </div>

              {/* Cost Details Modal */}
              {showCostModal && selectedItemForCosts && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Cost Details: {selectedItemForCosts.itemName}</h3>
                      <button
                        onClick={() => {
                          setShowCostModal(false);
                          setSelectedItemForCosts(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Supply Cost Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Supply Cost Details</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Base Supply Rate:</label>
                              <div className="text-sm font-medium">₹{selectedItemForCosts.supplyRate.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Quantity:</label>
                              <div className="text-sm font-medium">{selectedItemForCosts.quantity}</div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Base Supply Amount:</label>
                              <div className="text-sm font-medium">₹{selectedItemForCosts.supplyPrice.toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Discount (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.discount || 0}
                                onChange={(e) => handleCostChange('discount', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.discount || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Wastage (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.wastage || 0}
                                onChange={(e) => handleCostChange('wastage', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.wastage || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Transportation (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.transportation || 0}
                                onChange={(e) => handleCostChange('transportation', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.transportation || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Contingency (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.contingency || 0}
                                onChange={(e) => handleCostChange('contingency', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.contingency || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Miscellaneous (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.miscellaneous || 0}
                                onChange={(e) => handleCostChange('miscellaneous', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.miscellaneous || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Outstation (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.outstation || 0}
                                onChange={(e) => handleCostChange('outstation', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.outstation || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply Office Overhead (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.officeOverhead || 0}
                                onChange={(e) => handleCostChange('officeOverhead', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.officeOverhead || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Supply PO-variance (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.supplyCosts?.poVariance || 0}
                                onChange={(e) => handleCostChange('poVariance', e.target.value, 'supply')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.supplyPrice * (selectedItemForCosts.supplyCosts?.poVariance || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            <div className="flex justify-between font-medium">
                              <span className="text-sm text-gray-900">Total Supply Own Cost:</span>
                              <span className="text-sm text-gray-900">
                                ₹{calculateItemCosts(selectedItemForCosts).supplyOwnCost.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Installation Cost Section */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-900 mb-3">Installation Cost Details</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Base Installation Rate:</label>
                              <div className="text-sm font-medium">₹{selectedItemForCosts.installationRate.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Quantity:</label>
                              <div className="text-sm font-medium">{selectedItemForCosts.quantity}</div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-gray-600">Base Installation Amount:</label>
                              <div className="text-sm font-medium">₹{selectedItemForCosts.installationPrice.toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Wastage (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.wastage || 0}
                                onChange={(e) => handleCostChange('wastage', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.wastage || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Transportation (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.transportation || 0}
                                onChange={(e) => handleCostChange('transportation', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.transportation || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Contingency (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.contingency || 0}
                                onChange={(e) => handleCostChange('contingency', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.contingency || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Miscellaneous (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.miscellaneous || 0}
                                onChange={(e) => handleCostChange('miscellaneous', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.miscellaneous || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Outstation (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.outstation || 0}
                                onChange={(e) => handleCostChange('outstation', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.outstation || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation Office Overhead (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.officeOverhead || 0}
                                onChange={(e) => handleCostChange('officeOverhead', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.officeOverhead || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 items-center">
                              <label className="text-sm text-gray-600">Installation PO-variance (%):</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={selectedItemForCosts.installationCosts?.poVariance || 0}
                                onChange={(e) => handleCostChange('poVariance', e.target.value, 'installation')}
                                className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="text-sm font-medium text-right">
                                ₹{((selectedItemForCosts.installationPrice * (selectedItemForCosts.installationCosts?.poVariance || 0)) / 100).toLocaleString('en-IN')}
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 my-2"></div>
                            
                            <div className="flex justify-between font-medium">
                              <span className="text-sm text-gray-900">Total Installation Own Cost:</span>
                              <span className="text-sm text-gray-900">
                                ₹{calculateItemCosts(selectedItemForCosts).installationOwnCost.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowCostModal(false);
                          setSelectedItemForCosts(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveCostChanges}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formData.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Supply Cost Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Supply Base Amount:</span>
                        <span className="text-sm font-medium">
                          ₹{formData.items.reduce((sum, item) => sum + item.supplyPrice, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Supply Own Cost:</span>
                        <span className="text-sm font-medium">
                          ₹{calculateTotalCosts().totalSupplyOwnCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Installation Cost Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Installation Base Amount:</span>
                        <span className="text-sm font-medium">
                          ₹{formData.items.reduce((sum, item) => sum + item.installationPrice, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Installation Own Cost:</span>
                        <span className="text-sm font-medium">
                          ₹{calculateTotalCosts().totalInstallationOwnCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: POC */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Project Management & Site Establishment Cost</h4>
                  <button
                    type="button"
                    onClick={() => {
                      addCostItem('projectManagementCosts', {
                        id: Date.now().toString(),
                        description: supervisionDescriptions[0],
                        nos: 1,
                        monthlyExpense: 0,
                        months: 1,
                        diversity: 100,
                        amount: 0
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Cost
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.supervisionCosts.map((cost, index) => (
                      <tr key={cost.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <select
                            value={cost.description}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {supervisionDescriptions.map(desc => (
                              <option key={desc} value={desc}>{desc}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.nos}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].nos = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            value={cost.monthlyExpense}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].monthlyExpense = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.months}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].months = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cost.diversity}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].diversity = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{cost.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeCostItem('supervisionCosts', index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.supervisionCosts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                          No supervision costs added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {formData.supervisionCosts.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Supervision Cost:</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{formData.supervisionCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              {/* Supervision Costs */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Supervision Costs</h4>
                  <button
                    type="button"
                    onClick={() => {
                      addCostItem('supervisionCosts', {
                        id: Date.now().toString(),
                        description: supervisionDescriptions[0],
                        nos: 1,
                        monthlyExpense: 0,
                        months: 1,
                        diversity: 100,
                        amount: 0
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Cost
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.supervisionCosts.map((cost, index) => (
                      <tr key={cost.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <select
                            value={cost.description}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {supervisionDescriptions.map(desc => (
                              <option key={desc} value={desc}>{desc}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.nos}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].nos = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            value={cost.monthlyExpense}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].monthlyExpense = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.months}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].months = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cost.diversity}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].diversity = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{cost.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeCostItem('supervisionCosts', index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.supervisionCosts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                          No supervision costs added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {formData.supervisionCosts.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Supervision Cost:</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{formData.supervisionCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              {/* Finance Costs */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Finance Cost</h4>
                  <button
                    type="button"
                    onClick={() => {
                      addCostItem('financeCosts', {
                        id: Date.now().toString(),
                        description: supervisionDescriptions[0],
                        nos: 1,
                        monthlyExpense: 0,
                        months: 1,
                        diversity: 100,
                        amount: 0
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Cost
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.supervisionCosts.map((cost, index) => (
                      <tr key={cost.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <select
                            value={cost.description}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {supervisionDescriptions.map(desc => (
                              <option key={desc} value={desc}>{desc}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.nos}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].nos = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            value={cost.monthlyExpense}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].monthlyExpense = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.months}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].months = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cost.diversity}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].diversity = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{cost.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeCostItem('supervisionCosts', index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.supervisionCosts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                          No supervision costs added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {formData.supervisionCosts.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Supervision Cost:</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{formData.supervisionCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              {/* Contingencies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Contingencies</h4>
                  <button
                    type="button"
                    onClick={() => {
                      addCostItem('contingencyCosts', {
                        id: Date.now().toString(),
                        description: supervisionDescriptions[0],
                        nos: 1,
                        monthlyExpense: 0,
                        months: 1,
                        diversity: 100,
                        amount: 0
                      });
                    }}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Cost
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.supervisionCosts.map((cost, index) => (
                      <tr key={cost.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <select
                            value={cost.description}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {supervisionDescriptions.map(desc => (
                              <option key={desc} value={desc}>{desc}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.nos}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].nos = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            value={cost.monthlyExpense}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].monthlyExpense = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="1"
                            value={cost.months}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].months = parseInt(e.target.value) || 1;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cost.diversity}
                            onChange={(e) => {
                              const updatedCosts = [...formData.supervisionCosts];
                              updatedCosts[index].diversity = parseInt(e.target.value) || 0;
                              updatedCosts[index].amount = updatedCosts[index].nos * updatedCosts[index].monthlyExpense * updatedCosts[index].months * (updatedCosts[index].diversity / 100);
                              setFormData(prev => ({ ...prev, supervisionCosts: updatedCosts }));
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{cost.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeCostItem('supervisionCosts', index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.supervisionCosts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                          No supervision costs added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {formData.supervisionCosts.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Supervision Cost:</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{formData.supervisionCosts.reduce((sum, cost) => sum + cost.amount, 0).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between font-medium">
                  <span className="text-md text-gray-900">Total Overheads Cost:</span>
                  <span className="text-md text-gray-900">
                    ₹{(
                      formData.supervisionCosts.reduce((sum, cost) => sum + cost.amount, 0) +
                      formData.financeCosts.reduce((sum, cost) => sum + cost.amount, 0) +
                      formData.contingencyCosts.reduce((sum, cost) => sum + cost.amount, 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Margin Application</h3>
                <p className="text-sm text-gray-600">Apply margins to calculate final selling prices.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supply Margin */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Supply Margin</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Supply Own Cost:</span>
                      <span className="text-sm font-medium">₹{calculateTotalCosts().totalSupplyOwnCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Margin (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        name="supplyMargin"
                        value={formData.supplyMargin}
                        onChange={handleInputChange}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margin Amount:</span>
                      <span className="text-sm font-medium">
                        ₹{(calculateTotalCosts().totalSupplyOwnCost * (formData.supplyMargin / 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-900">Supply Selling Amount:</span>
                      <span className="text-sm text-green-600">
                        ₹{calculateSellingAmounts().supplySellingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Installation Margin */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Installation Margin</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Installation Own Cost:</span>
                      <span className="text-sm font-medium">₹{calculateTotalCosts().totalInstallationOwnCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Margin (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        name="installationMargin"
                        value={formData.installationMargin}
                        onChange={handleInputChange}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margin Amount:</span>
                      <span className="text-sm font-medium">
                        ₹{(calculateTotalCosts().totalInstallationOwnCost * (formData.installationMargin / 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm text-gray-900">Installation Selling Amount:</span>
                      <span className="text-sm text-green-600">
                        ₹{calculateSellingAmounts().installationSellingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Total Selling Amount</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supply Selling Amount:</span>
                    <span className="text-sm font-medium">₹{calculateSellingAmounts().supplySellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Installation Selling Amount:</span>
                    <span className="text-sm font-medium">₹{calculateSellingAmounts().installationSellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-medium">
                    <span className="text-sm text-gray-900">Total Selling Amount (Before GST):</span>
                    <span className="text-sm text-green-600">₹{calculateSellingAmounts().totalSellingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Costing Sheet */}
          {currentStep === 4 && (
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
                      {formData.items.map(item => {
                        const { supplyOwnCost, installationOwnCost } = calculateItemCosts(item);
                        const supplySellingRate = item.supplyRate * (1 + formData.supplyMargin / 100);
                        const installSellingRate = item.installationRate * (1 + formData.installationMargin / 100);
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{Math.round(supplySellingRate).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{Math.round(supplySellingRate * item.quantity).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{Math.round(installSellingRate).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{Math.round(installSellingRate * item.quantity).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{Math.round(calculateSellingAmounts().supplySellingAmount).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          ₹{Math.round(calculateSellingAmounts().installationSellingAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">GST Summary</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm text-gray-600">GST Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    name="gstRate"
                    value={formData.gstRate}
                    onChange={handleInputChange}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Supply</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().supplySellingAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formData.gstRate}%</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().supplySellingAmount * (formData.gstRate / 100)).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().supplySellingAmount * (1 + formData.gstRate / 100)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().installationSellingAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formData.gstRate}%</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().installationSellingAmount * (formData.gstRate / 100)).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().installationSellingAmount * (1 + formData.gstRate / 100)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Grand Total:</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ₹{Math.round(calculateSellingAmounts().gstAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">
                        ₹{Math.round(calculateSellingAmounts().grandTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Step 5: Comments */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation Comments</h3>
                <p className="text-sm text-gray-600">Internal communication regarding this quotation.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-4">
                  {formData.comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                  
                  {formData.comments.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Add the first comment below.
                    </div>
                  )}
                </div>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a comment..."
                      />
                    </div>
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed self-end"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
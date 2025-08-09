import React, { useEffect, useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Search, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { getLeads, createBOM, getBOMTemplates, getBOMTemplateById } from '../../../utils/bomApi';
import { LEAD_KEY_MAP, BOM_TEMPLATE_RESPONSE_KEY_MAP } from '../../../utils/bomApi';

interface CreateBOMProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bomData: any) => void;
  initialData?: any;
}

interface BOMItem {
  id: string;
  itemCode: string;
  itemName: string;
  uomName: string;
  supplyRate: number;
  installationRate: number;
  netRate: number;
  quantity: number;
  price: number;
  materialType: string;
  specifications?: string;
}

interface BOMSpec {
  id: string;
  name: string;
  items: BOMItem[];
  isExpanded: boolean;
  price: number;
}

const MATERIAL_TYPES = ['HIGH SIDE SUPPLY', 'LOW SIDE SUPPLY', 'INSTALLATION'];

const CreateBOM: React.FC<CreateBOMProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const editMode = !!initialData;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    leadId: '',
    leadName: '',
    workType: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    status: 'DRAFT',
    bomName: '', // <-- Add bomName to formData
  });
  const [specs, setSpecs] = useState<BOMSpec[]>([]);
  const [createdBOMId, setCreatedBOMId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API state
  const [leads, setLeads] = useState<any[]>([]);
  const [bomTemplates, setBOMTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [allItems, setAllItems] = useState<any[]>([]);

  // Fetch leads when modal opens
  useEffect(() => {
    const fetchLeads = async () => {
      if (isOpen) {
        try {
          const response = await getLeads();
          const apiLeads = response.data || [];
          
          // Map API response to UI format
          const mappedLeads = apiLeads.map((lead: any) => ({
            [LEAD_KEY_MAP.lead_id]: lead.lead_id,
            [LEAD_KEY_MAP.project_name]: lead.project_name,
            [LEAD_KEY_MAP.work_type]: lead.work_type,
            [LEAD_KEY_MAP.business_name]: lead.business_name
          }));
          
          setLeads(mappedLeads);
        } catch (error) {
          console.error('Error fetching leads:', error);
          setLeads([]);
        }
      }
    };

    fetchLeads();
  }, [isOpen]);

  // Fetch BOM templates when step 2 loads
  useEffect(() => {
    const fetchBOMTemplates = async () => {
      if (currentStep === 2) {
        try {
          const response = await getBOMTemplates();
          const apiTemplates = response.data || [];
          
          // Map API response to UI format
          const mappedTemplates = apiTemplates.map((template: any) => ({
            [BOM_TEMPLATE_RESPONSE_KEY_MAP.id]: template.id,
            [BOM_TEMPLATE_RESPONSE_KEY_MAP.name]: template.name,
            [BOM_TEMPLATE_RESPONSE_KEY_MAP.work_type]: template.work_type
          }));
          
          setBOMTemplates(mappedTemplates);
        } catch (error) {
          console.error('Error fetching BOM templates:', error);
          setBOMTemplates([]);
        }
      }
    };

    fetchBOMTemplates();
  }, [currentStep]);

  // Fetch all items for dropdown
  useEffect(() => {
    const fetchAllItems = async () => {
      if (currentStep === 2) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom-template/items/all`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setAllItems(data.data || []);
        } catch (error) {
          console.error('Error fetching all items:', error);
          setAllItems([]);
        }
      }
    };

    fetchAllItems();
  }, [currentStep]);

  // Ensure hooks are called unconditionally and consistently
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSpecs(initialData.specs || []);
      setCurrentStep(1);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value,
    }));

    // If lead is selected, update lead name, work type, and bomName
    if (name === 'leadId') {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          leadName: selectedLead.projectName,
          workType: selectedLead.workType,
          bomName: `${selectedLead.projectName} - BOM `,
        }));
      }
    }
  };

  // Handle BOM template selection
  const handleTemplateSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) {
      setSelectedTemplate(null);
      setSpecs([]);
      return;
    }

    try {
      const response = await getBOMTemplateById(templateId);
      const templateData = response.data;
      
      setSelectedTemplate(templateData);
      
      // Map specs and items from API response
      const mappedSpecs = templateData.specs?.map((spec: any) => {
        const mappedItems = spec.details?.map((detail: any) => {
          // Find the item in allItems to get latest rates
          const itemWithRates = allItems.find(item => item.id === detail.item_id);
          const supplyRate = itemWithRates?.latest_lowest_basic_supply_rate || detail.supply_rate || 0;
          const installationRate = itemWithRates?.latest_lowest_basic_installation_rate || detail.installation_rate || 0;
          const netRate = itemWithRates?.latest_lowest_net_rate || detail.net_rate || 0;
          
          return {
            id: detail.item_id, // Use direct property name for item ID
            itemCode: detail.item_code,
            itemName: detail.item_name,
            materialType: detail.material_type || 'HIGH SIDE SUPPLY',
            uomName: '-',
            supplyRate: supplyRate,
            installationRate: installationRate,
            netRate: netRate,
            quantity: detail.required_quantity,
            price: detail.required_quantity * netRate,
            specifications: ''
          };
        }) || [];

        // Calculate spec price from mapped items
        const specPrice = mappedItems.reduce((sum: number, item: any) => sum + item.price, 0);

        return {
          id: spec.spec_id,
          name: spec.spec_description,
          items: mappedItems,
          isExpanded: true,
          price: specPrice
        };
      }) || [];
      
      setSpecs(mappedSpecs);
    } catch (error) {
      console.error('Error fetching BOM template details:', error);
      setSelectedTemplate(null);
      setSpecs([]);
    }
  };

  // Spec management functions
  const addSpec = () => {
    const newSpec: BOMSpec = {
      id: Date.now().toString(),
      name: '',
      items: [],
      isExpanded: true,
      price: 0
    };
    setSpecs(prev => [...prev, newSpec]);
  };

  const updateSpecName = (specId: string, name: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { ...spec, name } : spec
    ));
  };

  const deleteSpec = (specId: string) => {
    setSpecs(prev => prev.filter(spec => spec.id !== specId));
  };

  const toggleSpecExpansion = (specId: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
    ));
  };

  // Item management functions
  const addItemToSpec = (specId: string, item: any) => {
    const newItem: BOMItem = {
      id: item.id,
      itemCode: item.item_code,
      itemName: item.item_name,
      uomName: '-',
      supplyRate: item.latest_lowest_basic_supply_rate || 0,
      installationRate: item.latest_lowest_basic_installation_rate || 0,
      netRate: item.latest_lowest_net_rate || 0,
      quantity: 1,
      price: item.latest_lowest_net_rate || 0,
      materialType: 'HIGH SIDE SUPPLY',
      specifications: ''
    };

    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { 
        ...spec, 
        items: [...spec.items, newItem],
        price: spec.items.reduce((sum, item) => sum + item.price, 0) + newItem.price
      } : spec
    ));
  };

  const removeItemFromSpec = (specId: string, itemId: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? {
        ...spec,
        items: spec.items.filter(item => item.id !== itemId),
        price: spec.items.filter(item => item.id !== itemId).reduce((sum, item) => sum + item.price, 0)
      } : spec
    ));
  };

  const updateSpecItemQuantity = (specId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? {
        ...spec,
        items: spec.items.map(item => 
          item.id === itemId ? {
            ...item,
            quantity,
            price: item.netRate * quantity
          } : item
        ),
        price: spec.items.map(item => 
          item.id === itemId ? { ...item, quantity, price: item.netRate * quantity } : item
        ).reduce((sum, item) => sum + item.price, 0)
      } : spec
    ));
  };

  const updateSpecItemRates = (specId: string, itemId: string, field: 'supplyRate' | 'installationRate' | 'netRate', value: number) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? {
        ...spec,
        items: spec.items.map(item => 
          item.id === itemId ? {
            ...item,
            [field]: value,
            price: field === 'netRate' ? value * item.quantity : item.price
          } : item
        ),
        price: spec.items.map(item => 
          item.id === itemId && field === 'netRate' ? 
            { ...item, [field]: value, price: value * item.quantity } : item
        ).reduce((sum, item) => sum + item.price, 0)
      } : spec
    ));
  };

  const getAvailableItemsForSpec = (specId: string) => {
    const spec = specs.find(s => s.id === specId);
    if (!spec) return allItems;
    
    const usedItemIds = spec.items.map(item => item.id);
    return allItems.filter(item => !usedItemIds.includes(item.id));
  };

  // Create BOM API call
  const handleCreateBOM = async () => {
    if (!formData.leadId) return;

    setIsSubmitting(true);
    try {
      const bomPayload = {
        name: formData.bomName, // Use bomName here
        leadId: formData.leadId,
        date: formData.date,
        workType: formData.workType
      };

      const response = await createBOM(bomPayload);
      const bomId = response.data?.id;

      if (bomId) {
        setCreatedBOMId(bomId);
        setCurrentStep(2);
      } else {
        throw new Error('BOM ID not received from API');
      }
    } catch (error) {
      console.error('Error creating BOM:', error);
      alert('Failed to create BOM. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save BOM with specs and details
  const handleSaveBOM = async () => {
    if (!createdBOMId) {
      alert('BOM not created yet. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create specs
      const specsPayload = specs.map(spec => ({
        bom_id: createdBOMId,
        spec_description: spec.name,
        spec_price: spec.price
      }));

      const specsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom-spec/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(specsPayload),
      });
      const specsData = await specsResponse.json();
      const createdSpecs = specsData.data || [];

      // Step 2: Create details
      const detailsPayload: any[] = [];
      specs.forEach((spec, specIndex) => {
        const specId = createdSpecs[specIndex]?.id;
        if (specId) {
          spec.items.forEach(item => {
            detailsPayload.push({
              bom_id: createdBOMId,
              bom_spec_id: specId,
              item_id: item.id,
              required_quantity: item.quantity,
              supply_rate: item.supplyRate,
              installation_rate: item.installationRate,
              net_rate: item.netRate,
              material_type: item.materialType || 'HIGH SIDE SUPPLY'
            });
          });
        }
      });

      if (detailsPayload.length > 0) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom-detail/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(detailsPayload),
        });
      }

      // Step 3: Update BOM with template and total price
      const totalPrice = specs.reduce((sum, spec) => sum + spec.price, 0);
      const bomUpdatePayload = {
        bom_template_id: selectedTemplate?.id || null,
        description: formData.note,
        total_price: totalPrice
      };

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom/${createdBOMId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bomUpdatePayload),
      });

      // Success - close modal and reset
      const bomData = {
        ...formData,
        specs,
        totalItems: specs.reduce((sum, spec) => sum + spec.items.length, 0),
        totalValue: totalPrice,
        createdDate: new Date().toISOString(),
      };
      
      onSubmit(bomData);
      
      // Reset form
      setCurrentStep(1);
      setCreatedBOMId(null);
      setFormData({
        leadId: '',
        leadName: '',
        workType: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        status: 'DRAFT',
      });
      setSpecs([]);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving BOM:', error);
      alert('Failed to save BOM. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.leadId) {
      handleCreateBOM();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (editMode) {
      // Handle edit mode
      const bomData = {
        ...formData,
        specs,
        totalItems: specs.reduce((sum, spec) => sum + spec.items.length, 0),
        totalValue: specs.reduce((sum, spec) => sum + spec.price, 0),
        createdDate: initialData?.createdDate || new Date().toISOString(),
      };
      onSubmit(bomData);
    } else {
      // Handle create mode
      handleSaveBOM();
    }
  };

  // Component for individual spec item dropdown
  const SpecItemDropdown: React.FC<{ specId: string }> = ({ specId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    
    const availableItems = getAvailableItemsForSpec(specId);
    const filteredItems = availableItems.filter(item => 
      item.item_name?.toLowerCase().includes(localSearchQuery.toLowerCase()) || 
      item.item_code?.toLowerCase().includes(localSearchQuery.toLowerCase())
    );
    
    return (
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search items by name or code"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.item_code}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.item_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          addItemToSpec(specId, item);
                          setIsOpen(false);
                          setLocalSearchQuery('');
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-sm text-gray-500 text-center">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {isOpen && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  // Breadcrumbs for steps
  const steps = [
    { label: 'BOM Header Details', step: 1 },
    { label: 'BOM Items & Details', step: 2 }
  ];

  const handleStepClick = (step: number) => {
    if (editMode) setCurrentStep(step);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editMode ? 'Edit Bill of Materials' : 'Create Bill of Materials'}
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 2</p>
            {/* Step Breadcrumbs */}
            <nav className="mt-2 flex space-x-4" aria-label="Steps">
              {steps.map((s, idx) => (
                <div key={s.step} className="flex items-center">
                  <span
                    className={`text-sm font-medium ${currentStep === s.step
                      ? 'text-blue-600'
                      : currentStep > s.step
                      ? 'text-green-600'
                      : 'text-gray-400'
                    } ${editMode ? 'cursor-pointer underline' : ''}`}
                    onClick={() => handleStepClick(s.step)}
                  >
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
                  )}
                </div>
              ))}
            </nav>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: BOM Header Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
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
                    <option key={lead.id} value={lead.id}>{lead.projectName}</option>
                  ))}
                </select>
              </div>

              {/* BOM Name Textfield */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="bomName"
                  value={formData.bomName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter BOM Name"
                />
              </div>

              {formData.leadId && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Name:</span> {formData.leadName}
                    </div>
                    <div>
                      <span className="text-gray-500">Work Type:</span> {formData.workType}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: BOM Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select Template (Optional)</h4>
                <select
                  onChange={handleTemplateSelect}
                  value={selectedTemplate?.id || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Template</option>
                  {bomTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Spec Button */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-700">BOM Specifications</h4>
                <button
                  type="button"
                  onClick={addSpec}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Spec
                </button>
              </div>

              {/* Specs List */}
              {specs.length > 0 ? (
                <div className="space-y-4">
                  {specs.map((spec: BOMSpec) => (
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
                              <h4 className="text-md font-medium text-gray-900">{spec.name || 'Unnamed Spec'}</h4>
                              <p className="text-sm text-gray-500">{spec.items.length} item(s) • ₹{spec.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSpec(spec.id);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Spec"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Spec Content */}
                      {spec.isExpanded && (
                        <div className="p-4">
                          <div className="space-y-4">
                            {/* Spec Name Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Spec Name *
                              </label>
                              <input
                                type="text"
                                value={spec.name}
                                onChange={(e) => updateSpecName(spec.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter spec name"
                              />
                            </div>
                            
                            {/* Add Item Dropdown */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Add Item
                              </label>
                              <SpecItemDropdown specId={spec.id} />
                            </div>
                            
                            {/* Items Table */}
                            {spec.items.length > 0 && (
                              <div className="border border-gray-200 rounded-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {spec.items.map(item => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                          {item.itemCode}
                                          <div className="text-[0.7em] text-blue-500">{item.materialType}</div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <input
                                            type="number"
                                            value={item.supplyRate}
                                            onChange={(e) => updateSpecItemRates(spec.id, item.id, 'supplyRate', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <input
                                            type="number"
                                            value={item.installationRate}
                                            onChange={(e) => updateSpecItemRates(spec.id, item.id, 'installationRate', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <input
                                            type="number"
                                            value={item.netRate}
                                            onChange={(e) => updateSpecItemRates(spec.id, item.id, 'netRate', parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateSpecItemQuantity(spec.id, item.id, parseInt(e.target.value) || 1)}
                                            min="1"
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                          />
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <select
                                            value={item.materialType}
                                            onChange={(e) => updateSpecItemRates(spec.id, item.id, 'materialType', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                          >
                                            {MATERIAL_TYPES.map(type => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <button
                                            onClick={() => removeItemFromSpec(spec.id, item.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Remove Item"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-50">
                                    <tr>
                                      <td colSpan={6} className="px-3 py-2 text-sm font-medium text-right">Spec Total:</td>
                                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                        ₹{spec.price.toLocaleString('en-IN')}
                                      </td>
                                      <td></td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            )}
                            
                            {spec.items.length === 0 && (
                              <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-md">
                                <p className="text-sm">No items added to this spec yet.</p>
                                <p className="text-xs">Use the dropdown above to add items.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Overall Total */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Grand Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{specs.reduce((sum, spec) => sum + spec.price, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No specs created yet</p>
                  <p className="text-sm">Click "Add Spec" to create your first spec</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BOM Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any notes specific to this BOM..."
                />
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
            {editMode ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={currentStep === 2 && specs.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            ) : currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.leadId || isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={specs.length === 0 || isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save BOM'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBOM;
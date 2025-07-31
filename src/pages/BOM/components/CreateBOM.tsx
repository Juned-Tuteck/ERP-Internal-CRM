import React, { useEffect, useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Search, Edit } from 'lucide-react';
import { getLeads, createBOM, getBOMTemplates, getBOMTemplateById } from '../../../utils/bomApi';
import { LEAD_KEY_MAP, BOM_TEMPLATE_RESPONSE_KEY_MAP, BOM_TEMPLATE_SPEC_KEY_MAP, BOM_TEMPLATE_DETAIL_KEY_MAP } from '../../../utils/bomApi';

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
  rate: number;
  quantity: number;
  price: number;
  specifications?: string;
}

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
  });
  const [items, setItems] = useState<BOMItem[]>([]);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [specification, setSpecification] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createdBOMId, setCreatedBOMId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // API state
  const [leads, setLeads] = useState<any[]>([]);
  const [bomTemplates, setBOMTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateSpecs, setTemplateSpecs] = useState<any[]>([]);

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
            [BOM_TEMPLATE_RESPONSE_KEY_MAP.workType]: template.work_type
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

  // Ensure hooks are called unconditionally and consistently
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setItems(initialData.items || []);
      setCurrentStep(1);
    }
  }, [initialData]);

  const statuses = ['DRAFT', 'Submitted for Approval'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value,
    }));

    // If lead is selected, update lead name and work type
    if (name === 'leadId') {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          leadName: selectedLead.projectName,
          workType: selectedLead.workType
        }));
      }
    }
  };

  // Handle BOM template selection
  const handleTemplateSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) {
      setSelectedTemplate(null);
      setTemplateSpecs([]);
      return;
    }

    try {
      const response = await getBOMTemplateById(templateId);
      const templateData = response.data;
      
      setSelectedTemplate(templateData);
      
      // Map specs and items from API response
      const mappedSpecs = templateData.specs?.map((spec: any) => ({
        [BOM_TEMPLATE_SPEC_KEY_MAP.spec_id]: spec.spec_id,
        [BOM_TEMPLATE_SPEC_KEY_MAP.spec_description]: spec.spec_description,
        isExpanded: true,
        [BOM_TEMPLATE_SPEC_KEY_MAP.details]: spec.details?.map((detail: any) => ({
          [BOM_TEMPLATE_DETAIL_KEY_MAP.detail_id]: detail.detail_id,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.item_id]: detail.item_id,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.required_quantity]: detail.required_quantity,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.item_code]: detail.item_code,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.item_name]: detail.item_name,
          uomName: '-', // As specified
          [BOM_TEMPLATE_DETAIL_KEY_MAP.latest_lowest_basic_supply_rate]: detail.latest_lowest_basic_supply_rate,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.latest_lowest_basic_installation_rate]: detail.latest_lowest_basic_installation_rate,
          [BOM_TEMPLATE_DETAIL_KEY_MAP.latest_lowest_net_rate]: detail.latest_lowest_net_rate,
          price: detail.required_quantity * detail.latest_lowest_net_rate
        })) || []
      })) || [];
      
      setTemplateSpecs(mappedSpecs);
    } catch (error) {
      console.error('Error fetching BOM template details:', error);
      setSelectedTemplate(null);
      setTemplateSpecs([]);
    }
  };

  const handleAddSpecification = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setSpecification(item.specifications || '');
      setEditingItemId(id);
      setShowSpecModal(true);
    }
  };

  const handleSaveSpecification = () => {
    if (editingItemId) {
      setItems(prev => prev.map(item => 
        item.id === editingItemId ? {
          ...item,
          specifications: specification
        } : item
      ));
      setShowSpecModal(false);
      setEditingItemId(null);
      setSpecification('');
    }
  };

  const toggleSpecExpansion = (specId: string) => {
    setTemplateSpecs(prev => prev.map(spec => 
      spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
    ));
  };

  const updateSpecItemQuantity = (specId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    
    setTemplateSpecs(prev => prev.map(spec => 
      spec.id === specId ? {
        ...spec,
        items: spec.items.map((item: any) => 
          item.itemId === itemId ? {
            ...item,
            quantity,
            price: item.netRate * quantity
          } : item
        )
      } : spec
    ));
  };

  // Create BOM API call
  const handleCreateBOM = async () => {
    if (!formData.leadId) return;
    
    setIsSubmitting(true);
    try {
      const bomPayload = {
        name: formData.leadName,
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
    const bomData = {
      ...formData,
      specs: templateSpecs,
      totalItems: templateSpecs.reduce((sum, spec) => sum + spec.items.length, 0),
      totalValue: templateSpecs.reduce((sum, spec) => sum + spec.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0),
      createdDate: initialData?.createdDate || new Date().toISOString(),
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
    setTemplateSpecs([]);
    setSelectedTemplate(null);
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

  const handleSave = () => {
    const bomData = {
      ...formData,
      specs: templateSpecs,
      totalItems: templateSpecs.reduce((sum, spec) => sum + spec.items.length, 0),
      totalValue: templateSpecs.reduce((sum, spec) => sum + spec.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0),
      createdDate: initialData?.createdDate || new Date().toISOString(),
    };
    onSubmit(bomData);
    setCurrentStep(1);
    setFormData({
      leadId: '',
      leadName: '',
      workType: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      status: 'DRAFT',
    });
    setTemplateSpecs([]);
    setSelectedTemplate(null);
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select Template</h4>
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

              {/* Template Specs and Items */}
              {templateSpecs.length > 0 && (
                <div className="space-y-4">
                  {templateSpecs.map((spec: any) => (
                    <div key={spec.id} className="border border-gray-200 rounded-lg">
                      {/* Spec Header */}
                      <div 
                        className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
                        onClick={() => toggleSpecExpansion(spec.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{spec.name}</h4>
                              <p className="text-sm text-gray-500">{spec.items.length} item(s)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              ₹{spec.items.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Spec Items */}
                      {spec.isExpanded && (
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {spec.items.map((item: any) => (
                                  <tr key={item.itemId} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.supplyRate.toLocaleString('en-IN')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.installationRate.toLocaleString('en-IN')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateSpecItemQuantity(spec.id, item.itemId, parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price.toLocaleString('en-IN')}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={6} className="px-3 py-2 text-sm font-medium text-right">Spec Total:</td>
                                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                    ₹{spec.items.reduce((sum: number, item: any) => sum + item.price, 0).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
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
                        ₹{templateSpecs.reduce((sum, spec) => sum + spec.items.reduce((itemSum: number, item: any) => itemSum + item.price, 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Specification Modal */}
        {showSpecModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Specification</h3>
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter technical specifications or additional details..."
                />
              </div>
              <div className="flex justify-end p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowSpecModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSpecification}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Specification
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
            {editMode ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={currentStep === 2 && items.length === 0}
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
                disabled={templateSpecs.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                Save BOM
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBOM;
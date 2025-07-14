import React, { useEffect, useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Upload, Search, Edit2, SquarePen } from 'lucide-react';

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

interface BOMTemplate {
  id: string;
  name: string;
  workType: string;
  items: BOMItem[];
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [specification, setSpecification] = useState<string>('');

  // Mock data for dropdowns
  const leads = [
    { id: '1', name: 'Mumbai Metro Ventilation System', workType: 'Basement Ventilation' },
    { id: '2', name: 'Corporate Office HVAC Upgrade', workType: 'HVAC Systems' },
    { id: '3', name: 'Hospital Fire Safety System', workType: 'Fire Safety' },
    { id: '4', name: 'Residential Complex Electrical', workType: 'Electrical' },
    { id: '5', name: 'Shopping Mall Plumbing System', workType: 'Plumbing' },
  ];
  
  const templates: BOMTemplate[] = [
    {
      id: '1',
      name: 'Basement Ventilation System - Standard',
      workType: 'Basement Ventilation',
      items: [
        { id: '101', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', rate: 12500, quantity: 4, price: 50000 },
        { id: '102', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', rate: 850, quantity: 120, price: 102000 },
        { id: '103', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', rate: 3200, quantity: 6, price: 19200 },
        { id: '104', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', rate: 1800, quantity: 8, price: 14400 },
      ]
    },
    {
      id: '2',
      name: 'HVAC System - Commercial Office',
      workType: 'HVAC Systems',
      items: [
        { id: '201', itemCode: 'AC-001', itemName: 'Central AC Unit', uomName: 'Nos', rate: 85000, quantity: 2, price: 170000 },
        { id: '202', itemCode: 'DUCT-002', itemName: 'Insulated Duct', uomName: 'Meter', rate: 1200, quantity: 80, price: 96000 },
        { id: '203', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500, quantity: 6, price: 27000 },
      ]
    },
    {
      id: '3',
      name: 'Fire Safety System - Residential',
      workType: 'Fire Safety',
      items: [
        { id: '301', itemCode: 'ALARM-001', itemName: 'Fire Alarm Control Panel', uomName: 'Nos', rate: 35000, quantity: 1, price: 35000 },
        { id: '302', itemCode: 'SENSOR-002', itemName: 'Smoke Detector', uomName: 'Nos', rate: 1200, quantity: 24, price: 28800 },
        { id: '303', itemCode: 'SPRINKLER-001', itemName: 'Automatic Sprinkler', uomName: 'Nos', rate: 800, quantity: 36, price: 28800 },
      ]
    },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setItems(initialData.items || []);
      setSelectedTemplate(initialData.selectedTemplate || initialData.templateId || '');
      setCurrentStep(1);
    }
  }, [initialData]);

  const statuses = ['DRAFT', 'Submitted for Approval'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If lead is selected, update lead name and work type
    if (name === 'leadId') {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setFormData(prev => ({
          ...prev,
          leadName: selectedLead.name,
          workType: selectedLead.workType
        }));
      }
    }
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Clone items from template
        setItems(template.items.map(item => ({...item, id: Date.now() + Math.random().toString()})));
      }
    } else {
      setItems([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUploadItems = () => {
    // In a real application, this would parse the CSV file
    // For this demo, we'll just simulate a successful upload
    if (csvFile) {
      // Mock data after CSV upload
      setItems([
        { id: '401', itemCode: 'PIPE-001', itemName: 'PVC Pipe', uomName: 'Meter', rate: 350, quantity: 150, price: 52500 },
        { id: '402', itemCode: 'VALVE-001', itemName: 'Ball Valve', uomName: 'Nos', rate: 1200, quantity: 12, price: 14400 },
        { id: '403', itemCode: 'FITTING-001', itemName: 'PVC Elbow', uomName: 'Nos', rate: 120, quantity: 40, price: 4800 },
      ]);
      
      setCsvFile(null);
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

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.leadId) {
      setCurrentStep(2);
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
      items,
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.price, 0),
      createdDate: initialData?.createdDate || new Date().toISOString(),
    };
    
    onSubmit(bomData);
    
    // Reset form
    setCurrentStep(1);
    setFormData({
      leadId: '',
      leadName: '',
      workType: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      status: 'DRAFT',
    });
    setItems([]);
    setSelectedTemplate('');
    setCsvFile(null);
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
      items,
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.price, 0),
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
    setItems([]);
    setSelectedTemplate('');
    setCsvFile(null);
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
                    <option key={lead.id} value={lead.id}>{lead.name}</option>
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
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lead Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Lead Name:</span> {formData.leadName}
                  </div>
                  <div>
                    <span className="text-gray-500">Work Type:</span> {formData.workType}
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span> {new Date(formData.date).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">BOM Items</h4>
                
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Load from Saved Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={handleTemplateSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Custom Template
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload-bom"
                      />
                      <label
                        htmlFor="csv-upload-bom"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Choose File
                      </label>
                      <button
                        onClick={handleUploadItems}
                        disabled={!csvFile}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </button>
                    </div>
                    {csvFile && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {csvFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {item.itemName}
                              {item.specifications && (
                                <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                  Spec: {item.specifications}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  // Increase quantity by 1 and update price accordingly
                                  setItems(prev =>
                                    prev.map(i =>
                                      i.id === item.id
                                        ? {
                                            ...i,
                                            quantity: i.quantity + 1,
                                            price: (i.quantity + 1) * i.rate,
                                          }
                                        : i
                                    )
                                  );
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Increase Quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              {/* Edit icon beside + */}
                              <button
                                onClick={() => handleAddSpecification(item.id)}
                                className="text-blue-600 hover:text-blue-900 pl-5"
                                title="Edit Specification"
                              >
                                <SquarePen className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 text-sm text-gray-500 text-center">
                            No items added yet. Select a template or upload a CSV file.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {items.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₹{items.reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

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
                disabled={!formData.leadId}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={items.length === 0}
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
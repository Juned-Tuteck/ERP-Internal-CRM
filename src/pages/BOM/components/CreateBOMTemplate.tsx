import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Upload, Search, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { createBOMTemplate, createBOMTemplateSpecs, createBOMTemplateDetails, getBOMTemplateItems } from '../../../utils/bomTemplateApi';

interface CreateBOMTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateData: any) => void;
  initialData?: {
    workType: string;
    name: string;
    description: string;
    items: BOMItem[];
    // add other fields as needed
  };
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

interface Spec {
  id: string;
  name: string;
  items: BOMItem[];
  isExpanded: boolean;
}

const CreateBOMTemplate: React.FC<CreateBOMTemplateProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData // <-- new prop
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState<'manual' | 'upload'>('manual');
  const [formData, setFormData] = useState({
    workType: '',
    name: '',
    description: '',
  });
  const [items, setItems] = useState<BOMItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specification, setSpecification] = useState<string>('');
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showDeleteSpecModal, setShowDeleteSpecModal] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<string | null>(null);
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);

  // Mock data for dropdowns
  const workTypes = ['Basement Ventilation', 'HVAC Systems', 'Fire Safety', 'Electrical', 'Plumbing'];
  
  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getBOMTemplateItems();
        setApiItems(items);
      } catch (error) {
        console.error('Error fetching BOM template items:', error);
        setApiItems([]);
      }
    };

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Use API items if available, fallback to mock data
  const masterItems = apiItems.length > 0 ? apiItems : [
    { id: '1', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', brand: 'Crompton', rate: 12500 },
    { id: '2', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', brand: 'Tata Steel', rate: 850 },
    { id: '3', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', brand: 'Honeywell', rate: 3200 },
    { id: '4', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', brand: 'Siemens', rate: 1800 },
    { id: '5', itemCode: 'CABLE-001', itemName: 'Electrical Cable', uomName: 'Meter', brand: 'Havells', rate: 120 },
    { id: '6', itemCode: 'PANEL-001', itemName: 'Control Panel', uomName: 'Nos', brand: 'Schneider', rate: 25000 },
    { id: '7', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', brand: '3M', rate: 4500 },
    { id: '8', itemCode: 'PIPE-001', itemName: 'PVC Pipe', uomName: 'Meter', brand: 'Supreme', rate: 350 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Spec management functions
  const addSpec = () => {
    const newSpec: Spec = {
      id: Date.now().toString(),
      name: '',
      items: [],
      isExpanded: true
    };
    setSpecs(prev => [...prev, newSpec]);
  };

  const updateSpecName = (specId: string, name: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { ...spec, name } : spec
    ));
  };

  const toggleSpecExpansion = (specId: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
    ));
  };

  const addItemToSpec = (specId: string, masterItem: any) => {
    const newItem: BOMItem = {
      id: masterItem.id,
      itemCode: masterItem.itemCode,
      itemName: masterItem.itemName,
      uomName: masterItem.uomName,
      rate: masterItem.rate,
      quantity: 1,
      price: masterItem.rate,
      specifications: ''
    };

    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? { 
        ...spec, 
        items: [...spec.items, newItem] 
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
            price: item.rate * quantity
          } : item
        )
      } : spec
    ));
  };

  const removeItemFromSpec = (specId: string, itemId: string) => {
    setSpecs(prev => prev.map(spec => 
      spec.id === specId ? {
        ...spec,
        items: spec.items.filter(item => item.id !== itemId)
      } : spec
    ));
  };

  const deleteSpec = (specId: string) => {
    setSpecs(prev => prev.filter(spec => spec.id !== specId));
    setShowDeleteSpecModal(false);
    setSpecToDelete(null);
  };

  const getAvailableItemsForSpec = (specId: string) => {
    const spec = specs.find(s => s.id === specId);
    if (!spec) return masterItems;
    
    const usedItemIds = spec.items.map(item => item.itemCode);
    return masterItems.filter(item => !usedItemIds.includes(item.itemCode));
  };

  const getFilteredItems = (specId: string, searchQuery: string) => {
    const availableItems = getAvailableItemsForSpec(specId);
    return availableItems.filter(item => 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const canSaveTemplate = () => {
    return specs.length > 0 && 
           specs.every(spec => spec.name.trim() !== '' && spec.items.length > 0) &&
           formData.workType && 
           formData.name;
  };

  // Convert specs to items for backward compatibility
  const getAllItems = () => {
    return specs.flatMap(spec => spec.items);
  };

  const handleEditItem = (specId: string, item: BOMItem) => {
    setEditingItemId(item.id);
    setSpecification(item.specifications || '');
    setShowSpecModal(true);
  };

  const handleSaveSpecification = () => {
    if (editingItemId) {
      setSpecs(prev => prev.map(spec => ({
        ...spec,
        items: spec.items.map(item => 
          item.id === editingItemId ? {
            ...item,
            specifications: specification
          } : item
        )
      })));
      setShowSpecModal(false);
      setEditingItemId(null);
      setSpecification('');
    }
  };

  // Component for individual spec item dropdown
  const SpecItemDropdown: React.FC<{ specId: string }> = ({ specId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    
    const filteredItems = getFilteredItems(specId, localSearchQuery);
    
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
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
                    <td colSpan={6} className="px-3 py-2 text-sm text-gray-500 text-center">No items found</td>
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

  // Component for individual spec
  const SpecSection: React.FC<{ spec: Spec }> = ({ spec }) => {
    const hasItems = spec.items.length > 0;
    const totalValue = spec.items.reduce((sum, item) => sum + item.price, 0);
    
    return (
      <div className="border border-gray-200 rounded-lg mb-4">
        {/* Spec Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => toggleSpecExpansion(spec.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {spec.isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <div>
                <h4 className="text-md font-medium text-gray-900">
                  {spec.name || 'Unnamed Spec'}
                </h4>
                <p className="text-sm text-gray-500">
                  {spec.items.length} item(s) • ₹{totalValue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => toggleSpecExpansion(spec.id)}
                className="text-blue-600 hover:text-blue-900"
                title="Edit Spec"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpecToDelete(spec.id);
                  setShowDeleteSpecModal(true);
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
                {!spec.name.trim() && (
                  <p className="text-xs text-red-500 mt-1">Spec name is required</p>
                )}
              </div>
              
              {/* Add Item Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Item
                </label>
                <SpecItemDropdown specId={spec.id} />
              </div>
              
              {/* Items Table */}
              {hasItems && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {spec.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {item.itemName}
                              {item.specifications && (
                                <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                  Spec: {item.specifications}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
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
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditItem(spec.id, item)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Specifications"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeItemFromSpec(spec.id, item.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Remove Item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          ₹{totalValue.toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              {!hasItems && (
                <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-md">
                  <p className="text-sm">No items added to this spec yet.</p>
                  <p className="text-xs">Use the dropdown above to add items.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUploadTemplate = () => {
    // In a real application, this would parse the CSV file
    // For this demo, we'll just simulate a successful upload
    if (csvFile) {
      // Mock data after CSV upload
      setFormData({
        workType: 'HVAC Systems',
        name: 'Uploaded HVAC Template',
        description: 'Automatically generated from CSV upload'
      });
      
      // Create a sample spec with items for CSV upload
      const sampleSpec: Spec = {
        id: Date.now().toString(),
        name: 'Uploaded HVAC Items',
        isExpanded: true,
        items: [
          {
            id: '101',
            itemCode: 'FAN-001',
            itemName: 'Industrial Exhaust Fan',
            uomName: 'Nos',
            rate: 12500,
            quantity: 4,
            price: 50000
          },
          {
            id: '102',
            itemCode: 'DUCT-001',
            itemName: 'Galvanized Steel Duct',
            uomName: 'Meter',
            rate: 850,
            quantity: 120,
            price: 102000
          },
          {
            id: '103',
            itemCode: 'FILTER-001',
            itemName: 'HEPA Filter',
            uomName: 'Nos',
            rate: 4500,
            quantity: 8,
            price: 36000
          }
        ]
      };
      
      setSpecs([sampleSpec]);
      
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.workType && formData.name) {
      handleCreateTemplate();
    }
  };

  // Create template API call
  const handleCreateTemplate = async () => {
    setIsSubmitting(true);
    try {
      const response = await createBOMTemplate(formData);
      const templateId = response.data?.id;
      
      if (templateId) {
        setCreatedTemplateId(templateId);
        setCurrentStep(2);
      } else {
        throw new Error('Template ID not received from API');
      }
    } catch (error) {
      console.error('Error creating BOM template:', error);
      alert('Failed to create BOM template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isEditMode = !!initialData;

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        workType: initialData.workType || '',
        name: initialData.name || '',
        description: initialData.description || '',
      });
      
      // Convert items to specs if editing existing template
      if (initialData.items && initialData.items.length > 0) {
        const defaultSpec: Spec = {
          id: Date.now().toString(),
          name: 'Default Spec',
          isExpanded: true,
          items: initialData.items
        };
        setSpecs([defaultSpec]);
      } else {
        setSpecs([]);
      }
      
      setCurrentStep(1);
      setMethod('manual');
    } else if (isOpen && !initialData) {
      setFormData({
        workType: '',
        name: '',
        description: '',
      });
      setSpecs([]);
      setCurrentStep(1);
      setMethod('manual');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (isEditMode) {
      // Handle edit mode
      const templateData = {
        ...formData,
        specs,
        items: getAllItems(),
        totalItems: getAllItems().length,
        totalValue: getAllItems().reduce((sum, item) => sum + item.price, 0),
        createdDate: initialData?.createdDate || new Date().toISOString(),
        status: initialData?.status || 'active'
      };
      onSubmit(templateData);
    } else {
      // Handle create mode with API calls
      handleSaveTemplate();
    }
  };

  // Save template with specs and details
  const handleSaveTemplate = async () => {
    if (!createdTemplateId) {
      alert('Template not created yet. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create specs
      const specsPayload = specs.map(spec => ({
        name: spec.name,
        bomTemplateId: createdTemplateId
      }));

      const specsResponse = await createBOMTemplateSpecs(specsPayload);
      const createdSpecs = specsResponse.data || [];

      // Step 2: Create details
      const detailsPayload: any[] = [];
      specs.forEach((spec, specIndex) => {
        const specId = createdSpecs[specIndex]?.id;
        if (specId) {
          spec.items.forEach(item => {
            detailsPayload.push({
              bomTemplateId: createdTemplateId,
              bomTemplateSpecId: specId,
              itemId: item.id,
              quantity: item.quantity
            });
          });
        }
      });

      if (detailsPayload.length > 0) {
        await createBOMTemplateDetails(detailsPayload);
      }

      // Success - close modal and reset
      const templateData = {
        ...formData,
        specs,
        items: getAllItems(),
        totalItems: getAllItems().length,
        totalValue: getAllItems().reduce((sum, item) => sum + item.price, 0),
        createdDate: new Date().toISOString(),
        status: 'active'
      };
      
      onSubmit(templateData);
      
      // Reset form
      setCurrentStep(1);
      setCreatedTemplateId(null);
      setFormData({
        workType: '',
        name: '',
        description: '',
      });
      setSpecs([]);
      setMethod('manual');
      setCsvFile(null);
    } catch (error) {
      console.error('Error saving BOM template specs/details:', error);
      alert('Failed to save BOM template details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 min-h-[540px] sm:min-h-[600px] md:min-h-[650px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit BOM Template' : 'Create BOM Template'}
            </h3>
            {method === 'manual' && (
              <nav className="flex items-center space-x-2 mt-1" aria-label="Breadcrumb">
                <span
                  className={`text-xs font-medium cursor-pointer ${currentStep === 1 ? 'text-blue-700 underline' : 'text-gray-500 hover:underline'}`}
                  onClick={() => isEditMode && setCurrentStep(1)}
                  style={isEditMode ? { pointerEvents: 'auto' } : { pointerEvents: 'none' }}
                >
                  Step 1: Template Details
                </span>
                <span className="text-gray-400">→</span>
                <span
                  className={`text-xs font-medium cursor-pointer ${currentStep === 2 ? 'text-blue-700 underline' : 'text-gray-500 hover:underline'}`}
                  onClick={() => isEditMode && setCurrentStep(2)}
                  style={isEditMode ? { pointerEvents: 'auto' } : { pointerEvents: 'none' }}
                >
                  Step 2: Add Items
                </span>
              </nav>
            )}
            {method === 'upload' && (
              <p className="text-xs text-gray-500 mt-1">Upload a CSV file to create a BOM template</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Method Selection */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <label className="block text-xs font-medium text-gray-700 mb-2">Choose Method</label>
          <div className="flex space-x-4">
            <button
              onClick={() => { setMethod('manual'); setCurrentStep(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                method === 'manual' 
                  ? 'bg-blue-600 text-white border border-blue-600 shadow'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Manual Creation
            </button>
            <button
              onClick={() => { setMethod('upload'); setCurrentStep(1); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                method === 'upload' 
                  ? 'bg-blue-600 text-white border border-blue-600 shadow'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Upload from CSV
            </button>
          </div>
        </div>

        <div
          className="
            flex-1
            p-6
            overflow-y-auto
            min-h-[350px] sm:min-h-[400px] md:min-h-[450px]
          "
        >
          {method === 'manual' ? (
            <>
              {/* Step 1: Define Template Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Work Type *
                    </label>
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Work Type</option>
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      BOM Template Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Add BOM Items */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Add Spec Button */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-700">Build Specs</h4>
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
                      {specs.map(spec => (
                        <SpecSection key={spec.id} spec={spec} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                      <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No specs created yet</p>
                      <p className="text-sm">Click "Add Spec" to create your first spec</p>
                    </div>
                  )}
                  
                  {/* Validation Messages */}
                  {specs.length > 0 && (
                    <div className="mt-4">
                      {specs.some(spec => !spec.name.trim()) && (
                        <p className="text-sm text-red-500 mb-2">⚠️ All specs must have a name</p>
                      )}
                      {specs.some(spec => spec.items.length === 0) && (
                        <p className="text-sm text-red-500 mb-2">⚠️ All specs must contain at least one item</p>
                      )}
                    </div>
                  )}
                  
                  {/* Summary */}
                  {specs.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Template Summary</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Specs:</span>
                          <span className="ml-2 font-medium">{specs.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Items:</span>
                          <span className="ml-2 font-medium">{getAllItems().length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Value:</span>
                          <span className="ml-2 font-medium text-green-600">
                            ₹{getAllItems().reduce((sum, item) => sum + item.price, 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file to create a BOM template
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  The CSV must include columns for BOM Template Name, Work Type, Item Code, Quantity, and Description
                </p>
                <div className="flex flex-col items-center space-y-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  {csvFile && (
                    <div className="text-sm text-gray-900">
                      Selected file: {csvFile.name}
                    </div>
                  )}
                  <button
                    onClick={handleUploadTemplate}
                    disabled={!csvFile}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </button>
                </div>
                <div className="mt-4">
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      // In a real app, this would download a template CSV
                      alert('Template download would start here');
                    }}
                  >
                    Download CSV Template
                  </a>
                </div>
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
          {method === 'manual' ? (
            <>
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
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSaveTemplate() || isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Updating...' : 'Update Template'}
                  </button>
                ) : (
                  currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!formData.workType || !formData.name || isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : 'Next'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSaveTemplate() || isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Template'}
                    </button>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex w-full justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSaveTemplate() || isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Delete Spec Confirmation Modal */}
    {showDeleteSpecModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Delete Spec</h3>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this spec? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={() => setShowDeleteSpecModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => specToDelete && deleteSpec(specToDelete)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CreateBOMTemplate;
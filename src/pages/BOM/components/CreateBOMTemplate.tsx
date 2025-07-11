import React, { useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Upload, Search } from 'lucide-react';

interface CreateBOMTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateData: any) => void;
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

const CreateBOMTemplate: React.FC<CreateBOMTemplateProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState<'manual' | 'upload'>('manual');
  const [formData, setFormData] = useState({
    workType: '',
    name: '',
    description: '',
  });
  const [items, setItems] = useState<BOMItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [specification, setSpecification] = useState<string>('');
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Mock data for dropdowns
  const workTypes = ['Basement Ventilation', 'HVAC Systems', 'Fire Safety', 'Electrical', 'Plumbing'];
  
  // Mock data for master items
  const masterItems = [
    { id: '1', itemCode: 'FAN-001', itemName: 'Industrial Exhaust Fan', uomName: 'Nos', rate: 12500 },
    { id: '2', itemCode: 'DUCT-001', itemName: 'Galvanized Steel Duct', uomName: 'Meter', rate: 850 },
    { id: '3', itemCode: 'DAMPER-001', itemName: 'Fire Damper', uomName: 'Nos', rate: 3200 },
    { id: '4', itemCode: 'SENSOR-001', itemName: 'CO2 Sensor', uomName: 'Nos', rate: 1800 },
    { id: '5', itemCode: 'CABLE-001', itemName: 'Electrical Cable', uomName: 'Meter', rate: 120 },
    { id: '6', itemCode: 'PANEL-001', itemName: 'Control Panel', uomName: 'Nos', rate: 25000 },
    { id: '7', itemCode: 'FILTER-001', itemName: 'HEPA Filter', uomName: 'Nos', rate: 4500 },
    { id: '8', itemCode: 'PIPE-001', itemName: 'PVC Pipe', uomName: 'Meter', rate: 350 },
  ];

  const filteredItems = masterItems.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = () => {
    if (selectedItem && quantity > 0) {
      const newItem: BOMItem = {
        id: Date.now().toString(),
        itemCode: selectedItem.itemCode,
        itemName: selectedItem.itemName,
        uomName: selectedItem.uomName,
        rate: selectedItem.rate,
        quantity: quantity,
        price: selectedItem.rate * quantity,
        specifications: specification
      };

      setItems(prev => [...prev, newItem]);
      setSelectedItem(null);
      setQuantity(1);
      setSpecification('');
    }
  };

  const handleEditItem = (item: BOMItem) => {
    setSelectedItem({
      id: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      uomName: item.uomName,
      rate: item.rate
    });
    setQuantity(item.quantity);
    setSpecification(item.specifications || '');
    setEditingItemId(item.id);
  };

  const handleUpdateItem = () => {
    if (selectedItem && quantity > 0 && editingItemId) {
      setItems(prev => prev.map(item => 
        item.id === editingItemId ? {
          ...item,
          quantity: quantity,
          price: selectedItem.rate * quantity,
          specifications: specification
        } : item
      ));
      setSelectedItem(null);
      setQuantity(1);
      setSpecification('');
      setEditingItemId(null);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
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
      
      setItems([
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
      ]);
      
      setCurrentStep(2);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.workType && formData.name) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const templateData = {
      ...formData,
      items,
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.price, 0),
      createdDate: new Date().toISOString(),
      status: 'active'
    };
    
    onSubmit(templateData);
    
    // Reset form
    setCurrentStep(1);
    setFormData({
      workType: '',
      name: '',
      description: '',
    });
    setItems([]);
    setMethod('manual');
    setCsvFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create BOM Template</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Method Selection */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setMethod('manual')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                method === 'manual' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              Manual Creation
            </button>
            <button
              onClick={() => setMethod('upload')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                method === 'upload' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              Upload from CSV
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {method === 'manual' ? (
            <>
              {/* Step 1: Define Template Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Add BOM Items */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template description"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Items</h4>
                    
                    <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search items by name or code"
                          />
                        </div>
                      </div>
                      
                      <div className="w-24">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Qty"
                          disabled={!selectedItem}
                        />
                      </div>
                      
                      <button
                        onClick={editingItemId ? handleUpdateItem : handleAddItem}
                        disabled={!selectedItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {editingItemId ? 'Update' : 'Add'}
                      </button>
                    </div>

                    {/* Search Results */}
                    {searchQuery && !selectedItem && (
                      <div className="border border-gray-200 rounded-md mb-4 max-h-40 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map(item => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedItem(item)}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filteredItems.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-2 text-sm text-gray-500 text-center">No items found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Selected Item */}
                    {selectedItem && (
                      <div className="border border-gray-200 rounded-md p-4 mb-4 bg-blue-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium text-gray-900">Selected Item</h5>
                          <button
                            onClick={() => {
                              setSelectedItem(null);
                              setEditingItemId(null);
                              setQuantity(1);
                              setSpecification('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Item Code:</span> {selectedItem.itemCode}
                          </div>
                          <div>
                            <span className="text-gray-500">Item Name:</span> {selectedItem.itemName}
                          </div>
                          <div>
                            <span className="text-gray-500">UOM:</span> {selectedItem.uomName}
                          </div>
                          <div>
                            <span className="text-gray-500">Rate:</span> ₹{selectedItem.rate.toLocaleString('en-IN')}
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span> ₹{(selectedItem.rate * quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => setShowSpecModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Add Specification
                          </button>
                        </div>
                      </div>
                    )}

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
                                    onClick={() => handleEditItem(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAddSpecification(item.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Plus className="h-4 w-4" />
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
                                No items added yet. Search and add items above.
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
                
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!formData.workType || !formData.name}
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
                    Save Template
                  </button>
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
                  disabled={items.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBOMTemplate;
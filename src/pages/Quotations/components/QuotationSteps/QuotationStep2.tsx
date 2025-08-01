import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface QuotationStep2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep2: React.FC<QuotationStep2Props> = ({ formData, setFormData }) => {
  const [expandedSections, setExpandedSections] = useState({
    project: true,
    supervision: true,
    finance: true,
    contingency: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const addCostItem = (section: 'projectCosts' | 'supervisionCosts' | 'financeCosts' | 'contingencyCosts') => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      nosPercentage: 0,
      monthlyExpense: 0,
      months: 0,
      diversity: 0,
      total: 0
    };

    setFormData({
      ...formData,
      [section]: [...(formData[section] || []), newItem]
    });
  };

  const updateCostItem = (section: 'projectCosts' | 'supervisionCosts' | 'financeCosts' | 'contingencyCosts', index: number, field: string, value: any) => {
    const updatedItems = [...(formData[section] || [])];
    updatedItems[index][field] = value;
    
    // Calculate total
    if (field !== 'description') {
      const item = updatedItems[index];
      item.total = (item.monthlyExpense * item.months) * item.diversity * item.nosPercentage;
    }
    
    setFormData({
      ...formData,
      [section]: updatedItems
    });
  };

  const removeCostItem = (section: 'projectCosts' | 'supervisionCosts' | 'financeCosts' | 'contingencyCosts', index: number) => {
    const updatedItems = [...(formData[section] || [])];
    updatedItems.splice(index, 1);
    
    setFormData({
      ...formData,
      [section]: updatedItems
    });
  };

  // Calculate section totals
  const totalProjectCost = (formData.projectCosts || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const totalSupervisionCost = (formData.supervisionCosts || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const totalFinanceCost = (formData.financeCosts || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const totalContingencyCost = (formData.contingencyCosts || []).reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const totalOverheadsCost = totalProjectCost + totalSupervisionCost + totalFinanceCost + totalContingencyCost;

  // Calculate summary values - material and labour costs from step 1 grand totals
  const materialCost = formData.materialCost || 0;
  const labourCost = formData.labourCost || 0;

  const totalOwnCost = materialCost + labourCost;
  const contractValue = formData.contractValue || 0;

  // Update formData with calculated totals
  React.useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      totalOwnCost,
      materialCost,
      labourCost,
      totalOverheadsCost,
      contractValue: prev.contractValue || 0
    }));
  }, [totalOwnCost, setFormData, materialCost, labourCost, totalOverheadsCost]);

  const handleSummaryChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({
      ...formData,
      [field]: numValue
    });
  };

  const renderCostSection = (
    title: string,
    sectionKey: 'projectCosts' | 'supervisionCosts' | 'financeCosts' | 'contingencyCosts',
    expandKey: 'project' | 'supervision' | 'finance' | 'contingency',
    total: number
  ) => {
    const items = formData[sectionKey] || [];
    
    return (
      <div className="border border-gray-200 rounded-lg">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection(expandKey)}
        >
          <div className="flex items-center space-x-2">
            {expandedSections[expandKey] ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
            <h4 className="text-md font-medium text-gray-900">{title}</h4>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-green-600">
              Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addCostItem(sectionKey);
              }}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </button>
          </div>
        </div>
        
        {expandedSections[expandKey] && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nos / % Age</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateCostItem(sectionKey, index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter description"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.nosPercentage || 0}
                          onChange={(e) => updateCostItem(sectionKey, index, 'nosPercentage', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.monthlyExpense || 0}
                          onChange={(e) => updateCostItem(sectionKey, index, 'monthlyExpense', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.months || 0}
                          onChange={(e) => updateCostItem(sectionKey, index, 'months', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.diversity || 0}
                          onChange={(e) => updateCostItem(sectionKey, index, 'diversity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        ₹{(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeCostItem(sectionKey, index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 text-center">
                        No items added yet. Click "Add" to create the first item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Management & Site Establishment Cost</h3>
        <p className="text-sm text-gray-600">Calculate overhead costs associated with this project.</p>
      </div>

      {/* Four Cost Sections */}
      <div className="space-y-4">
        {renderCostSection(
          'Project Management & Site Establishment Cost',
          'projectCosts',
          'project',
          totalProjectCost
        )}
        
        {renderCostSection(
          'Supervision',
          'supervisionCosts',
          'supervision',
          totalSupervisionCost
        )}
        
        {renderCostSection(
          'Finance Cost',
          'financeCosts',
          'finance',
          totalFinanceCost
        )}
        
        {renderCostSection(
          'Contingencies',
          'contingencyCosts',
          'contingency',
          totalContingencyCost
        )}
      </div>

      {/* Summary Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Overheads Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹{totalOverheadsCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹{materialCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labour Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹{labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Own Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹{totalOwnCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Value
            </label>
            <input
              type="number"
              value={contractValue}
              onChange={(e) => handleSummaryChange('contractValue', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Auto: ₹${(totalOwnCost + totalOverheadsCost).toLocaleString('en-IN')}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationStep2;
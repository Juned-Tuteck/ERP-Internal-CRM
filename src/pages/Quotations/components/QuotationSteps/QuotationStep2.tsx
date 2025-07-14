import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

interface QuotationStep2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep2: React.FC<QuotationStep2Props> = ({ formData, setFormData }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [costCategory, setCostCategory] = useState<'supervision' | 'finance' | 'contingency'>('supervision');
  const [costItem, setCostItem] = useState({
    description: '',
    nosPercentage: '',
    monthlyExpense: '',
    months: '',
    diversity: '',
    amount: 0
  });

  // Mock data for dropdowns
  const supervisionDescriptions = ['Project Manager', 'Site Engineer', 'Safety Officer', 'Quality Control Engineer'];
  const financeDescriptions = ['Bank Guarantee', 'Insurance', 'Letter of Credit', 'Processing Fee'];
  const contingencyDescriptions = ['Project Contingency', 'Weather Contingency', 'Material Price Fluctuation', 'Labor Shortage'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCostItem({
      ...costItem,
      [name]: value
    });

    // Calculate amount if all required fields are filled
    if (name === 'nosPercentage' || name === 'monthlyExpense' || name === 'months' || name === 'diversity') {
      if (costItem.nosPercentage && costItem.monthlyExpense && costItem.months && costItem.diversity) {
        const nos = parseFloat(costItem.nosPercentage);
        const expense = parseFloat(costItem.monthlyExpense);
        const months = parseFloat(costItem.months);
        const diversity = parseFloat(costItem.diversity) / 100;
        
        const amount = nos * expense * months * diversity;
        setCostItem(prev => ({
          ...prev,
          amount: amount
        }));
      }
    }
  };

  const handleAddCost = () => {
    const newCost = {
      id: Date.now().toString(),
      ...costItem
    };

    if (costCategory === 'supervision') {
      setFormData({
        ...formData,
        supervisionCosts: [...formData.supervisionCosts, newCost]
      });
    } else if (costCategory === 'finance') {
      setFormData({
        ...formData,
        financeCosts: [...formData.financeCosts, newCost]
      });
    } else if (costCategory === 'contingency') {
      setFormData({
        ...formData,
        contingencyCosts: [...formData.contingencyCosts, newCost]
      });
    }

    // Reset form
    setCostItem({
      description: '',
      nosPercentage: '',
      monthlyExpense: '',
      months: '',
      diversity: '',
      amount: 0
    });
    setShowAddModal(false);
  };

  const handleRemoveCost = (category: 'supervision' | 'finance' | 'contingency', id: string) => {
    if (category === 'supervision') {
      setFormData({
        ...formData,
        supervisionCosts: formData.supervisionCosts.filter((cost: any) => cost.id !== id)
      });
    } else if (category === 'finance') {
      setFormData({
        ...formData,
        financeCosts: formData.financeCosts.filter((cost: any) => cost.id !== id)
      });
    } else if (category === 'contingency') {
      setFormData({
        ...formData,
        contingencyCosts: formData.contingencyCosts.filter((cost: any) => cost.id !== id)
      });
    }
  };

  const openAddModal = (category: 'supervision' | 'finance' | 'contingency') => {
    setCostCategory(category);
    setShowAddModal(true);
  };

  // Calculate totals
  const totalSupervisionCost = formData.supervisionCosts.reduce((sum: number, cost: any) => sum + parseFloat(cost.amount || 0), 0);
  const totalFinanceCost = formData.financeCosts.reduce((sum: number, cost: any) => sum + parseFloat(cost.amount || 0), 0);
  const totalContingencyCost = formData.contingencyCosts.reduce((sum: number, cost: any) => sum + parseFloat(cost.amount || 0), 0);
  const totalOverheadsCost = totalSupervisionCost + totalFinanceCost + totalContingencyCost;

  return (
    <div className="space-y-6">
      {/* Supervision Costs */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Supervision Costs</h4>
          <button
            type="button"
            onClick={() => openAddModal('supervision')}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOS / %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Expense</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Months</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diversity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.supervisionCosts.map((cost: any) => (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cost.description}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{cost.nosPercentage}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{parseFloat(cost.monthlyExpense).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{cost.months}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{cost.diversity}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(cost.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleRemoveCost('supervision', cost.id)}
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
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{totalSupervisionCost.toLocaleString('en-IN')}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Finance Costs */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Finance Costs</h4>
          <button
            type="button"
            onClick={() => openAddModal('finance')}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.financeCosts.map((cost: any) => (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cost.description}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{cost.nosPercentage}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(cost.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleRemoveCost('finance', cost.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {formData.financeCosts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">
                  No finance costs added yet.
                </td>
              </tr>
            )}
          </tbody>
          {formData.financeCosts.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-4 py-2 text-sm font-medium text-right">Total Finance Cost:</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{totalFinanceCost.toLocaleString('en-IN')}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Contingencies */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Contingencies</h4>
          <button
            type="button"
            onClick={() => openAddModal('contingency')}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formData.contingencyCosts.map((cost: any) => (
              <tr key={cost.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{cost.description}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{cost.nosPercentage}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{parseFloat(cost.amount).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleRemoveCost('contingency', cost.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {formData.contingencyCosts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">
                  No contingency costs added yet.
                </td>
              </tr>
            )}
          </tbody>
          {formData.contingencyCosts.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-4 py-2 text-sm font-medium text-right">Total Contingency Cost:</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{totalContingencyCost.toLocaleString('en-IN')}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Total Overheads */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between font-medium">
          <span className="text-md text-gray-900">Total Overheads Cost:</span>
          <span className="text-md text-gray-900">₹{totalOverheadsCost.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Add Cost Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add {costCategory === 'supervision' ? 'Supervision' : costCategory === 'finance' ? 'Finance' : 'Contingency'} Cost
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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
                    name="description"
                    value={costItem.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Description</option>
                    {costCategory === 'supervision' && supervisionDescriptions.map(desc => (
                      <option key={desc} value={desc}>{desc}</option>
                    ))}
                    {costCategory === 'finance' && financeDescriptions.map(desc => (
                      <option key={desc} value={desc}>{desc}</option>
                    ))}
                    {costCategory === 'contingency' && contingencyDescriptions.map(desc => (
                      <option key={desc} value={desc}>{desc}</option>
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
                        name="nosPercentage"
                        value={costItem.nosPercentage}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Expense (₹) *
                      </label>
                      <input
                        type="number"
                        name="monthlyExpense"
                        value={costItem.monthlyExpense}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Months *
                      </label>
                      <input
                        type="number"
                        name="months"
                        value={costItem.months}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter months"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diversity (%) *
                      </label>
                      <input
                        type="number"
                        name="diversity"
                        value={costItem.diversity}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter percentage"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Percentage (%) *
                      </label>
                      <input
                        type="number"
                        name="nosPercentage"
                        value={costItem.nosPercentage}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter percentage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={costItem.amount}
                        onChange={(e) => setCostItem({...costItem, amount: parseFloat(e.target.value) || 0})}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCost}
                disabled={!costItem.description || (costCategory === 'supervision' && (!costItem.nosPercentage || !costItem.monthlyExpense || !costItem.months || !costItem.diversity)) || (costCategory !== 'supervision' && (!costItem.nosPercentage || !costItem.amount))}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Cost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationStep2;
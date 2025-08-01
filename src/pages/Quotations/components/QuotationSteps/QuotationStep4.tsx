import React, { useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuotationStep4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep4: React.FC<QuotationStep4Props> = ({ formData, setFormData }) => {
  const [expandedSpecs, setExpandedSpecs] = React.useState<Record<string, boolean>>({});

  // Initialize GST rates if not exists
  useEffect(() => {
    if (!formData.gstRates) {
      setFormData(prev => ({
        ...prev,
        gstRates: {
          highSideSupply: 18,
          lowSideSupply: 18,
          installation: 18
        }
      }));
    }
  }, []);

  const toggleSpecExpansion = (specId: string) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  // Group items by material type and calculate amounts
  const groupItemsByMaterialType = () => {
    const groups = {
      'HIGH SIDE SUPPLY': { items: [], totalAmount: 0 },
      'LOW SIDE SUPPLY': { items: [], totalAmount: 0 },
      'INSTALLATION': { items: [], totalAmount: 0 }
    };

    if (formData.specs) {
      formData.specs.forEach((spec: any) => {
        spec.items.forEach((item: any) => {
          const materialType = item.materialType || 'INSTALLATION';
          const totalAmount = (item.supplyOwnAmount || 0) + (item.installationOwnAmount || 0);
          
          groups[materialType as keyof typeof groups].items.push({
            ...item,
            specName: spec.name,
            totalAmount
          });
          groups[materialType as keyof typeof groups].totalAmount += totalAmount;
        });
      });
    }

    return groups;
  };

  const groupedItems = groupItemsByMaterialType();

  // Calculate amounts without GST based on grouped items
  const highSideAmount = groupedItems['HIGH SIDE SUPPLY'].totalAmount;
  const lowSideAmount = groupedItems['LOW SIDE SUPPLY'].totalAmount;
  const installationAmount = groupedItems['INSTALLATION'].totalAmount;

  // Calculate amounts with GST
  const highSideGST = formData.gstRates?.highSideSupply || 18;
  const lowSideGST = formData.gstRates?.lowSideSupply || 18;
  const installationGST = formData.gstRates?.installation || 18;

  const highSideWithGST = highSideAmount * (1 + highSideGST / 100);
  const lowSideWithGST = lowSideAmount * (1 + lowSideGST / 100);
  const installationWithGST = installationAmount * (1 + installationGST / 100);

  const totalWithoutGST = highSideAmount + lowSideAmount + installationAmount;
  const totalWithGST = highSideWithGST + lowSideWithGST + installationWithGST;

  const handleGSTChange = (category: 'highSideSupply' | 'lowSideSupply' | 'installation', value: string) => {
    const gstValue = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      gstRates: {
        ...prev.gstRates,
        [category]: gstValue
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Final Costing Sheet</h3>
        <p className="text-sm text-gray-600">Consolidated item-level costs with GST calculations.</p>
      </div>

      {/* BOM Items Display - Same as Step 1 but Read-only */}
      {formData.specs && formData.specs.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700">BOM Items (Read-only)</h4>
          
          {formData.specs.map((spec: any) => (
            <div key={spec.id} className="border border-gray-200 rounded-lg">
              {/* Spec Header */}
              <div 
                className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSpecExpansion(spec.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedSpecs[spec.id] ? (
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
              {expandedSpecs[spec.id] && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {spec.items.map((item: any) => (
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
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.supplyRate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.supplyOwnAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.installationRate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{(item.installationOwnAmount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Table - GST and Final Cost Breakdown */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">GST and Final Cost Breakdown (Grouped by Material Type)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Without GST</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount With GST</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">HIGH SIDE SUPPLY</td>
                <td className="px-4 py-3 text-sm text-gray-500">{groupedItems['HIGH SIDE SUPPLY'].items.length} items</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={highSideGST}
                    onChange={(e) => handleGSTChange('highSideSupply', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{highSideAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">₹{highSideWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">LOW SIDE SUPPLY</td>
                <td className="px-4 py-3 text-sm text-gray-500">{groupedItems['LOW SIDE SUPPLY'].items.length} items</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={lowSideGST}
                    onChange={(e) => handleGSTChange('lowSideSupply', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{lowSideAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">₹{lowSideWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">INSTALLATION</td>
                <td className="px-4 py-3 text-sm text-gray-500">{groupedItems['INSTALLATION'].items.length} items</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={installationGST}
                    onChange={(e) => handleGSTChange('installation', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{installationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">₹{installationWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL BASIC OF SITC</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{Object.values(groupedItems).reduce((sum, group) => sum + group.items.length, 0)} items</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{totalWithoutGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">₹{totalWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">Total GST Amount</h5>
          <p className="text-lg font-bold text-blue-600">
            ₹{(totalWithGST - totalWithoutGST).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">Total Without GST</h5>
          <p className="text-lg font-bold text-gray-900">
            ₹{totalWithoutGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">Grand Total With GST</h5>
          <p className="text-xl font-bold text-green-600">
            ₹{totalWithGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Update formData with final calculations */}
      {React.useEffect(() => {
        setFormData((prev: any) => ({
          ...prev,
          finalCosting: {
            groupedItems,
            highSideAmount,
            lowSideAmount,
            installationAmount,
            highSideWithGST,
            lowSideWithGST,
            installationWithGST,
            totalWithoutGST,
            totalWithGST,
            totalGSTAmount: totalWithGST - totalWithoutGST
          }
        }));
      }, [groupedItems, highSideAmount, lowSideAmount, installationAmount, highSideWithGST, lowSideWithGST, installationWithGST, totalWithoutGST, totalWithGST])}
    </div>
  );
};

export default QuotationStep4;
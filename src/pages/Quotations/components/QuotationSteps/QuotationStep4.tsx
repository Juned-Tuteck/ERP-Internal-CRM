import React, { useEffect } from 'react';

interface QuotationStep4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep4: React.FC<QuotationStep4Props> = ({ formData, setFormData }) => {
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

  // Categorize items for display
  const categorizeItems = () => {
    // Get items from specs structure or fallback to items array
    const items = formData.specs ? 
      formData.specs.flatMap((spec: any) => spec.items || []) :
      (formData.items || []);
    
    const categorizedItems = [];

    items.forEach((item: any) => {
      // Add HIGH SIDE SUPPLY entry (assuming 60% of supply)
      if (item.finalSupplyAmount > 0) {
        const highSideAmount = item.finalSupplyAmount * 0.6;
        categorizedItems.push({
          itemType: 'HIGH SIDE SUPPLY',
          itemName: item.itemName,
          itemCode: item.itemCode,
          uomName: item.uomName,
          supplyRate: item.supplyRate,
          installationRate: 0,
          quantity: item.quantity,
          supplyPrice: highSideAmount,
          installationPrice: 0
        });

        // Add LOW SIDE SUPPLY entry (remaining 40% of supply)
        const lowSideAmount = item.finalSupplyAmount * 0.4;
        categorizedItems.push({
          itemType: 'LOW SIDE SUPPLY',
          itemName: item.itemName,
          itemCode: item.itemCode,
          uomName: item.uomName,
          supplyRate: item.supplyRate,
          installationRate: 0,
          quantity: item.quantity,
          supplyPrice: lowSideAmount,
          installationPrice: 0
        });
      }

      // Add INSTALLATION entry
      if (item.finalInstallationAmount > 0) {
        categorizedItems.push({
          itemType: 'INSTALLATION',
          itemName: item.itemName,
          itemCode: item.itemCode,
          uomName: item.uomName,
          supplyRate: 0,
          installationRate: item.installationRate,
          quantity: item.quantity,
          supplyPrice: 0,
          installationPrice: item.finalInstallationAmount
        });
      }
    });

    return categorizedItems;
  };

  const categorizedItems = categorizeItems();

  // Calculate amounts without GST
  const highSideAmount = categorizedItems
    .filter(item => item.itemType === 'HIGH SIDE SUPPLY')
    .reduce((sum, item) => sum + item.supplyPrice, 0);
  
  const lowSideAmount = categorizedItems
    .filter(item => item.itemType === 'LOW SIDE SUPPLY')
    .reduce((sum, item) => sum + item.supplyPrice, 0);
  
  const installationAmount = categorizedItems
    .filter(item => item.itemType === 'INSTALLATION')
    .reduce((sum, item) => sum + item.installationPrice, 0);

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

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'HIGH SIDE SUPPLY':
        return 'bg-blue-100 text-blue-800';
      case 'LOW SIDE SUPPLY':
        return 'bg-green-100 text-green-800';
      case 'INSTALLATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Final Costing Sheet</h3>
        <p className="text-sm text-gray-600">Consolidated item-level costs with GST calculations.</p>
      </div>

      {/* Top Table - Item-wise Details (Display Only) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Item-wise Details</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorizedItems.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getItemTypeColor(item.itemType)}`}>
                      {item.itemType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.itemCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.uomName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.supplyRate > 0 ? `₹${item.supplyRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.installationRate > 0 ? `₹${item.installationRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.supplyPrice > 0 ? `₹${item.supplyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.installationPrice > 0 ? `₹${item.installationPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                </tr>
              ))}
              {categorizedItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-sm text-gray-500 text-center">
                    No items available. Please complete Step 1 first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Table - GST and Final Cost Breakdown */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">GST and Final Cost Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Without GST</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount With GST</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">HIGH SIDE SUPPLY</td>
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
            categorizedItems,
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
      }, [categorizedItems, highSideAmount, lowSideAmount, installationAmount, highSideWithGST, lowSideWithGST, installationWithGST, totalWithoutGST, totalWithGST])}
    </div>
  );
};

export default QuotationStep4;
import React from 'react';

interface QuotationStep4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep4: React.FC<QuotationStep4Props> = ({ formData, setFormData }) => {
  const handleGSTRateChange = (category: 'highSideSupply' | 'lowSideSupply' | 'installation', value: string) => {
    setFormData({
      ...formData,
      gstRates: {
        ...formData.gstRates,
        [category]: parseFloat(value) || 0
      }
    });
  };

  // Calculate high side and low side supply amounts (example: 40% high side, 60% low side)
  const totalSupplyAmount = formData.supplyData.sellingAmount;
  const highSideSupplyAmount = totalSupplyAmount * 0.4;
  const lowSideSupplyAmount = totalSupplyAmount * 0.6;
  const installationAmount = formData.labourData.sellingAmount;

  // Calculate GST amounts
  const highSideGSTAmount = (formData.gstRates.highSideSupply / 100) * highSideSupplyAmount;
  const lowSideGSTAmount = (formData.gstRates.lowSideSupply / 100) * lowSideSupplyAmount;
  const installationGSTAmount = (formData.gstRates.installation / 100) * installationAmount;
  
  // Calculate totals with GST
  const highSideTotalWithGST = highSideSupplyAmount + highSideGSTAmount;
  const lowSideTotalWithGST = lowSideSupplyAmount + lowSideGSTAmount;
  const installationTotalWithGST = installationAmount + installationGSTAmount;
  
  // Grand total
  const totalGSTAmount = highSideGSTAmount + lowSideGSTAmount + installationGSTAmount;
  const grandTotalWithGST = highSideTotalWithGST + lowSideTotalWithGST + installationTotalWithGST;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Final Costing Sheet</h3>
        <p className="text-sm text-gray-600">Customer-facing summary of costs.</p>
      </div>
      
      {/* Itemized List */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Itemized List</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item: any) => {
                // Calculate selling rates based on MF (markup factor)
                const supplySellingRate = item.supplyRate * (formData.supplyData.mf || 1);
                const installSellingRate = item.installationRate * (formData.labourData.mf || 1);
                const supplySellingPrice = supplySellingRate * item.quantity;
                const installSellingPrice = installSellingRate * item.quantity;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{supplySellingRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{supplySellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installSellingRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{installSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Subtotal:</td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{formData.supplyData.sellingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                <td></td>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{formData.labourData.sellingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* GST Summary */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">GST Summary</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">High Side Supply</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{highSideSupplyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.highSideSupply}
                  onChange={(e) => handleGSTRateChange('highSideSupply', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{highSideGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{highSideTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Low Side Supply</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{lowSideSupplyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.lowSideSupply}
                  onChange={(e) => handleGSTRateChange('lowSideSupply', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{lowSideGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{lowSideTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Installation</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installationAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <input
                  type="number"
                  value={formData.gstRates.installation}
                  onChange={(e) => handleGSTRateChange('installation', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">₹{installationGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{installationTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">Grand Total:</td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{totalGSTAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 text-sm font-medium text-green-600">₹{grandTotalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default QuotationStep4;
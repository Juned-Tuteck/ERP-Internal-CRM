import React, { useEffect } from 'react';

interface QuotationStep3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep3: React.FC<QuotationStep3Props> = ({ formData, setFormData }) => {
  // Calculate total supply and installation amounts from items
  const totalSupplyOwnAmount = formData.items.reduce(
    (sum: number, item: any) => sum + (item.supplyOwnAmount || 0), 
    0
  );
  
  const totalInstallationOwnAmount = formData.items.reduce(
    (sum: number, item: any) => sum + (item.installationOwnAmount || 0), 
    0
  );

  // Calculate total SITC own amount (Supply + Installation)
  const totalSITCOwnAmount = totalSupplyOwnAmount + totalInstallationOwnAmount;

  // Update form data when own amounts change
  useEffect(() => {
    // Update supply data
    const supplyOverheadsAmount = (formData.supplyData.overheadsPercentage / 100) * totalSupplyOwnAmount;
    const supplySubtotal1 = totalSupplyOwnAmount + supplyOverheadsAmount;
    const supplyMarginAmount = (formData.supplyData.marginPercentage / 100) * supplySubtotal1;
    const supplySubtotal2 = supplySubtotal1 + supplyMarginAmount;
    const supplySellingAmount = supplySubtotal2;
    const supplyMF = supplySellingAmount / totalSupplyOwnAmount;

    // Update labour data
    const labourOverheadsAmount = (formData.labourData.overheadsPercentage / 100) * totalInstallationOwnAmount;
    const labourSubtotal1 = totalInstallationOwnAmount + labourOverheadsAmount;
    const labourMarginAmount = (formData.labourData.marginPercentage / 100) * labourSubtotal1;
    const labourSubtotal2 = labourSubtotal1 + labourMarginAmount;
    const labourSellingAmount = labourSubtotal2;
    const labourMF = labourSellingAmount / totalInstallationOwnAmount;

    // Update SITC data
    const sitcOverheadsAmount = (formData.sitcData.overheadsPercentage / 100) * totalSITCOwnAmount;
    const sitcSubtotal1 = totalSITCOwnAmount + sitcOverheadsAmount;
    const sitcMarginAmount = (formData.sitcData.marginPercentage / 100) * sitcSubtotal1;
    const sitcSubtotal2 = sitcSubtotal1 + sitcMarginAmount;
    const sitcSellingAmount = sitcSubtotal2;
    const sitcMF = sitcSellingAmount / totalSITCOwnAmount;

    setFormData({
      ...formData,
      supplyData: {
        ...formData.supplyData,
        ownAmount: totalSupplyOwnAmount,
        overheadsAmount: supplyOverheadsAmount,
        subtotal1: supplySubtotal1,
        marginAmount: supplyMarginAmount,
        subtotal2: supplySubtotal2,
        sellingAmount: supplySellingAmount,
        mf: supplyMF
      },
      labourData: {
        ...formData.labourData,
        ownAmount: totalInstallationOwnAmount,
        overheadsAmount: labourOverheadsAmount,
        subtotal1: labourSubtotal1,
        marginAmount: labourMarginAmount,
        subtotal2: labourSubtotal2,
        sellingAmount: labourSellingAmount,
        mf: labourMF
      },
      sitcData: {
        ...formData.sitcData,
        ownAmount: totalSITCOwnAmount,
        overheadsAmount: sitcOverheadsAmount,
        subtotal1: sitcSubtotal1,
        marginAmount: sitcMarginAmount,
        subtotal2: sitcSubtotal2,
        sellingAmount: sitcSellingAmount,
        mf: sitcMF
      }
    });
  }, [totalSupplyOwnAmount, totalInstallationOwnAmount, totalSITCOwnAmount]);

  const handleInputChange = (section: 'supply' | 'labour' | 'sitc', field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (section === 'supply') {
      let updatedSupplyData = { ...formData.supplyData, [field]: numValue };
      
      // Recalculate dependent values
      if (field === 'overheadsPercentage') {
        updatedSupplyData.overheadsAmount = (numValue / 100) * updatedSupplyData.ownAmount;
        updatedSupplyData.subtotal1 = updatedSupplyData.ownAmount + updatedSupplyData.overheadsAmount;
        updatedSupplyData.marginAmount = (updatedSupplyData.marginPercentage / 100) * updatedSupplyData.subtotal1;
        updatedSupplyData.subtotal2 = updatedSupplyData.subtotal1 + updatedSupplyData.marginAmount;
        updatedSupplyData.sellingAmount = updatedSupplyData.subtotal2;
        updatedSupplyData.mf = updatedSupplyData.sellingAmount / updatedSupplyData.ownAmount;
      } else if (field === 'marginPercentage') {
        updatedSupplyData.marginAmount = (numValue / 100) * updatedSupplyData.subtotal1;
        updatedSupplyData.subtotal2 = updatedSupplyData.subtotal1 + updatedSupplyData.marginAmount;
        updatedSupplyData.sellingAmount = updatedSupplyData.subtotal2;
        updatedSupplyData.mf = updatedSupplyData.sellingAmount / updatedSupplyData.ownAmount;
      }
      
      setFormData({
        ...formData,
        supplyData: updatedSupplyData
      });
    } else if (section === 'labour') {
      let updatedLabourData = { ...formData.labourData, [field]: numValue };
      
      // Recalculate dependent values
      if (field === 'overheadsPercentage') {
        updatedLabourData.overheadsAmount = (numValue / 100) * updatedLabourData.ownAmount;
        updatedLabourData.subtotal1 = updatedLabourData.ownAmount + updatedLabourData.overheadsAmount;
        updatedLabourData.marginAmount = (updatedLabourData.marginPercentage / 100) * updatedLabourData.subtotal1;
        updatedLabourData.subtotal2 = updatedLabourData.subtotal1 + updatedLabourData.marginAmount;
        updatedLabourData.sellingAmount = updatedLabourData.subtotal2;
        updatedLabourData.mf = updatedLabourData.sellingAmount / updatedLabourData.ownAmount;
      } else if (field === 'marginPercentage') {
        updatedLabourData.marginAmount = (numValue / 100) * updatedLabourData.subtotal1;
        updatedLabourData.subtotal2 = updatedLabourData.subtotal1 + updatedLabourData.marginAmount;
        updatedLabourData.sellingAmount = updatedLabourData.subtotal2;
        updatedLabourData.mf = updatedLabourData.sellingAmount / updatedLabourData.ownAmount;
      }
      
      setFormData({
        ...formData,
        labourData: updatedLabourData
      });
    } else if (section === 'sitc') {
      let updatedSITCData = { ...formData.sitcData, [field]: numValue };
      
      // Recalculate dependent values
      if (field === 'overheadsPercentage') {
        updatedSITCData.overheadsAmount = (numValue / 100) * updatedSITCData.ownAmount;
        updatedSITCData.subtotal1 = updatedSITCData.ownAmount + updatedSITCData.overheadsAmount;
        updatedSITCData.marginAmount = (updatedSITCData.marginPercentage / 100) * updatedSITCData.subtotal1;
        updatedSITCData.subtotal2 = updatedSITCData.subtotal1 + updatedSITCData.marginAmount;
        updatedSITCData.sellingAmount = updatedSITCData.subtotal2;
        updatedSITCData.mf = updatedSITCData.sellingAmount / updatedSITCData.ownAmount;
      } else if (field === 'marginPercentage') {
        updatedSITCData.marginAmount = (numValue / 100) * updatedSITCData.subtotal1;
        updatedSITCData.subtotal2 = updatedSITCData.subtotal1 + updatedSITCData.marginAmount;
        updatedSITCData.sellingAmount = updatedSITCData.subtotal2;
        updatedSITCData.mf = updatedSITCData.sellingAmount / updatedSITCData.ownAmount;
      }
      
      setFormData({
        ...formData,
        sitcData: updatedSITCData
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Margin Application</h3>
        <p className="text-sm text-gray-600">Apply margins to calculate the final selling price.</p>
      </div>
      
      {/* Summary Section */}
      <div className="grid grid-cols-3 gap-4">
        {/* Supply Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Supply</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Own Amount:</label>
              <span className="text-sm font-medium">₹{formData.supplyData.ownAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Overheads (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.supplyData.overheadsPercentage}
                  onChange={(e) => handleInputChange('supply', 'overheadsPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.supplyData.overheadsAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.supplyData.subtotal1.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Margin (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.supplyData.marginPercentage}
                  onChange={(e) => handleInputChange('supply', 'marginPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.supplyData.marginAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.supplyData.subtotal2.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
              <label className="text-sm font-medium text-gray-700">Selling Amount:</label>
              <span className="text-sm font-medium text-green-600">₹{formData.supplyData.sellingAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">MF:</label>
              <span className="text-sm font-medium">{formData.supplyData.mf.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Labour Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Labour</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Own Amount:</label>
              <span className="text-sm font-medium">₹{formData.labourData.ownAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Overheads (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.labourData.overheadsPercentage}
                  onChange={(e) => handleInputChange('labour', 'overheadsPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.labourData.overheadsAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.labourData.subtotal1.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Margin (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.labourData.marginPercentage}
                  onChange={(e) => handleInputChange('labour', 'marginPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.labourData.marginAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.labourData.subtotal2.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
              <label className="text-sm font-medium text-gray-700">Selling Amount:</label>
              <span className="text-sm font-medium text-green-600">₹{formData.labourData.sellingAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">MF:</label>
              <span className="text-sm font-medium">{formData.labourData.mf.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* SITC Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">SITC (Supply, Installation, Testing, and Commissioning)</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Own Amount:</label>
              <span className="text-sm font-medium">₹{formData.sitcData.ownAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Overheads (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.sitcData.overheadsPercentage}
                  onChange={(e) => handleInputChange('sitc', 'overheadsPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.sitcData.overheadsAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.sitcData.subtotal1.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Margin (%):</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={formData.sitcData.marginPercentage}
                  onChange={(e) => handleInputChange('sitc', 'marginPercentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right"
                />
                <span className="ml-2 text-sm">₹{formData.sitcData.marginAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Sub Total:</label>
              <span className="text-sm font-medium">₹{formData.sitcData.subtotal2.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
              <label className="text-sm font-medium text-gray-700">Selling Amount:</label>
              <span className="text-sm font-medium text-green-600">₹{formData.sitcData.sellingAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">MF:</label>
              <span className="text-sm font-medium">{formData.sitcData.mf.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grand Total */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-900">Grand Total (Selling Amount):</span>
          <span className="text-green-600">
            ₹{(formData.supplyData.sellingAmount + formData.labourData.sellingAmount).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationStep3;
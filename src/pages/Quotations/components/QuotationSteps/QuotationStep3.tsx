import React, { useEffect } from 'react';

interface QuotationStep3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const QuotationStep3: React.FC<QuotationStep3Props> = ({ formData, setFormData }) => {
  // Get values from previous steps
  const ownSupply = formData.items?.reduce((sum: number, item: any) => sum + (item.finalSupplyAmount || 0), 0) || 0;
  const ownLabour = formData.items?.reduce((sum: number, item: any) => sum + (item.finalInstallationAmount || 0), 0) || 0;
  const totalOverheads = formData.totalOverheadsCost || 0;
  const totalOwn = ownSupply + ownLabour;

  // Initialize summary data if not exists
  useEffect(() => {
    if (!formData.supplySummary) {
      setFormData(prev => ({
        ...prev,
        supplySummary: {
          ownAmount: ownSupply,
          overheadsPercentage: totalOwn > 0 ? ((ownSupply / totalOwn) * totalOverheads / ownSupply * 100) : 0,
          overheadsAmount: totalOwn > 0 ? (ownSupply / totalOwn) * totalOverheads : 0,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0
        },
        labourSummary: {
          ownAmount: ownLabour,
          overheadsPercentage: totalOwn > 0 ? ((ownLabour / totalOwn) * totalOverheads / ownLabour * 100) : 0,
          overheadsAmount: totalOwn > 0 ? (ownLabour / totalOwn) * totalOverheads : 0,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0
        },
        sitcSummary: {
          ownAmount: totalOwn,
          overheadsPercentage: totalOwn > 0 ? (totalOverheads / totalOwn * 100) : 0,
          overheadsAmount: totalOverheads,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0
        }
      }));
    }
  }, [ownSupply, ownLabour, totalOverheads, totalOwn]);

  // Calculate values whenever inputs change
  useEffect(() => {
    if (formData.supplySummary && formData.labourSummary && formData.sitcSummary) {
      // Supply calculations
      const supplyOverheadsAmount = totalOwn > 0 ? (ownSupply / totalOwn) * totalOverheads : 0;
      const supplySubTotal = ownSupply + supplyOverheadsAmount;
      const supplyMarginAmount = supplySubTotal * (formData.supplySummary.marginPercentage / 100);
      const supplySellingAmount = supplySubTotal + supplyMarginAmount;
      const supplyMF = ownSupply > 0 ? supplySellingAmount / ownSupply : 0;

      // Labour calculations
      const labourOverheadsAmount = totalOwn > 0 ? (ownLabour / totalOwn) * totalOverheads : 0;
      const labourSubTotal = ownLabour + labourOverheadsAmount;
      const labourMarginAmount = labourSubTotal * (formData.labourSummary.marginPercentage / 100);
      const labourSellingAmount = labourSubTotal + labourMarginAmount;
      const labourMF = ownLabour > 0 ? labourSellingAmount / ownLabour : 0;

      // SITC calculations
      const sitcSubTotal = totalOwn + totalOverheads;
      const sitcMarginAmount = sitcSubTotal * (formData.sitcSummary.marginPercentage / 100);
      const sitcSellingAmount = sitcSubTotal + sitcMarginAmount;
      const sitcMF = totalOwn > 0 ? sitcSellingAmount / totalOwn : 0;

      setFormData(prev => ({
        ...prev,
        supplySummary: {
          ...prev.supplySummary,
          ownAmount: ownSupply,
          overheadsPercentage: ownSupply > 0 ? (supplyOverheadsAmount / ownSupply * 100) : 0,
          overheadsAmount: supplyOverheadsAmount,
          subTotal: supplySubTotal,
          marginAmount: supplyMarginAmount,
          sellingAmount: supplySellingAmount,
          mf: supplyMF
        },
        labourSummary: {
          ...prev.labourSummary,
          ownAmount: ownLabour,
          overheadsPercentage: ownLabour > 0 ? (labourOverheadsAmount / ownLabour * 100) : 0,
          overheadsAmount: labourOverheadsAmount,
          subTotal: labourSubTotal,
          marginAmount: labourMarginAmount,
          sellingAmount: labourSellingAmount,
          mf: labourMF
        },
        sitcSummary: {
          ...prev.sitcSummary,
          ownAmount: totalOwn,
          overheadsPercentage: totalOwn > 0 ? (totalOverheads / totalOwn * 100) : 0,
          overheadsAmount: totalOverheads,
          subTotal: sitcSubTotal,
          marginAmount: sitcMarginAmount,
          sellingAmount: sitcSellingAmount,
          mf: sitcMF
        }
      }));
    }
  }, [ownSupply, ownLabour, totalOverheads, totalOwn, formData.supplySummary?.marginPercentage, formData.labourSummary?.marginPercentage, formData.sitcSummary?.marginPercentage]);

  const handleMarginChange = (section: 'supplySummary' | 'labourSummary' | 'sitcSummary', value: string) => {
    const marginPercentage = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        marginPercentage
      }
    }));
  };

  const renderSummarySection = (title: string, data: any, section: 'supplySummary' | 'labourSummary' | 'sitcSummary') => (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Own Amount:</span>
          <span className="text-sm font-medium">₹{(data?.ownAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Overheads (%):</span>
          <span className="text-sm font-medium">{(data?.overheadsPercentage || 0).toFixed(2)}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Overheads (Amount):</span>
          <span className="text-sm font-medium">₹{(data?.overheadsAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-600">Margin (%):</label>
          <input
            type="number"
            value={data?.marginPercentage || 0}
            onChange={(e) => handleMarginChange(section, e.target.value)}
            min="0"
            max="100"
            step="0.01"
            className="w-20 px-2 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Sub Total:</span>
          <span className="text-sm font-medium">₹{(data?.subTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Margin (Amount):</span>
          <span className="text-sm font-medium">₹{(data?.marginAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-900">Selling Amount:</span>
          <span className="text-sm font-medium text-green-600">₹{(data?.sellingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">MF:</span>
          <span className="text-sm font-medium">{(data?.mf || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
        <p className="text-sm text-gray-600">Apply margins to calculate final selling prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderSummarySection('SUPPLY SUMMARY', formData.supplySummary, 'supplySummary')}
        {renderSummarySection('LABOUR SUMMARY', formData.labourSummary, 'labourSummary')}
        {renderSummarySection('SITC (OVERALL) SUMMARY', formData.sitcSummary, 'sitcSummary')}
      </div>
    </div>
  );
};

export default QuotationStep3;
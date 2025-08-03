import React, { useState, useEffect } from 'react';
import { X, FileText, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface BOMViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bomId: string;
}

interface BOMDetail {
  id: string;
  name: string;
  workType: string;
  description: string;
  totalPrice: number;
  bomNumber: string;
  approvalStatus: string;
  createdAt: string;
  createdBy: string;
  specs: Array<{
    id: string;
    name: string;
    price: number;
    isExpanded: boolean;
    items: Array<{
      id: string;
      itemCode: string;
      itemName: string;
      quantity: number;
      supplyRate: number;
      installationRate: number;
      netRate: number;
      price: number;
    }>;
  }>;
}

const BOMViewModal: React.FC<BOMViewModalProps> = ({ 
  isOpen, 
  onClose, 
  bomId 
}) => {
  const [bomDetail, setBomDetail] = useState<BOMDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBOMDetail = async () => {
      if (!bomId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom/${bomId}`);
        const data = await response.json();
        const apiBOM = data.data;
        
        // Map API response to UI format
        const mappedBOM: BOMDetail = {
          id: apiBOM.id,
          name: apiBOM.name,
         bomNumber: apiBOM.bom_number,
         bomTemplateNumber: apiBOM.bom_template_number,
          workType: apiBOM.work_type || 'Unknown',
          description: apiBOM.description || '',
          totalPrice: apiBOM.total_price || 0,
          bomNumber: apiBOM.bom_number || '',
          approvalStatus: apiBOM.approval_status || 'draft',
          createdAt: apiBOM.created_at || '',
          createdBy: apiBOM.created_by || 'Unknown',
          specs: (apiBOM.specs || []).map((spec: any) => ({
            id: spec.spec_id,
            name: spec.spec_description,
            price: spec.spec_price || 0,
            isExpanded: true,
            items: (spec.details || []).map((detail: any) => ({
              id: detail.detail_id,
              itemCode: detail.item_code || '',
              itemName: detail.item_name || '',
              quantity: detail.required_quantity || 0,
              supplyRate: detail.supply_rate || 0,
              installationRate: detail.installation_rate || 0,
              netRate: detail.net_rate || 0,
              price: (detail.required_quantity || 0) * (detail.net_rate || 0)
            }))
          }))
        };
        
        setBomDetail(mappedBOM);
      } catch (error) {
        console.error('Error fetching BOM details:', error);
        setError('Failed to load BOM details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && bomId) {
      fetchBOMDetail();
    }
  }, [isOpen, bomId]);

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'Basement Ventilation':
        return 'bg-blue-100 text-blue-800';
      case 'HVAC Systems':
        return 'bg-purple-100 text-purple-800';
      case 'Fire Safety':
        return 'bg-red-100 text-red-800';
      case 'Electrical':
        return 'bg-amber-100 text-amber-800';
      case 'Plumbing':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSpecExpansion = (specId: string) => {
    setBomDetail(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        specs: prev.specs.map(spec => 
          spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
        )
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">BOM Details</h3>
            <p className="text-sm text-gray-500">View BOM specifications and items</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading BOM details...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : bomDetail ? (
            <div className="space-y-6">
              {/* BOM Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{bomDetail.name}</h2>
                     <div>
                       <p className="text-sm font-bold text-blue-600">BOM #: {bomDetail.bomNumber || '-'}</p>
                       <p className="text-sm font-bold text-green-600">Template #: {bomDetail.bomTemplateNumber || '-'}</p>
                     </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getWorkTypeColor(bomDetail.workType)}`}>
                      {bomDetail.workType}
                    </span>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bomDetail.approvalStatus)}`}>
                        {bomDetail.approvalStatus}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{bomDetail.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total Price:</span>
                    <p className="text-lg font-bold text-green-600 mt-1">₹{bomDetail.totalPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created By:</span>
                    <p className="text-sm text-gray-900 mt-1">{bomDetail.createdBy}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(bomDetail.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                {bomDetail.specs.length > 0 ? (
                  <div className="space-y-4">
                    {bomDetail.specs.map((spec) => (
                      <div key={spec.id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
                          onClick={() => toggleSpecExpansion(spec.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {spec.isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              )}
                              <Tag className="h-5 w-5 text-gray-500" />
                              <div>
                                <h4 className="text-md font-medium text-gray-900">{spec.name}</h4>
                                <p className="text-sm text-gray-500">{spec.items.length} item(s) • ₹{spec.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {spec.isExpanded && (
                          <div className="p-4">
                            {spec.items.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Rate</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {spec.items.map((item) => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.supplyRate.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.installationRate.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.netRate.toLocaleString('en-IN')}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price.toLocaleString('en-IN')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-gray-50">
                                    <tr>
                                      <td colSpan={6} className="px-3 py-2 text-sm font-medium text-right">Spec Total:</td>
                                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                        ₹{spec.price.toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">No items in this specification</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Grand Total */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900">Grand Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{bomDetail.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No specifications found for this BOM</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">BOM not found</div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMViewModal;
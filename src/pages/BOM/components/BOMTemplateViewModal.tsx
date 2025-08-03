import React, { useState, useEffect } from 'react';
import { X, FileText, Tag } from 'lucide-react';
import { getBOMTemplateById } from '../../../utils/bomApi';
import { BOM_TEMPLATE_RESPONSE_KEY_MAP, BOM_TEMPLATE_SPEC_KEY_MAP, BOM_TEMPLATE_DETAIL_KEY_MAP } from '../../../utils/bomApi';

interface BOMTemplateViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
}

interface TemplateDetail {
  id: string;
  name: string;
  workType: string;
  description: string;
  specs: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      itemCode: string;
      itemName: string;
      quantity: number;
      uomName: string;
      brand: string;
    }>;
  }>;
  createdAt: string;
  status: string;
}

const BOMTemplateViewModal: React.FC<BOMTemplateViewModalProps> = ({ 
  isOpen, 
  onClose, 
  templateId 
}) => {
  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplateDetail = async () => {
      if (!templateId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getBOMTemplateById(templateId);
        const apiData = response.data;
        
        // Map API response to UI format
        const mappedTemplate: TemplateDetail = {
          [BOM_TEMPLATE_RESPONSE_KEY_MAP.id]: apiData.id,
          [BOM_TEMPLATE_RESPONSE_KEY_MAP.name]: apiData.name,
         templateNumber: apiData.bom_template_number,
          [BOM_TEMPLATE_RESPONSE_KEY_MAP.work_type]: apiData.work_type,
          [BOM_TEMPLATE_RESPONSE_KEY_MAP.reason]: apiData.reason || '',
          specs: (apiData.specs || []).map((spec: any) => ({
            [BOM_TEMPLATE_SPEC_KEY_MAP.spec_id]: spec.spec_id,
            [BOM_TEMPLATE_SPEC_KEY_MAP.spec_description]: spec.spec_description,
            items: (spec.details || []).map((detail: any) => ({
              [BOM_TEMPLATE_DETAIL_KEY_MAP.item_id]: detail.item_id,
              [BOM_TEMPLATE_DETAIL_KEY_MAP.item_code]: detail.item_code || '',
              [BOM_TEMPLATE_DETAIL_KEY_MAP.item_name]: detail.item_name || '',
              [BOM_TEMPLATE_DETAIL_KEY_MAP.required_quantity]: detail.required_quantity,
              uomName: '-',
              brand: '-'
            }))
          })),
          [BOM_TEMPLATE_RESPONSE_KEY_MAP.created_at]: apiData.created_at,
          status: apiData.is_active ? 'active' : 'inactive'
        };
        
        setTemplateDetail(mappedTemplate);
      } catch (error) {
        console.error('Error fetching BOM template details:', error);
        setError('Failed to load template details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && templateId) {
      fetchTemplateDetail();
    }
  }, [isOpen, templateId]);

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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">BOM Template Details</h3>
            <p className="text-sm text-gray-500">View template specifications and items</p>
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
              <div className="text-gray-500">Loading template details...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : templateDetail ? (
            <div className="space-y-6">
              {/* Template Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{templateDetail.name}</h2>
                     <div>
                       <p className="text-sm text-gray-600">Template ID: {templateDetail.id}</p>
                       <p className="text-sm font-bold text-blue-600">Template #: {templateDetail.templateNumber || '-'}</p>
                     </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getWorkTypeColor(templateDetail.workType)}`}>
                      {templateDetail.workType}
                    </span>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(templateDetail.status)}`}>
                        {templateDetail.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{templateDetail.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(templateDetail.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                {templateDetail.specs.length > 0 ? (
                  <div className="space-y-4">
                    {templateDetail.specs.map((spec) => (
                      <div key={spec.id} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Tag className="h-5 w-5 text-gray-500" />
                              <div>
                                <h4 className="text-md font-medium text-gray-900">{spec.name}</h4>
                                <p className="text-sm text-gray-500">{spec.items.length} item(s)</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {spec.items.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {spec.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemCode}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.uomName}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p className="text-sm">No items in this specification</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No specifications found for this template</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">Template not found</div>
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

export default BOMTemplateViewModal;
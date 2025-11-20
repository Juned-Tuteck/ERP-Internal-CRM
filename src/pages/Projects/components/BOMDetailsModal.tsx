import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../../../utils/projectApi';
import { getBOMById } from '../../../utils/bomApi';

interface BOMDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BOMSpec {
  spec_id: string;
  spec_description: string;
  spec_price: number | null;
  details: BOMDetail[];
}

interface BOMDetail {
  detail_id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  hsn_code: string;
  description: string;
  material_type: string;
  dimensions: string;
  required_quantity: number;
  action: string;
  supply_rate: number;
  installation_rate: number;
  net_rate: number;
  uom_value: number;
}

interface BOMData {
  id: string;
  bom_number: string;
  name: string;
  work_type: string;
  total_price: string;
  approval_status: string;
  created_at: string;
  bom_date: string;
  business_name: string;
  lead_number: string;
  specs: BOMSpec[];
}

const BOMDetailsModal: React.FC<BOMDetailsModalProps> = ({ project, isOpen, onClose }) => {
  const [bomData, setBomData] = useState<BOMData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBOMData = async () => {
      if (!isOpen || !project?.latest_bom?.bom_id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getBOMById(project.latest_bom.bom_id);
        if (response.success && response.data) {
          setBomData(response.data);
        }
      } catch (err) {
        console.error('Error fetching BOM details:', err);
        setError('Failed to load BOM details');
      } finally {
        setLoading(false);
      }
    };

    fetchBOMData();
  }, [isOpen, project?.latest_bom?.bom_id]);

  if (!isOpen || !project) return null;

  const bom = project.latest_bom;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const allDetails = bomData?.specs?.flatMap(spec => spec.details) || [];
  const grandTotal = bomData?.total_price ? parseFloat(bomData.total_price) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">BOM Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOM Number
                  </label>
                  <input
                    type="text"
                    value={bomData?.bom_number || bom?.bom_number || 'N/A'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Type
                  </label>
                  <input
                    type="text"
                    value={bomData?.work_type || project.project_type || 'N/A'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOM Created On
                  </label>
                  <input
                    type="text"
                    value={formatDate(bomData?.created_at || bom?.created_at)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </>
          )}

          {!loading && !error && bomData && (
            <>
              {bomData.specs && bomData.specs.length > 0 ? (
                <div className="mt-6 space-y-6">
                  {bomData.specs.map((spec, specIndex) => (
                    <div key={spec.spec_id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {spec.spec_description}
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Code
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Material Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supply Rate
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Installation
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Rate
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {spec.details.map((detail, detailIndex) => (
                              <tr key={detail.detail_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.item_code}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.item_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{detail.material_type}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.required_quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.supply_rate.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.installation_rate.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{detail.net_rate.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {(detail.required_quantity * detail.net_rate).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 text-center py-8 text-gray-500">
                  No BOM items available
                </div>
              )}
            </>
          )}

          {!loading && !error && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Approval Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (bomData?.approval_status || bom?.approval_status) === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : (bomData?.approval_status || bom?.approval_status) === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : (bomData?.approval_status || bom?.approval_status) === 'REVISIT'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {bomData?.approval_status || bom?.approval_status || 'N/A'}
                </span>
              </div>
              <div className="flex justify-end">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-gray-700">Grand Total:</span>
                  <span className="text-lg font-bold text-gray-900">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMDetailsModal;

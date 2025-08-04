import React from 'react';
import { useState, useEffect } from 'react';
import { FileSpreadsheet, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { getQuotations } from '../../../utils/quotationApi';

interface Quotation {
  id: string;
  leadName: string;
  businessName: string;
  workType: string;
  leadType?: string;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  expiryDate: string;
  leadNumber?: string;
  bomNumber?: string;
  quotationNumber?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
}

interface QuotationListProps {
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
}

const QuotationList: React.FC<QuotationListProps> = ({ selectedQuotation, onSelectQuotation }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch quotations from API
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await getQuotations();
        const apiQuotations = response.data || [];
        
        // Map API response to UI format
        const mappedQuotations: Quotation[] = apiQuotations.map((apiQuotation: any) => ({
          id: apiQuotation.id,
         quotationNumber: apiQuotation.customer_quotation_number,
         leadNumber: apiQuotation.lead_number,
         bomNumber: apiQuotation.bom_number,
          leadName: apiQuotation.project_name || 'Unknown Lead',
          businessName: apiQuotation.business_name || 'Unknown Business',
          workType: apiQuotation.work_type || 'Unknown',
          leadType: apiQuotation.lead_type || 'Unknown',
          totalValue: `₹${(apiQuotation.total_cost || 0).toLocaleString('en-IN')}`,
          createdBy: apiQuotation.created_by || 'Unknown',
          createdDate: apiQuotation.quotation_date || apiQuotation.created_at || new Date().toISOString(),
          expiryDate: apiQuotation.expiry_date || new Date().toISOString(),
          status: apiQuotation.approval_status?.toLowerCase() || 'draft',
        }));
        
        setQuotations(mappedQuotations);
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

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
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 mr-1" />;
      case 'pending_approval':
        return <Calendar className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600 mr-1" />;
      case 'expired':
        return <Calendar className="h-4 w-4 text-orange-600 mr-1" />;
      default:
        return null;
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'Basement Ventilation':
        return 'bg-blue-100 text-blue-800';
      case 'HVAC Systems':
        return 'bg-purple-100 text-purple-800';
      case 'AMC':
        return 'bg-red-100 text-red-800';
      case 'Retrofit':
        return 'bg-amber-100 text-amber-800';
      case 'Chiller':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'Government':
        return 'bg-green-100 text-green-800';
      case 'Private':
        return 'bg-blue-100 text-blue-800';
      case 'Commercial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Public':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(50em-100px)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Quotations</h3>
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${quotations.length} total quotations`}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Loading quotations...
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {quotations.map((quotation) => (
            <div
              key={quotation.id}
              className={`relative p-4 rounded-lg border cursor-pointer hover:shadow-md ${
                selectedQuotation?.id === quotation.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              }`}
              onClick={() => onSelectQuotation(quotation)}
            >
              <div className="flex items-center">
                <FileSpreadsheet className="h-6 w-6 text-gray-500" />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{quotation.leadName}</div>
                  <div className="text-xs text-gray-500">{quotation.businessName}</div>
                 <div className="text-xs font-bold text-blue-700">
                   Quotation : {quotation.quotationNumber || '-'}
                 </div>
                 <div className="text-xs font-bold text-blue-500">
                   Lead : {quotation.leadNumber || '-'}
                 </div>
                 <div className="text-xs font-bold text-blue-400">
                  BOM : {quotation.bomNumber || '-'}
                 </div>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeadTypeColor(
                        quotation.leadType || 'Unknown'
                      )}`}
                    >
                      {quotation.leadType || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(
                        quotation.workType
                      )}`}
                    >
                      {quotation.workType}
                    </span>
                  </div>
                </div>
              </div>
              {/* Total Price on Top-Right */}
              <div className="absolute top-4 right-4 text-sm font-medium text-green-600">
                {quotation.totalValue}
              </div>
              {/* Status Card on Bottom-Right */}
              <div className="absolute bottom-4 right-4">
                <span
                  className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    quotation.status
                  )}`}
                >
                  {getStatusIcon(quotation.status)}
                  {quotation.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Quoted on : {new Date(quotation.createdDate).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
          {quotations.length === 0 && !loading && (
            <div className="text-sm text-gray-500 text-center">No quotations found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotationList;
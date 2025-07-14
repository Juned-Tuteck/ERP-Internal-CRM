import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import QuotationStep1 from './QuotationSteps/QuotationStep1';
import QuotationStep2 from './QuotationSteps/QuotationStep2';
import QuotationStep3 from './QuotationSteps/QuotationStep3';
import QuotationStep4 from './QuotationSteps/QuotationStep4';
import QuotationStep5 from './QuotationSteps/QuotationStep5';

// Mock data for leads
const leads = [
  { id: '1', name: 'Mumbai Metro Ventilation System', businessName: 'TechCorp Solutions Pvt Ltd', bomId: 'BOM-2024-001' },
  { id: '2', name: 'Corporate Office HVAC Upgrade', businessName: 'Innovate India Limited', bomId: 'BOM-2024-002' },
  { id: '3', name: 'Hospital Fire Safety System', businessName: 'Digital Solutions Enterprise', bomId: 'BOM-2024-003' },
];

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
  initialData?: any;
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const getDefaultFormData = () => ({
    // Step 1: Costing Sheet
    leadId: '',
    leadName: '',
    businessName: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    bomId: '',
    items: [],
    note: '',
    // Step 2: POC
    projectCosts: [],
    supervisionCosts: [],
    financeCosts: [],
    contingencyCosts: [],
   projectSummary: {
     contractValue: 0,
     materialCost: 0,
     labourCost: 0,
     totalOwnCost: 0
   },
    // Step 3: Summary
    supplyData: {
      ownAmount: 0,
      overheadsPercentage: 10,
      overheadsAmount: 0,
      subtotal1: 0,
      marginPercentage: 15,
      marginAmount: 0,
      subtotal2: 0,
      sellingAmount: 0,
      mf: 0
    },
    labourData: {
      ownAmount: 0,
      overheadsPercentage: 12,
      overheadsAmount: 0,
      subtotal1: 0,
      marginPercentage: 20,
      marginAmount: 0,
      subtotal2: 0,
      sellingAmount: 0,
      mf: 0
    },
    sitcData: {
      ownAmount: 0,
      overheadsPercentage: 8,
      overheadsAmount: 0,
      subtotal1: 0,
      marginPercentage: 18,
      marginAmount: 0,
      subtotal2: 0,
      sellingAmount: 0,
      mf: 0
    },
    // Step 4: Final Costing
    gstRates: {
      highSideSupply: 18,
      lowSideSupply: 18,
      installation: 18
    },
    // Step 5: Comments
    comments: []
  });

  const [formData, setFormData] = useState(() => {
    const defaultData = getDefaultFormData();
    if (initialData) {
      // Find the lead ID based on the lead name if it's not provided
      let leadId = initialData.leadId;
      if (!leadId && initialData.leadName) {
        const lead = leads.find(l => l.name === initialData.leadName);
        if (lead) {
          leadId = lead.id;
        }
      }
      
      return {
        ...defaultData,
        ...initialData,
        leadId: leadId || '',
        bomId: initialData.bomId || '',
        items: initialData.items || [],
        projectCosts: initialData.projectCosts || [],
        supervisionCosts: initialData.supervisionCosts || [],
        financeCosts: initialData.financeCosts || [],
        contingencyCosts: initialData.contingencyCosts || [],
        projectSummary: {
          ...defaultData.projectSummary,
          ...(initialData.projectSummary || {})
        },
        supplyData: {
          ...defaultData.supplyData,
          ...(initialData.supplyData || {})
        },
        labourData: {
          ...defaultData.labourData,
          ...(initialData.labourData || {})
        },
        sitcData: {
          ...defaultData.sitcData,
          ...(initialData.sitcData || {})
        },
        gstRates: {
          ...defaultData.gstRates,
          ...(initialData.gstRates || {})
        },
        comments: initialData.comments || []
      };
    }
    return defaultData;
  });

  const steps = [
    { id: 1, name: 'Costing Sheet', description: 'Item costs and details' },
    { id: 2, name: 'POC', description: 'Project overhead costs' },
    { id: 3, name: 'Summary', description: 'Margin application' },
    { id: 4, name: 'Final Costing', description: 'Customer-facing summary' },
    { id: 5, name: 'Comments', description: 'Internal notes' }
  ];

  useEffect(() => {
    if (initialData) {
      const defaultData = getDefaultFormData();
      
      // Find the lead ID based on the lead name if it's not provided
      let leadId = initialData.leadId;
      if (!leadId && initialData.leadName) {
        const lead = leads.find(l => l.name === initialData.leadName);
        if (lead) {
          leadId = lead.id;
        }
      }
      
      setFormData({
        ...defaultData,
        ...initialData,
        leadId: leadId || '',
        bomId: initialData.bomId || '',
        items: initialData.items || [],
        projectCosts: initialData.projectCosts || [],
        supervisionCosts: initialData.supervisionCosts || [],
        financeCosts: initialData.financeCosts || [],
        contingencyCosts: initialData.contingencyCosts || [],
        projectSummary: {
          ...defaultData.projectSummary,
          ...(initialData.projectSummary || {})
        },
        supplyData: {
          ...defaultData.supplyData,
          ...(initialData.supplyData || {})
        },
        labourData: {
          ...defaultData.labourData,
          ...(initialData.labourData || {})
        },
        sitcData: {
          ...defaultData.sitcData,
          ...(initialData.sitcData || {})
        },
        gstRates: {
          ...defaultData.gstRates,
          ...(initialData.gstRates || {})
        },
        comments: initialData.comments || []
      });
    }
  }, [initialData]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    
    // Reset form
    setCurrentStep(1);
    setFormData(getDefaultFormData());
  };

  const isEditMode = !!initialData;
  const handleBreadcrumbClick = (stepId: number) => {
    if (isEditMode) setCurrentStep(stepId);
  };
  
  // Calculate total items cost for Step 2
  const totalItemsCost = (formData.items || []).reduce(
    (sum: number, item: any) => sum + (item.supplyOwnAmount || 0) + (item.installationOwnAmount || 0), 
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Quotation' : 'Create New Quotation'}
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(step.id)}
                  style={isEditMode ? { cursor: 'pointer' } : { cursor: 'default' }}
                  className={`flex items-center space-x-2 focus:outline-none ${
                    currentStep === step.id ? 'text-blue-600' : 
                    currentStep > step.id ? 'text-green-600' : isEditMode ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id ? 'bg-blue-100 text-blue-600' :
                    currentStep > step.id ? 'bg-green-100 text-green-600' : 
                    isEditMode ? 'bg-blue-50 text-blue-400' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Costing Sheet */}
          {currentStep === 1 && (
            <QuotationStep1 
              formData={formData} 
              setFormData={setFormData} 
              isEditMode={isEditMode}
            />
          )}

          {/* Step 2: POC */}
          {currentStep === 2 && (
            <QuotationStep2 
              formData={formData}
              setFormData={setFormData}
              totalItemsCost={totalItemsCost}
            />
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <QuotationStep3 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}

          {/* Step 4: Final Costing */}
          {currentStep === 4 && (
            <QuotationStep4 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}

          {/* Step 5: Comments */}
          {currentStep === 5 && (
            <QuotationStep5 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {isEditMode ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            ) : currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Save Changes' : 'Create Quotation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;
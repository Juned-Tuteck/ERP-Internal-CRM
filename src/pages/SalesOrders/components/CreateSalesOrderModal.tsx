import React, { useState, useEffect } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Plus, Trash2, Upload } from 'lucide-react';
import { getMaterialTypes, getPaymentTermTypes, createSalesOrder, MaterialType, PaymentTermType } from '../../../utils/salesOrderApi';

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (salesOrderData: any) => void;
}

interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
}

interface PaymentTerm {
  id: string;
  description: string;
  termType: string;
  percentage: number;
  amount: number;
}

const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [paymentTermTypes, setPaymentTermTypes] = useState<PaymentTermType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: General Information
    salesOrderType: 'Sales Order',
    leadNumber: '',
    quotationId: '',
    quotationNumber: '',
    businessName: '',
    customerBranch: '',
    contactPerson: '',
    bomNumber: '',
    totalCost: '',
    currency: 'INR',
    soDate: new Date().toISOString().split('T')[0],
    comments: '',
    // Project Details
    workOrderNumber: '',
    workOrderTenureMonths: '',
    projectName: '',
    workOrderAmount: '',
    workOrderDate: new Date().toISOString().split('T')[0],
    projectStartDate: '',
    projectEndDate: '',
    projectCategory: '',
    projectTemplate: '',
    projectAddress: '',
    // BG Information
    isGovernment: false,
    issueDate: '',
    beneficiaryName: '',
    beneficiaryAddress: '',
    beneficiaryContactNumber: '',
    beneficiaryEmail: '',
    applicantName: '',
    applicantAddress: '',
    applicantContactNumber: '',
    applicantEmail: '',
    bankName: '',
    bankAddress: '',
    bankContactNumber: '',
    bankEmail: '',
    guaranteeNumber: '',
    guaranteeCurrency: 'INR',
    guaranteeAmount: '',
    effectiveDate: '',
    expiryDate: '',
    purpose: '',
    guaranteeType: '',
    // Material Type
    materialTypeId: '',
    // Material Costs
    materialCosts: [
      { type: 'High Side Supply', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 },
      { type: 'Low Side Supply', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 },
      { type: 'Installation', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 }
    ],
    // Payment Terms
    paymentTerms: [] as PaymentTerm[],
    // Step 2: Contacts
    contacts: [] as ContactPerson[],
    // Step 3: Comments
    orderComments: ''
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!isOpen) return;

      try {
        const [materialTypesData, paymentTermTypesData] = await Promise.all([
          getMaterialTypes(),
          getPaymentTermTypes()
        ]);
        setMaterialTypes(materialTypesData);
        setPaymentTermTypes(paymentTermTypesData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, [isOpen]);

  const steps = [
    { id: 1, name: 'General Information', description: 'Order and project details' },
    { id: 2, name: 'SO Contact Info', description: 'Contact information' },
    { id: 3, name: 'SO Comments', description: 'Additional notes' }
  ];

  // Mock data for dropdowns
  const quotations = [
    { id: '1', number: 'QT-2024-001', businessName: 'TechCorp Solutions Pvt Ltd', bomNumber: 'BOM-2024-001', totalValue: '₹24,75,000', isGovernment: true },
    { id: '2', number: 'QT-2024-002', businessName: 'Innovate India Limited', bomNumber: 'BOM-2024-002', totalValue: '₹18,50,000', isGovernment: false },
    { id: '3', number: 'QT-2024-003', businessName: 'Digital Solutions Enterprise', bomNumber: 'BOM-2024-003', totalValue: '₹32,80,000', isGovernment: false }
  ];

  const branches = {
    'TechCorp Solutions Pvt Ltd': ['Mumbai Head Office', 'Delhi Branch', 'Bangalore Office'],
    'Innovate India Limited': ['Pune Main', 'Chennai Branch', 'Hyderabad Office'],
    'Digital Solutions Enterprise': ['Gurgaon HQ', 'Noida Branch']
  };

  const contactPersons = {
    'Mumbai Head Office': ['Amit Patel', 'Rajesh Kumar', 'Priya Sharma'],
    'Pune Main': ['Vikram Singh', 'Sneha Gupta', 'Kavita Reddy'],
    'Gurgaon HQ': ['Arjun Mehta', 'Deepika Joshi', 'Rohit Sharma']
  };

  const projectCategories = ['Commercial', 'Residential', 'Industrial', 'Healthcare', 'Educational', 'Government'];
  const guaranteeTypes = ['ADVANCE PAYMENT GUARANTEE', 'BID BOND', 'FINANCIAL GUARANTEE', 'PERFORMANCE GUARANTEE'];
  const projectTemplates = ['Standard Ventilation Project', 'Commercial HVAC Project', 'Healthcare AMC Project', 'Residential Retrofit Project', 'Commercial Chiller Project'];
  const purposes = ['Performance Guarantee', 'Advance Payment Guarantee', 'Retention Money Guarantee', 'Bid Bond'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'quotationId') {
      const selectedQuotation = quotations.find(q => q.id === value);
      if (selectedQuotation) {
        setFormData(prev => ({
          ...prev,
          quotationId: value,
          quotationNumber: selectedQuotation.number,
          businessName: selectedQuotation.businessName,
          bomNumber: selectedQuotation.bomNumber,
          totalCost: selectedQuotation.totalValue,
          isGovernment: selectedQuotation.isGovernment
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleMaterialCostChange = (index: number, field: string, value: string) => {
    const updatedCosts = [...formData.materialCosts];
    const numValue = parseFloat(value) || 0;
    
    if (field === 'amountBasic') {
      updatedCosts[index].amountBasic = numValue;
      updatedCosts[index].amountWithGst = numValue * (1 + updatedCosts[index].gstPercentage / 100);
    } else if (field === 'gstPercentage') {
      updatedCosts[index].gstPercentage = numValue;
      updatedCosts[index].amountWithGst = updatedCosts[index].amountBasic * (1 + numValue / 100);
    }
    
    setFormData(prev => ({
      ...prev,
      materialCosts: updatedCosts
    }));
  };

  // Payment Terms Management
  const addPaymentTerm = () => {
    const newTerm: PaymentTerm = {
      id: Date.now().toString(),
      description: '',
      termType: '',
      percentage: 0,
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      paymentTerms: [...prev.paymentTerms, newTerm]
    }));
  };

  const updatePaymentTerm = (id: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.map(term => {
        if (term.id === id) {
          const updatedTerm = { ...term, [field]: value };
          
          // If percentage is updated, recalculate amount
          if (field === 'percentage') {
            const totalCostValue = parseFloat(prev.totalCost.replace(/[₹,]/g, '')) || 0;
            updatedTerm.amount = totalCostValue * (updatedTerm.percentage / 100);
          }
          
          return updatedTerm;
        }
        return term;
      })
    }));
  };

  const removePaymentTerm = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter(term => term.id !== id)
    }));
  };

  // Contact Management
  const addContact = () => {
    const newContact: ContactPerson = {
      id: Date.now().toString(),
      name: '',
      designation: '',
      email: '',
      phone: ''
    };
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const updateContact = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact => 
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id)
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const salesOrderData = {
        salesOrder: {
          sales_order_type: formData.salesOrderType,
          lead_number: formData.leadNumber,
          quotation_id: formData.quotationId,
          quotation_number: formData.quotationNumber,
          business_name: formData.businessName,
          customer_branch: formData.customerBranch,
          contact_person: formData.contactPerson,
          bom_number: formData.bomNumber,
          total_cost: formData.totalCost,
          currency: formData.currency,
          so_date: formData.soDate,
          comments: formData.comments,
        },
        projectDetails: {
          work_order_number: formData.workOrderNumber,
          work_order_tenure_months: formData.workOrderTenureMonths ? parseInt(formData.workOrderTenureMonths) : undefined,
          project_name: formData.projectName,
          work_order_amount: formData.workOrderAmount,
          work_order_date: formData.workOrderDate,
          project_start_date: formData.projectStartDate,
          project_end_date: formData.projectEndDate,
          project_category: formData.projectCategory,
          project_template: formData.projectTemplate,
          project_address: formData.projectAddress,
        },
        bankGuaranteeInfo: formData.isGovernment ? {
          is_government: formData.isGovernment,
          issue_date: formData.issueDate,
          guarantee_type: formData.guaranteeType,
          beneficiary_name: formData.beneficiaryName,
          beneficiary_address: formData.beneficiaryAddress,
          beneficiary_contact_number: formData.beneficiaryContactNumber,
          beneficiary_email: formData.beneficiaryEmail,
          applicant_name: formData.applicantName,
          applicant_address: formData.applicantAddress,
          applicant_contact_number: formData.applicantContactNumber,
          applicant_email: formData.applicantEmail,
          bank_name: formData.bankName,
          bank_address: formData.bankAddress,
          bank_contact_number: formData.bankContactNumber,
          bank_email: formData.bankEmail,
          guarantee_number: formData.guaranteeNumber,
          guarantee_currency: formData.guaranteeCurrency,
          guarantee_amount: formData.guaranteeAmount,
          effective_date: formData.effectiveDate,
          expiry_date: formData.expiryDate,
          purpose: formData.purpose,
        } : undefined,
        materialCosts: formData.materialCosts.map(cost => ({
          material_type_id: formData.materialTypeId,
          gst_percentage: cost.gstPercentage,
          amount_basic: cost.amountBasic,
          amount_with_gst: cost.amountWithGst,
        })),
        paymentTerms: formData.paymentTerms.map(term => ({
          payment_term_type_id: term.termType,
          description: term.description,
          percentage: term.percentage,
          amount: term.amount,
        })),
        contacts: formData.contacts,
        orderComments: formData.orderComments,
      };

      const response = await createSalesOrder(salesOrderData);
      onSubmit(response.data);

      // Reset form
      setCurrentStep(1);
      setFormData({
        salesOrderType: 'Sales Order',
        leadNumber: '',
        quotationId: '',
        quotationNumber: '',
        businessName: '',
        customerBranch: '',
        contactPerson: '',
        bomNumber: '',
        totalCost: '',
        currency: 'INR',
        soDate: new Date().toISOString().split('T')[0],
        comments: '',
        workOrderNumber: '',
        workOrderTenureMonths: '',
        projectName: '',
        workOrderAmount: '',
        workOrderDate: new Date().toISOString().split('T')[0],
        projectStartDate: '',
        projectEndDate: '',
        projectCategory: '',
        projectTemplate: '',
        projectAddress: '',
        isGovernment: false,
        issueDate: '',
        beneficiaryName: '',
        beneficiaryAddress: '',
        beneficiaryContactNumber: '',
        beneficiaryEmail: '',
        applicantName: '',
        applicantAddress: '',
        applicantContactNumber: '',
        applicantEmail: '',
        bankName: '',
        bankAddress: '',
        bankContactNumber: '',
        bankEmail: '',
        guaranteeNumber: '',
        guaranteeCurrency: 'INR',
        guaranteeAmount: '',
        effectiveDate: '',
        expiryDate: '',
        purpose: '',
        guaranteeType: '',
        materialTypeId: '',
        materialCosts: [
          { type: 'High Side Supply', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 },
          { type: 'Low Side Supply', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 },
          { type: 'Installation', gstPercentage: 18, amountBasic: 0, amountWithGst: 0 }
        ],
        paymentTerms: [],
        contacts: [],
        orderComments: ''
      });
    } catch (error) {
      console.error('Error creating sales order:', error);
      alert('Error creating sales order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create Sales Order</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep === step.id ? 'text-blue-600' : 
                  currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id ? 'bg-blue-100 text-blue-600' :
                    currentStep > step.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit}>
            {/* Step 1: General Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Sales Order Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Sales Order Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sales Order Type *
                      </label>
                      <select
                        name="salesOrderType"
                        value={formData.salesOrderType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Sales Order">Sales Order</option>
                        <option value="Work Order">Work Order</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Number
                      </label>
                      <input
                        type="text"
                        name="leadNumber"
                        value={formData.leadNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter lead number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quotation *
                      </label>
                      <select
                        name="quotationId"
                        value={formData.quotationId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Quotation</option>
                        {quotations.map(quotation => (
                          <option key={quotation.id} value={quotation.id}>{quotation.number} - {quotation.businessName}</option>
                        ))}
                      </select>
                    </div>

                    {formData.quotationId && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            BOM Number
                          </label>
                          <input
                            type="text"
                            name="bomNumber"
                            value={formData.bomNumber}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Branch *
                          </label>
                          <select
                            name="customerBranch"
                            value={formData.customerBranch}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Branch</option>
                            {formData.businessName && branches[formData.businessName as keyof typeof branches]?.map(branch => (
                              <option key={branch} value={branch}>{branch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Person *
                          </label>
                          <select
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.customerBranch}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">Select Contact Person</option>
                            {formData.customerBranch && contactPersons[formData.customerBranch as keyof typeof contactPersons]?.map(person => (
                              <option key={person} value={person}>{person}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Cost
                          </label>
                          <input
                            type="text"
                            name="totalCost"
                            value={formData.totalCost}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-green-600 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                          </label>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SO Date *
                          </label>
                          <input
                            type="date"
                            name="soDate"
                            value={formData.soDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comments
                          </label>
                          <textarea
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter any comments related to this sales order..."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {formData.quotationId && (
                  <>
                    {/* Project Details */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Project Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Work Order Number
                          </label>
                          <input
                            type="text"
                            name="workOrderNumber"
                            value={formData.workOrderNumber}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter work order number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Work Order Tenure (in months)
                          </label>
                          <input
                            type="number"
                            name="workOrderTenureMonths"
                            value={formData.workOrderTenureMonths}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter tenure in months"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Work Order Amount *
                          </label>
                          <input
                            type="text"
                            name="workOrderAmount"
                            value={formData.workOrderAmount}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter amount"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Work Order Date *
                          </label>
                          <input
                            type="date"
                            name="workOrderDate"
                            value={formData.workOrderDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Category *
                          </label>
                          <select
                            name="projectCategory"
                            value={formData.projectCategory}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Category</option>
                            {projectCategories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Template
                          </label>
                          <select
                            name="projectTemplate"
                            value={formData.projectTemplate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Template</option>
                            {projectTemplates.map(template => (
                              <option key={template} value={template}>{template}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Address *
                          </label>
                          <textarea
                            name="projectAddress"
                            value={formData.projectAddress}
                            onChange={handleInputChange}
                            required
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter complete project address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Start Date *
                          </label>
                          <input
                            type="date"
                            name="projectStartDate"
                            value={formData.projectStartDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated End Date *
                          </label>
                          <input
                            type="date"
                            name="projectEndDate"
                            value={formData.projectEndDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BG Information (Conditional) */}
                    {formData.isGovernment && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Guarantee Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Issue Date
                            </label>
                            <input
                              type="date"
                              name="issueDate"
                              value={formData.issueDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Beneficiary Details */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">Beneficiary Details</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  name="beneficiaryName"
                                  value={formData.beneficiaryName}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter beneficiary name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Address *
                                </label>
                                <textarea
                                  name="beneficiaryAddress"
                                  value={formData.beneficiaryAddress}
                                  onChange={handleInputChange}
                                  required
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter address"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Contact Number *
                                </label>
                                <input
                                  type="tel"
                                  name="beneficiaryContactNumber"
                                  value={formData.beneficiaryContactNumber}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="+91 98765 43210"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  name="beneficiaryEmail"
                                  value={formData.beneficiaryEmail}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="email@example.com"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Applicant Details */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">Applicant Details</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  name="applicantName"
                                  value={formData.applicantName}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter applicant name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Address *
                                </label>
                                <textarea
                                  name="applicantAddress"
                                  value={formData.applicantAddress}
                                  onChange={handleInputChange}
                                  required
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter address"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Contact Number *
                                </label>
                                <input
                                  type="tel"
                                  name="applicantContactNumber"
                                  value={formData.applicantContactNumber}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="+91 98765 43210"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  name="applicantEmail"
                                  value={formData.applicantEmail}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="email@example.com"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Bank Details */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">Bank Details</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  name="bankName"
                                  value={formData.bankName}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter bank name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Address *
                                </label>
                                <textarea
                                  name="bankAddress"
                                  value={formData.bankAddress}
                                  onChange={handleInputChange}
                                  required
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter address"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Contact Number *
                                </label>
                                <input
                                  type="tel"
                                  name="bankContactNumber"
                                  value={formData.bankContactNumber}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="+91 98765 43210"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Email *
                                </label>
                                <input
                                  type="email"
                                  name="bankEmail"
                                  value={formData.bankEmail}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="email@example.com"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Guarantee Number
                            </label>
                            <input
                              type="text"
                              name="guaranteeNumber"
                              value={formData.guaranteeNumber}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter guarantee number"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Currency
                            </label>
                            <select
                              name="guaranteeCurrency"
                              value={formData.guaranteeCurrency}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="INR">Indian Rupee (₹)</option>
                              <option value="USD">US Dollar ($)</option>
                              <option value="EUR">Euro (€)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Guarantee Amount
                            </label>
                            <input
                              type="text"
                              name="guaranteeAmount"
                              value={formData.guaranteeAmount}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter amount"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Effective Date
                            </label>
                            <input
                              type="date"
                              name="effectiveDate"
                              value={formData.effectiveDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="date"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Purpose
                            </label>
                            <select
                              name="purpose"
                              value={formData.purpose}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Purpose</option>
                              {purposes.map(purpose => (
                                <option key={purpose} value={purpose}>{purpose}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Guarantee Type
                            </label>
                            <select
                              name="guaranteeType"
                              value={formData.guaranteeType}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Guarantee Type</option>
                              {guaranteeTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Material Type Cost */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Material Type Cost</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Material Type *
                          </label>
                          <select
                            name="materialTypeId"
                            value={formData.materialTypeId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Material Type</option>
                            {materialTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Material Type</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">GST %</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount (Basic)</th>
                              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount with GST</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {formData.materialCosts.map((cost, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{cost.type}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <input
                                    type="number"
                                    value={cost.gstPercentage}
                                    onChange={(e) => handleMaterialCostChange(index, 'gstPercentage', e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <input
                                    type="number"
                                    value={cost.amountBasic}
                                    onChange={(e) => handleMaterialCostChange(index, 'amountBasic', e.target.value)}
                                    className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                                  ₹{cost.amountWithGst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={2} className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">Total:</td>
                              <td className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                                ₹{formData.materialCosts.reduce((sum, cost) => sum + cost.amountBasic, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-3.5 text-sm font-semibold text-green-600">
                                ₹{formData.materialCosts.reduce((sum, cost) => sum + cost.amountWithGst, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Sales Order Payment Terms</h4>
                        <button
                          type="button"
                          onClick={addPaymentTerm}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment Term
                        </button>
                      </div>
                      
                      {formData.paymentTerms.length > 0 ? (
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Description</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Term Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Percentage</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {formData.paymentTerms.map((term) => (
                                <tr key={term.id}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                    <input
                                      type="text"
                                      value={term.description}
                                      onChange={(e) => updatePaymentTerm(term.id, 'description', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Description"
                                    />
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <select
                                      value={term.termType}
                                      onChange={(e) => updatePaymentTerm(term.id, 'termType', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value="">Select Term Type</option>
                                      {paymentTermTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <input
                                      type="number"
                                      value={term.percentage}
                                      onChange={(e) => updatePaymentTerm(term.id, 'percentage', parseFloat(e.target.value) || 0)}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-1">%</span>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">
                                    ₹{term.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <button
                                      type="button"
                                      onClick={() => removePaymentTerm(term.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            {formData.paymentTerms.length > 0 && (
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={2} className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">Total:</td>
                                  <td className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                                    {formData.paymentTerms.reduce((sum, term) => sum + term.percentage, 0)}%
                                  </td>
                                  <td className="px-3 py-3.5 text-sm font-semibold text-green-600">
                                    ₹{formData.paymentTerms.reduce((sum, term) => sum + term.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500">No payment terms added yet. Click "Add Payment Term" to define payment milestones.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: SO Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Sales Order Contacts</h4>
                  <button
                    type="button"
                    onClick={addContact}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </button>
                </div>
                
                {formData.contacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.contacts.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">Contact Details</h5>
                          <button
                            type="button"
                            onClick={() => removeContact(contact.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter contact name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Designation
                            </label>
                            <input
                              type="text"
                              value={contact.designation}
                              onChange={(e) => updateContact(contact.id, 'designation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter designation"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Phone *
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="+91 98765 43210"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">No contacts added yet. Click "Add Contact" to add sales order contacts.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: SO Comments */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sales Order Comments</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Comment
                  </label>
                  <textarea
                    name="orderComments"
                    value={formData.orderComments}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any comments or notes related to this sales order..."
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    These comments are for internal use only and will not be visible to the customer. Use this space to add any important notes, special instructions, or context about this sales order.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div></div>
          {/* <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button> */}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentStep < 3 ? (
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
                type="submit"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Sales Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesOrderModal;
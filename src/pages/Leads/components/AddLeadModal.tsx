import React, { useEffect, useState } from 'react';
import { X, Save, ChevronLeft, ChevronRight, Upload, MessageSquare, Trash2 } from 'lucide-react';
import axios from 'axios';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: any) => void;
  initialData?: any;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    // Step 1: General Information
    businessName: '',
    avatar: '',
    customerBranch: '',
    currency: 'INR',
    contactPerson: '',
    contactNo: '',
    leadGeneratedDate: new Date().toISOString().split('T')[0],
    referencedBy: '',
    projectName: '',
    projectValue: '',
    leadType: '',
    workType: '',
    leadCriticality: '',
    leadSource: '',
    leadStage: 'New Lead',
    leadStagnation: '',
    approximateResponseTime: '',
    eta: '',
    leadDetails: '',
    involvedAssociates: [],
    // Step 2: Upload Files
    uploadedFiles: [],
    // Step 3: Follow-up
    followUpComments: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAssociateForm, setShowAssociateForm] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [associateForm, setAssociateForm] = useState({
    designation: '',
    associateId: '',
    otherInfo: ''
  });

  const steps = [
    { id: 1, name: 'General Information', description: 'Basic lead details' },
    { id: 2, name: 'Upload Files', description: 'Supporting documents' },
    { id: 3, name: 'Follow-up Leads', description: 'Communication log' }
  ];

  // Mock data for dropdowns
  const businesses = [
    'TechCorp Solutions Pvt Ltd',
    'Innovate India Limited',
    'Digital Solutions Enterprise',
    'Manufacturing Industries Co',
    'FinTech Innovations Pvt Ltd'
  ];

  const branches = {
    'TechCorp Solutions Pvt Ltd': ['Mumbai HQ', 'Delhi Branch', 'Bangalore Office'],
    'Innovate India Limited': ['Pune Main', 'Chennai Branch', 'Hyderabad Office'],
    'Digital Solutions Enterprise': ['Gurgaon HQ', 'Noida Branch'],
    'Manufacturing Industries Co': ['Mumbai Plant', 'Aurangabad Factory'],
    'FinTech Innovations Pvt Ltd': ['Bangalore HQ', 'Mumbai Office']
  };

  const contactPersons = {
    'Mumbai HQ': ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh'],
    'Delhi Branch': ['Sneha Patel', 'Vikram Gupta', 'Kavita Reddy'],
    'Bangalore Office': ['Arjun Mehta', 'Deepika Joshi', 'Rohit Sharma']
  };

  const leadTypes = ['Government', 'Private', 'Corporate', 'SME', 'Startup'];
  const workTypes = ['Basement Ventilation', 'HVAC Systems', 'Fire Safety', 'Electrical', 'Plumbing'];
  const leadCriticalities = ['Critical', 'High', 'Medium', 'Low'];
  const leadSources = ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Trade Show', 'Advertisement'];
  const leadStages = ['New Lead', 'Qualified', 'Meeting', 'Quotation Submitted', 'Won', 'Lost'];

  const associateDesignations = [
    'Architect',
    'Consultant',
    'Engineer',
    'Designer',
    'Contractor',
    'Other'
  ];

  // Replace this with your actual registered associates source
  const registeredAssociates = [
    { id: '1', name: 'Architect A' },
    { id: '2', name: 'Consultant B' },
    { id: '3', name: 'Engineer C' },
    { id: '4', name: 'Designer D' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setUploadedFiles(formData.uploadedFiles || []);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Reset dependent fields
    if (name === 'businessName') {
      setFormData(prev => ({
        ...prev,
        businessName: value,
        customerBranch: '',
        contactPerson: ''
      }));
      return;
    }
    if (name === 'customerBranch') {
      setFormData(prev => ({
        ...prev,
        customerBranch: value,
        contactPerson: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name as keyof typeof prev].includes(value)
        ? (prev[name as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[name as keyof typeof prev] as string[]), value]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
        author: 'Current User'
      };
      setFormData(prev => ({
        ...prev,
        followUpComments: [...prev.followUpComments, comment]
      }));
      setNewComment('');
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      handleCreateLead();
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create lead API call
  const handleCreateLead = async () => {
    setIsLoading(true);
    try {
      // Map UI fields to backend keys
      const leadPayload = {
        business_name: formData.businessName,
        customer_id: null, // Will be mapped when customer integration is done
        customer_branch_id: null, // Will be mapped when customer integration is done
        contact_person: formData.contactPerson,
        contact_no: formData.contactNo,
        lead_date_generated_on: formData.leadGeneratedDate,
        referenced_by: formData.referencedBy || null,
        project_name: formData.projectName,
        project_value: parseFloat(formData.projectValue) || 0,
        lead_type: formData.leadType,
        work_type: formData.workType || null,
        lead_criticality: formData.leadCriticality,
        lead_source: formData.leadSource,
        lead_stage: formData.leadStage,
        approximate_response_time_day: parseInt(formData.approximateResponseTime) || 0,
        eta: formData.eta || null,
        lead_details: formData.leadDetails || null,
        approval_status: 'PENDING',
        approved_by: null,
        created_by: 'current_user', // Replace with actual user ID
        updated_by: 'current_user', // Replace with actual user ID
        is_active: true,
        is_deleted: false
      };

      const leadResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/lead`, leadPayload);
      const leadData = leadResponse.data.data;
      const leadId = leadData.lead_id;
      
      setCreatedLeadId(leadId);

      // If there are associates, create lead-associate entries
      if (formData.involvedAssociates && formData.involvedAssociates.length > 0) {
        const associatePayload = formData.involvedAssociates.map((associate: any) => ({
          lead_id: leadId,
          associate_type: associate.designation,
          associate_name: associate.associateName,
          other_information: associate.otherInfo || null,
          created_by: 'current_user', // Replace with actual user ID
          updated_by: 'current_user', // Replace with actual user ID
          is_active: true,
          is_deleted: false
        }));

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/lead-associate/bulk`, associatePayload);
      }

      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add follow-up comment API call
  const handleAddComment = async () => {
    if (!newComment.trim() || !createdLeadId) return;

    try {
      const commentPayload = {
        lead_id: createdLeadId,
        comment: newComment.trim()
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/lead-follow-up`, commentPayload);
      
      // Add comment to local state for UI update
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
        author: 'Current User'
      };
      setFormData(prev => ({
        ...prev,
        followUpComments: [...prev.followUpComments, comment]
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleCommentSubmit = () => {
    if (currentStep === 3 && createdLeadId) {
      handleAddComment();
    } else {
      // Fallback for local comment addition (when not connected to API)
      if (newComment.trim()) {
        const comment = {
          id: Date.now(),
          text: newComment,
          timestamp: new Date().toISOString(),
          author: 'Current User'
        };
        setFormData(prev => ({
          ...prev,
          followUpComments: [...prev.followUpComments, comment]
        }));
        setNewComment('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Close modal and notify parent component
    onSubmit({ success: true, leadId: createdLeadId });
    
    // Reset form
    setCurrentStep(1);
    setCreatedLeadId(null);
    setFormData({
      businessName: '',
      customerBranch: '',
      currency: 'INR',
      contactPerson: '',
      contactNo: '',
      leadGeneratedDate: new Date().toISOString().split('T')[0],
      referencedBy: '',
      projectName: '',
      projectValue: '',
      leadType: '',
      workType: '',
      leadCriticality: '',
      leadSource: '',
      leadStage: 'New Lead',
      leadStagnation: '',
      approximateResponseTime: '',
      eta: '',
      leadDetails: '',
      involvedAssociates: [],
      uploadedFiles: [],
      followUpComments: []
    });
    setUploadedFiles([]);
    setNewComment('');
  };

  const handleAssociateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssociateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAssociate = () => {
    if (!associateForm.designation || !associateForm.associateId) return;
    const associateName = registeredAssociates.find(a => a.id === associateForm.associateId)?.name || '';
    setFormData(prev => ({
      ...prev,
      involvedAssociates: [
        ...prev.involvedAssociates,
        {
          designation: associateForm.designation,
          associateId: associateForm.associateId,
          associateName,
          otherInfo: associateForm.otherInfo
        }
      ]
    }));
    setAssociateForm({ designation: '', associateId: '', otherInfo: '' });
    setShowAssociateForm(false);
  };

  const removeAssociate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      involvedAssociates: prev.involvedAssociates.filter((_, i) => i !== index)
    }));
  };

  const isEditMode = !!initialData;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Lead</h3>
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
                <button
                  type="button"
                  disabled={!isEditMode}
                  className={`flex items-center space-x-2 ${
                    currentStep === step.id ? 'text-blue-600' : 
                    currentStep > step.id ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
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
                </button>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <select
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Business</option>
                      {businesses.map(business => (
                        <option key={business} value={business}>{business}</option>
                      ))}
                    </select>
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
                      disabled={!formData.businessName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Branch</option>
                      {formData.businessName && branches[formData.businessName as keyof typeof branches]?.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
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
                      {formData.customerBranch &&
                        (contactPersons[formData.customerBranch as keyof typeof contactPersons] || []).map(person => (
                          <option key={person} value={person}>{person}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact No *
                    </label>
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Generated Date *
                    </label>
                    <input
                      type="date"
                      name="leadGeneratedDate"
                      value={formData.leadGeneratedDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referenced By
                    </label>
                    <input
                      type="text"
                      name="referencedBy"
                      value={formData.referencedBy}
                      onChange={handleInputChange}
                      placeholder="Enter reference source"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter project name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Value *
                    </label>
                    <input
                      type="number"
                      name="projectValue"
                      value={formData.projectValue}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter value in selected currency"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Type *
                    </label>
                    <select
                      name="leadType"
                      value={formData.leadType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Lead Type</option>
                      {leadTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Type
                    </label>
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Work Type</option>
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Criticality *
                    </label>
                    <select
                      name="leadCriticality"
                      value={formData.leadCriticality}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Criticality</option>
                      {leadCriticalities.map(criticality => (
                        <option key={criticality} value={criticality}>{criticality}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source *
                    </label>
                    <select
                      name="leadSource"
                      value={formData.leadSource}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Source</option>
                      {leadSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Stage *
                    </label>
                    <select
                      name="leadStage"
                      value={formData.leadStage}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {leadStages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approximate Response Time (Days) *
                    </label>
                    <input
                      type="number"
                      name="approximateResponseTime"
                      value={formData.approximateResponseTime}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ETA (Completion Date)
                    </label>
                    <input
                      type="date"
                      name="eta"
                      value={formData.eta}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Details
                  </label>
                  <textarea
                    name="leadDetails"
                    value={formData.leadDetails}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter detailed description of the lead..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Involved Associates
                  </label>
                  {formData.involvedAssociates.length === 0 && !showAssociateForm && (
                    <button
                      type="button"
                      onClick={() => setShowAssociateForm(true)}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                    >
                      + Tag Associate
                    </button>
                  )}

                  {showAssociateForm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <select
                          name="designation"
                          value={associateForm.designation}
                          onChange={handleAssociateFormChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        >
                          <option value="">Select Designation</option>
                          {associateDesignations.map(des => (
                            <option key={des} value={des}>{des}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          name="associateId"
                          value={associateForm.associateId}
                          onChange={handleAssociateFormChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        >
                          <option value="">Select Associate</option>
                          {registeredAssociates.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          name="otherInfo"
                          value={associateForm.otherInfo}
                          onChange={handleAssociateFormChange}
                          placeholder="Other Information"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        />
                      </div>
                      <div className="col-span-3 flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={addAssociate}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          disabled={!associateForm.designation || !associateForm.associateId}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAssociateForm(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.involvedAssociates.length > 0 && (
                    <div className="space-y-2">
                      {formData.involvedAssociates.map((a, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-thin text-sm">{a.designation}</span>{' '}
                            <span className="text-gray-700 text-sm">{a.associateName}</span>
                            {a.otherInfo && <span className="text-gray-500 ml-2 text-xs">({a.otherInfo})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAssociate(idx)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            <Trash2 className='h-5 w-5'/>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowAssociateForm(true)}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs mt-1"
                      >
                        + Tag Another Associate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Upload Files */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload RFQ documents, technical drawings, site photos, etc.
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, DWG (Max 10MB per file)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Follow-up Leads */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Follow-up Comment
                  </label>
                  <div className="flex space-x-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      placeholder="Enter follow-up notes, meeting details, customer feedback..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {formData.followUpComments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Communication History</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {formData.followUpComments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
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
                type="submit"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            ) : currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Creating...' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;
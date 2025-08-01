import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get all quotations
export const getQuotations = async () => {
  const response = await axios.get(`${API_BASE_URL}/customer-quotation/`);
  return response.data;
};

// Get quotation by ID
export const getQuotationById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/customer-quotation/${id}`);
  return response.data;
};

// Get leads
export const getLeads = async () => {
  const response = await axios.get(`${API_BASE_URL}/lead/`);
  return response.data;
};

// Get BOM by lead ID
export const getBOMByLeadId = async (leadId: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom/`, {
    params: { lead_id: leadId }
  });
  return response.data;
};

// Get BOM details by ID
export const getBOMDetailsById = async (bomId: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom/${bomId}`);
  return response.data;
};

// Create quotation
export const createQuotation = async (quotationData: any) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation/`, quotationData);
  return response.data;
};

// Create quotation specs in bulk
export const createQuotationSpecs = async (specsData: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation-bom-spec/bulk`, specsData);
  return response.data;
};

// Create quotation item details in bulk
export const createQuotationItemDetails = async (itemsData: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation-bom-item-details/bulk`, itemsData);
  return response.data;
};

// Create POC expenses in bulk
export const createPOCExpenses = async (pocData: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation-poc-expense/bulk`, pocData);
  return response.data;
};

// Update quotation
export const updateQuotation = async (id: string, updateData: any) => {
  const response = await axios.put(`${API_BASE_URL}/customer-quotation/${id}`, updateData);
  return response.data;
};

// Create cost margins in bulk
export const createCostMargins = async (marginsData: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation-cost-margin/bulk`, marginsData);
  return response.data;
};

// Create quotation comment
export const createQuotationComment = async (commentData: any) => {
  const response = await axios.post(`${API_BASE_URL}/customer-quotation-comment/`, commentData);
  return response.data;
};
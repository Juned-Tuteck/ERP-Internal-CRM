import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Key mappings for API integration
export const BOM_KEY_MAP = {
  // UI field -> Backend field
  name: 'name',
  leadId: 'lead_id',
  date: 'bom_date',
  workType: 'work_type'
};

export const LEAD_KEY_MAP = {
  // Backend field -> UI field
  lead_id: 'id',
  project_name: 'projectName',
  work_type: 'workType',
  business_name: 'businessName'
};

export const BOM_TEMPLATE_RESPONSE_KEY_MAP = {
  // Backend field -> UI field
  id: 'id',
  name: 'name',
  work_type: 'workType',
  reason: 'description',
  created_at: 'createdAt',
  is_active: 'isActive'
};

export const BOM_TEMPLATE_SPEC_KEY_MAP = {
  // Backend field -> UI field
  spec_id: 'id',
  spec_description: 'name',
  details: 'items'
};

export const BOM_TEMPLATE_DETAIL_KEY_MAP = {
  // Backend field -> UI field
  detail_id: 'detailId',
  item_id: 'itemId',
  required_quantity: 'quantity',
  item_code: 'itemCode',
  item_name: 'itemName',
  latest_lowest_basic_supply_rate: 'supplyRate',
  latest_lowest_basic_installation_rate: 'installationRate',
  latest_lowest_net_rate: 'netRate'
};

// Get all leads for dropdown
export const getLeads = async () => {
  const response = await axios.get(`${API_BASE_URL}/lead/`);
  return response.data;
};

// Create BOM
export const createBOM = async (bomData: any) => {
  const payload = {
    [BOM_KEY_MAP.name]: bomData.name,
    [BOM_KEY_MAP.leadId]: bomData.leadId,
    [BOM_KEY_MAP.date]: bomData.date,
    [BOM_KEY_MAP.workType]: bomData.workType
  };
  
  const response = await axios.post(`${API_BASE_URL}/bom/`, payload);
  return response.data;
};

// Get all BOM templates for dropdown
export const getBOMTemplates = async () => {
  const response = await axios.get(`${API_BASE_URL}/bom-template/`);
  return response.data;
};

// Get BOM template by ID with full details
export const getBOMTemplateById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom-template/${id}`);
  return response.data;
};
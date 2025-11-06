import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Key mappings for API integration
export const BOM_KEY_MAP = {
  // UI field -> Backend field
  name: "name",
  leadId: "lead_id",
  date: "bom_date",
  workType: "work_type",
  approvalStatus: "approval_status",
};

export const LEAD_KEY_MAP = {
  // Backend field -> UI field
  lead_id: "id",
  project_name: "projectName",
  work_type: "workType",
  business_name: "businessName",
  approval_status: "approvalStatus",
};

export const BOM_TEMPLATE_RESPONSE_KEY_MAP = {
  // Backend field -> UI field
  id: "id",
  name: "name",
  work_type: "workType",
  reason: "description",
  created_at: "createdAt",
  is_active: "isActive",
};

export const BOM_TEMPLATE_SPEC_KEY_MAP = {
  // Backend field -> UI field
  spec_id: "id",
  spec_description: "name",
  details: "items",
};

export const BOM_TEMPLATE_DETAIL_KEY_MAP = {
  // Backend field -> UI field
  detail_id: "detailId",
  item_id: "itemId",
  required_quantity: "quantity",
  item_code: "itemCode",
  item_name: "itemName",
  material_type: "materialType",
  latest_lowest_basic_supply_rate: "supplyRate",
  latest_lowest_basic_installation_rate: "installationRate",
  latest_lowest_net_rate: "netRate",
  uom_name: "uomName",
  brand: "brand",
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
    [BOM_KEY_MAP.workType]: bomData.workType,
    [BOM_KEY_MAP.approvalStatus]: bomData.approvalStatus,
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

// Get all BOMs
export const getBOMs = async () => {
  const response = await axios.get(`${API_BASE_URL}/bom/`);
  return response.data;
};

// Get BOM by ID with full details
export const getBOMById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom/${id}`);
  return response.data;
};

// Create BOM specs in bulk
export const createBOMSpecs = async (specs: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/bom-spec/bulk`, specs);
  return response.data;
};

// Create BOM details in bulk
export const createBOMDetails = async (details: any[]) => {
  const response = await axios.post(`${API_BASE_URL}/bom-detail/bulk`, details);
  return response.data;
};

// Update BOM
export const updateBOM = async (id: string, bomData: any) => {
  const response = await axios.put(`${API_BASE_URL}/bom/${id}`, bomData);
  return response.data;
};

// Get all items for dropdown
export const getAllItems = async () => {
  const response = await axios.patch(`${API_BASE_URL}/bom-template/items/all`);
  return response.data;
};

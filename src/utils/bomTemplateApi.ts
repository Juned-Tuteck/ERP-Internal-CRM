import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Key mappings for API integration
export const BOM_TEMPLATE_KEY_MAP = {
  // UI field -> Backend field
  name: 'name',
  workType: 'work_type',
  description: 'reason'
};

export const BOM_TEMPLATE_SPEC_KEY_MAP = {
  // UI field -> Backend field
  name: 'spec_description',
  bomTemplateId: 'bom_template_id'
};

export const BOM_TEMPLATE_DETAIL_KEY_MAP = {
  // UI field -> Backend field
  bomTemplateId: 'bom_template_id',
  bomTemplateSpecId: 'bom_template_spec_id',
  itemId: 'item_id',
  quantity: 'required_quantity',
  materialType: 'material_type'
};

export const BOM_TEMPLATE_ITEM_KEY_MAP = {
  // Backend field -> UI field
  id: 'id',
  item_code: 'itemCode',
  item_name: 'itemName'
};

// Get all BOM templates
export const getBOMTemplates = async () => {
  const response = await axios.get(`${API_BASE_URL}/bom-template/`);
  return response.data;
};

// Get BOM template by ID
export const getBOMTemplateById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom-template/${id}`);
  return response.data;
};

// Create BOM template
export const createBOMTemplate = async (templateData: any) => {
  const payload = {
    [BOM_TEMPLATE_KEY_MAP.name]: templateData.name,
    [BOM_TEMPLATE_KEY_MAP.workType]: templateData.workType,
    [BOM_TEMPLATE_KEY_MAP.description]: templateData.description
  };
  
  const response = await axios.post(`${API_BASE_URL}/bom-template/`, payload);
  return response.data;
};

// Create BOM template specs in bulk
export const createBOMTemplateSpecs = async (specs: any[]) => {
  const payload = specs.map(spec => ({
    [BOM_TEMPLATE_SPEC_KEY_MAP.name]: spec.name,
    [BOM_TEMPLATE_SPEC_KEY_MAP.bomTemplateId]: spec.bomTemplateId
  }));
  
  const response = await axios.post(`${API_BASE_URL}/bom-template-spec/bulk`, payload);
  return response.data;
};

// Create BOM template details in bulk
export const createBOMTemplateDetails = async (details: any[]) => {
  const payload = details.map(detail => ({
    [BOM_TEMPLATE_DETAIL_KEY_MAP.bomTemplateId]: detail.bomTemplateId,
    [BOM_TEMPLATE_DETAIL_KEY_MAP.bomTemplateSpecId]: detail.bomTemplateSpecId,
    [BOM_TEMPLATE_DETAIL_KEY_MAP.itemId]: detail.itemId,
    [BOM_TEMPLATE_DETAIL_KEY_MAP.quantity]: detail.quantity,
    [BOM_TEMPLATE_DETAIL_KEY_MAP.materialType]: detail.materialType || 'HIGH SIDE SUPPLY' // Default value
  }));
  
  const response = await axios.post(`${API_BASE_URL}/bom-template-detail/bulk`, payload);
  return response.data;
};

// Get BOM template items for dropdown
export const getBOMTemplateItems = async () => {
  const response = await axios.patch(`${API_BASE_URL}/bom-template/items/all`);
  
  // Map backend response to UI format
  const mappedItems = response.data.data?.map((item: any) => ({
    [BOM_TEMPLATE_ITEM_KEY_MAP.id]: item.id,
    [BOM_TEMPLATE_ITEM_KEY_MAP.item_code]: item.item_code,
    [BOM_TEMPLATE_ITEM_KEY_MAP.item_name]: item.item_name,
    uomName: '-',
    brand: '-',
    rate: 0
  })) || [];
  
  return mappedItems;
};
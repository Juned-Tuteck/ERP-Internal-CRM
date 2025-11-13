import axios from 'axios';

export interface Project {
  id: string;
  project_number: string;
  project_name: string;
  lead_number: string;
  project_type: string;
  customer_id: string;
  customer_name: string;
  created_at: string;
  project_manager: string;
  est_start_date: string;
  est_end_date: string;
  kick_off_date: string;
  last_updated: string | null;
  est_price: string;
  status: string;
  warehouse_id: string;
  project_species: string;
  actual_start: string | null;
  actual_end: string | null;
  price_customer: string;
  actual_price: string | null;
  comment_baseline: string;
  comment_other: string;
  project_template_id: string | null;
  location: string | null;
  project_address: string;
  is_insured: boolean;
  insurance_no: string | null;
  insurance_from_date: string | null;
  insurance_to_date: string | null;
  approval_status: string;
  approval_comment: string | null;
  approved_by: string | null;
  approved_on: string | null;
  completion: number;
  created_by: string;
  updated_by: string | null;
  is_active: boolean;
  is_deleted: boolean;
}

export interface CreateProjectRequest {
  // UUID fields - using string for API requests
  lead_id?: string; 
  warehouse_id?: string; 
  project_template_id?: string; 
  customer_id?: string; 
  location?: string;  
  approved_by?: string; 
  created_by: string; 
  updated_by?: string; 

  // VARCHAR fields
  project_species?: string; 
  name: string; 
  project_type?: string; 
  project_status?: string; 
  comment_baseline?: string; 
  comment_other?: string; 
  project_number?: string; 
  insurance_no?: string; 

  // DATE fields - using string for ISO date format
  estimated_start?: string; 
  estimated_end?: string; 
  actual_start?: string; 
  actual_end?: string; 
  kick_off?: string; 
  insurance_from_date?: string; 
  insurance_to_date?: string; 

  // NUMERIC fields
  price_customer?: number; 
  estimated_price?: number; 
  actual_price?: number; 

  // INTEGER fields
  completion?: number; 

  // BOOLEAN fields
  is_insured?: boolean; 
  is_active?: boolean; 
  is_deleted?: boolean; 

  // TEXT fields
  project_address?: string; 
  approval_comment?: string; 

  // ENUM and TIMESTAMP fields
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED'; 
  approved_on?: string; 
}

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_PMS_API_BASE_URL}`);
    return response.data.data as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_PMS_API_BASE_URL}/${id}`);
    return response.data.data as Project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project');
  }
};

export const createProjectFromLead = async (projectData: CreateProjectRequest) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_PMS_API_BASE_URL}`,
      projectData
    );
    return {
      success: true,
      data: response.data,
      projectId: response.data?.project_id || response.data?.id
    };
  } catch (error) {
    console.error('Error creating project from lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const createProjectFromSalesOrder = async (salesOrderData: any) => {
  try {
    const projectData = {
      lead_id: salesOrderData.lead_id || null,
      warehouse_id: salesOrderData.warehouse_id || null,
      project_species: salesOrderData.project_species || null,
      name: salesOrderData.project_name || null,
      project_type: salesOrderData.project_category || null,
      project_status: salesOrderData.project_status || 'NOT_STARTED',
      estimated_start: salesOrderData.estimated_start_date || null,
      estimated_end: salesOrderData.estimated_end_date || null,
      actual_start: salesOrderData.actual_start || null,
      actual_end: salesOrderData.actual_end || null,
      price_customer: salesOrderData.total_cost || null,
      estimated_price: salesOrderData.total_cost || null,
      actual_price: salesOrderData.actual_price || null,
      kick_off: salesOrderData.kick_off || null,
      comment_baseline: salesOrderData.comment_baseline || null,
      comment_other: salesOrderData.so_comments || null,
      project_template_id: salesOrderData.project_template_id || null,
      customer_id: salesOrderData.customer_id || null,
      location: salesOrderData.location || null,
      project_address: salesOrderData.project_address || null,
      project_number: salesOrderData.project_number || null,
      is_insured: salesOrderData.is_insured || false,
      insurance_no: salesOrderData.insurance_no || null,
      insurance_from_date: salesOrderData.insurance_from_date || null,
      insurance_to_date: salesOrderData.insurance_to_date || null,
      approval_status: 'PENDING',
      approval_comment: `Created from Sales Order: ${salesOrderData.so_number}`,
      approved_by: null,
      approved_on: null,
      completion: 0,
      created_by: salesOrderData.created_by || null
    };

    const response = await axios.post(
      `${import.meta.env.VITE_PMS_API_BASE_URL}`,
      projectData,
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    return {
      success: true,
      statusCode: 201,
      data: response.data,
      clientMessage: 'Project created successfully from Sales Order',
      devMessage: 'Insert query executed successfully'
    };
  } catch (error) {
    console.error('Error creating project from sales order:', error);
    return {
      success: false,
      statusCode: 500,
      data: null,
      clientMessage: 'Failed to create project from Sales Order',
      devMessage: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const updateSOStatusToProjectCreated = async (salesOrderId: string) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`,
      { is_project_created: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating sales order status:', error);
    throw new Error('Failed to update sales order status');
  }
};
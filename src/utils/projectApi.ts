import axios from 'axios';

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

import axios from "axios";

// Define the Competitor interface based on the API response
export interface Competitor {
    id: string;
    competitor_number: string;
    company_name: string;
    competitor_group?: string;
    industry_type?: string;
    contact_number?: number;
    alternate_number?: number;
    email_id?: string;
    currency?: string;
    competitor_classification?: string;
    msme_status?: boolean;
    udyam_registration_number?: string;
    experience_years?: number;
    ho_contact_number?: string;
    ho_email_id?: string;
    address_type?: string;
    branch_project_name?: string;
    zone_id?: string;
    state_id?: string;
    district_id?: string;
    city?: string;
    pincode?: string;
    street?: string;
    location?: string;
    associate_potential?: number;
    current_status?: string;
    commission_percentage?: number;
    gst_number?: string;
    pan_number?: string;
    tan_number?: string;
    bank_id?: string;
    bank_account_no?: string;
    bank_branch_name?: string;
    ifsc_code?: string;
    approval_status?: "PENDING" | "APPROVED" | "REJECTED";
    approved_by?: string | null;
    created_at: string;
    created_by: string;
    updated_at?: string | null;
    updated_by?: string | null;
    is_active: boolean;
    is_deleted: boolean;
}

// Fetch all competitors from the API
export const getCompetitors = async (): Promise<Competitor[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

// Get competitor by ID with full details (branches, contacts, files)
export const getCompetitorById = async (id: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor/${id}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || null;
};

// Get pending competitors (not APPROVED or REJECTED)
export const getPendingCompetitors = async (): Promise<Competitor[]> => {
    const competitors = await getCompetitors();
    return competitors.filter(
        (competitor) =>
            competitor.approval_status !== "APPROVED" &&
            competitor.approval_status !== "REJECTED"
    );
};

// Create a new competitor
export const createCompetitor = async (
    competitorData: Record<string, unknown>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor`,
        competitorData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Update competitor fields using PUT /competitor/:id
export const updateCompetitor = async (
    competitorId: string,
    fields: Record<string, unknown>
): Promise<unknown> => {
    if (!competitorId) throw new Error("competitorId is required");

    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/competitor/${competitorId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Delete (soft delete) a competitor
export const deleteCompetitor = async (competitorId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/competitor/${competitorId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Approve a competitor
export const approveCompetitor = async (
    competitorId: string,
    reason?: string
): Promise<any> => {
    const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/competitor/${competitorId}/approve`,
        {
            approval_status: "APPROVED",
            notes: reason,
        },
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Reject a competitor
export const rejectCompetitor = async (
    competitorId: string,
    reason: string
): Promise<any> => {
    const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/competitor/${competitorId}/reject`,
        {
            approval_status: "REJECTED",
            rejection_reason: reason,
        },
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ========== Competitor Contact APIs ==========

// Get all competitor contacts (optionally filter by competitor_id)
export const getCompetitorContacts = async (
    competitorId?: string
): Promise<any[]> => {
    const url = competitorId
        ? `${import.meta.env.VITE_API_BASE_URL}/competitor-contact?competitor_id=${competitorId}`
        : `${import.meta.env.VITE_API_BASE_URL}/competitor-contact`;

    const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
    });

    return response.data.data || [];
};

// Get competitor contact by ID
export const getCompetitorContactById = async (id: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-contact/${id}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || null;
};

// Create a single competitor contact
export const createCompetitorContact = async (
    contactData: Record<string, unknown>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-contact`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Bulk create competitor contacts
export const bulkCreateCompetitorContacts = async (
    contacts: Array<Record<string, unknown>>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-contact/bulk`,
        contacts,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Update competitor contact
export const updateCompetitorContact = async (
    contactId: string,
    fields: Record<string, unknown>
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-contact/${contactId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Delete competitor contact
export const deleteCompetitorContact = async (
    contactId: string
): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ========== Competitor Branch APIs ==========

// Get all competitor branches (optionally filter by competitor_id)
export const getCompetitorBranches = async (
    competitorId?: string
): Promise<any[]> => {
    const url = competitorId
        ? `${import.meta.env.VITE_API_BASE_URL}/competitor-branch?competitor_id=${competitorId}`
        : `${import.meta.env.VITE_API_BASE_URL}/competitor-branch`;

    const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
    });

    return response.data.data || [];
};

// Get competitor branch by ID
export const getCompetitorBranchById = async (id: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch/${id}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || null;
};

// Create a single competitor branch
export const createCompetitorBranch = async (
    branchData: Record<string, unknown>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch`,
        branchData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Bulk create competitor branches
export const bulkCreateCompetitorBranches = async (
    branches: Array<Record<string, unknown>>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch/bulk`,
        branches,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Update competitor branch
export const updateCompetitorBranch = async (
    branchId: string,
    fields: Record<string, unknown>
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch/${branchId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Delete competitor branch
export const deleteCompetitorBranch = async (branchId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch/${branchId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ========== Competitor Branch Contact APIs ==========

// Get all competitor branch contacts (optionally filter by competitor_branch_id)
export const getCompetitorBranchContacts = async (
    branchId?: string
): Promise<any[]> => {
    const url = branchId
        ? `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact?competitor_branch_id=${branchId}`
        : `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact`;

    const response = await axios.get(url, {
        headers: { "Cache-Control": "no-cache" },
    });

    return response.data.data || [];
};

// Get competitor branch contact by ID
export const getCompetitorBranchContactById = async (
    id: string
): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact/${id}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || null;
};

// Create a single competitor branch contact
export const createCompetitorBranchContact = async (
    contactData: Record<string, unknown>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Bulk create competitor branch contacts
export const bulkCreateCompetitorBranchContacts = async (
    contacts: Array<Record<string, unknown>>
): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact/bulk`,
        contacts,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Update competitor branch contact
export const updateCompetitorBranchContact = async (
    contactId: string,
    fields: Record<string, unknown>
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact/${contactId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Delete competitor branch contact
export const deleteCompetitorBranchContact = async (
    contactId: string
): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-branch-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ========== Competitor File APIs ==========

/**
 * Upload files for a competitor
 * @param competitorId - Competitor ID
 * @param files - Array of files to upload
 * @param uploadBy - User ID who is uploading
 * @returns Upload response data
 */
export const uploadCompetitorFiles = async (
    competitorId: string,
    files: File[],
    uploadBy: string
): Promise<any> => {
    const formData = new FormData();

    files.forEach((file) => {
        formData.append('files', file);
    });
    formData.append('upload_by', uploadBy);

    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file/${competitorId}/files`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

/**
 * Download a competitor file
 * @param competitorId - Competitor ID
 * @param fileId - File ID
 * @returns Blob data for download
 */
export const downloadCompetitorFile = async (
    competitorId: string,
    fileId: string
): Promise<Blob> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file/${competitorId}/files/${fileId}/download`,
        {
            responseType: 'blob',
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Get all competitor files
export const getCompetitorFiles = async (): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

// Get competitor file by ID
export const getCompetitorFileById = async (id: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file/${id}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || null;
};

// Update competitor file record
export const updateCompetitorFile = async (
    fileId: string,
    fields: Record<string, unknown>
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file/${fileId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data;
};

// Delete competitor file
export const deleteCompetitorFile = async (fileId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-file/${fileId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ========== Competitor Compliance File APIs ==========

/**
 * Upload a compliance file for a competitor
 * @param competitorId - Competitor ID
 * @param file - File to upload
 * @param documentType - Type of document (PAN | TAN | GST | MSME | BANK | OTHER)
 * @param entityLevel - Entity level (HO | BRANCH)
 * @param competitorBranchId - Branch ID (required for BRANCH level)
 * @param uploadBy - User ID who is uploading
 * @returns Upload response data
 */
export const uploadCompetitorComplianceFile = async (
    competitorId: string,
    file: File,
    documentType: string,
    entityLevel: string,
    competitorBranchId: string | null,
    uploadBy: string
): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('entity_level', entityLevel);
    formData.append('upload_by', uploadBy);

    if (entityLevel === 'BRANCH' && competitorBranchId) {
        formData.append('competitor_branch_id', competitorBranchId);
    }

    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

/**
 * Get all compliance files for a competitor
 * @param competitorId - Competitor ID
 * @returns Array of compliance files
 */
export const getCompetitorComplianceFiles = async (
    competitorId: string
): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

/**
 * Download a competitor compliance file
 * @param competitorId - Competitor ID
 * @param fileId - File ID
 * @returns Blob data for download
 */
export const downloadCompetitorComplianceFile = async (
    competitorId: string,
    fileId: string
): Promise<Blob> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/competitor-compliance-file/${competitorId}/compliance-files/${fileId}/download`,
        {
            responseType: 'blob',
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

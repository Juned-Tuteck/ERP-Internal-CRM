import axios from "axios";

// Define the Associate interface based on the API response
export interface Associate {
    associate_id: string;
    associate_number: string;
    business_name: string;
    contact_number: string;
    email: string;
    country: string;
    currency: string;
    state: string;
    district: string;
    city: string;
    associate_type: string;
    associate_potential: string;
    pincode: string;
    active: boolean;
    pan_number: string;
    tan_number?: string;
    gst_number: string;
    bank_name: string;
    bank_account_number?: string;
    branch_name?: string;
    ifsc_code?: string;
    approval_status: "PENDING" | "APPROVED" | "REJECTED";
    approved_by?: string | null;
    created_at: string;
    created_by: string;
    updated_at?: string | null;
    updated_by?: string | null;
    is_active: boolean;
    is_deleted: boolean;
}

// Fetch all associates from the API
export const getAssociates = async (): Promise<Associate[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate/`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data || [];
};

// Get associate by ID with details (branches, contacts, files)
export const getAssociateById = async (associateId: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Get pending associates (not APPROVED or REJECTED)
export const getPendingAssociates = async (): Promise<Associate[]> => {
    const associates = await getAssociates();
    return associates.filter(
        (associate) =>
            associate.approval_status !== "APPROVED" &&
            associate.approval_status !== "REJECTED"
    );
};

// Create a new associate
export const createAssociate = async (associateData: any): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate`,
        associateData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Update an associate
export const updateAssociate = async (
    associateId: string,
    fields: Record<string, unknown>
): Promise<unknown> => {
    if (!associateId) throw new Error('associateId is required');

    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}`,
        fields,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Approve an associate
export const approveAssociate = async (
    associateId: string,
    reason?: string
): Promise<any> => {
    const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}/decision?status=approved`,
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

// Reject an associate
export const rejectAssociate = async (
    associateId: string,
    reason: string
): Promise<any> => {
    const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}/decision?status=rejected`,
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

// Soft delete an associate
export const deleteAssociate = async (associateId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ==================== ASSOCIATE BRANCH APIs ====================

// Get all branches for an associate
export const getAssociateBranches = async (associateId: string): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch?associate_id=${associateId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

// Get branch by ID
export const getAssociateBranchById = async (branchId: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch/${branchId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Create a single branch
export const createAssociateBranch = async (branchData: any): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch`,
        branchData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Bulk create branches
export const bulkCreateAssociateBranches = async (branches: any[]): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch/bulk`,
        { branches },
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Update a branch
export const updateAssociateBranch = async (
    branchId: string,
    branchData: any
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch/${branchId}`,
        branchData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Delete a branch
export const deleteAssociateBranch = async (branchId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch/${branchId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ==================== ASSOCIATE CONTACT APIs ====================

// Get all contacts for an associate
export const getAssociateContacts = async (associateId: string): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact?associate_id=${associateId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

// Get contact by ID
export const getAssociateContactById = async (contactId: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Create a single contact
export const createAssociateContact = async (contactData: any): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Bulk create contacts
export const bulkCreateAssociateContacts = async (contacts: any[]): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact/bulk`,
        { contacts },
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Update a contact
export const updateAssociateContact = async (
    contactId: string,
    contactData: any
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${contactId}`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Delete a contact
export const deleteAssociateContact = async (contactId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ==================== ASSOCIATE BRANCH CONTACT APIs ====================

// Get all branch contacts for a branch
export const getAssociateBranchContacts = async (branchId: string): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact?associate_branch_id=${branchId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

// Get branch contact by ID
export const getAssociateBranchContactById = async (contactId: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Create a single branch contact
export const createAssociateBranchContact = async (contactData: any): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Bulk create branch contacts
export const bulkCreateAssociateBranchContacts = async (contacts: any[]): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact/bulk`,
        { contacts },
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Update a branch contact
export const updateAssociateBranchContact = async (
    contactId: string,
    contactData: any
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact/${contactId}`,
        contactData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// Delete a branch contact
export const deleteAssociateBranchContact = async (contactId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact/${contactId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ==================== ASSOCIATE COMPLIANCE FILE APIs ====================

/**
 * Upload a compliance file for an associate
 * @param associateId - Associate ID
 * @param file - File to upload
 * @param documentType - Type of document (PAN, TAN, GST, BANK)
 * @param entityLevel - Entity level (HO or BRANCH)
 * @param associateBranchId - Branch ID (required for BRANCH level)
 * @param uploadBy - User ID who is uploading
 * @returns Upload response data
 */
export const uploadAssociateComplianceFile = async (
    associateId: string,
    file: File,
    documentType: string,
    entityLevel: string,
    associateBranchId: string | null,
    uploadBy: string
): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('entity_level', entityLevel);
    formData.append('upload_by', uploadBy);

    if (entityLevel === 'BRANCH' && associateBranchId) {
        formData.append('associate_branch_id', associateBranchId);
    }

    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${associateId}/compliance-files`,
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
 * Get all compliance files for an associate
 * @param associateId - Associate ID
 * @returns Array of compliance files
 */
export const getAssociateComplianceFiles = async (associateId: string): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${associateId}/compliance-files`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

/**
 * Download a compliance file
 * @param associateId - Associate ID
 * @param fileId - File ID
 * @returns Blob data for download
 */
export const downloadAssociateComplianceFile = async (
    associateId: string,
    fileId: string
): Promise<Blob> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${associateId}/compliance-files/${fileId}/download`,
        {
            responseType: 'blob',
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

// ==================== ALIAS EXPORTS FOR COMPATIBILITY ====================
// These aliases match the naming convention used in AddAssociateModal.tsx
// and provide consistency with the customer API pattern

/**
 * Alias for uploadAssociateComplianceFile
 * Upload a compliance file for an associate
 */
export const uploadComplianceFile = uploadAssociateComplianceFile;

/**
 * Alias for getAssociateComplianceFiles
 * Get all compliance files for an associate
 */
export const getComplianceFiles = getAssociateComplianceFiles;

/**
 * Alias for downloadAssociateComplianceFile
 * Download a compliance file
 */
export const downloadComplianceFile = downloadAssociateComplianceFile;


// ==================== ASSOCIATE FILE APIs ====================

/**
 * Upload files for an associate (max 10)
 * @param associateId - Associate ID
 * @param files - Files to upload
 * @returns Upload response data
 */
export const uploadAssociateFiles = async (
    associateId: string,
    files: File[]
): Promise<any> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file/${associateId}/files`,
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
 * Download an associate file
 * @param associateId - Associate ID
 * @param fileId - File ID
 * @returns Blob data for download
 */
export const downloadAssociateFile = async (
    associateId: string,
    fileId: string
): Promise<Blob> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file/${associateId}/files/${fileId}/download`,
        {
            responseType: 'blob',
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

/**
 * Get all files for an associate
 * @returns Array of associate files
 */
export const getAssociateFiles = async (): Promise<any[]> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data.data || [];
};

/**
 * Get file by ID
 * @param fileId - File ID
 * @returns File data
 */
export const getAssociateFileById = async (fileId: string): Promise<any> => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file/${fileId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

/**
 * Create a file record
 * @param fileData - File data
 * @returns Created file data
 */
export const createAssociateFile = async (fileData: any): Promise<any> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file`,
        fileData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

/**
 * Update a file record
 * @param fileId - File ID
 * @param fileData - Updated file data
 * @returns Updated file data
 */
export const updateAssociateFile = async (
    fileId: string,
    fileData: any
): Promise<any> => {
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file/${fileId}`,
        fileData,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

/**
 * Delete a file
 * @param fileId - File ID
 * @returns Delete response
 */
export const deleteAssociateFile = async (fileId: string): Promise<any> => {
    const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/associate-file/${fileId}`,
        {
            headers: { "Cache-Control": "no-cache" },
        }
    );

    return response.data;
};

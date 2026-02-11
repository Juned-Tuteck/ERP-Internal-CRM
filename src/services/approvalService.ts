import axios from 'axios';
import {
    ApprovalRequest,
    ApprovalHistory,
    PendingApproval,
    InitiateApprovalPayload,
    ApprovalActionPayload,
    ApprovalHistoryResponse,
    HierarchyLevel
} from '../types/approval.types';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/approvals`;

interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    clientMessage: string;
    devMessage: string;
}

export const approvalService = {
    /**
     * Initiate approval process for an entity
     */
    initiateApproval: async (payload: InitiateApprovalPayload) => {
        const response = await axios.post<ApiResponse<{
            approval_request_id: string;
            current_level: number;
        }>>(`${API_BASE}/initiate`, payload);
        return response.data;
    },

    /**
     * Get pending approvals for current user
     */
    getPendingApprovals: async (
        userId: string,
        entityType?: string,
        page = 1,
        limit = 20
    ) => {
        const params = new URLSearchParams();
        params.append('user_id', userId);
        if (entityType) params.append('entity_type', entityType);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await axios.get<ApiResponse<{
            approvals: PendingApproval[];
            total: number;
            page: number;
            limit: number;
        }>>(`${API_BASE}/pending?${params}`);
        return response.data;
    },

    /**
     * Get approval history for an entity
     */
    getApprovalHistory: async (entityType: string, entityId: string) => {
        const response = await axios.get<ApiResponse<ApprovalHistoryResponse>>(
            `${API_BASE}/history/${entityType}/${entityId}`
        );
        return response.data;
    },

    /**
     * Approve a request
     */
    approveRequest: async (approvalId: string, payload: ApprovalActionPayload) => {
        const response = await axios.post<ApiResponse<{
            next_level?: number;
            status?: string;
        }>>(`${API_BASE}/approve/${approvalId}`, payload);
        return response.data;
    },

    /**
     * Reject a request
     */
    rejectRequest: async (approvalId: string, payload: ApprovalActionPayload) => {
        const response = await axios.post<ApiResponse<{
            status: string;
        }>>(`${API_BASE}/reject/${approvalId}`, payload);
        return response.data;
    },

    /**
     * Recall a request (only by original requester)
     */
    recallRequest: async (approvalId: string, userId: string) => {
        const response = await axios.post<ApiResponse<{
            status: string;
        }>>(`${API_BASE}/recall/${approvalId}`, { user_id: userId });
        return response.data;
    },

    /**
     * Get approval hierarchy for an access/menu
     */
    getApprovalHierarchy: async (accessId: string) => {
        const response = await axios.get<ApiResponse<HierarchyLevel[]>>(
            `${API_BASE}/hierarchy/${accessId}`
        );
        return response.data;
    },

    /**
     * Check if hierarchy exists for an access/menu
     */
    checkHierarchyExists: async (accessId: string): Promise<boolean> => {
        try {
            const result = await approvalService.getApprovalHierarchy(accessId);
            return result.success && result.data && result.data.length > 0;
        } catch (error) {
            console.error('Error checking hierarchy:', error);
            return false;
        }
    },

    /**
     * Get complete hierarchy status for an entity
     */
    getHierarchyStatus: async (entityType: string, entityId: string) => {
        const response = await axios.get<ApiResponse<{
            has_hierarchy: boolean;
            approval_request_id: string | null;
            current_level: number | null;
            overall_status: string | null;
            hierarchy_progress: Array<{
                level: number;
                role_name: string;
                status: 'approved' | 'rejected' | 'pending' | 'awaiting';
                approver_name: string | null;
                approved_at: string | null;
            }>;
        }>>(`${API_BASE}/hierarchy-status/${entityType}/${entityId}`);
        return response.data;
    }
};

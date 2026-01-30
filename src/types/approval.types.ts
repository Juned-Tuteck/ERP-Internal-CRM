// Approval System Type Definitions
// Note: These match the backend crm.approval_status_enum values

export type ApprovalStatus =
    | 'PENDING'           // Initial status for leads
    | 'PENDING_FOR_APPROVAL'  // Hierarchical approval in progress
    | 'APPROVED'          // Final approval granted
    | 'REJECTED'          // Rejected at any level
    | 'REVISIT';          // Needs revision

export type ApprovalAction = 'approved' | 'rejected' | 'pending';

export interface ApprovalRequest {
    id: string;
    entity_type: string;
    entity_id: string;
    access_id: string;
    current_level: number;
    current_approver_role_id: string;
    overall_status: ApprovalStatus;
    requested_by: string;
    requested_at: string;
    completed_at?: string;
}

export interface ApprovalHistory {
    id: string;
    approval_request_id: string;
    hierarchy_level: number;
    approver_role_id: string;
    approver_role_name: string;
    approver_user_id?: string;
    approver_user_name?: string;
    action: ApprovalAction;
    comments?: string;
    action_at?: string;
}

export interface PendingApproval {
    approval_request_id: string;
    entity_type: string;
    entity_id: string;
    entity_details: any;
    current_level: number;
    requested_by: string;
    requested_at: string;
    current_approver_role?: string;
}

export interface InitiateApprovalPayload {
    entity_type: string;
    entity_id: string;
    access_id: string;
    requested_by: string;
}

export interface ApprovalActionPayload {
    user_id: string;
    comments?: string;
}

export interface ApprovalHistoryResponse {
    approval_request: {
        id: string;
        overall_status: ApprovalStatus;
        requested_by: string;
        requested_at: string;
        completed_at?: string;
    };
    history: Array<{
        level: number;
        role: string;
        approver?: string;
        action: ApprovalAction;
        comments?: string;
        action_at?: string;
    }>;
}

export interface HierarchyLevel {
    access_id: string;
    hierarchy_level: number;
    role_id: string;
    parent_role_id: string | null;
    sort_order: number;
    role_name: string;
    parent_role_name: string | null;
}

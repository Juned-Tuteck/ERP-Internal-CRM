import { useState, useCallback } from 'react';
import { approvalService } from '../services/approvalService';
import { useToast } from '../components/Toast';

export const useApprovals = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const initiateApproval = useCallback(async (
        entityType: string,
        entityId: string,
        accessId: string,
        userId: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await approvalService.initiateApproval({
                entity_type: entityType,
                entity_id: entityId,
                access_id: accessId,
                requested_by: userId
            });

            if (result.success) {
                showToast(result.clientMessage || 'Approval request sent successfully', 'success');
                return result;
            } else {
                throw new Error(result.clientMessage || 'Failed to initiate approval');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.clientMessage || err.message || 'Failed to initiate approval';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const approveRequest = useCallback(async (
        approvalId: string,
        userId: string,
        comments?: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await approvalService.approveRequest(approvalId, {
                user_id: userId,
                comments
            });

            if (result.success) {
                showToast(result.clientMessage || 'Approved successfully', 'success');
                return result;
            } else {
                throw new Error(result.clientMessage || 'Failed to approve');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.clientMessage || err.message || 'Failed to approve';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const rejectRequest = useCallback(async (
        approvalId: string,
        userId: string,
        comments?: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await approvalService.rejectRequest(approvalId, {
                user_id: userId,
                comments
            });

            if (result.success) {
                showToast(result.clientMessage || 'Request rejected', 'success');
                return result;
            } else {
                throw new Error(result.clientMessage || 'Failed to reject');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.clientMessage || err.message || 'Failed to reject';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const recallRequest = useCallback(async (
        approvalId: string,
        userId: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await approvalService.recallRequest(approvalId, userId);

            if (result.success) {
                showToast(result.clientMessage || 'Request recalled successfully', 'success');
                return result;
            } else {
                throw new Error(result.clientMessage || 'Failed to recall');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.clientMessage || err.message || 'Failed to recall';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const checkHierarchyExists = useCallback(async (accessId: string): Promise<boolean> => {
        try {
            return await approvalService.checkHierarchyExists(accessId);
        } catch (err) {
            console.error('Error checking hierarchy:', err);
            return false;
        }
    }, []);

    return {
        loading,
        error,
        initiateApproval,
        approveRequest,
        rejectRequest,
        recallRequest,
        checkHierarchyExists
    };
};

import React, { useState } from 'react';
import { Send, Loader2, Clock, CheckCircle } from 'lucide-react';
import { useApprovals } from '../../hooks/useApprovals';
import { ApprovalStatus } from '../../types/approval.types';

interface ApprovalButtonProps {
    entityType: string;
    entityId: string;
    accessId: string;
    userId: string;
    currentStatus: ApprovalStatus;
    onSuccess?: () => void;
    disabled?: boolean;
    className?: string;
}

export const ApprovalButton: React.FC<ApprovalButtonProps> = ({
    entityType,
    entityId,
    accessId,
    userId,
    currentStatus,
    onSuccess,
    disabled = false,
    className = ''
}) => {
    const { loading, initiateApproval, checkHierarchyExists } = useApprovals();
    const [checking, setChecking] = useState(false);
    console.log("currentStatus", currentStatus);

    const handleSendForApproval = async () => {
        try {
            setChecking(true);

            // Check if hierarchy exists
            const hierarchyExists = await checkHierarchyExists(accessId);

            if (!hierarchyExists) {
                // No hierarchy configured - inform user
                alert('No approval hierarchy is configured for this module. Please contact your administrator.');
                return;
            }

            // Hierarchy exists - initiate approval
            await initiateApproval(entityType, entityId, accessId, userId);
            onSuccess?.();
        } catch (error) {
            // Error already handled in hook with toast
            console.error('Error initiating approval:', error);
        } finally {
            setChecking(false);
        }
    };

    // Hide button only for rejected/revisit status
    if (['REJECTED', 'REVISIT'].includes(currentStatus.toUpperCase())) {
        return null;
    }

    const isLoading = loading || checking;
    const isApprovalInProgress = currentStatus.toUpperCase() === 'PENDING_FOR_APPROVAL';
    const isApproved = currentStatus.toUpperCase() === 'APPROVED';

    return (
        <button
            onClick={handleSendForApproval}
            disabled={disabled || isLoading || isApprovalInProgress || isApproved}
            title={
                isApproved ? 'Already approved' :
                    isApprovalInProgress ? 'Approval already in progress' :
                        'Send for approval'
            }
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isApproved
                ? 'bg-green-500 cursor-not-allowed'
                : isApprovalInProgress
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {checking ? 'Checking...' : 'Sending...'}
                </>
            ) : isApproved ? (
                <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approved
                </>
            ) : isApprovalInProgress ? (
                <>
                    <Clock className="h-4 w-4 mr-2" />
                    Approval In Progress
                </>
            ) : (
                <>
                    <Send className="h-4 w-4 mr-2" />
                    Send for Approval
                </>
            )}
        </button>
    );
};

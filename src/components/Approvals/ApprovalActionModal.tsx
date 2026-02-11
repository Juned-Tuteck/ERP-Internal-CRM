import React, { useState } from 'react';
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';
import { useApprovals } from '../../hooks/useApprovals';
import { PendingApproval } from '../../types/approval.types';

interface ApprovalActionModalProps {
    approval: PendingApproval;
    userId: string;
    onClose: () => void;
    onComplete: () => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
    approval,
    userId,
    onClose,
    onComplete
}) => {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const { loading, approveRequest, rejectRequest } = useApprovals();

    const handleSubmit = async () => {
        if (!action) return;

        // Validate comments for rejection
        if (action === 'reject' && !comments.trim()) {
            alert('Comments are required when rejecting');
            return;
        }

        try {
            if (action === 'approve') {
                await approveRequest(approval.approval_request_id, userId, comments || undefined);
            } else {
                await rejectRequest(approval.approval_request_id, userId, comments);
            }
            onComplete();
        } catch (error) {
            // Error already handled in hook
            console.error('Error processing approval action:', error);
        }
    };

    const handleActionSelect = (selectedAction: 'approve' | 'reject') => {
        setAction(selectedAction);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Approval Request
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Entity Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm space-y-2">
                            <div>
                                <span className="text-gray-600">Type:</span>
                                <span className="ml-2 font-medium capitalize">{approval.entity_type}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Details:</span>
                                <span className="ml-2 font-medium">
                                    {approval.entity_details?.project_name ||
                                        approval.entity_details?.business_name ||
                                        approval.entity_details?.name ||
                                        'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Requested by:</span>
                                <span className="ml-2 font-medium">{approval.requested_by}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Requested at:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(approval.requested_at).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Current Level:</span>
                                <span className="ml-2 font-medium">Level {approval.current_level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Selection */}
                    {!action && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Choose an action:</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleActionSelect('approve')}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleActionSelect('reject')}
                                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                >
                                    <XCircle className="h-5 w-5 mr-2" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    {action && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                {action === 'approve' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                )}
                                <span className="font-medium">
                                    {action === 'approve' ? 'Approving Request' : 'Rejecting Request'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {action === 'approve' ? 'Comments (Optional)' : 'Rejection Reason *'}
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows={3}
                                    required={action === 'reject'}
                                    placeholder={
                                        action === 'approve'
                                            ? 'Add any notes...'
                                            : 'Please provide reason for rejection...'
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            if (action) {
                                setAction(null);
                                setComments('');
                            } else {
                                onClose();
                            }
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        {action ? 'Back' : 'Cancel'}
                    </button>
                    {action && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (action === 'reject' && !comments.trim())}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${action === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    {action === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Approval
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Confirm Rejection
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

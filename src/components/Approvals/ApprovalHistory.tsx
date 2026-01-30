import React, { useEffect, useState } from 'react';
import { approvalService } from '../../services/approvalService';
import { CheckCircle, XCircle, Clock, User, Circle } from 'lucide-react';

interface ApprovalHistoryProps {
    entityType: string;
    entityId: string;
}

interface HierarchyStatusData {
    has_hierarchy: boolean;
    approval_request_id: string | null;
    current_level: number | null;
    overall_status: string | null;
    hierarchy_progress: Array<{
        level: number;
        role_name: string;
        status: 'approved' | 'rejected' | 'pending' | 'awaiting' | 'initiator';
        approver_name: string | null;
        approved_at: string | null;
    }>;
}

export const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({
    entityType,
    entityId
}) => {
    const [historyData, setHistoryData] = useState<HierarchyStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, [entityType, entityId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await approvalService.getHierarchyStatus(entityType, entityId);

            if (response.success) {
                setHistoryData(response.data);
            } else {
                setError(response.clientMessage || 'Failed to load approval history');
            }
        } catch (err: any) {
            console.error('Failed to load approval history:', err);
            setError(err.response?.data?.clientMessage || 'Failed to load approval history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'initiator':
                return <User className="h-5 w-5 text-blue-600" />;
            case 'awaiting':
            default:
                return <Circle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Rejected</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>;
            case 'initiator':
                return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Initiator</span>;
            case 'awaiting':
            default:
                return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Not Reached</span>;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center text-gray-500">Loading approval history...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    if (!historyData || !historyData.has_hierarchy) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center text-gray-500">No approval hierarchy configured</div>
            </div>
        );
    }

    const { overall_status, current_level, hierarchy_progress } = historyData;

    return (
        <div className="bg-white rounded-lg">
            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Overall Status:</span>
                        <span className="ml-2 font-medium capitalize">{overall_status || 'Pending'}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Current Level:</span>
                        <span className="ml-2 font-medium">
                            {current_level ? `Level ${current_level}` : 'Not Started'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Hierarchy Progress Timeline */}
            <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Approval Timeline</h4>
                <div className="space-y-4">
                    {hierarchy_progress.map((level) => (
                        <div key={level.level} className="flex items-start space-x-4">
                            {/* Level Indicator */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-800">
                                L{level.level}
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(level.status)}
                                        <div>
                                            <div className="font-medium text-gray-900">{level.role_name}</div>
                                            {level.approver_name && (
                                                <div className="text-sm text-gray-600 flex items-center mt-1">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {level.approver_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusBadge(level.status)}
                                </div>

                                {level.approved_at && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        {new Date(level.approved_at).toLocaleString('en-IN', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

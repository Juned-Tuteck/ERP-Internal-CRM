import React, { useEffect, useState } from 'react';
import { approvalService } from '../../services/approvalService';
import { PendingApproval } from '../../types/approval.types';
import { ApprovalActionModal } from './ApprovalActionModal';
import { Search, Clock } from 'lucide-react';

interface PendingApprovalsProps {
    userId: string;
    entityType?: string;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
    userId,
    entityType
}) => {
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        loadPendingApprovals();
    }, [userId, entityType, page]);

    const loadPendingApprovals = async () => {
        try {
            setLoading(true);
            const response = await approvalService.getPendingApprovals(
                userId,
                entityType,
                page,
                limit
            );

            if (response.success) {
                setApprovals(response.data.approvals);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Failed to load pending approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalClick = (approval: PendingApproval) => {
        setSelectedApproval(approval);
        setShowModal(true);
    };

    const handleActionComplete = () => {
        setShowModal(false);
        setSelectedApproval(null);
        loadPendingApprovals(); // Reload list
    };

    const filteredApprovals = approvals.filter((approval) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            approval.entity_type.toLowerCase().includes(searchLower) ||
            approval.requested_by.toLowerCase().includes(searchLower) ||
            JSON.stringify(approval.entity_details).toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-500">Loading pending approvals...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Pending Approvals
                            </h3>
                            <p className="text-sm text-gray-500">
                                {filteredApprovals.length} approval{filteredApprovals.length !== 1 ? 's' : ''} awaiting your action
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-amber-600">
                            <Clock className="h-4 w-4" />
                            <span>Action Required</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search approvals..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredApprovals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {searchTerm
                                ? 'No approvals match your search criteria'
                                : 'No pending approvals'}
                        </div>
                    ) : (
                        filteredApprovals.map((approval) => (
                            <div
                                key={approval.approval_request_id}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                                onClick={() => handleApprovalClick(approval)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900 capitalize">
                                                {approval.entity_type}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                                                Level {approval.current_level}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            {approval.entity_details?.project_name ||
                                                approval.entity_details?.business_name ||
                                                approval.entity_details?.name ||
                                                approval.entity_id}
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                            <span>Requested by: {approval.requested_by}</span>
                                            <span>•</span>
                                            <span>
                                                {new Date(approval.requested_at).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="ml-4 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApprovalClick(approval);
                                        }}
                                    >
                                        Review →
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {total > limit && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page * limit >= total}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && selectedApproval && (
                <ApprovalActionModal
                    approval={selectedApproval}
                    userId={userId}
                    onClose={() => setShowModal(false)}
                    onComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

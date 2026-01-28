import React from 'react';
import { ApprovalStatus } from '../../types/approval.types';

interface ApprovalStatusBadgeProps {
    status: ApprovalStatus;
    className?: string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
    status,
    className = ''
}) => {
    const getStatusConfig = (status: ApprovalStatus) => {
        switch (status) {
            case 'APPROVED':
                return {
                    label: 'Approved',
                    className: 'bg-green-100 text-green-800'
                };
            case 'PENDING_FOR_APPROVAL':
                return {
                    label: 'Pending Approval',
                    className: 'bg-yellow-100 text-yellow-800'
                };
            case 'REJECTED':
                return {
                    label: 'Rejected',
                    className: 'bg-red-100 text-red-800'
                };
            case 'REVISIT':
                return {
                    label: 'Needs Revision',
                    className: 'bg-orange-100 text-orange-800'
                };
            case 'PENDING':
            default:
                return {
                    label: 'Pending',
                    className: 'bg-gray-100 text-gray-800'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
        >
            {config.label}
        </span>
    );
};

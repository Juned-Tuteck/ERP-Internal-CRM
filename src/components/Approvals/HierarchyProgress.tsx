// Hierarchy Progress Component
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Circle, XCircle, Loader2, User } from 'lucide-react';
import { approvalService } from '../../services/approvalService';

interface HierarchyProgressProps {
    entityType: string;
    entityId: string;
}

interface ProgressLevel {
    level: number;
    role_name: string;
    status: 'approved' | 'rejected' | 'pending' | 'awaiting' | 'initiator';
    approver_name: string | null;
    approved_at: string | null;
}

export const HierarchyProgress: React.FC<HierarchyProgressProps> = ({
    entityType,
    entityId
}) => {
    const [progress, setProgress] = useState<ProgressLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHierarchyStatus();
    }, [entityType, entityId]);

    const loadHierarchyStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await approvalService.getHierarchyStatus(entityType, entityId);

            if (response.success && response.data.has_hierarchy) {
                setProgress(response.data.hierarchy_progress);
            } else {
                setProgress([]);
            }
        } catch (err: any) {
            console.error('Failed to load hierarchy status:', err);
            setError('Failed to load');
            setProgress([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'initiator':
                return <User className="h-4 w-4 text-blue-600" />;
            case 'awaiting':
            default:
                return <Circle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-50';
            case 'rejected':
                return 'text-red-600 bg-red-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'initiator':
                return 'text-blue-600 bg-blue-50';
            case 'awaiting':
            default:
                return 'text-gray-500 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    if (error || progress.length === 0) {
        return (
            <span className="text-xs text-gray-400">No hierarchy</span>
        );
    }

    return (
        <div className="flex items-center space-x-1">
            {progress.map((level, index) => (
                <div key={level.level} className="flex items-center">
                    {/* Level Indicator */}
                    <div
                        className={`group relative flex items-center space-x-1 px-2 py-1 rounded ${getStatusColor(level.status)}`}
                        title={`${level.role_name} - ${level.status}`}
                    >
                        {getStatusIcon(level.status)}
                        <span className="text-xs font-medium">L{level.level}</span>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                                <div className="font-medium">{level.role_name}</div>
                                {level.approver_name && (
                                    <div className="text-gray-300 mt-1">
                                        By: {level.approver_name}
                                    </div>
                                )}
                                {level.approved_at && (
                                    <div className="text-gray-300">
                                        {new Date(level.approved_at).toLocaleString('en-IN', {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                        })}
                                    </div>
                                )}
                                {level.status === 'pending' && (
                                    <div className="text-yellow-300 mt-1">⏳ Awaiting approval</div>
                                )}
                                {level.status === 'initiator' && (
                                    <div className="text-blue-300 mt-1">👤 Initiated approval</div>
                                )}
                                {level.status === 'awaiting' && (
                                    <div className="text-gray-400 mt-1">⏸️ Not yet reached</div>
                                )}
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow between levels */}
                    {index < progress.length - 1 && (
                        <div className="text-gray-400 mx-0.5">→</div>
                    )}
                </div>
            ))}
        </div>
    );
};

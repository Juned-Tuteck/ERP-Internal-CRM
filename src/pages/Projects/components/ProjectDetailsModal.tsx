import React from 'react';
import { X, Calendar, Building2, User, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import type { Project } from '../../../utils/projectApi';

interface ProjectDetailsModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, isOpen, onClose }) => {
    if (!isOpen || !project) return null;

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'on hold':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'in progress':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                Project Information
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Number</label>
                                    <p className="text-sm text-gray-900 font-mono">{project.project_number}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Name</label>
                                    <p className="text-sm text-gray-900 font-semibold">{project.project_name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Type</label>
                                    <p className="text-sm text-gray-900">{project.project_type}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Species</label>
                                    <p className="text-sm text-gray-900">{project.project_species || 'Not specified'}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2 text-green-600" />
                                People & Relations
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Lead ID</label>
                                    <p className="text-sm text-blue-600 font-mono">{project.lead_id}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer ID</label>
                                    <p className="text-sm text-gray-900">{project.customer_id}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Manager</label>
                                    <p className="text-sm text-gray-900 font-medium">{project.project_manager}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="text-sm text-gray-900">{project.created_by}</p>
                                </div>

                                {project.updated_by && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Updated By</label>
                                        <p className="text-sm text-gray-900">{project.updated_by}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                            Timeline
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-blue-600">Created At</label>
                                <p className="text-sm text-gray-900">{formatDate(project.created_at)}</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-green-600">Kick Off Date</label>
                                <p className="text-sm text-gray-900">{formatDate(project.kick_off_date)}</p>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-orange-600">Est. Start Date</label>
                                <p className="text-sm text-gray-900">{formatDate(project.est_start_date)}</p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-red-600">Est. End Date</label>
                                <p className="text-sm text-gray-900">{formatDate(project.est_end_date)}</p>
                            </div>
                        </div>

                        {(project.actual_start || project.actual_end) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {project.actual_start && (
                                    <div className="bg-cyan-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-cyan-600">Actual Start</label>
                                        <p className="text-sm text-gray-900">{formatDate(project.actual_start)}</p>
                                    </div>
                                )}

                                {project.actual_end && (
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-indigo-600">Actual End</label>
                                        <p className="text-sm text-gray-900">{formatDate(project.actual_end)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
                            Financial Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-green-600">Estimated Price</label>
                                <p className="text-lg text-gray-900 font-semibold">₹{project.est_price}</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <label className="text-sm font-medium text-blue-600">Customer Price</label>
                                <p className="text-lg text-gray-900 font-semibold">₹{project.price_customer}</p>
                            </div>

                            {project.actual_price && (
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <label className="text-sm font-medium text-purple-600">Actual Price</label>
                                    <p className="text-lg text-gray-900 font-semibold">₹{project.actual_price}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location & Insurance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                                Location Details
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Project Address</label>
                                    <p className="text-sm text-gray-900">{project.project_address || 'Not provided'}</p>
                                </div>

                                {project.location && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Location</label>
                                        <p className="text-sm text-gray-900">{project.location}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Warehouse ID</label>
                                    <p className="text-sm text-gray-900 font-mono">{project.warehouse_id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-teal-600" />
                                Insurance Details
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Is Insured</label>
                                    <p className={`text-sm font-medium ${project.is_insured ? 'text-green-600' : 'text-red-600'}`}>
                                        {project.is_insured ? 'Yes' : 'No'}
                                    </p>
                                </div>

                                {project.is_insured && (
                                    <>
                                        {project.insurance_no && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Insurance Number</label>
                                                <p className="text-sm text-gray-900 font-mono">{project.insurance_no}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {project.insurance_from_date && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">From Date</label>
                                                    <p className="text-sm text-gray-900">{formatDate(project.insurance_from_date)}</p>
                                                </div>
                                            )}

                                            {project.insurance_to_date && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">To Date</label>
                                                    <p className="text-sm text-gray-900">{formatDate(project.insurance_to_date)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Approval & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                                Approval Status
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getApprovalStatusColor(project.approval_status)}`}>
                                        {project.approval_status}
                                    </span>
                                </div>

                                {project.approved_by && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Approved By</label>
                                        <p className="text-sm text-gray-900">{project.approved_by}</p>
                                    </div>
                                )}

                                {project.approved_on && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Approved On</label>
                                        <p className="text-sm text-gray-900">{formatDate(project.approved_on)}</p>
                                    </div>
                                )}

                                {project.approval_comment && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Approval Comment</label>
                                        <p className="text-sm text-gray-900">{project.approval_comment}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                                Progress & Updates
                            </h3>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Completion</label>
                                    <div className="flex items-center mt-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${project.completion}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-900">{project.completion}%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-sm text-gray-900">{formatDate(project.last_updated)}</p>
                                </div>

                                {project.project_template_id && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Template ID</label>
                                        <p className="text-sm text-gray-900 font-mono">{project.project_template_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    {(project.comment_baseline || project.comment_other) && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                                Comments
                            </h3>

                            <div className="space-y-4">
                                {project.comment_baseline && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-blue-600">Baseline Comment</label>
                                        <p className="text-sm text-gray-900 mt-1">{project.comment_baseline}</p>
                                    </div>
                                )}

                                {project.comment_other && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Other Comments</label>
                                        <p className="text-sm text-gray-900 mt-1">{project.comment_other}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsModal;

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../../../utils/projectApi';
import LeadDetailsModal from './LeadDetailsModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import BOMDetailsModal from './BOMDetailsModal';

interface ProjectDetailsModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, isOpen, onClose }) => {
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showBOMModal, setShowBOMModal] = useState(false);

    if (!isOpen || !project) return null;

    const formatCurrency = (value: string | null | undefined) => {
        if (!value) return 'N/A';
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const calculateDuration = () => {
        if (!project.est_start_date || !project.est_end_date) return 'N/A';
        const start = new Date(project.est_start_date);
        const end = new Date(project.est_end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} days`;
    };

    const calculateGrossMargin = () => {
        if (!project.est_price || !project.price_customer) return 'N/A';
        const estPrice = parseFloat(project.est_price);
        const customerPrice = parseFloat(project.price_customer);
        if (customerPrice === 0) return 'N/A';
        const margin = ((customerPrice - estPrice) / customerPrice) * 100;
        return `${margin.toFixed(2)}%`;
    };

    const estimatedResourceCost = project.est_price ? (parseFloat(project.est_price) * 0.7).toFixed(2) : 'N/A';
    const basicCost = project.est_price ? (parseFloat(project.est_price) * 0.6).toFixed(2) : 'N/A';

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">View Task Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={project.project_name || 'N/A'}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Value
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(project.price_customer)}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Basic Cost
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(basicCost)}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Gross Margin
                                </label>
                                <input
                                    type="text"
                                    value={calculateGrossMargin()}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Est. Total Task Duration
                                </label>
                                <input
                                    type="text"
                                    value={calculateDuration()}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Est. Resource Cost(E)
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(estimatedResourceCost)}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setShowLeadModal(true)}
                                disabled={!project.lead_id}
                                className={`px-6 py-3 rounded-md transition-colors font-medium ${project.lead_id
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                VIEW LEAD DETAILS
                            </button>
                            <button
                                onClick={() => setShowCustomerModal(true)}
                                disabled={!project.lead_customer_id}
                                className={`px-6 py-3 rounded-md transition-colors font-medium ${project.lead_customer_id
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                VIEW CUSTOMER DETAILS
                            </button>
                            <button
                                onClick={() => setShowBOMModal(true)}
                                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-md hover:bg-blue-200 transition-colors font-medium"
                            >
                                VIEW BOM DETAILS
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <LeadDetailsModal
                project={project}
                isOpen={showLeadModal}
                onClose={() => setShowLeadModal(false)}
            />
            <CustomerDetailsModal
                project={project}
                isOpen={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
            />
            <BOMDetailsModal
                project={project}
                isOpen={showBOMModal}
                onClose={() => setShowBOMModal(false)}
            />
        </>
    );
};

export default ProjectDetailsModal;

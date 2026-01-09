import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Phone,
    Mail,
    MapPin,
} from "lucide-react";

import { useCRM } from "../../../context/CRMContext";
import useNotifications from '../../../hook/useNotifications';

const CompetitorApproval: React.FC = () => {
    //----------------------------------------------------------------------------------- For Notification
    const token = localStorage.getItem('auth_token') || '';
    const { userData } = useCRM();
    const userRole = userData?.role || '';
    const { sendNotification } = useNotifications(userRole, token);
    //------------------------------------------------------------------------------------

    const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject">("approve");
    const [reason, setReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pendingCompetitors, setPendingCompetitors] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { hasActionAccess } = useCRM();

    const fetchCompetitors = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/competitor/`
            );
            const competitors = response.data.data;

            // Filter competitors with approval_status not APPROVED or REJECTED
            const filteredCompetitors = competitors.filter(
                (competitor: any) =>
                    competitor.approval_status !== "APPROVED" &&
                    competitor.approval_status !== "REJECTED" &&
                    competitor.approval_status !== "DRAFT"
            );

            // Map API keys to UI keys
            const mappedCompetitors = filteredCompetitors.map((competitor: any) => ({
                id: competitor.id,
                companyName: competitor.company_name,
                contactNo: competitor.contact_number,
                email: competitor.email_id,
                city: competitor.city,
                industryType: competitor.industry_type,
                associatePotential: competitor.associate_potential,
                pincode: competitor.pincode,
                submittedBy: competitor.created_by, // Assuming created_by is the submitter
                submittedDate: new Date(competitor.created_at).toLocaleDateString(
                    "en-IN"
                ),
                panNumber: competitor.pan_number,
                gstNumber: competitor.gst_number,
                contactPersons: competitor.contacts || [], // Assuming contacts from API
                branches: competitor.branches || [], // Assuming branches from API
                uploadedFiles: [], // Assuming no uploaded files in the API response
            }));

            setPendingCompetitors(mappedCompetitors);
        } catch (error) {
            console.error("Error fetching competitors:", error);
        }
    };

    useEffect(() => {
        fetchCompetitors();
    }, [refreshTrigger]);

    const getIndustryTypeColor = (type: string) => {
        switch (type) {
            case "Manufacturing":
                return "bg-blue-100 text-blue-800";
            case "Service":
                return "bg-green-100 text-green-800";
            case "Technology":
                return "bg-purple-100 text-purple-800";
            case "Healthcare":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPotentialColor = (potential: number) => {
        if (potential >= 500000) {
            return "bg-green-100 text-green-800";
        } else if (potential >= 100000) {
            return "bg-yellow-100 text-yellow-800";
        } else {
            return "bg-red-100 text-red-800";
        }
    };

    const handleApprovalClick = (competitor: any, action: "approve" | "reject") => {
        setSelectedCompetitor(competitor);
        setActionType(action);
        setShowReasonModal(true);
    };

    const handleConfirmAction = async () => {
        if (selectedCompetitor) {
            try {
                const response = await axios.patch(
                    `${import.meta.env.VITE_API_BASE_URL}/competitor/${selectedCompetitor.id
                    }/decision`,
                    {
                        approved_by: userData?.id,
                        reason: reason,
                    },
                    {
                        params: {
                            status: actionType === "approve" ? "APPROVED" : "REJECTED",
                        },
                    }
                );

                if (response.status === 200) {
                    // ------------------------------------------------------------------------------------------For notifications
                    try {
                        await sendNotification({
                            receiver_ids: ['admin'],
                            title: `CRM - Competitor ${actionType === "approve" ? "approved" : "rejected"} : ${selectedCompetitor.companyName || 'Competitor'}`,
                            message: `Competitor ${selectedCompetitor.companyName || 'Competitor'} has been ${actionType === "approve" ? "approved" : "rejected"} by ${userData?.name || 'a user'}`,
                            service_type: 'CRM',
                            link: '/competitors',
                            sender_id: userRole || 'user',
                            access: {
                                module: "CRM",
                                menu: "competitors",
                            }
                        });
                        console.log(`Notification sent for CRM Competitor ${selectedCompetitor.companyName || 'Competitor'}`);
                    } catch (notifError) {
                        console.error('Failed to send notification:', notifError);
                        // Continue with the flow even if notification fails
                    }
                    // ----------------------------------------------------------------------------------------

                    // Refresh the competitor list to show updated data
                    setRefreshTrigger(prev => prev + 1);

                    alert(
                        `Competitor ${actionType === "approve" ? "approved" : "rejected"
                        } successfully!`
                    );
                }
            } catch (error) {
                console.error("Error updating competitor status:", error);
                alert("Failed to update competitor status. Please try again.");
            } finally {
                setShowReasonModal(false);
                setReason("");
                setSelectedCompetitor(null);
            }
        }
    };

    // Filter competitors by all visible attributes
    const filteredCompetitors = pendingCompetitors.filter((competitor) => {
        const submittedDateObj = new Date(competitor.submittedDate);
        const formattedDate = submittedDateObj.toLocaleDateString("en-IN");
        const formattedDateShort = submittedDateObj.toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
        });
        const valuesToSearch = [
            competitor.companyName,
            competitor.contactNo,
            competitor.email,
            competitor.city,
            competitor.industryType,
            competitor.associatePotential,
            competitor.pincode,
            competitor.submittedBy,
            competitor.submittedDate,
            formattedDate,
            formattedDateShort,
            competitor.panNumber,
            competitor.gstNumber,
            (competitor.contactPersons || [])
                .map((p: any) => `${p.full_name} ${p.contact_number} ${p.email_id}`)
                .join(" "),
            (competitor.branches || [])
                .map(
                    (b: any) =>
                        `${b.branch_project_name} ${b.contact_number} ${b.email} ${b.city}`
                )
                .join(" "),
            (competitor.uploadedFiles || [])
                .map((f: any) => `${f.name} ${f.size}`)
                .join(" "),
        ]
            .join(" ")
            .toLowerCase();
        return valuesToSearch.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Pending Competitor Registrations
                            </h3>
                            <p className="text-sm text-gray-500">
                                {filteredCompetitors.length} competitors awaiting approval
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-amber-600">
                            <Clock className="h-4 w-4" />
                            <span>Requires Sales Head Approval</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-2 py-1 border border-blue-300 rounded w-48 focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location & Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCompetitors.map((competitor) => (
                                <tr key={competitor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {competitor.companyName}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIndustryTypeColor(
                                                        competitor.industryType
                                                    )}`}
                                                >
                                                    {competitor.industryType}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(
                                                        competitor.associatePotential
                                                    )}`}
                                                >
                                                    ₹{competitor.associatePotential || 0} Potential
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PAN: {competitor.panNumber} | GST: {competitor.gstNumber}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                                {competitor.contactNo}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                                {competitor.email}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {competitor.contactPersons.length} contact person(s)
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-900">
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                {competitor.city}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {competitor.pincode}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {competitor.branches.length} branch(es)
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {hasActionAccess('Approve', 'Competitor Approval', 'competitors') && (
                                                <button
                                                    onClick={() => handleApprovalClick(competitor, "approve")}
                                                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Approve
                                                </button>
                                            )}
                                            {hasActionAccess('Reject', 'Competitor Approval', 'competitors') && (
                                                <button
                                                    onClick={() => handleApprovalClick(competitor, "reject")}
                                                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reason Modal */}
            {showReasonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {actionType === "approve"
                                    ? "Approve Competitor"
                                    : "Reject Competitor"}
                            </h3>
                            <button
                                onClick={() => setShowReasonModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                {actionType === "approve" ? (
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedCompetitor?.companyName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {actionType === "approve"
                                            ? "Approve this competitor registration?"
                                            : "Reject this competitor registration?"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {actionType === "approve"
                                        ? "Approval Notes (Optional)"
                                        : "Rejection Reason *"}
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    required={actionType === "reject"}
                                    placeholder={
                                        actionType === "approve"
                                            ? "Add any notes..."
                                            : "Please provide reason for rejection..."
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowReasonModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={actionType === "reject" && !reason.trim()}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${actionType === "approve"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                            >
                                {actionType === "approve" ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Competitor
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Competitor
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitorApproval;

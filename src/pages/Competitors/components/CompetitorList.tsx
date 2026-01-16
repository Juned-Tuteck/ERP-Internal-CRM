import React, { useEffect, useState } from "react";
import { Building2, MapPin, DollarSign, Calendar } from "lucide-react";
import axios from "axios";

interface Competitor {
    id: string;
    name: string;
    industry: string;
    location: string;
    revenue: string;
    joinDate: string;
    status: "active" | "inactive" | "pending";
    avatar: string;
    dealCount: number;
}

interface CompetitorListProps {
    selectedCompetitor: Competitor | null;
    onSelectCompetitor: (competitor: Competitor) => void;
    screenRefresh: number;
}

const CompetitorList: React.FC<CompetitorListProps> = ({
    selectedCompetitor,
    onSelectCompetitor,
    screenRefresh,
}) => {
    const [apiCompetitorList, setApiCompetitorList] = useState<any[]>([]);

    useEffect(() => {
        const fetchCompetitors = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/competitor/`
                );
                setApiCompetitorList(response.data.data);
            } catch (error) {
                console.error("Error fetching competitors:", error);
            }
        };

        fetchCompetitors();
    }, [screenRefresh]);

    const competitors = apiCompetitorList.map((competitor) => ({
        id: competitor.id,
        name: competitor.company_name,
        competitorNumber: competitor.competitor_number,
        contactNumber: competitor.contact_number,
        email: competitor.email_id,
        industry: competitor.industry_type || "N/A",
        location: `${competitor.city || "N/A"}, ${competitor.state_id || "N/A"}`,
        revenue: `${competitor.associate_potential || 0}`,
        joinDate: new Date(competitor.created_at).toISOString(),
        status: competitor.approval_status?.toLowerCase() || "pending",
        avatar: competitor.company_name
            .split(" ")
            .map((word: string) => word[0])
            .join(""),
        dealCount: 0, // TODO: Add deal count if available in API
    }));

    const [searchTerm, setSearchTerm] = useState("");
    const filteredCompetitors = competitors.filter((competitor) => {
        const valuesToSearch = [
            competitor.name,
            competitor.competitorNumber,
            competitor.industry,
            competitor.location,
            competitor.revenue,
            competitor.status,
            new Date(competitor.joinDate).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
            }),
            String(competitor.dealCount),
        ]
            .join(" ")
            .toLowerCase();
        return valuesToSearch.includes(searchTerm.toLowerCase());
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "revisit":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Competitors</h3>
                <p className="text-sm text-gray-500">
                    {competitors.length} total competitors
                </p>
                <input
                    type="text"
                    placeholder="Search competitors by any attribute..."
                    className="mt-3 px-3 py-1 border border-blue-300 rounded w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="divide-y divide-gray-200 overflow-y-auto flex-1 min-h-0">
                {filteredCompetitors.map((competitor) => (
                    <div
                        key={competitor.id}
                        onClick={() => onSelectCompetitor(competitor)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${selectedCompetitor?.id === competitor.id
                                ? "bg-blue-50 border-r-2 border-blue-600"
                                : ""
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {competitor.avatar}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {competitor.name}
                                    </p>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            competitor.status
                                        )}`}
                                    >
                                        {competitor.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                    {competitor.industry}
                                </p>
                                <p className="text-xs font-bold text-blue-600 truncate">
                                    Competitor : {competitor.competitorNumber || "-"}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {competitor.location.split(",")[0]}
                                    </div>
                                    <div className="flex items-center text-xs text-green-600">
                                        {/* <DollarSign className="h-3 w-3 mr-1" /> */}
                                        {/* {competitor.revenue.replace("₹", "₹")} */}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Since{" "}
                                        {new Date(competitor.joinDate).toLocaleDateString("en-IN", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        {/* {competitor.dealCount} deals */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompetitorList;

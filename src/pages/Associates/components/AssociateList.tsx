import React, { useEffect, useState } from "react";
import { HardHat, MapPin, DollarSign, Calendar } from "lucide-react";
import { getAssociates } from "../../../utils/associateApi";

interface Associate {
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

interface AssociateListProps {
  selectedAssociate: Associate | null;
  onSelectAssociate: (associate: Associate) => void;
  screenRefresh: number;
}

const AssociateList: React.FC<AssociateListProps> = ({
  selectedAssociate,
  onSelectAssociate,
  screenRefresh,
}) => {
  const [apiAssociateList, setApiAssociateList] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssociates = async () => {
      try {
        const data = await getAssociates();
        // Handle different response structures
        if (Array.isArray(data)) {
          setApiAssociateList(data);
        } else if (data && Array.isArray(data.data)) {
          setApiAssociateList(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          setApiAssociateList([]);
        }
      } catch (error) {
        console.error("Error fetching associates:", error);
        setApiAssociateList([]);
      }
    };

    fetchAssociates();
  }, [screenRefresh]);

  const associates = Array.isArray(apiAssociateList) ? apiAssociateList.map((associate: any) => ({
    id: associate.associate_id,
    name: associate.business_name,
    associateNumber: associate.associate_number,
    contactNumber: associate.contact_number,
    email: associate.email,
    industry: associate.associate_type,
    location: `${associate.city}, ${associate.state}`,
    revenue: `${associate.associate_potential}`,
    joinDate: new Date(associate.created_at).toISOString(),
    status: associate.approval_status.toLowerCase(),
    avatar: associate.business_name
      .split(" ")
      .map((word: string) => word[0])
      .join(""),
    dealCount: associate.lead_count || 0,
  })) : [];

  const [searchTerm, setSearchTerm] = useState("");
  const filteredAssociates = associates.filter((associate) => {
    const valuesToSearch = [
      associate.name,
      associate.associateNumber,
      associate.industry,
      associate.location,
      associate.revenue,
      associate.status,
      new Date(associate.joinDate).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      String(associate.dealCount),
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
        <h3 className="text-lg font-semibold text-gray-900">All Associates</h3>
        <p className="text-sm text-gray-500">
          {associates.length} total associates
        </p>
        <input
          type="text"
          placeholder="Search associates by any attribute..."
          className="mt-3 px-3 py-1 border border-blue-300 rounded w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="divide-y divide-gray-200 overflow-y-auto flex-1 min-h-0">
        {filteredAssociates.map((associate) => (
          <div
            key={associate.id}
            onClick={() => onSelectAssociate(associate)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${selectedAssociate?.id === associate.id
              ? "bg-blue-50 border-r-2 border-blue-600"
              : ""
              }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {associate.avatar}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {associate.name}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      associate.status
                    )}`}
                  >
                    {associate.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {associate.industry}
                </p>
                <p className="text-xs font-bold text-teal-600 truncate">
                  Associate : {associate.associateNumber || "-"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {associate.location.split(",")[0]}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    {/* <DollarSign className="h-3 w-3 mr-1" /> */}
                    {/* {associate.revenue.replace("₹", "₹")} */}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Since{" "}
                    {new Date(associate.joinDate).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-blue-600">
                    {/* {associate.dealCount} deals */}
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

export default AssociateList;
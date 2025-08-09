import React from "react";
import {
  Truck,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Phone,
  Mail,
} from "lucide-react";

export interface Vendor {
  id: string;
  name: string;
  vendorNumber: string;
  category: string;
  type: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  joinDate: string;
  status: "active" | "inactive" | "pending";
  avatar: string;
}

interface VendorListProps {
  selectedVendor: Vendor | null;
  onSelectVendor: (vendor: Vendor) => void;
  vendors: Vendor[];
}

const VendorList: React.FC<VendorListProps> = ({
  selectedVendor,
  onSelectVendor,
  vendors,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Electronics":
        return "bg-blue-100 text-blue-800";
      case "Raw Materials":
        return "bg-gray-100 text-gray-800";
      case "Automotive":
        return "bg-red-100 text-red-800";
      case "Chemicals":
        return "bg-purple-100 text-purple-800";
      case "Furniture":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Vendors</h3>
        <p className="text-sm text-gray-500">{vendors.length} total vendors</p>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {Array.isArray(vendors) && vendors.length > 0 ? (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => onSelectVendor(vendor)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                selectedVendor?.id === vendor.id
                  ? "bg-blue-50 border-r-2 border-blue-600"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {vendor.avatar}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {vendor.name}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        vendor.status
                      )}`}
                    >
                      {vendor.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 truncate">
                    Vendor : {vendor.vendorNumber || '-'}
                  </p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getCategoryColor(
                        vendor.category
                      )}`}
                    >
                      {vendor.category}
                    </span>
                    <span className="text-xs text-gray-500">{vendor.type}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {vendor.location.split(",")[0]}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Since{" "}
                      {new Date(vendor.joinDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Phone className="h-3 w-3 mr-1" />
                    {vendor.phone}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500">No vendors found.</div>
        )}
      </div>
    </div>
  );
};

export default VendorList;
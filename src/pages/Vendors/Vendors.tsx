import React, { useState, useEffect } from "react";
import VendorList, { Vendor } from "./components/VendorList";
import { getAllVendors, getVendorById } from "../../utils/vendorApi";
import { registerVendor } from "../../utils/registerVendorApi";
import VendorDetails from "./components/VendorDetails";
import AddVendorModal from "./components/AddVendorModal";
import VendorApproval from "./components/VendorApproval";
import { Truck, Filter, Download, Plus, CheckCircle } from "lucide-react";
import { useCRM } from "../../context/CRMContext";

const Vendors: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailedVendor, setDetailedVendor] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    getAllVendors()
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch vendors");
        setLoading(false);
      });
  }, []);

  // Fetch detailed vendor info when selectedVendor changes
  useEffect(() => {
    if (selectedVendor && selectedVendor.id) {
      getVendorById(selectedVendor.id)
        .then((data) => setDetailedVendor(data))
        .catch(() => setDetailedVendor(null));
    } else {
      setDetailedVendor(null);
    }
  }, [selectedVendor]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vendors");
  const { addNotification } = useCRM();

  // Utility to convert camelCase keys to snake_case
  const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(toSnakeCase);
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = toSnakeCase(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  const handleAddVendor = async (vendorData: any) => {
    try {
      const snakeCaseData = toSnakeCase(vendorData);
      await registerVendor(snakeCaseData);
      addNotification({
        type: "success",
        message: `Vendor ${
          snakeCaseData.business_name || snakeCaseData.businessName || ""
        } registered successfully and sent for approval!`,
      });
      setIsAddModalOpen(false);
      // Refresh vendor list
      setLoading(true);
      const data = await getAllVendors();
      setVendors(data);
      setLoading(false);
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to register vendor. Please try again.",
      });
    }
  };

  const handleApprovalAction = (
    vendorId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    console.log(`${action} vendor:`, vendorId, reason);
    addNotification({
      type: action === "approve" ? "success" : "warning",
      message: `Vendor ${action}d successfully!`,
    });
  };

  const handleExportVendors = () => {
    console.log("Exporting vendors...");
    addNotification({
      type: "info",
      message: "Vendor export initiated. Download will start shortly.",
    });
  };

  const tabs = [
    { id: "vendors", name: "All Vendors", icon: Truck },
    { id: "approval", name: "Vendor Approval", icon: CheckCircle },
  ];

  useEffect(() => {
    console.log("Selected Vendor:", selectedVendor);
  }, [selectedVendor]);

  useEffect(() => {
    console.log("Detailed Vendor:", detailedVendor);
  }, [detailedVendor]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <div className="flex space-x-3">
          {/* <button
            onClick={handleExportVendors}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
          {activeTab === "vendors" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Vendor
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "vendors" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {loading ? (
              <div className="p-4 text-gray-500">Loading vendors...</div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : (
              <VendorList
                selectedVendor={selectedVendor}
                onSelectVendor={setSelectedVendor}
                vendors={Array.isArray(vendors) ? vendors : []}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <VendorDetails
              data={{
                vendor: detailedVendor,
                branches: detailedVendor?.branches || [],
                contacts: detailedVendor?.contactPersons || [],
                files: detailedVendor?.files || [],
              }}
              onVendorDeleted={async () => {
                setSelectedVendor(null);
                setDetailedVendor(null);
                setLoading(true);
                const data = await getAllVendors();
                setVendors(data);
                setLoading(false);
                addNotification({
                  type: "success",
                  message: "Vendor deleted successfully!",
                });
              }}
            />
          </div>
        </div>
      ) : (
        <VendorApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVendor}
        onRefresh={async () => {
          setLoading(true);
          const data = await getAllVendors();
          setVendors(data);
          setLoading(false);
        }}
      />
    </div>
  );
};

export default Vendors;

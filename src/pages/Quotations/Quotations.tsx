import React, { useState } from "react";
import QuotationList from "./components/QuotationList";
import QuotationDetails from "./components/QuotationDetails";
import CreateQuotationModal from "./components/CreateQuotationModal";
import QuotationApproval from "./components/QuotationApproval";
import {
  FileSpreadsheet,
  Filter,
  Download,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";

const Quotations: React.FC = () => {
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quotations");
  const [refreshKey, setRefreshKey] = useState(0);
  const { addNotification, hasSubmenuAccess, hasActionAccess } = useCRM();

  const handleCreateQuotation = (quotationData: any) => {
    console.log("Creating new quotation:", quotationData);
    addNotification({
      type: "success",
      message: `Quotation for ${quotationData.leadName} created successfully and sent for approval!`,
    });
    setIsCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleApprovalAction = (
    quotationId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    console.log(`${action} quotation:`, quotationId, reason);
    addNotification({
      type: action === "approve" ? "success" : "warning",
      message: `Quotation ${action}d successfully!`,
    });
  };

  const handleExportQuotations = () => {
    console.log("Exporting quotations...");
    addNotification({
      type: "info",
      message: "Quotation export initiated. Download will start shortly.",
    });
  };

  // Define all tabs with their access requirements
  const allTabs = [
    { id: "quotations", name: "All Quotations", icon: FileSpreadsheet, accessKey: "All Quotations" },
    { id: "approval", name: "Quotation Approval", icon: CheckCircle, accessKey: "Quotation Approval" },
  ];

  // Filter tabs based on user submenu access permissions
  const tabs = allTabs.filter(tab => hasSubmenuAccess(tab.accessKey));

  // Ensure active tab is accessible, if not set to first available tab
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.some(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // If no tabs are accessible, show access denied message
  if (tabs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You don't have permission to access any quotation sections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Quotation Management
        </h1>
        <div className="flex space-x-3">
          {/* <button
            onClick={handleExportQuotations}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
          {activeTab === "quotations" && hasActionAccess("Create Quotation", "All Quotations", "Quotations") && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
      {activeTab === "quotations" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuotationList
              selectedQuotation={selectedQuotation}
              onSelectQuotation={setSelectedQuotation}
              refreshKey={refreshKey}
            />
          </div>
          <div className="lg:col-span-2">
            <QuotationDetails
              quotation={selectedQuotation}
              onQuotationDeleted={() => {
                setRefreshKey((prev) => prev + 1);
                setSelectedQuotation(null);
              }}
            />
          </div>
        </div>
      ) : (
        <QuotationApproval onApprovalAction={handleApprovalAction} />
      )}

      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateQuotation}
      />
    </div>
  );
};

export default Quotations;

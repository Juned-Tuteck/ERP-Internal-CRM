import React, { useState } from "react";
import BOMTemplateList from "./components/BOMTemplateList";
import BOMList from "./components/BOMList";
import CreateBOMTemplate from "./components/CreateBOMTemplate";
import CreateBOM from "./components/CreateBOM";
import BOMApproval from "./components/BOMApproval";
import {
  FileText,
  Plus,
  Filter,
  Download,
  CheckCircle,
  Upload,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";

const BOM: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateBOMOpen, setIsCreateBOMOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedBOM, setSelectedBOM] = useState<any>(null);
  const [bomListKey, setBOMListKey] = useState(0);
  const [bomTemplateListKey, setBOMTemplateListKey] = useState(0);
  const [screenRefresh, setScreenRefresh] = useState(0);  
  const { addNotification, hasSubmenuAccess } = useCRM();

  // Called after BOM Template is created

  const handleCreateTemplate = (templateData: any) => {
    console.log("Creating new BOM template:", templateData);
    addNotification({
      type: "success",
      message: `BOM Template "${templateData.name}" created successfully!`,
    });
    setIsCreateTemplateOpen(false);
    setBOMTemplateListKey((k) => k + 1); // Refresh BOM Template list
  };

  // Called after BOM is created
  const handleCreateBOM = (bomData: any) => {
    console.log("Creating new BOM:", bomData);
    addNotification({
      type: "success",
      message: `BOM for "${bomData.leadName}" created successfully and sent for approval!`,
    });
    setIsCreateBOMOpen(false);
    setBOMListKey((k) => k + 1); // Refresh BOM list
  };

  const handleApprovalAction = (
    bomId: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    console.log(`${action} BOM:`, bomId, reason);
    addNotification({
      type: action === "approve" ? "success" : "warning",
      message: `BOM ${action}d successfully!`,
    });
  };

  const handleExportBOM = () => {
    console.log("Exporting BOM...");
    addNotification({
      type: "info",
      message: "BOM export initiated. Download will start shortly.",
    });
  };

  // Define all tabs with their access requirements
  const allTabs = [
    { id: "templates", name: "BOM Templates", icon: FileText, accessKey: "Bom templates" },
    { id: "boms", name: "BOMs", icon: FileText, accessKey: "Boms" },
    { id: "approval", name: "BOM Approval", icon: CheckCircle, accessKey: "Bom approval" },
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
          <h1 className="text-2xl font-bold text-gray-900">BOM Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You don't have permission to access any BOM sections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">BOM Management</h1>
        <div className="flex space-x-3">
          {/* <button
            onClick={handleExportBOM}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
          {activeTab === "templates" && (
            <button
              onClick={() => setIsCreateTemplateOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </button>
          )}
          {activeTab === "boms" && (
            <button
              onClick={() => setIsCreateBOMOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create BOM
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

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 gap-6">
          <BOMTemplateList
            key={bomTemplateListKey}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            screenRefresh={screenRefresh}
          />
        </div>
      )}

      {activeTab === "boms" && (
        <div className="grid grid-cols-1 gap-6">
          <BOMList
            key={bomListKey}
            selectedBOM={selectedBOM}
            onSelectBOM={setSelectedBOM}
          />
        </div>
      )}

      {activeTab === "approval" && (
        <BOMApproval onApprovalAction={handleApprovalAction} />
      )}

      <CreateBOMTemplate
        isOpen={isCreateTemplateOpen}
        onClose={() => setIsCreateTemplateOpen(false)}
        onSubmit={handleCreateTemplate}
        setScreenRefresh={setScreenRefresh}
      />

      <CreateBOM
        isOpen={isCreateBOMOpen}
        onClose={() => setIsCreateBOMOpen(false)}
        onSubmit={handleCreateBOM}
      />
    </div>
  );
};

export default BOM;

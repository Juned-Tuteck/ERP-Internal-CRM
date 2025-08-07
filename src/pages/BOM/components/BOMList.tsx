import React from "react";
import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CreateBOM from "./CreateBOM";
import BOMViewModal from "./BOMViewModal";

interface BOM {
  id: string;
  leadName: string;
  workType: string;
  itemCount: number;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  status: "draft" | "pending_approval" | "approved" | "rejected";
}

interface BOMListProps {
  selectedBOM: BOM | null;
  onSelectBOM: (bom: BOM) => void;
}

const BOMList: React.FC<BOMListProps> = ({ selectedBOM, onSelectBOM }) => {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bomToDelete, setBomToDelete] = React.useState<BOM | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editInitialData, setEditInitialData] = React.useState<any>(null);
  const [viewBOMId, setViewBOMId] = React.useState<string | null>(null);
  const [showViewModal, setShowViewModal] = React.useState(false);

  // Fetch BOMs from API
  useEffect(() => {
    const fetchBOMs = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/bom/`
        );
        const data = await response.json();
        const apiBOMs = data.data || [];

        // Map API response to UI format
        const mappedBOMs: BOM[] = apiBOMs.map((apiBOM: any) => ({
          id: apiBOM.id,
          leadName: apiBOM.name,
          bomNumber: apiBOM.bom_number,
          bomTemplateNumber: apiBOM.bom_template_number,
          workType: apiBOM.work_type || "Unknown",
          itemCount:
            apiBOM.specs?.reduce(
              (sum: number, spec: any) => sum + (spec.details?.length || 0),
              0
            ) || 0,
          totalValue: `₹${(apiBOM.total_price || 0).toLocaleString("en-IN")}`,
          createdBy: apiBOM.created_by || "Unknown",
          createdDate: apiBOM.created_at || new Date().toISOString(),
          status: apiBOM.approval_status?.toLowerCase() || "draft",
        }));
        console.log("Edit Initial Data:::::", editInitialData);
        setBoms(mappedBOMs);
      } catch (error) {
        console.error("Error fetching BOMs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBOMs();
  }, []);
  // BOMItem and BOMTemplate types
  type BOMItem = {
    id: string;
    itemCode: string;
    itemName: string;
    uomName: string;
    rate: number;
    quantity: number;
    price: number;
    specifications?: string;
  };

  type BOMTemplate = {
    id: string;
    name: string;
    workType: string;
    items: BOMItem[];
  };

  // Templates data (should match CreateBOM)
  const templates: BOMTemplate[] = [
    {
      id: "1",
      name: "Basement Ventilation System - Standard",
      workType: "Basement Ventilation",
      items: [
        {
          id: "101",
          itemCode: "FAN-001",
          itemName: "Industrial Exhaust Fan",
          uomName: "Nos",
          rate: 12500,
          quantity: 4,
          price: 50000,
          specifications: "High efficiency, low noise",
        },
        {
          id: "102",
          itemCode: "DUCT-001",
          itemName: "Galvanized Steel Duct",
          uomName: "Meter",
          rate: 850,
          quantity: 120,
          price: 102000,
          specifications: "Corrosion resistant, fire retardant",
        },
        {
          id: "103",
          itemCode: "DAMPER-001",
          itemName: "Fire Damper",
          uomName: "Nos",
          rate: 3200,
          quantity: 6,
          price: 19200,
        },
        {
          id: "104",
          itemCode: "SENSOR-001",
          itemName: "CO2 Sensor",
          uomName: "Nos",
          rate: 1800,
          quantity: 8,
          price: 14400,
        },
      ],
    },
    {
      id: "2",
      name: "HVAC System - Commercial Office",
      workType: "HVAC Systems",
      items: [
        {
          id: "201",
          itemCode: "AC-001",
          itemName: "Central AC Unit",
          uomName: "Nos",
          rate: 85000,
          quantity: 2,
          price: 170000,
        },
        {
          id: "202",
          itemCode: "DUCT-002",
          itemName: "Insulated Duct",
          uomName: "Meter",
          rate: 1200,
          quantity: 80,
          price: 96000,
        },
        {
          id: "203",
          itemCode: "FILTER-001",
          itemName: "HEPA Filter",
          uomName: "Nos",
          rate: 4500,
          quantity: 6,
          price: 27000,
        },
      ],
    },
    {
      id: "3",
      name: "AMC System - Residential",
      workType: "AMC",
      items: [
        {
          id: "301",
          itemCode: "ALARM-001",
          itemName: "Fire Alarm Control Panel",
          uomName: "Nos",
          rate: 35000,
          quantity: 1,
          price: 35000,
        },
        {
          id: "302",
          itemCode: "SENSOR-002",
          itemName: "Smoke Detector",
          uomName: "Nos",
          rate: 1200,
          quantity: 24,
          price: 28800,
        },
        {
          id: "303",
          itemCode: "SPRINKLER-001",
          itemName: "Automatic Sprinkler",
          uomName: "Nos",
          rate: 800,
          quantity: 36,
          price: 28800,
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600 mr-1" />;
      case "pending_approval":
        return <Calendar className="h-4 w-4 text-yellow-600 mr-1" />;
      case "draft":
        return <Edit className="h-4 w-4 text-gray-600 mr-1" />;
      default:
        return null;
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case "Basement Ventilation":
        return "bg-blue-100 text-blue-800";
      case "HVAC Systems":
        return "bg-purple-100 text-purple-800";
      case "AMC":
        return "bg-red-100 text-red-800";
      case "Retrofit":
        return "bg-amber-100 text-amber-800";
      case "Chiller":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    setBomToDelete(bom);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bomToDelete) {
      setBoms((prev) => prev.filter((b) => b.id !== bomToDelete.id));
      setDeleteDialogOpen(false);
      setBomToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBomToDelete(null);
  };
  console.log("Template data:", templates);

  // Helper to format BOM data for CreateBOM modal
  const formatBOMForEdit = (bom: any) => {
    // Map API specs/details to UI spec/item structure
    const specs = (bom.specs || []).map((spec: any) => ({
      id: spec.spec_id,
      name: spec.spec_description,
      isExpanded: true,
      price: spec.spec_price || 0,
      items: (spec.details || []).map((detail: any) => ({
        id: detail.item_id,
        itemCode: detail.item_code,
        itemName: detail.item_name,
        uomName: detail.uom_name || "-",
        supplyRate: detail.supply_rate || 0,
        installationRate: detail.installation_rate || 0,
        netRate: detail.net_rate || 0,
        quantity: detail.required_quantity || 1,
        price: (detail.required_quantity || 1) * (detail.net_rate || 0),
        materialType: detail.material_type || "HIGH SIDE SUPPLY",
        specifications: detail.specifications || "",
      })),
    }));

    return {
      id: bom.id,
      leadId: bom.lead_id || bom.id,
      leadName: bom.leadName,
      workType: bom.workType,
      date: bom.createdDate,
      note: bom.description || "",
      status: bom.status?.toUpperCase() || "DRAFT",
      specs,
      createdDate: bom.createdDate,
      // Add other fields as needed
    };
  };

  // Handler for edit button
  const handleEditClick = async (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    try {
      // Fetch BOM details from API
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/bom/${bom.id}`
      );
      const data = await response.json();
      const apiBOM = data.data;

      // Fetch BOM template details if bom_template_id exists
      let selectedTemplateName = null;
      if (apiBOM.bom_template_id) {
        try {
          const templateRes = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/bom-template/${
              apiBOM.bom_template_id
            }`
          );
          const templateData = await templateRes.json();
          selectedTemplateName = templateData.data?.name || null;
          console.log("Selected Template Name:", selectedTemplateName);
        } catch (err) {
          console.error("Error fetching BOM template for edit:", err);
        }
      }

      // Map API response to UI format for CreateBOM
      const specs = (apiBOM.specs || []).map((spec: any) => ({
        id: spec.spec_id,
        name: spec.spec_description,
        isExpanded: true,
        price: spec.spec_price || 0,
        items: (spec.details || []).map((detail: any) => ({
          id: detail.item_id || detail.detail_id,
          itemCode: detail.item_code,
          itemName: detail.item_name,
          uomName: detail.uom_name || "-",
          supplyRate: detail.supply_rate || 0,
          installationRate: detail.installation_rate || 0,
          netRate: detail.net_rate || 0,
          quantity: detail.required_quantity || 1,
          price: (detail.required_quantity || 1) * (detail.net_rate || 0),
          materialType: detail.material_type || "HIGH SIDE SUPPLY",
          specifications: detail.specifications || "",
        })),
      }));
      const editData = {
        id: apiBOM.id,
        leadId: apiBOM.lead_id || apiBOM.id,
        leadName: apiBOM.name,
        workType: apiBOM.work_type,
        date: apiBOM.bom_date
          ? apiBOM.bom_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        note: apiBOM.description || "",
        status: (apiBOM.approval_status || "draft").toUpperCase(),
        specs,
        createdDate: apiBOM.created_at,
        bomTemplateId: apiBOM.bom_template_id,
        selectedTemplateName,
      };
      setEditInitialData(editData);
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching BOM details for edit:", error);
    }
  };

  // Handler for saving edited BOM
  const handleEditSave = (updatedBOM: any) => {
    setBoms((prev) =>
      prev.map((b) => (b.id === updatedBOM.id ? { ...b, ...updatedBOM } : b))
    );
    setEditModalOpen(false);
    setEditInitialData(null);
  };

  // Handler for viewing BOM details
  const handleRowClick = (bom: BOM) => {
    setViewBOMId(bom.id);
    setShowViewModal(true);
    onSelectBOM(bom);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Bills of Materials
        </h3>
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${boms.length} total BOMs`}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading BOMs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lead Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Work Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boms.map((bom) => (
                <tr
                  key={bom.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedBOM?.id === bom.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleRowClick(bom)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {bom.leadName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created:{" "}
                          {new Date(bom.createdDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                        <div className="text-xs font-bold text-blue-600">
                          BOM : {bom.bomNumber || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(
                        bom.workType
                      )}`}
                    >
                      {bom.workType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bom.itemCount} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {bom.totalValue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        bom.status
                      )}`}
                    >
                      {getStatusIcon(bom.status)}
                      {bom.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(e, bom);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(e, bom);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {boms.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No BOMs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">
              Delete BOM
            </h4>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{bomToDelete?.leadName}</span>{" "}
              BOM? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create BOM Modal */}
      {editModalOpen && (
        <CreateBOM
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditInitialData(null);
          }}
          onSubmit={handleEditSave}
          initialData={editInitialData}
        />
      )}

      {/* View BOM Modal */}
      {showViewModal && viewBOMId && (
        <BOMViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewBOMId(null);
          }}
          bomId={viewBOMId}
        />
      )}
    </div>
  );
};

export default BOMList;

import React, { useState } from "react";
import { useEffect } from "react";
import {
  FileText,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Copy,
  Download,
} from "lucide-react";
import CreateBOMTemplate from "./CreateBOMTemplate";
import {
  getBOMTemplates,
  getBOMTemplateById,
  updateBOMTemplate,
} from "../../../utils/bomTemplateApi";
import BOMTemplateViewModal from "./BOMTemplateViewModal";

interface Item {
  itemCode: string;
  itemName: string;
  uom: string;
  rate: number;
  qty: number;
  price: number;
}

interface BOMTemplate {
  id: string;
  name: string;
  workType: string;
  itemCount: number;
  createdBy: string;
  createdDate: string;
  status: "active" | "inactive" | "draft";
  items: Item[];
  description?: string;
}

interface BOMTemplateListProps {
  selectedTemplate: BOMTemplate | null;
  onSelectTemplate: (template: BOMTemplate) => void;
}

const BOMTemplateList: React.FC<BOMTemplateListProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<BOMTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<BOMTemplate | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templates, setTemplates] = useState<BOMTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTemplateId, setViewTemplateId] = useState<string | null>(null);

  // Fetch BOM templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await getBOMTemplates();
        const apiTemplates = response.data || [];
        console.log("Fetched BOM templates:", apiTemplates);

        // Map API response to UI format
        const mappedTemplates: BOMTemplate[] = apiTemplates.map(
          (template: any) => ({
            id: template.id,
            name: template.name,
            templateNumber: template.bom_template_number,
            workType: template.work_type,
            itemCount: 0, // Will be calculated from specs/details if needed
            createdBy: "System", // Default value since not in API
            createdDate: template.created_at || new Date().toISOString(),
            status: template.is_active ? "active" : "inactive",
            items: [], // Will be populated when viewing details
            description: template.reason || "",
          })
        );

        setTemplates(mappedTemplates);
      } catch (error) {
        console.error("Error fetching BOM templates:", error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const workTypeMap: Record<string, string> = {
    TYPE1: "Basement Ventilation",
    TYPE2: "HVAC Systems",
    TYPE3: "AMC",
    TYPE4: "Retrofit",
    TYPE5: "Chiller",
    // Add more mappings as needed
  };

  const handleEditTemplate = async (template: BOMTemplate) => {
    try {
      const response = await getBOMTemplateById(template.id);
      const apiData = response.data;

      const specs = (apiData.specs || []).map((spec: any) => ({
        id: spec.spec_id,
        name: spec.spec_description,
        isExpanded: true,
        items: (spec.details || []).map((detail: any) => ({
          id: detail.item_id,
          detailId: detail.detail_id,
          itemCode: detail.item_code,
          itemName: detail.item_name,
          uomName: detail.uom_value || "-",
          rate: detail.latest_lowest_basic_supply_rate || 0,
          installationRate: detail.latest_lowest_basic_installation_rate || 0,
          netRate: detail.latest_lowest_net_rate || 0,
          quantity: detail.required_quantity,
          price:
            (detail.required_quantity || 1) *
            (detail.latest_lowest_net_rate || 0),
          specifications: detail.description || "",
          materialType: detail.material_type || "HIGH SIDE SUPPLY",
        })),
      }));

      const items: any[] = specs.flatMap((spec: any) => spec.items);

      const editTemplate = {
        id: apiData.id,
        workType: workTypeMap[apiData.work_type] || apiData.work_type || "",
        name: apiData.name || "",
        description: apiData.reason || "",
        specs,
        items,
        status: apiData.is_active ? "active" : "inactive",
        createdDate: apiData.created_at,
      };

      setEditTemplate(editTemplate);
      setShowBOMModal(true);
    } catch (error) {
      console.error("Failed to fetch template details for edit:", error);
    }
  };

  const handleCloseModal = () => {
    setShowBOMModal(false);
    setEditTemplate(null);
  };

  const handleSubmitTemplate = async (template: BOMTemplate) => {
    try {
      if (template.id) {
        // Update existing template
        await updateBOMTemplate(template.id, template);
      }
      // Refresh templates list after update
      const fetchTemplates = async () => {
        try {
          const response = await getBOMTemplates();
          const apiTemplates = response.data || [];
          const mappedTemplates: BOMTemplate[] = apiTemplates.map(
            (template: any) => ({
              id: template.id,
              name: template.name,
              workType: template.workType,
              itemCount: 0,
              createdBy: "System",
              createdDate: template.created_at || new Date().toISOString(),
              status: template.is_active ? "active" : "inactive",
              items: [],
            })
          );
          setTemplates(mappedTemplates);
        } catch (error) {
          console.error("Error refreshing templates:", error);
        }
      };
      await fetchTemplates();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update template:", error);
      // Optionally show error to user
    }
  };

  const handleRowClick = (template: BOMTemplate) => {
    setViewTemplateId(template.id);
    setShowViewModal(true);
    onSelectTemplate(template);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">BOM Templates</h3>
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${templates.length} total templates`}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Loading BOM templates...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Template Name
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
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedTemplate?.id === template.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleRowClick(template)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created:{" "}
                          {new Date(template.createdDate).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                        <div className="text-xs font-bold text-blue-600">
                          Template : {template.templateNumber || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(
                        template.workType
                      )}`}
                    >
                      {template.workType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.itemCount} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {template.createdBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        template.status
                      )}`}
                    >
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template);
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
                          setDeleteTemplate(template);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No BOM templates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* BOM Template View Modal */}
      {showViewModal && viewTemplateId && (
        <BOMTemplateViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewTemplateId(null);
          }}
          templateId={viewTemplateId}
        />
      )}

      <CreateBOMTemplate
        isOpen={showBOMModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTemplate}
        initialData={editTemplate}
      />

      {showDeleteModal && deleteTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Delete BOM Template</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTemplate.name}</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  // TODO: Remove from your templates state or call API
                  setShowDeleteModal(false);
                  setDeleteTemplate(null);
                  // You may want to update your templates array here
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTemplateList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Search,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  createBOMTemplate,
  createBOMTemplateSpecs,
  createBOMTemplateDetails,
  getBOMTemplateItems,
  updateBOMTemplate,
  updateBOMTemplateSpec,
  // updateBOMTemplateDetail,
  // createBOMTemplateDetail,
} from "../../../utils/bomTemplateApi";

interface CreateBOMTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateData: any) => void;
  setScreenRefresh: React.Dispatch<React.SetStateAction<number>>; // New prop to trigger screen refresh
  initialData?: {
    id?: string;
    workType: string;
    name: string;
    description: string;
    items: BOMItem[];
    status?: string;
    createdDate?: string;
    // add other fields as needed
    [key: string]: any;
  };
}

interface BOMItem {
  id: string;
  itemCode: string;
  itemName: string;
  uomName: string;
  rate: number;
  quantity: number;
  price: number;
  specifications?: string;
  materialType: string; // Add materialType
}

interface Spec {
  id: string;
  name: string;
  items: BOMItem[];
  isExpanded: boolean;
}

const CreateBOMTemplate: React.FC<CreateBOMTemplateProps> = ({
  isOpen,
  onClose,
  onSubmit,
  setScreenRefresh,
  initialData // <-- new prop

}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [method, setMethod] = useState<"manual" | "upload">("manual");
  const [formData, setFormData] = useState({
    workType: "",
    name: "",
    description: "",
  });
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specification, setSpecification] = useState<string>("");
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showDeleteSpecModal, setShowDeleteSpecModal] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<string | null>(null);
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(
    null
  );

  // Mock data for dropdowns
  const workTypes = [
    "Basement Ventilation",
    "HVAC Systems",
    "AMC",
    "Retrofit",
    "Chiller",
  ];

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getBOMTemplateItems();
        setApiItems(items);
      } catch (error) {
        console.error("Error fetching BOM template items:", error);
        setApiItems([]);
      }
    };

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Use API items if available, fallback to mock data
  const masterItems =
    apiItems.length > 0
      ? apiItems
      : [
          {
            id: "1",
            itemCode: "FAN-001",
            itemName: "Industrial Exhaust Fan",
            uomName: "Nos",
            brand: "Crompton",
            rate: 12500,
          },
          {
            id: "2",
            itemCode: "DUCT-001",
            itemName: "Galvanized Steel Duct",
            uomName: "Meter",
            brand: "Tata Steel",
            rate: 850,
          },
          {
            id: "3",
            itemCode: "DAMPER-001",
            itemName: "Fire Damper",
            uomName: "Nos",
            brand: "Honeywell",
            rate: 3200,
          },
          {
            id: "4",
            itemCode: "SENSOR-001",
            itemName: "CO2 Sensor",
            uomName: "Nos",
            brand: "Siemens",
            rate: 1800,
          },
          {
            id: "5",
            itemCode: "CABLE-001",
            itemName: "Retrofit Cable",
            uomName: "Meter",
            brand: "Havells",
            rate: 120,
          },
          {
            id: "6",
            itemCode: "PANEL-001",
            itemName: "Control Panel",
            uomName: "Nos",
            brand: "Schneider",
            rate: 25000,
          },
          {
            id: "7",
            itemCode: "FILTER-001",
            itemName: "HEPA Filter",
            uomName: "Nos",
            brand: "3M",
            rate: 4500,
          },
          {
            id: "8",
            itemCode: "PIPE-001",
            itemName: "PVC Pipe",
            uomName: "Meter",
            brand: "Supreme",
            rate: 350,
          },
        ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Spec management functions
  const addSpec = () => {
    const newSpec: Spec = {
      id: Date.now().toString(),
      name: "",
      items: [],
      isExpanded: true,
    };
    setSpecs((prev) => [...prev, newSpec]);
  };

  const updateSpecName = (specId: string, name: string) => {
    setSpecs((prev) =>
      prev.map((spec) => (spec.id === specId ? { ...spec, name } : spec))
    );
  };

  const toggleSpecExpansion = (specId: string) => {
    setSpecs((prev) =>
      prev.map((spec) =>
        spec.id === specId ? { ...spec, isExpanded: !spec.isExpanded } : spec
      )
    );
  };

  const addItemToSpec = (specId: string, masterItem: any) => {
    const newItem: BOMItem = {
      id: masterItem.id,
      itemCode: masterItem.itemCode,
      itemName: masterItem.itemName,
      uomName: masterItem.uomName,
      rate: masterItem.rate,
      quantity: 1,
      price: masterItem.rate,
      specifications: "",
      materialType: "", // Default value
    };

    setSpecs((prev) =>
      prev.map((spec) =>
        spec.id === specId
          ? {
              ...spec,
              items: [...spec.items, newItem],
            }
          : spec
      )
    );
  };

  const updateSpecItemQuantity = (
    specId: string,
    itemId: string,
    quantity: number
  ) => {
    if (quantity <= 0) return;

    setSpecs((prev) =>
      prev.map((spec) =>
        spec.id === specId
          ? {
              ...spec,
              items: spec.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      quantity,
                      price: item.rate * quantity,
                    }
                  : item
              ),
            }
          : spec
      )
    );
  };

  const removeItemFromSpec = (specId: string, itemId: string) => {
    setSpecs((prev) =>
      prev.map((spec) =>
        spec.id === specId
          ? {
              ...spec,
              items: spec.items.filter((item) => item.id !== itemId),
            }
          : spec
      )
    );
  };

  const deleteSpec = (specId: string) => {
    setSpecs((prev) => prev.filter((spec) => spec.id !== specId));
    setShowDeleteSpecModal(false);
    setSpecToDelete(null);
  };

  const getAvailableItemsForSpec = (specId: string) => {
    const spec = specs.find((s) => s.id === specId);
    if (!spec) return masterItems;

    const usedItemIds = spec.items.map((item) => item.itemCode);
    return masterItems.filter((item) => !usedItemIds.includes(item.itemCode));
  };

  const getFilteredItems = (specId: string, searchQuery: string) => {
    const availableItems = getAvailableItemsForSpec(specId);
    return availableItems.filter(
      (item) =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const canSaveTemplate = () => {
    return (
      specs.length > 0 &&
      specs.every((spec) => spec.name.trim() !== "" && spec.items.length > 0) &&
      formData.workType &&
      formData.name
    );
  };

  // Helper function to check if an item was part of the initial data
  const isItemFromInitialData = (itemId: string) => {
    if (!initialData?.specs) return false;

    return initialData.specs.some(
      (spec: any) =>
        spec.items && spec.items.some((item: any) => item.id === itemId)
    );
  };

  // Convert specs to items for backward compatibility
  const getAllItems = () => {
    return specs.flatMap((spec) => spec.items);
  };

  const handleSaveSpecification = () => {
    if (editingItemId) {
      setSpecs((prev) =>
        prev.map((spec) => ({
          ...spec,
          items: spec.items.map((item) =>
            item.id === editingItemId
              ? {
                  ...item,
                  specifications: specification,
                }
              : item
          ),
        }))
      );
      setShowSpecModal(false);
      setEditingItemId(null);
      setSpecification("");
    }
  };

  // Component for individual spec item dropdown
  const SpecItemDropdown: React.FC<{ specId: string }> = ({ specId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState("");

    const filteredItems = getFilteredItems(specId, localSearchQuery);

    return (
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search items by name or code"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UOM
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  {/* <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th> */}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.itemCode}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.uomName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.brand}
                    </td>
                    {/* <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.rate.toLocaleString('en-IN')}</td> */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          addItemToSpec(specId, item);
                          setIsOpen(false);
                          setLocalSearchQuery("");
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-2 text-sm text-gray-500 text-center"
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isOpen && (
          <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
        )}
      </div>
    );
  };

  // Component for individual spec
  const materialTypes = ["HIGH SIDE SUPPLY", "LOW SIDE SUPPLY", "INSTALLATION"]; // Hardcoded array

  // --- Enhanced SpecSection with edit/save for spec name and item rows ---
  const SpecSection: React.FC<{ spec: Spec }> = ({ spec }) => {
    console.log("Rendering SpecSection for spec:", spec);

    const [isEditingSpecName, setIsEditingSpecName] = useState(false);
    const [localSpecName, setLocalSpecName] = useState(spec.name);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [itemEditState, setItemEditState] = useState<any>({}); // { [itemId]: { ...fields } }
    const hasItems = spec.items.length > 0;
    const totalValue = spec.items.reduce((sum, item) => sum + item.price, 0);

    // Only allow edit/save in edit mode
    const isEditMode = !!initialData;

    // Spec name edit/save logic
    const handleSpecNameEdit = () => setIsEditingSpecName(true);
    const handleSpecNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
      setLocalSpecName(e.target.value);
    const handleSpecNameSave = async () => {
      if (spec.id && localSpecName.trim() && localSpecName !== spec.name) {
        await updateBOMTemplateSpec(spec.id, {
          spec_description: localSpecName,
        });
        updateSpecName(spec.id, localSpecName);
      }
      setIsEditingSpecName(false);
    };

    // Item row edit/save logic
    const handleItemEdit = (item: BOMItem) => {
      setEditingItemId(item.id);
      setItemEditState({
        ...itemEditState,
        [item.id]: {
          quantity: item.quantity,
          materialType: item.materialType || "HIGH SIDE SUPPLY",
          specifications: item.specifications || "",
        },
      });
    };
    const handleItemFieldChange = (
      itemId: string,
      field: string,
      value: any
    ) => {
      setItemEditState((prev: any) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value,
        },
      }));
    };
    const handleItemSave = async (item: any) => {
      const editState = itemEditState[item.id];
      if (!editState) return;
      // In edit mode, if item has detailId, call API to update
      console.log("Editing item:", item, "with state:", editState);
      if (isEditMode && item.id) {
        // Prepare payload as per backend API
        const payload: any = {
          required_quantity: editState.quantity,
          material_type: editState.materialType,
        };
        // Optionally add updated_by if you have user info
        // payload.updated_by = currentUserId;
        try {
          console.log("Sending payload to API:", payload);
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/bom-template-detail/${
              item.detailId
            }`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log("API response:", response.data);
        } catch (err: any) {
          console.error("Failed to update item:", err?.response?.data || err);
          alert("Failed to update item. Please try again.");
        }
      }
      // Always update local state
      setSpecs((prevSpecs) =>
        prevSpecs.map((s) =>
          s.id === spec.id
            ? {
                ...s,
                items: s.items.map((it) =>
                  it.id === item.id
                    ? {
                        ...it,
                        quantity: editState.quantity,
                        materialType: editState.materialType,
                        specifications: editState.specifications,
                      }
                    : it
                ),
              }
            : s
        )
      );

      setEditingItemId(null);
    };

    const handleMaterialTypeChange = (itemId: string, value: string) => {
      handleItemFieldChange(itemId, "materialType", value);
    };

    return (
      <div className="border border-gray-200 rounded-lg mb-4">
        {/* Spec Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => toggleSpecExpansion(spec.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {spec.isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {/* Spec Name Input (always input in creation, and for new spec in edit mode) */}
              <div>
                {!isEditMode || !spec.name ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spec Name *
                    </label>
                    <input
                      type="text"
                      value={localSpecName}
                      onChange={handleSpecNameChange}
                      onBlur={() => updateSpecName(spec.id, localSpecName)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter spec name"
                    />
                    {!localSpecName.trim() && (
                      <p className="text-xs text-red-500 mt-1">
                        Spec name is required
                      </p>
                    )}
                  </div>
                ) : isEditingSpecName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={localSpecName}
                      onChange={handleSpecNameChange}
                      className="px-2 py-1 border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleSpecNameSave}
                      className="text-green-600"
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h4 className="text-md font-medium text-gray-900">
                      {spec.name || "Unnamed Spec"}
                    </h4>
                    {/* Toggle icon only in edit mode, not in creation */}
                    {isEditMode && (
                      <button
                        onClick={handleSpecNameEdit}
                        className="text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {spec.items.length} item(s) • ₹
                  {totalValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSpecToDelete(spec.id);
                  setShowDeleteSpecModal(true);
                }}
                className="text-red-600 hover:text-red-900"
                title="Delete Spec"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Spec Content */}
        {spec.isExpanded && (
          <div className="p-4">
            <div className="space-y-4">
              {/* Add Item Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Item
                </label>
                <SpecItemDropdown specId={spec.id} />
              </div>

              {/* Items Table */}
              {hasItems && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Code
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          UOM
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Material Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specifications
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {spec.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.itemCode}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.itemName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.uomName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {editingItemId === item.id ? (
                              <input
                                type="number"
                                value={
                                  itemEditState[item.id]?.quantity ||
                                  item.quantity
                                }
                                onChange={(e) =>
                                  handleItemFieldChange(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min="1"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : !isEditMode ||
                              (isEditMode &&
                                !isItemFromInitialData(item.id)) ? (
                              // New items in creation mode or edit mode - quantity is directly editable
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity =
                                    parseInt(e.target.value) || 1;
                                  updateSpecItemQuantity(
                                    spec.id,
                                    item.id,
                                    newQuantity
                                  );
                                }}
                                min="1"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              item.quantity
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {editingItemId === item.id ? (
                              <select
                                value={
                                  itemEditState[item.id]?.materialType ||
                                  item.materialType ||
                                  "HIGH SIDE SUPPLY"
                                }
                                onChange={(e) =>
                                  handleMaterialTypeChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                {materialTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            ) : !isEditMode ||
                              (isEditMode &&
                                !isItemFromInitialData(item.id)) ? (
                              // New items in creation mode or edit mode - material type is directly editable
                              <select
                                value={item.materialType || "HIGH SIDE SUPPLY"}
                                onChange={(e) => {
                                  setSpecs((prevSpecs) =>
                                    prevSpecs.map((s) =>
                                      s.id === spec.id
                                        ? {
                                            ...s,
                                            items: s.items.map((it) =>
                                              it.id === item.id
                                                ? {
                                                    ...it,
                                                    materialType:
                                                      e.target.value,
                                                  }
                                                : it
                                            ),
                                          }
                                        : s
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                {materialTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              item.materialType || "HIGH SIDE SUPPLY"
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {editingItemId === item.id ? (
                              <textarea
                                value={
                                  itemEditState[item.id]?.specifications ||
                                  item.specifications ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleItemFieldChange(
                                    item.id,
                                    "specifications",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                rows={1}
                                placeholder="Enter specifications..."
                              />
                            ) : !isEditMode ||
                              (isEditMode &&
                                !isItemFromInitialData(item.id)) ? (
                              // New items in creation mode or edit mode - specifications is directly editable
                              <textarea
                                value={item.specifications || ""}
                                onChange={(e) => {
                                  setSpecs((prevSpecs) =>
                                    prevSpecs.map((s) =>
                                      s.id === spec.id
                                        ? {
                                            ...s,
                                            items: s.items.map((it) =>
                                              it.id === item.id
                                                ? {
                                                    ...it,
                                                    specifications:
                                                      e.target.value,
                                                  }
                                                : it
                                            ),
                                          }
                                        : s
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                rows={1}
                                placeholder="Enter specifications..."
                              />
                            ) : (
                              <span className="text-sm text-gray-500">
                                {item.specifications || "No specifications"}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {/* Only show Edit/Save toggle in edit mode for existing items */}
                              {isEditMode &&
                                isItemFromInitialData(item.id) &&
                                (editingItemId === item.id ? (
                                  <button
                                    onClick={() => handleItemSave(item)}
                                    className="text-green-600"
                                    title="Save"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleItemEdit(item)}
                                    className="text-blue-600"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                ))}
                              <button
                                onClick={() =>
                                  removeItemFromSpec(spec.id, item.id)
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Remove Item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-2 text-sm font-medium text-right"
                        >
                          Total:
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          ₹{totalValue.toLocaleString("en-IN")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {!hasItems && (
                <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-md">
                  <p className="text-sm">No items added to this spec yet.</p>
                  <p className="text-xs">
                    Use the dropdown above to add items.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUploadTemplate = async () => {
    if (!csvFile) {
      alert('Please select a file before uploading.');
      return;
    }

    // Validate file type
    const validExtensions = ['csv', 'xlsx', 'xls'];
    const fileExtension = csvFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert('Invalid file type. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('excelFile', csvFile);

      // Make the API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bom-template/process-excel`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File processed successfully!');
        onClose(); // Close the modal on success
        setScreenRefresh(prev => prev + 1); 
      } else {
        const errorData = await response.json();
        alert(`Failed to process file: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file. Please try again.');

    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.workType && formData.name) {
      handleCreateTemplate();
    }
  };

  // Create template API call
  const handleCreateTemplate = async () => {
    setIsSubmitting(true);
    try {
      const response = await createBOMTemplate(formData);
      const templateId = response.data?.id;

      if (templateId) {
        setCreatedTemplateId(templateId);
        setCurrentStep(2);
      } else {
        throw new Error("Template ID not received from API");
      }
    } catch (error) {
      console.error("Error creating BOM template:", error);
      alert("Failed to create BOM template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isEditMode = !!initialData;

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        workType: initialData.workType || "",
        name: initialData.name || "",
        description: initialData.description || "",
      });

      // Convert items to specs if editing existing template
      if (initialData.items && initialData.items.length > 0) {
        const defaultSpec: Spec = {
          id: Date.now().toString(),
          name: "Default Spec",
          isExpanded: true,
          items: initialData.items,
        };
        setSpecs([defaultSpec]);
      } else {
        setSpecs([]);
      }

      setCurrentStep(1);
      setMethod("manual");
    } else if (isOpen && !initialData) {
      setFormData({
        workType: "",
        name: "",
        description: "",
      });
      setSpecs([]);
      setCurrentStep(1);
      setMethod("manual");
    }
  }, [isOpen, initialData]);

  // Prefill specs when initialData changes (e.g., when editing)
  useEffect(() => {
    if (initialData && initialData.specs) {
      setSpecs(initialData.specs);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (isEditMode) {
      try {
        setIsSubmitting(true);
        if (currentStep === 1) {
          // Step 1: Update template details
          const templateData = {
            name: formData.name,
            work_type: "TYPE2",
            reason: formData.description,
          };
          if (initialData?.id) {
            await updateBOMTemplate(initialData.id, templateData);
            onSubmit(templateData); // Notify parent to refresh list, close modal, etc.
          } else {
            alert("Template ID missing. Cannot update.");
          }
        } else if (currentStep === 2) {
          // Step 2: Update specs and details
          if (!specs.length) {
            alert("No specs to update.");
            return;
          }

          // 1. Find new specs (no id or id not in initialData.specs)
          const initialSpecIds = (initialData?.specs || []).map(
            (s: any) => s.id
          );
          const newSpecs = specs.filter(
            (spec) => !spec.id || !initialSpecIds.includes(spec.id)
          );

          // 3. If new specs, call createBOMTemplateSpecs, then update specs array with real UUIDs
          if (newSpecs.length > 0) {
            const specsPayload = newSpecs.map((spec) => ({
              name: spec.name,
              bomTemplateId: initialData.id,
            }));
            const specsResponse = await createBOMTemplateSpecs(specsPayload);
            const createdSpecs = specsResponse.data || [];
            // Map temp id to real UUID
            const tempIdToUuid: Record<string, string> = {};
            newSpecs.forEach((spec, idx) => {
              const createdSpecId = createdSpecs[idx]?.id;
              if (createdSpecId) {
                tempIdToUuid[spec.id] = createdSpecId;
              }
            });
            // Update specs array in memory (not just state)
            specs.forEach((spec) => {
              if (tempIdToUuid[spec.id]) {
                spec.id = tempIdToUuid[spec.id];
              }
            });
          }

          // 2. Find new items in all specs (item.id not in initialData.specs' items)
          let newDetails: any[] = [];
          (specs || []).forEach((spec) => {
            const initialSpec = (initialData?.specs || []).find(
              (s: any) => s.id === spec.id
            );
            const initialItemIds = (initialSpec?.items || []).map(
              (item: any) => item.id
            );
            const addedItems = spec.items.filter(
              (item) => !item.id || !initialItemIds?.includes(item.id)
            );
            addedItems.forEach((item) => {
              newDetails.push({
                bomTemplateId: initialData.id,
                bomTemplateSpecId: spec.id,
                itemId: item.id,
                quantity: item.quantity,
                materialType: item.materialType || "HIGH SIDE SUPPLY",
              });
            });
          });

          // 4. If new details, call createBOMTemplateDetails
          if (newDetails.length > 0) {
            await createBOMTemplateDetails(newDetails);
          }

          // 5. Update existing specs' names if changed
          const updatePromises = specs
            .filter(
              (spec) => spec.id && !newSpecs.find((s) => s.id === spec.id)
            )
            .map((spec) => {
              const payload = { spec_description: spec.name };
              return updateBOMTemplateSpec(spec.id, payload);
            });
          await Promise.all(updatePromises);

          onSubmit({ ...formData, specs });
        }
      } catch (error) {
        console.error("Failed to update BOM template:", error);
        alert("Failed to update BOM template. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleSaveTemplate();
    }
  };

  // Save template with specs and details
  const handleSaveTemplate = async () => {
    if (!createdTemplateId) {
      alert("Template not created yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create specs
      const specsPayload = specs.map((spec) => ({
        name: spec.name,
        bomTemplateId: createdTemplateId,
      }));

      const specsResponse = await createBOMTemplateSpecs(specsPayload);
      const createdSpecs = specsResponse.data || [];

      // Step 2: Create details
      const detailsPayload: any[] = [];
      specs.forEach((spec, specIndex) => {
        const specId = createdSpecs[specIndex]?.id;
        if (specId) {
          spec.items.forEach((item) => {
            detailsPayload.push({
              bomTemplateId: createdTemplateId,
              bomTemplateSpecId: specId,
              itemId: item.id,
              quantity: item.quantity,
              materialType: item.materialType || "HIGH SIDE SUPPLY", // Include materialType
            });
          });
        }
      });

      if (detailsPayload.length > 0) {
        console.log("Creating BOM template details:", detailsPayload);
        await createBOMTemplateDetails(detailsPayload);
      }

      // Success - close modal and reset
      const templateData = {
        ...formData,
        specs,
        items: getAllItems(),
        totalItems: getAllItems().length,
        totalValue: getAllItems().reduce((sum, item) => sum + item.price, 0),
        createdDate: new Date().toISOString(),
        status: "active",
      };

      onSubmit(templateData);

      // Reset form
      setCurrentStep(1);
      setCreatedTemplateId(null);
      setFormData({
        workType: "",
        name: "",
        description: "",
      });
      setSpecs([]);
      setMethod("manual");
      setCsvFile(null);
    } catch (error) {
      console.error("Error saving BOM template specs/details:", error);
      alert("Failed to save BOM template details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setFormData({
        workType: '',
        name: '',
        description: '',
      });
      setSpecs([]);
      setCsvFile(null);
      setCurrentStep(1);
      setMethod('manual');
      setCreatedTemplateId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 min-h-[540px] sm:min-h-[600px] md:min-h-[650px] max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit BOM Template" : "Create BOM Template"}
              </h3>
              {method === "manual" && (
                <nav
                  className="flex items-center space-x-2 mt-1"
                  aria-label="Breadcrumb"
                >
                  <span
                    className={`text-xs font-medium cursor-pointer ${
                      currentStep === 1
                        ? "text-blue-700 underline"
                        : "text-gray-500 hover:underline"
                    }`}
                    onClick={() => isEditMode && setCurrentStep(1)}
                    style={
                      isEditMode
                        ? { pointerEvents: "auto" }
                        : { pointerEvents: "none" }
                    }
                  >
                    Step 1: Template Details
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`text-xs font-medium cursor-pointer ${
                      currentStep === 2
                        ? "text-blue-700 underline"
                        : "text-gray-500 hover:underline"
                    }`}
                    onClick={() => isEditMode && setCurrentStep(2)}
                    style={
                      isEditMode
                        ? { pointerEvents: "auto" }
                        : { pointerEvents: "none" }
                    }
                  >
                    Step 2: Add Items
                  </span>
                </nav>
              )}
              {method === "upload" && (
                <p className="text-xs text-gray-500 mt-1">
                  Upload a CSV file to create a BOM template
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Method Selection */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Choose Method
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setMethod("manual");
                  setCurrentStep(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  method === "manual"
                    ? "bg-blue-600 text-white border border-blue-600 shadow"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Manual Creation
              </button>
              <button
                onClick={() => {
                  setMethod("upload");
                  setCurrentStep(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  method === "upload"
                    ? "bg-blue-600 text-white border border-blue-600 shadow"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Upload from CSV
              </button>
            </div>
          </div>

          <div
            className="
            flex-1
            p-6
            overflow-y-auto
            min-h-[350px] sm:min-h-[400px] md:min-h-[450px]
          "
          >
            {method === "manual" ? (
              <>
                {/* Step 1: Define Template Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Work Type *
                      </label>
                      <select
                        name="workType"
                        value={formData.workType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Work Type</option>
                        {workTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        BOM Template Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template description"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Add BOM Items */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Add Spec Button */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-700">
                        Build Specs
                      </h4>
                      <button
                        type="button"
                        onClick={addSpec}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Spec
                      </button>
                    </div>

                    {/* Specs List */}
                    {specs.length > 0 ? (
                      <div className="space-y-4">
                        {specs.map((spec) => (
                          <SpecSection key={spec.id} spec={spec} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                        <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">
                          No specs created yet
                        </p>
                        <p className="text-sm">
                          Click "Add Spec" to create your first spec
                        </p>
                      </div>
                    )}

                    {/* Validation Messages */}
                    {specs.length > 0 && (
                      <div className="mt-4">
                        {specs.some((spec) => !spec.name.trim()) && (
                          <p className="text-sm text-red-500 mb-2">
                            ⚠️ All specs must have a name
                          </p>
                        )}
                        {specs.some((spec) => spec.items.length === 0) && (
                          <p className="text-sm text-red-500 mb-2">
                            ⚠️ All specs must contain at least one item
                          </p>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    {specs.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Template Summary
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Specs:</span>
                            <span className="ml-2 font-medium">
                              {specs.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Items:</span>
                            <span className="ml-2 font-medium">
                              {getAllItems().length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Value:</span>
                            <span className="ml-2 font-medium text-green-600">
                              ₹
                              {getAllItems()
                                .reduce((sum, item) => sum + item.price, 0)
                                .toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                 )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file to create a BOM template
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  The CSV must include columns for BOM Template Name, Work Type, Item Code, Quantity, and Description
                </p>
                <div className="flex flex-col items-center space-y-3">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  {csvFile && (
                    <div className="text-sm text-gray-900">
                      Selected file: {csvFile.name}
                    </div>
                  )}
                    <button
                      onClick={handleUploadTemplate}
                      disabled={!csvFile}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                       <Upload className="h-4 w-4 mr-2" />
                    Upload Data For Template
                    </button>
                  </div>
                  <div className="mt-4">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, this would download a template CSV
                        alert("Template download would start here");
                      }}
                    >
                      Download CSV Template
                    </a>
                  </div>
                </div>

              </div>
            )}
          </div>
          {/* Specification Modal */}
          {showSpecModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Specification
                  </h3>
                  <button
                    onClick={() => setShowSpecModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >

                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <textarea
                    value={specification}
                    onChange={(e) => setSpecification(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter technical specifications or additional details..."
                  />
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowSpecModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSpecification}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Specification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer with navigation buttons */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            {method === "manual" ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSaveTemplate() || isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Updating..." : "Update Template"}
                    </button>
                  ) : currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        !formData.workType || !formData.name || isSubmitting
                      }
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Next"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSaveTemplate() || isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Saving..." : "Save Template"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex w-full justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>

                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSaveTemplate() || isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Template"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Spec Confirmation Modal */}
      {showDeleteSpecModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Spec
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this spec? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteSpecModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => specToDelete && deleteSpec(specToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateBOMTemplate;

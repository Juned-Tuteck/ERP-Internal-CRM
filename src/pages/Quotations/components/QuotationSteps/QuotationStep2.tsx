import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

interface QuotationStep2Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface ValidationErrors {
  projectCosts?: { [index: number]: { [field: string]: string } };
  supervisionCosts?: { [index: number]: { [field: string]: string } };
  financeCosts?: { [index: number]: { [field: string]: string } };
  contingencyCosts?: { [index: number]: { [field: string]: string } };
  summary?: { [field: string]: string };
}

// Cost types for each section
const COST_TYPES = {
  projectCosts: [
    "Electricity & Water",
    "Guest House",
    "Minor Civil Work",
    "Outstation Travelling + Hotel Cost",
    "Painting Charges, Sleeves",
    "Planning Cost in office",
    "Safety",
    "Scaffolding",
    "Site Office & Store Construction",
    "Unloading of material at site after delivery & Material shifting from store except chiller",
    "Watch & Ward"
  ],
  supervisionCosts: [
    "Project Manager",
    "Safety Inspector/QA/QC I",
    "Site Engineer",
    "Supervisor",
    "Technician / Fore man"
  ],
  financeCosts: [
    "Advance BG Charges",
    "Insurance Charges",
    "Performance BG Charges",
    "Retention BG Charges"
  ],
  contingencyCosts: [
    "Material & labour Contingency",
    "Testing & Inspection",
    "Warranty / DLP"
  ]
};

const QuotationStep2: React.FC<QuotationStep2Props> = ({
  formData,
  setFormData,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    project: true,
    supervision: true,
    finance: true,
    contingency: true,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Validation functions
  const validateCostItemField = (field: string, value: any, section?: string): string => {
    switch (field) {
      case "description":
        if (!value || value.toString().trim() === "") {
          return "Description is required";
        }
        // Validate against predefined cost types if section is provided
        if (section && COST_TYPES[section as keyof typeof COST_TYPES]) {
          const validOptions = COST_TYPES[section as keyof typeof COST_TYPES];
          if (!validOptions.includes(value)) {
            return "Please select a valid description from the dropdown";
          }
        }
        return "";

      case "nosPercentage":
        if (value === "" || value === null || value === undefined) {
          return "Nos/% Age is required";
        }
        const nosValue = parseFloat(value);
        if (isNaN(nosValue)) {
          return "Must be a valid number";
        }
        if (nosValue < 0) {
          return "Cannot be negative";
        }
        if (nosValue > 10000) {
          return "Value too large (max 10,000)";
        }
        return "";

      case "monthlyExpense":
        if (value === "" || value === null || value === undefined) {
          return "Monthly expense is required";
        }
        const expenseValue = parseFloat(value);
        if (isNaN(expenseValue)) {
          return "Must be a valid number";
        }
        if (expenseValue < 0) {
          return "Cannot be negative";
        }
        if (expenseValue > 10000000) {
          return "Value too large (max ₹1 crore)";
        }
        return "";

      case "months":
        if (value === "" || value === null || value === undefined) {
          return "Months is required";
        }
        const monthsValue = parseFloat(value);
        if (isNaN(monthsValue)) {
          return "Must be a valid number";
        }
        if (monthsValue < 0) {
          return "Cannot be negative";
        }
        if (monthsValue > 120) {
          return "Cannot exceed 120 months";
        }
        return "";

      case "diversity":
        if (value === "" || value === null || value === undefined) {
          return "Diversity is required";
        }
        const diversityValue = parseFloat(value);
        if (isNaN(diversityValue)) {
          return "Must be a valid number";
        }
        if (diversityValue < 0) {
          return "Cannot be negative";
        }
        if (diversityValue > 100) {
          return "Cannot exceed 100";
        }
        return "";

      default:
        return "";
    }
  };

  const validateSummaryField = (field: string, value: any): string => {
    switch (field) {
      case "contractValue":
        if (value === "" || value === null || value === undefined) {
          return ""; // Contract value is optional
        }
        const contractValue = parseFloat(value);
        if (isNaN(contractValue)) {
          return "Must be a valid number";
        }
        if (contractValue < 0) {
          return "Cannot be negative";
        }
        if (contractValue > 1000000000) {
          return "Value too large (max ₹100 crore)";
        }
        return "";

      default:
        return "";
    }
  };

  const setFieldError = (
    section: string,
    index: number,
    field: string,
    error: string
  ) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };

      // Type-safe error setting
      const sectionKey = section as keyof ValidationErrors;
      if (!newErrors[sectionKey]) {
        (newErrors as any)[sectionKey] = {};
      }
      if (!(newErrors as any)[sectionKey][index]) {
        (newErrors as any)[sectionKey][index] = {};
      }
      (newErrors as any)[sectionKey][index][field] = error;
      return newErrors;
    });
  };

  const clearFieldError = (section: string, index: number, field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      const sectionKey = section as keyof ValidationErrors;

      if (newErrors[sectionKey] && (newErrors as any)[sectionKey][index]) {
        delete (newErrors as any)[sectionKey][index][field];

        // If no errors left for this item, remove the index
        if (Object.keys((newErrors as any)[sectionKey][index]).length === 0) {
          delete (newErrors as any)[sectionKey][index];
        }
      }
      return newErrors;
    });
  };

  const setSummaryError = (field: string, error: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors.summary) {
        newErrors.summary = {};
      }
      newErrors.summary[field] = error;
      return newErrors;
    });
  };

  const clearSummaryError = (field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors.summary) {
        delete newErrors.summary[field];
        if (Object.keys(newErrors.summary).length === 0) {
          delete newErrors.summary;
        }
      }
      return newErrors;
    });
  };

  // Helper function to get field error
  const getFieldError = (
    section: string,
    index: number,
    field: string
  ): string => {
    const sectionKey = section as keyof ValidationErrors;
    const sectionErrors = validationErrors[sectionKey];
    if (sectionErrors && typeof sectionErrors === "object") {
      return (sectionErrors as any)[index]?.[field] || "";
    }
    return "";
  };

  // Helper function to get summary error
  const getSummaryError = (field: string): string => {
    return validationErrors.summary?.[field] || "";
  };

  // Function to validate all form data
  const validateAllFields = (): boolean => {
    let isValid = true;
    const sections = [
      "projectCosts",
      "supervisionCosts",
      "financeCosts",
      "contingencyCosts",
    ] as const;

    sections.forEach((section) => {
      const items = formData[section] || [];
      items.forEach((item: any, index: number) => {
        const fields = [
          "description",
          "nosPercentage",
          "monthlyExpense",
          "months",
          "diversity",
        ];

        fields.forEach((field) => {
          const error = validateCostItemField(field, item[field], section);
          if (error) {
            setFieldError(section, index, field, error);
            isValid = false;
          }
        });
      });
    });

    // Validate summary fields
    const contractValueError = validateSummaryField(
      "contractValue",
      formData.contractValue
    );
    if (contractValueError) {
      setSummaryError("contractValue", contractValueError);
      isValid = false;
    }

    return isValid;
  };

  // Function to get validation summary
  const getValidationSummary = (): { errorCount: number; message: string } => {
    let errorCount = 0;
    const sections = [
      "projectCosts",
      "supervisionCosts",
      "financeCosts",
      "contingencyCosts",
    ] as const;

    sections.forEach((section) => {
      const sectionKey = section as keyof ValidationErrors;
      const sectionErrors = validationErrors[sectionKey];
      if (sectionErrors) {
        Object.values(sectionErrors).forEach((itemErrors) => {
          errorCount += Object.keys(itemErrors).length;
        });
      }
    });

    // Count summary errors
    if (validationErrors.summary) {
      errorCount += Object.keys(validationErrors.summary).length;
    }

    const message =
      errorCount > 0
        ? `Please fix ${errorCount} validation error${
            errorCount > 1 ? "s" : ""
          } before proceeding.`
        : "All fields are valid.";

    return { errorCount, message };
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const addCostItem = (
    section:
      | "projectCosts"
      | "supervisionCosts"
      | "financeCosts"
      | "contingencyCosts"
  ) => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
      nosPercentage: "",
      monthlyExpense: "",
      months: "",
      diversity: "",
      total: 0,
    };

    setFormData({
      ...formData,
      [section]: [...(formData[section] || []), newItem],
    });

    // Set validation errors for the new empty item
    const newIndex = (formData[section] || []).length;
    setFieldError(section, newIndex, "description", "Description is required");
    setFieldError(section, newIndex, "nosPercentage", "Nos/% Age is required");
    setFieldError(
      section,
      newIndex,
      "monthlyExpense",
      "Monthly expense is required"
    );
    setFieldError(section, newIndex, "months", "Months is required");
    setFieldError(section, newIndex, "diversity", "Diversity is required");
  };

  const updateCostItem = (
    section:
      | "projectCosts"
      | "supervisionCosts"
      | "financeCosts"
      | "contingencyCosts",
    index: number,
    field: string,
    value: any
  ) => {
    // Validate the field
    const validationError = validateCostItemField(field, value, section);
    if (validationError) {
      setFieldError(section, index, field, validationError);
    } else {
      clearFieldError(section, index, field);
    }

    const updatedItems = [...(formData[section] || [])];
    updatedItems[index][field] = value;

    // Calculate total
    if (field !== "description") {
      const item = updatedItems[index];
      const nos = parseFloat(item.nosPercentage) || 0;
      const expense = parseFloat(item.monthlyExpense) || 0;
      const months = parseFloat(item.months) || 0;
      const diversity = parseFloat(item.diversity) || 0;

      item.total = parseFloat((expense * months * diversity * nos).toFixed(2));
    }

    setFormData({
      ...formData,
      [section]: updatedItems,
    });
  };

  const removeCostItem = (
    section:
      | "projectCosts"
      | "supervisionCosts"
      | "financeCosts"
      | "contingencyCosts",
    index: number
  ) => {
    const updatedItems = [...(formData[section] || [])];
    updatedItems.splice(index, 1);

    setFormData({
      ...formData,
      [section]: updatedItems,
    });

    // Clear validation errors for the removed item and reindex remaining items
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      const sectionKey = section as keyof ValidationErrors;

      if (newErrors[sectionKey]) {
        const sectionErrors = { ...newErrors[sectionKey] };

        // Remove errors for the deleted item
        delete (sectionErrors as any)[index];

        // Reindex errors for items after the deleted one
        const reindexedErrors: any = {};
        Object.keys(sectionErrors).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            reindexedErrors[keyIndex - 1] = (sectionErrors as any)[keyIndex];
          } else if (keyIndex < index) {
            reindexedErrors[keyIndex] = (sectionErrors as any)[keyIndex];
          }
        });

        (newErrors as any)[sectionKey] = reindexedErrors;

        // If no errors left for this section, remove it
        if (Object.keys(reindexedErrors).length === 0) {
          delete newErrors[sectionKey];
        }
      }

      return newErrors;
    });
  };

  // Calculate section totals
  const totalProjectCost = (formData.projectCosts || []).reduce(
    (sum: number, item: any) => sum + (parseFloat(item.total) || 0),
    0
  );

  const totalSupervisionCost = (formData.supervisionCosts || []).reduce(
    (sum: number, item: any) => sum + (parseFloat(item.total) || 0),
    0
  );
  const totalFinanceCost = (formData.financeCosts || []).reduce(
    (sum: number, item: any) => sum + (parseFloat(item.total) || 0),
    0
  );
  const totalContingencyCost = (formData.contingencyCosts || []).reduce(
    (sum: number, item: any) => sum + (parseFloat(item.total) || 0),
    0
  );

  const totalOverheadsCost =
    totalProjectCost +
    totalSupervisionCost +
    totalFinanceCost +
    totalContingencyCost;
  console.log("Total Overheads Cost:", totalOverheadsCost);

  // Calculate summary values - material and labour costs from step 1 grand totals
  const materialCost = formData.materialCost || 0;
  const labourCost = formData.labourCost || 0;

  const totalOwnCost = materialCost + labourCost;
  const contractValue = formData.contractValue || 0;

  // Update formData with calculated totals
  React.useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      totalOwnCost,
      materialCost,
      labourCost,
      totalOverheadsCost,
      contractValue: prev.contractValue || 0,
    }));
  }, [totalOwnCost, setFormData, materialCost, labourCost, totalOverheadsCost]);

  // Validate existing data on component mount
  React.useEffect(() => {
    const sections = [
      "projectCosts",
      "supervisionCosts",
      "financeCosts",
      "contingencyCosts",
    ] as const;

    sections.forEach((section) => {
      const items = formData[section] || [];
      items.forEach((item: any, index: number) => {
        const fields = [
          "description",
          "nosPercentage",
          "monthlyExpense",
          "months",
          "diversity",
        ];

        fields.forEach((field) => {
          const error = validateCostItemField(field, item[field], section);
          if (error) {
            setFieldError(section, index, field, error);
          }
        });
      });
    });

    // Validate summary fields
    const contractValueError = validateSummaryField(
      "contractValue",
      formData.contractValue
    );
    if (contractValueError) {
      setSummaryError("contractValue", contractValueError);
    }
  }, []); // Empty dependency array - run only on mount

  const handleSummaryChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;

    // Validate the field
    const validationError = validateSummaryField(field, value);
    if (validationError) {
      setSummaryError(field, validationError);
    } else {
      clearSummaryError(field);
    }

    setFormData({
      ...formData,
      [field]: numValue,
    });
  };

  const renderCostSection = (
    title: string,
    sectionKey:
      | "projectCosts"
      | "supervisionCosts"
      | "financeCosts"
      | "contingencyCosts",
    expandKey: "project" | "supervision" | "finance" | "contingency",
    total: number
  ) => {
    const items = formData[sectionKey] || [];

    return (
      <div className="border border-gray-200 rounded-lg">
        <div
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection(expandKey)}
        >
          <div className="flex items-center space-x-2">
            {expandedSections[expandKey] ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
            <h4 className="text-md font-medium text-gray-900">{title}</h4>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-green-600">
              Total: ₹
              {total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addCostItem(sectionKey);
              }}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </button>
          </div>
        </div>

        {expandedSections[expandKey] && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nos / % Age
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Expense
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Months
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diversity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item: any, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div>
                          <select
                            value={item.description || ""}
                            onChange={(e) =>
                              updateCostItem(
                                sectionKey,
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 ${
                              getFieldError(sectionKey, index, "description")
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          >
                            <option value="">Select description...</option>
                            {COST_TYPES[sectionKey].map((costType) => (
                              <option key={costType} value={costType}>
                                {costType}
                              </option>
                            ))}
                          </select>
                          {getFieldError(sectionKey, index, "description") && (
                            <div className="mt-1 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getFieldError(sectionKey, index, "description")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <input
                            type="number"
                            value={item.nosPercentage || ""}
                            onChange={(e) =>
                              updateCostItem(
                                sectionKey,
                                index,
                                "nosPercentage",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                              getFieldError(sectionKey, index, "nosPercentage")
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                          {getFieldError(
                            sectionKey,
                            index,
                            "nosPercentage"
                          ) && (
                            <div className="mt-1 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getFieldError(
                                sectionKey,
                                index,
                                "nosPercentage"
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <input
                            type="number"
                            value={item.monthlyExpense || ""}
                            onChange={(e) =>
                              updateCostItem(
                                sectionKey,
                                index,
                                "monthlyExpense",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            className={`w-24 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                              getFieldError(sectionKey, index, "monthlyExpense")
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                          {getFieldError(
                            sectionKey,
                            index,
                            "monthlyExpense"
                          ) && (
                            <div className="mt-1 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getFieldError(
                                sectionKey,
                                index,
                                "monthlyExpense"
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <input
                            type="number"
                            value={item.months || ""}
                            onChange={(e) =>
                              updateCostItem(
                                sectionKey,
                                index,
                                "months",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                              getFieldError(sectionKey, index, "months")
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                          {getFieldError(sectionKey, index, "months") && (
                            <div className="mt-1 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getFieldError(sectionKey, index, "months")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <input
                            type="number"
                            value={item.diversity || ""}
                            onChange={(e) =>
                              updateCostItem(
                                sectionKey,
                                index,
                                "diversity",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                              getFieldError(sectionKey, index, "diversity")
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                          />
                          {getFieldError(sectionKey, index, "diversity") && (
                            <div className="mt-1 flex items-center text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getFieldError(sectionKey, index, "diversity")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        ₹
                        {(item.total || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeCostItem(sectionKey, index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No items added yet. Click "Add" to create the first
                        item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project Management & Site Establishment Cost
        </h3>
        <p className="text-sm text-gray-600">
          Calculate overhead costs associated with this project.
        </p>
      </div>

      {/* Four Cost Sections */}
      <div className="space-y-4">
        {renderCostSection(
          "Project Management & Site Establishment Cost",
          "projectCosts",
          "project",
          totalProjectCost
        )}

        {renderCostSection(
          "Supervision",
          "supervisionCosts",
          "supervision",
          totalSupervisionCost
        )}

        {renderCostSection(
          "Finance Cost",
          "financeCosts",
          "finance",
          totalFinanceCost
        )}

        {renderCostSection(
          "Contingencies",
          "contingencyCosts",
          "contingency",
          totalContingencyCost
        )}
      </div>

      {/* Summary Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Overheads Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹
              {totalOverheadsCost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹
              {materialCost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labour Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹
              {labourCost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Own Cost
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-medium text-gray-900">
              ₹
              {totalOwnCost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Value
            </label>
            <div>
              <input
                type="number"
                value={contractValue || ""}
                onChange={(e) =>
                  handleSummaryChange("contractValue", e.target.value)
                }
                min="0"
                step="0.01"
                readOnly
                className={`w-full px-3 py-2 border rounded-md text-right bg-gray-50 cursor-not-allowed text-green-700 font-medium border-gray-300 ${
                  getSummaryError("contractValue")
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder={`Auto: ₹${(
                  totalOwnCost + totalOverheadsCost
                ).toLocaleString("en-IN")}`}
              />
              {getSummaryError("contractValue") && (
                <div className="mt-1 flex items-center text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {getSummaryError("contractValue")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {(() => {
        const { errorCount, message } = getValidationSummary();
        return errorCount > 0 ? (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h4 className="text-md font-medium text-red-800">
                Validation Errors
              </h4>
            </div>
            <p className="mt-2 text-sm text-red-700">{message}</p>
            <button
              type="button"
              onClick={() => validateAllFields()}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
            >
              Re-validate All Fields
            </button>
          </div>
        ) : null;
      })()}
    </div>
  );
};

export default QuotationStep2;

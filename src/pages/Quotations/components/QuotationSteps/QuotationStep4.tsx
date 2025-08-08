import React, { useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuotationStep4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onValidationChange?: (isValid: boolean) => void; // Optional callback for validation status
}

const QuotationStep4: React.FC<QuotationStep4Props> = ({
  formData,
  setFormData,
  onValidationChange,
}) => {
  const [expandedSpecs, setExpandedSpecs] = React.useState<
    Record<string, boolean>
  >({});
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  // Initialize GST rates if not exists
  useEffect(() => {
    if (!formData.gstRates) {
      setFormData((prev: any) => ({
        ...prev,
        gstRates: {
          highSideSupply: "",
          lowSideSupply: "",
          installation: "",
        },
      }));
    }
  }, []);

  // Validation effect - notify parent about validation status
  useEffect(() => {
    const isValid = Object.keys(validationErrors).length === 0;
    onValidationChange?.(isValid);
  }, [validationErrors, onValidationChange]);

  // Public method to validate all fields - can be called by parent
  useEffect(() => {
    // Validate on mount and when GST rates change
    validateAllFields();
  }, [formData.gstRates]);

  const toggleSpecExpansion = (specId: string) => {
    setExpandedSpecs((prev) => ({
      ...prev,
      [specId]: !prev[specId],
    }));
  };

  // Validation functions
  const validateGSTRate = (value: string, fieldName: string): string => {
    const numValue = parseFloat(value);

    // Allow empty values (no required validation)
    if (value === "" || value === undefined || value === null) {
      return "";
    }

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }

    // Range validation (0-100%)
    if (numValue < 0) {
      return `${fieldName} cannot be negative`;
    }

    if (numValue > 100) {
      return `${fieldName} cannot exceed 100%`;
    }

    // Decimal places limit (max 2 decimal places)
    const decimalPlaces = (value.split(".")[1] || "").length;
    if (decimalPlaces > 2) {
      return `${fieldName} can have maximum 2 decimal places`;
    }

    return "";
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate GST rates
    const highSideError = validateGSTRate(
      String(formData.gstRates?.highSideSupply || ""),
      "High Side Supply GST"
    );
    if (highSideError) errors.highSideSupply = highSideError;

    const lowSideError = validateGSTRate(
      String(formData.gstRates?.lowSideSupply || ""),
      "Low Side Supply GST"
    );
    if (lowSideError) errors.lowSideSupply = lowSideError;

    const installationError = validateGSTRate(
      String(formData.gstRates?.installation || ""),
      "Installation GST"
    );
    if (installationError) errors.installation = installationError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Group items by material type and calculate amounts
  const groupItemsByMaterialType = () => {
    const groups: {
      "HIGH SIDE SUPPLY": { items: any[]; totalAmount: number };
      "LOW SIDE SUPPLY": { items: any[]; totalAmount: number };
      INSTALLATION: { items: any[]; totalAmount: number };
    } = {
      "HIGH SIDE SUPPLY": { items: [], totalAmount: 0 },
      "LOW SIDE SUPPLY": { items: [], totalAmount: 0 },
      INSTALLATION: { items: [], totalAmount: 0 },
    };

    if (formData.specs) {
      formData.specs.forEach((spec: any) => {
        spec.items.forEach((item: any) => {
          const materialType = item.materialType || "INSTALLATION";
          const totalAmount =
            (item.supplyOwnAmount || 0) + (item.installationOwnAmount || 0);

          groups[materialType as keyof typeof groups].items.push({
            ...item,
            specName: spec.name,
            totalAmount,
          });
          groups[materialType as keyof typeof groups].totalAmount +=
            totalAmount;
        });
      });
    }

    return groups;
  };

  const groupedItems = groupItemsByMaterialType();

  // Calculate amounts without GST based on grouped items
  const highSideAmount = groupedItems["HIGH SIDE SUPPLY"].totalAmount;
  const lowSideAmount = groupedItems["LOW SIDE SUPPLY"].totalAmount;
  const installationAmount = groupedItems["INSTALLATION"].totalAmount;

  // Calculate amounts with GST
  const highSideGST = parseFloat(formData.gstRates?.highSideSupply || "0") || 0;
  const lowSideGST = parseFloat(formData.gstRates?.lowSideSupply || "0") || 0;
  const installationGST =
    parseFloat(formData.gstRates?.installation || "0") || 0;

  const highSideWithGST = highSideAmount * (1 + highSideGST / 100);
  const lowSideWithGST = lowSideAmount * (1 + lowSideGST / 100);
  const installationWithGST = installationAmount * (1 + installationGST / 100);

  const totalWithoutGST = highSideAmount + lowSideAmount + installationAmount;
  const totalWithGST = highSideWithGST + lowSideWithGST + installationWithGST;

  const handleGSTChange = (
    category: "highSideSupply" | "lowSideSupply" | "installation",
    value: string
  ) => {
    // Clear existing error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[category];
      return newErrors;
    });

    // Allow empty input (user might be clearing the field)
    if (value === "") {
      setFormData((prev: any) => ({
        ...prev,
        gstRates: {
          ...prev.gstRates,
          [category]: "",
        },
      }));
      return;
    }

    // Validate the input
    const fieldNames = {
      highSideSupply: "High Side Supply GST",
      lowSideSupply: "Low Side Supply GST",
      installation: "Installation GST",
    };

    const errorMessage = validateGSTRate(value, fieldNames[category]);

    if (errorMessage) {
      setValidationErrors((prev) => ({
        ...prev,
        [category]: errorMessage,
      }));
    }

    // Update the value (store the actual input value, not parsed)
    setFormData((prev: any) => ({
      ...prev,
      gstRates: {
        ...prev.gstRates,
        [category]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Final Costing Sheet
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Consolidated item-level costs with GST calculations.
        </p>
        <p className="text-xs text-blue-600">
          <span className="font-medium">Note:</span> GST rates can be adjusted
          for each material type. Enter values between 0-100% with up to 2
          decimal places.
        </p>
      </div>

      {/* BOM Items Display - Same as Step 1 but Read-only */}
      {formData.specs && formData.specs.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700">
            BOM Items (Read-only)
          </h4>

          {formData.specs.map((spec: any) => (
            <div key={spec.id} className="border border-gray-200 rounded-lg">
              {/* Spec Header */}
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSpecExpansion(spec.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedSpecs[spec.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <h4 className="text-md font-medium text-gray-900">
                        {spec.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {spec.items.length} item(s) • Supply: ₹
                        {spec.items
                          .reduce(
                            (sum: number, item: any) =>
                              sum + (item.supplyOwnAmount || 0),
                            0
                          )
                          .toLocaleString("en-IN")}{" "}
                        • Installation: ₹
                        {spec.items
                          .reduce(
                            (sum: number, item: any) =>
                              sum + (item.installationOwnAmount || 0),
                            0
                          )
                          .toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spec Content */}
              {expandedSpecs[spec.id] && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Material Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supply Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Supply Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Install Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Install Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {spec.items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {item.itemName}
                              </div>
                              {item.description && (
                                <div className="text-xs text-gray-500">
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {item.itemCode}
                              </div>
                              {item.hsnCode && (
                                <div className="text-xs text-gray-500">
                                  HSN: {item.hsnCode}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.materialType === "HIGH SIDE SUPPLY"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.materialType === "LOW SIDE SUPPLY"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {item.materialType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹{(item.supplyRate || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹
                              {(item.supplyOwnAmount || 0).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹
                              {(item.installationRate || 0).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹
                              {(item.installationOwnAmount || 0).toLocaleString(
                                "en-IN"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Table - GST and Final Cost Breakdown */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">
            GST and Final Cost Breakdown (Grouped by Material Type)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST %
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Without GST
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount With GST
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  HIGH SIDE SUPPLY
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {groupedItems["HIGH SIDE SUPPLY"].items.length} items
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={formData.gstRates?.highSideSupply || ""}
                      onChange={(e) =>
                        handleGSTChange("highSideSupply", e.target.value)
                      }
                      onBlur={() => {
                        // Re-validate on blur
                        const errorMessage = validateGSTRate(
                          String(formData.gstRates?.highSideSupply || ""),
                          "High Side Supply GST"
                        );
                        if (errorMessage) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            highSideSupply: errorMessage,
                          }));
                        }
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder=""
                      className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                        validationErrors.highSideSupply
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {validationErrors.highSideSupply && (
                      <div className="text-xs text-red-600">
                        {validationErrors.highSideSupply}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₹
                  {highSideAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  ₹
                  {highSideWithGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  LOW SIDE SUPPLY
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {groupedItems["LOW SIDE SUPPLY"].items.length} items
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={formData.gstRates?.lowSideSupply || ""}
                      onChange={(e) =>
                        handleGSTChange("lowSideSupply", e.target.value)
                      }
                      onBlur={() => {
                        // Re-validate on blur
                        const errorMessage = validateGSTRate(
                          String(formData.gstRates?.lowSideSupply || ""),
                          "Low Side Supply GST"
                        );
                        if (errorMessage) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            lowSideSupply: errorMessage,
                          }));
                        }
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder=""
                      className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                        validationErrors.lowSideSupply
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {validationErrors.lowSideSupply && (
                      <div className="text-xs text-red-600">
                        {validationErrors.lowSideSupply}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₹
                  {lowSideAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  ₹
                  {lowSideWithGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  INSTALLATION
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {groupedItems["INSTALLATION"].items.length} items
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={formData.gstRates?.installation || ""}
                      onChange={(e) =>
                        handleGSTChange("installation", e.target.value)
                      }
                      onBlur={() => {
                        // Re-validate on blur
                        const errorMessage = validateGSTRate(
                          String(formData.gstRates?.installation || ""),
                          "Installation GST"
                        );
                        if (errorMessage) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            installation: errorMessage,
                          }));
                        }
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder=""
                      className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 ${
                        validationErrors.installation
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {validationErrors.installation && (
                      <div className="text-xs text-red-600">
                        {validationErrors.installation}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₹
                  {installationAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  ₹
                  {installationWithGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  TOTAL BASIC OF SITC
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {Object.values(groupedItems).reduce(
                    (sum, group) => sum + group.items.length,
                    0
                  )}{" "}
                  items
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  ₹
                  {totalWithoutGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">
                  ₹
                  {totalWithGST.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Total GST Amount
          </h5>
          <p className="text-lg font-bold text-blue-600">
            ₹
            {(totalWithGST - totalWithoutGST).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Total Without GST
          </h5>
          <p className="text-lg font-bold text-gray-900">
            ₹
            {totalWithoutGST.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Grand Total With GST
          </h5>
          <p className="text-xl font-bold text-green-600">
            ₹
            {totalWithGST.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Update formData with final calculations */}
      {React.useEffect(() => {
        setFormData((prev: any) => ({
          ...prev,
          finalCosting: {
            groupedItems,
            highSideAmount,
            lowSideAmount,
            installationAmount,
            highSideWithGST,
            lowSideWithGST,
            installationWithGST,
            totalWithoutGST,
            totalWithGST,
            totalGSTAmount: totalWithGST - totalWithoutGST,
          },
        }));
      }, [
        groupedItems,
        highSideAmount,
        lowSideAmount,
        installationAmount,
        highSideWithGST,
        lowSideWithGST,
        installationWithGST,
        totalWithoutGST,
        totalWithGST,
      ])}
    </div>
  );
};

export default QuotationStep4;

import { read } from "fs";
import React, { useEffect, useState } from "react";

interface QuotationStep3Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

const QuotationStep3: React.FC<QuotationStep3Props> = ({
  formData,
  setFormData,
  onValidationChange,
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Validation functions
  const validateMarginPercentage = (value: string): string => {
    if (value === "" || value === null || value === undefined) {
      return "Margin percentage is required";
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return "Margin percentage must be a valid number";
    }

    if (numValue < 0) {
      return "Margin percentage cannot be negative";
    }

    if (numValue > 100) {
      return "Margin percentage cannot exceed 100%";
    }

    // Check for reasonable decimal places (max 2 decimal places for percentage)
    if (value.includes(".") && value.split(".")[1].length > 2) {
      return "Margin percentage can have maximum 2 decimal places";
    }

    return "";
  };

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "supplySummary.marginPercentage":
      case "labourSummary.marginPercentage":
      case "sitcSummary.marginPercentage":
        return validateMarginPercentage(value);
      default:
        return "";
    }
  };

  const updateValidationError = (fieldName: string, error: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  };

  const isFieldValid = (fieldName: string): boolean => {
    return !validationErrors[fieldName] || validationErrors[fieldName] === "";
  };

  const hasValidationErrors = (): boolean => {
    return Object.values(validationErrors).some((error) => error !== "");
  };

  // Notify parent component about validation status changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(!hasValidationErrors());
    }
  }, [validationErrors, onValidationChange]);
  // Get values from previous steps

  const ownSupply = formData.specs
    ? formData.specs.reduce(
      (sum: number, spec: any) =>
        sum +
        spec.items.reduce(
          (itemSum: number, item: any) =>
            itemSum + ( item.supplyOwnAmount || 0),
          0
        ),
      0
    )
    : formData.items?.reduce(
      (sum: number, item: any) => sum + ( item.supplyOwnAmount || 0),
      0
    ) || 0;

  const ownLabour = formData.specs
    ? formData.specs.reduce(
      (sum: number, spec: any) =>
        sum +
        spec.items.reduce(
          (itemSum: number, item: any) =>
            itemSum + ( item.installationOwnAmount || 0),
          0
        ),
      0
    )
    : formData.items?.reduce(
      (sum: number, item: any) => sum + (item.installationOwnAmount || 0),
      0
    ) || 0;

  console.log("Own Supply", ownSupply);
  console.log("Own Labour", ownLabour);

  const totalOverheads = formData.totalOverheadsCost || 0;
  const totalOwn = ownSupply + ownLabour;

  // Initialize summary data if not exists
  useEffect(() => {
    if (!formData.supplySummary) {
      setFormData((prev: any) => ({
        ...prev,
        supplySummary: {
          ownAmount: ownSupply,
          overheadsPercentage:
            totalOwn > 0
              ? (((ownSupply / totalOwn) * totalOverheads) / ownSupply) * 100
              : 0,
          overheadsAmount:
            totalOwn > 0 ? (ownSupply / totalOwn) * totalOverheads : 0,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0,
        },
        labourSummary: {
          ownAmount: ownLabour,
          overheadsPercentage:
            totalOwn > 0
              ? (((ownLabour / totalOwn) * totalOverheads) / ownLabour) * 100
              : 0,
          overheadsAmount:
            totalOwn > 0 ? (ownLabour / totalOwn) * totalOverheads : 0,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0,
        },
        sitcSummary: {
          ownAmount: totalOwn,
          overheadsPercentage:
            totalOwn > 0 ? (totalOverheads / totalOwn) * 100 : 0,
          overheadsAmount: totalOverheads,
          marginPercentage: 0,
          subTotal: 0,
          marginAmount: 0,
          sellingAmount: 0,
          mf: 0,
        },
      }));
    }
  }, [ownSupply, ownLabour, totalOverheads, totalOwn]);

  // Calculate values whenever inputs change
  useEffect(() => {
    if (
      formData.supplySummary &&
      formData.labourSummary &&
      formData.sitcSummary
    ) {
      // Supply calculations
      const supplyOverheadsAmount =
        totalOwn > 0 ? (ownSupply / totalOwn) * totalOverheads : 0;
      const supplySubTotal = ownSupply + supplyOverheadsAmount;
      const supplyMarginAmount =
        supplySubTotal * (formData.supplySummary.marginPercentage / 100);
      const supplySellingAmount = supplySubTotal + supplyMarginAmount;
      const supplyMF = ownSupply > 0 ? supplySellingAmount / ownSupply : 0;

      // Labour calculations
      const labourOverheadsAmount =
        totalOwn > 0 ? (ownLabour / totalOwn) * totalOverheads : 0;
      const labourSubTotal = ownLabour + labourOverheadsAmount;
      const labourMarginAmount =
        labourSubTotal * (formData.labourSummary.marginPercentage / 100);
      const labourSellingAmount = labourSubTotal + labourMarginAmount;
      const labourMF = ownLabour > 0 ? labourSellingAmount / ownLabour : 0;

      // SITC calculations
      const sitcSubTotal = totalOwn + totalOverheads;
      // SITC margin amount is the sum of supply margin amount and labour margin amount
      const sitcMarginAmount = supplyMarginAmount + labourMarginAmount;
      const sitcSellingAmount = sitcSubTotal + sitcMarginAmount;
      const sitcMF = totalOwn > 0 ? sitcSellingAmount / totalOwn : 0;

      setFormData((prev: any) => ({
        ...prev,
        supplySummary: {
          ...prev.supplySummary,
          ownAmount: ownSupply,
          overheadsPercentage:
            ownSupply > 0 ? (supplyOverheadsAmount / ownSupply) * 100 : 0,
          overheadsAmount: supplyOverheadsAmount,
          subTotal: supplySubTotal,
          marginAmount: supplyMarginAmount,
          sellingAmount: supplySellingAmount,
          mf: supplyMF,
        },
        labourSummary: {
          ...prev.labourSummary,
          ownAmount: ownLabour,
          overheadsPercentage:
            ownLabour > 0 ? (labourOverheadsAmount / ownLabour) * 100 : 0,
          overheadsAmount: labourOverheadsAmount,
          subTotal: labourSubTotal,
          marginAmount: labourMarginAmount,
          sellingAmount: labourSellingAmount,
          mf: labourMF,
        },
        sitcSummary: {
          ...prev.sitcSummary,
          ownAmount: totalOwn,
          overheadsPercentage:
            totalOwn > 0 ? (totalOverheads / totalOwn) * 100 : 0,
          overheadsAmount: totalOverheads,
          subTotal: sitcSubTotal,
          marginAmount: sitcMarginAmount,
          sellingAmount: sitcSellingAmount,
          mf: sitcMF,
        },
      }));
    }
  }, [
    ownSupply,
    ownLabour,
    totalOverheads,
    totalOwn,
    formData.supplySummary?.marginPercentage,
    formData.labourSummary?.marginPercentage,
    formData.sitcSummary?.marginPercentage,
  ]);

  // Validate existing data when component mounts or data changes
  useEffect(() => {
    if (
      formData.supplySummary ||
      formData.labourSummary ||
      formData.sitcSummary
    ) {
      const sections = [
        "supplySummary",
        "labourSummary",
        "sitcSummary",
      ] as const;

      sections.forEach((section) => {
        const data = formData[section];
        if (data && typeof data.marginPercentage !== "undefined") {
          const fieldName = `${section}.marginPercentage`;
          const error = validateField(
            fieldName,
            data.marginPercentage.toString()
          );
          updateValidationError(fieldName, error);
        }
      });
    }
  }, [
    formData.supplySummary?.marginPercentage,
    formData.labourSummary?.marginPercentage,
    formData.sitcSummary?.marginPercentage,
  ]);

  const handleMarginChange = (
    section: "supplySummary" | "labourSummary" | "sitcSummary",
    value: string
  ) => {
    const fieldName = `${section}.marginPercentage`;

    // Mark field as touched
    markFieldAsTouched(fieldName);

    // Validate the input
    const error = validateField(fieldName, value);
    updateValidationError(fieldName, error);

    // Only update the form data if validation passes or if the field is empty (to allow clearing)
    if (error === "" || value === "") {
      const marginPercentage = parseFloat(value) || 0;

      setFormData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          marginPercentage,
        },
      }));
    }
  };

  const renderSummarySection = (
    title: string,
    data: any,
    section: "supplySummary" | "labourSummary" | "sitcSummary"
  ) => {
    const fieldName = `${section}.marginPercentage`;
    const hasError = touchedFields.has(fieldName) && !isFieldValid(fieldName);
    const errorMessage = validationErrors[fieldName];

    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Own Amount:</span>
            <span className="text-sm font-medium">
              ₹
              {(data?.ownAmount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overheads (%):</span>
            <span className="text-sm font-medium">
              {(data?.overheadsPercentage || 0).toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overheads (Amount):</span>
            <span className="text-sm font-medium">
              ₹
              {(data?.overheadsAmount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">Margin (%):</label>
              <div className="flex flex-col items-end">
                {title === "SITC (OVERALL) SUMMARY" ? (
                <span className="text-sm font-medium"> - </span>
                ) : (
                <input
                  type="number"
                  value={data?.marginPercentage || ""}
                  onChange={(e) => handleMarginChange(section, e.target.value)}
                  onBlur={() => markFieldAsTouched(fieldName)}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-20 px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-1 transition-colors ${hasError
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                    }`}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${fieldName}-error` : undefined}
                />
                )}
              </div>
            </div>
            {hasError && (
              <div className="flex justify-end">
                <span
                  id={`${fieldName}-error`}
                  className="text-xs text-red-600 mt-1 max-w-[200px] text-right"
                  role="alert"
                >
                  {errorMessage}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sub Total:</span>
            <span className="text-sm font-medium">
              ₹
              {(data?.subTotal || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Margin (Amount):</span>
            <span className="text-sm font-medium">
              ₹
              {(data?.marginAmount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-gray-200 pt-3">
            <span className="text-sm font-medium text-gray-900">
              Selling Amount:
            </span>
            <span className="text-sm font-medium text-green-600">
              ₹
              {(data?.sellingAmount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">MF:</span>
            <span className="text-sm font-medium">
              {(data?.mf || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
        <p className="text-sm text-gray-600">
          Apply margins to calculate final selling prices.
        </p>

        {/* Validation Summary */}
        {hasValidationErrors() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-red-800">
                Please correct the following errors before proceeding:
              </span>
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {Object.entries(validationErrors)
                .filter(([_, error]) => error !== "")
                .map(([field, error]) => (
                  <li key={field}>
                    {field.includes("supplySummary") && "Supply Summary: "}
                    {field.includes("labourSummary") && "Labour Summary: "}
                    {field.includes("sitcSummary") && "SITC Summary: "}
                    {error}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderSummarySection(
          "SUPPLY SUMMARY",
          formData.supplySummary,
          "supplySummary"
        )}
        {renderSummarySection(
          "LABOUR SUMMARY",
          formData.labourSummary,
          "labourSummary"
        )}
        {renderSummarySection(
          "SITC (OVERALL) SUMMARY",
          formData.sitcSummary,
          "sitcSummary"
        )}
      </div>
    </div>
  );
};

export default QuotationStep3;

import React, { useState } from "react";
import { useEffect } from "react";
import {
  FileSpreadsheet,
  Calendar,
  Building2,
  User,
  DollarSign,
  Tag,
  Clock,
  Download,
  Printer,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useCRM } from "../../../context/CRMContext";
import CreateQuotationModal from "./CreateQuotationModal";
import { getQuotationById, deleteQuotation } from "../../../utils/quotationApi";

interface QuotationDetailsProps {
  quotation: any;
  onQuotationDeleted?: () => void;
}

const QuotationDetails: React.FC<QuotationDetailsProps> = ({ quotation, onQuotationDeleted }) => {
  // Handler for deleting quotation
  const handleDeleteQuotation = async () => {
    if (!quotation?.id) return;
    setLoading(true);
    try {
      await deleteQuotation(quotation.id);
      setIsDeleteModalOpen(false);
      if (onQuotationDeleted) {
        onQuotationDeleted();
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
    } finally {
      setLoading(false);
    }
  };
  const [activeTab, setActiveTab] = useState("summary");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quotationDetails, setQuotationDetails] = useState<any>(null);
  const [quotationDetailsForEdit, setQuotationDetailsForEdit] =
    useState<any>(null);
  // const [reloadDtls, setReloadDtls] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasActionAccess } = useCRM();

  // Fetch detailed quotation information when quotation is selected
  useEffect(() => {
    const fetchQuotationDetails = async () => {
      if (!quotation?.id) return;

      setLoading(true);
      try {
        const response = await getQuotationById(quotation.id);
        const apiQuotation = response.data;

        console.log(
          "QuotationDate:",
          apiQuotation.quotation_date,
          quotation.createdDate
        );
        console.log(
          "ExpiryDate:",
          apiQuotation.expiry_date,
          quotation.expiryDate
        );

        // Map API response to UI format
        const mappedQuotation = {
          id: apiQuotation.id,
          leadName: apiQuotation.lead_name || quotation.leadName,
          businessName: apiQuotation.business_name || quotation.businessName,
          workType: apiQuotation.work_type || quotation.workType,
          totalValue: `₹${(
            parseFloat(apiQuotation.high_side_cost_with_gst || 0) +
            parseFloat(apiQuotation.low_side_cost_with_gst || 0) +
            parseFloat(apiQuotation.installation_cost_with_gst || 0)
          ).toLocaleString("en-IN")}`,
          createdBy: apiQuotation.created_by || quotation.createdBy,
          createdDate: apiQuotation.quotation_date || quotation.createdDate,
          expiryDate: apiQuotation.expiry_date || quotation.expiryDate,
          status:
            apiQuotation.approval_status?.toLowerCase() || quotation.status,
          note: apiQuotation.note || "",
          bomId: apiQuotation.bom_id || "",
          leadId: apiQuotation.lead_id || "",
          totalSupplyOwnCost: parseFloat(
            apiQuotation.total_supply_own_cost || 0
          ),
          totalInstallationOwnCost: parseFloat(
            apiQuotation.total_installation_own_cost || 0
          ),
          totalPocOverheadsCost: parseFloat(
            apiQuotation.total_poc_overheads_cost || 0
          ),
          highSideCostWithoutGst: parseFloat(
            apiQuotation.high_side_cost_without_gst || 0
          ),
          highSideGstPercentage: parseFloat(
            apiQuotation.high_side_gst_percentage || 18
          ),
          highSideCostWithGst: parseFloat(
            apiQuotation.high_side_cost_with_gst || 0
          ),
          lowSideCostWithoutGst: parseFloat(
            apiQuotation.low_side_cost_without_gst || 0
          ),
          lowSideGstPercentage: parseFloat(
            apiQuotation.low_side_gst_percentage || 18
          ),
          lowSideCostWithGst: parseFloat(
            apiQuotation.low_side_cost_with_gst || 0
          ),
          installationCostWithoutGst: parseFloat(
            apiQuotation.installation_cost_without_gst || 0
          ),
          installationGstPercentage: parseFloat(
            apiQuotation.installation_gst_percentage || 18
          ),
          installationCostWithGst: parseFloat(
            apiQuotation.installation_cost_with_gst || 0
          ),
          specs: apiQuotation.bom_specs || [],
          pocExpenses: apiQuotation.poc_expenses || {},
          costMargins: apiQuotation.cost_margins || [],
          comments: apiQuotation.comments || [],
        };

        const mappedSpecs = apiQuotation.bom_specs.map((spec: any) => ({
          id: spec.id,
          name: spec.spec_description,
          isExpanded: true,
          price: parseFloat(spec.spec_price || "0"),
          items: (spec.items || []).map((detail: any) => {
            const quantity = parseFloat(detail.required_qty || "1");
            const supplyRate = parseFloat(detail.supply_rate || "0");
            const installationRate = parseFloat(
              detail.installation_rate || "0"
            );

            return {
              id: detail.id,
              itemId: detail.item_id,
              itemCode: detail.item_code || "",
              itemName: detail.item_name || "",
              materialType: detail.material_type || "INSTALLATION",
              uomName: "-", // static as per your code
              uomId: detail.uom_id || null,
              hsnCode: detail.hsn_code || "",
              description: detail.description || "",
              dimensions: detail.dimensions || "",
              unitPrice: parseFloat(detail.unit_price || "0"),
              uomValue: parseFloat(detail.uom_value || "1"),
              isCapitalItem: detail.is_capital_item || false,
              isScrapItem: detail.is_scrap_item || false,
              basicSupplyRate: supplyRate,
              basicInstallationRate: installationRate,
              supplyRate,
              installationRate,
              netRate: parseFloat(detail.latest_lowest_net_rate || "0"),
              quantity,
              supplyOwnAmount: quantity * supplyRate,
              installationOwnAmount: quantity * installationRate,
              finalSupplyAmount: parseFloat(detail.supply_price || "0"),
              finalInstallationAmount: parseFloat(
                detail.installation_price || "0"
              ),
              costDetails: {
                supplyDiscount: 0, // Not stored in API, would need separate endpoint
                supplyWastage: parseFloat(detail.supply_wastage_pct || "0"),
                supplyWastageAmount: parseFloat(
                  detail.supply_wastage_amt || "0"
                ),
                supplyTransportation: parseFloat(
                  detail.supply_transportation_pct || "0"
                ),
                supplyTransportationAmount: parseFloat(
                  detail.supply_transportation_amt || "0"
                ),
                supplyContingency: parseFloat(
                  detail.supply_contingency_pct || "0"
                ),
                supplyContingencyAmount: parseFloat(
                  detail.supply_contingency_amt || "0"
                ),
                supplyMiscellaneous: parseFloat(
                  detail.supply_miscellaneous_pct || "0"
                ),
                supplyMiscellaneousAmount: parseFloat(
                  detail.supply_miscellaneous_amt || "0"
                ),
                supplyOutstation: parseFloat(
                  detail.supply_outstation_pct || "0"
                ),
                supplyOutstationAmount: parseFloat(
                  detail.supply_outstation_amt || "0"
                ),
                supplyOfficeOverhead: parseFloat(
                  detail.supply_office_overhead_pct || "0"
                ),
                supplyOfficeOverheadAmount: parseFloat(
                  detail.supply_office_overhead_amt || "0"
                ),
                supplyPOVariance: parseFloat(
                  detail.supply_povariance_pct || "0"
                ),
                supplyPOVarianceAmount: parseFloat(
                  detail.supply_povariance_amt || "0"
                ),
                installationWastage: parseFloat(
                  detail.installation_wastage_pct || "0"
                ),
                installationWastageAmount: parseFloat(
                  detail.installation_wastage_amt || "0"
                ),
                installationTransportation: parseFloat(
                  detail.installation_transportation_pct || "0"
                ),
                installationTransportationAmount: parseFloat(
                  detail.installation_transportation_amt || "0"
                ),
                installationContingency: parseFloat(
                  detail.installation_contingency_pct || "0"
                ),
                installationContingencyAmount: parseFloat(
                  detail.installation_contingency_amt || "0"
                ),
                installationMiscellaneous: parseFloat(
                  detail.installation_miscellaneous_pct || "0"
                ),
                installationMiscellaneousAmount: parseFloat(
                  detail.installation_miscellaneous_amt || "0"
                ),
                installationOutstation: parseFloat(
                  detail.installation_outstation_pct || "0"
                ),
                installationOutstationAmount: parseFloat(
                  detail.installation_outstation_amt || "0"
                ),
                installationOfficeOverhead: parseFloat(
                  detail.installation_office_overhead_pct || "0"
                ),
                installationOfficeOverheadAmount: parseFloat(
                  detail.installation_office_overhead_amt || "0"
                ),
                installationPOVariance: parseFloat(
                  detail.installation_povariance_pct || "0"
                ),
                installationPOVarianceAmount: parseFloat(
                  detail.installation_povariance_amt || "0"
                ),
              },
            };
          }),
        }));

        const mappedQuotationForEdit = {
          // Step 1: Costing Sheet - Reverse mapping from quotation payload
          id: apiQuotation.id,
          leadId: apiQuotation.lead_id || "",
          leadName: apiQuotation.lead_name || quotation.leadName,
          businessName: apiQuotation.business_name || quotation.businessName,
          quotationNumber: apiQuotation.customer_quotation_number || "",
          quotationDate: apiQuotation.quotation_date
            ? new Date(apiQuotation.quotation_date).toLocaleDateString("en-CA")
            : quotation.createdDate
              ? new Date(quotation.createdDate).toLocaleDateString("en-CA")
              : "",
          expiryDate: apiQuotation.expiry_date
            ? new Date(apiQuotation.expiry_date).toLocaleDateString("en-CA")
            : quotation.expiryDate
              ? new Date(quotation.expiryDate).toLocaleDateString("en-CA")
              : "",
          bomId: apiQuotation.bom_id || "",
          specs: mappedSpecs || [],
          items: [], // Keep for backward compatibility
          note: apiQuotation.note || "",

          // Step 2: POC - Reverse mapping from POC expenses
          projectCosts: (
            apiQuotation.poc_expenses?.[
            "Project Management & Site Establishment Cost"
            ] || []
          ).map((cost: any) => ({
            id: cost.id?.toString() || Date.now().toString(),
            description: cost.description || "",
            nosPercentage: cost.measurement || 0,
            monthlyExpense: cost.monthly_expense || 0,
            months: cost.months || 0,
            diversity: cost.diversity || 0,
            total: cost.total || 0,
          })),
          supervisionCosts: (
            apiQuotation.poc_expenses?.["Supervision"] || []
          ).map((cost: any) => ({
            id: cost.id?.toString() || Date.now().toString(),
            description: cost.description || "",
            nosPercentage: cost.measurement || 0,
            monthlyExpense: cost.monthly_expense || 0,
            months: cost.months || 0,
            diversity: cost.diversity || 0,
            total: cost.total || 0,
          })),
          financeCosts: (apiQuotation.poc_expenses?.["Finance Cost"] || []).map(
            (cost: any) => ({
              id: cost.id?.toString() || Date.now().toString(),
              description: cost.description || "",
              nosPercentage: cost.measurement || 0,
              monthlyExpense: cost.monthly_expense || 0,
              months: cost.months || 0,
              diversity: cost.diversity || 0,
              total: cost.total || 0,
            })
          ),
          contingencyCosts: (
            apiQuotation.poc_expenses?.["Contingencies"] || []
          ).map((cost: any) => ({
            id: cost.id?.toString() || Date.now().toString(),
            description: cost.description || "",
            nosPercentage: cost.measurement || 0,
            monthlyExpense: cost.monthly_expense || 0,
            months: cost.months || 0,
            diversity: cost.diversity || 0,
            total: cost.total || 0,
          })),
          totalOverheadsCost: parseFloat(
            apiQuotation.total_poc_overheads_cost || 0
          ),
          materialCost: parseFloat(apiQuotation.total_supply_own_cost || 0),
          labourCost: parseFloat(apiQuotation.total_installation_own_cost || 0),
          totalOwnCost:
            parseFloat(apiQuotation.total_supply_own_cost || 0) +
            parseFloat(apiQuotation.total_installation_own_cost || 0),
          contractValue: 0, // This might need to be calculated or stored separately

          // Step 3: Summary - Reverse mapping from cost margins
          supplySummary: {
            id:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "supply"
              )?.id || NaN,
            ownAmount: parseFloat(apiQuotation.total_supply_own_cost || 0),
            overheadsPercentage: 0, // This would need calculation based on POC distribution
            overheadsAmount: 0, // This would need calculation based on POC distribution
            marginPercentage:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "supply"
              )?.margin || 0,
            subTotal: 0, // Would need calculation
            marginAmount: 0, // Would need calculation
            sellingAmount:
              parseFloat(apiQuotation.high_side_cost_without_gst || 0) +
              parseFloat(apiQuotation.low_side_cost_without_gst || 0),
            mf: 0, // Would need calculation
          },
          labourSummary: {
            id:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "labour"
              )?.id || NaN,
            ownAmount: parseFloat(
              apiQuotation.total_installation_own_cost || 0
            ),
            overheadsPercentage: 0, // This would need calculation based on POC distribution
            overheadsAmount: 0, // This would need calculation based on POC distribution
            marginPercentage:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "labour"
              )?.margin || 0,
            subTotal: 0, // Would need calculation
            marginAmount: 0, // Would need calculation
            sellingAmount: parseFloat(
              apiQuotation.installation_cost_without_gst || 0
            ),
            mf: 0, // Would need calculation
          },
          sitcSummary: {
            id:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "sitc"
              )?.id || NaN,
            ownAmount:
              parseFloat(apiQuotation.total_supply_own_cost || 0) +
              parseFloat(apiQuotation.total_installation_own_cost || 0),
            overheadsPercentage: 0, // This would need calculation
            overheadsAmount: parseFloat(
              apiQuotation.total_poc_overheads_cost || 0
            ),
            marginPercentage:
              apiQuotation.cost_margins?.find(
                (margin: any) => margin.cost_type === "sitc"
              )?.margin || 0,
            subTotal: 0, // Would need calculation
            marginAmount: 0, // Would need calculation
            sellingAmount:
              parseFloat(apiQuotation.high_side_cost_without_gst || 0) +
              parseFloat(apiQuotation.low_side_cost_without_gst || 0) +
              parseFloat(apiQuotation.installation_cost_without_gst || 0),
            mf: 0, // Would need calculation
          },

          // Step 4: Final Costing - Reverse mapping from GST details
          gstRates: {
            highSideSupply: parseFloat(
              apiQuotation.high_side_gst_percentage || 18
            ),
            lowSideSupply: parseFloat(
              apiQuotation.low_side_gst_percentage || 18
            ),
            installation: parseFloat(
              apiQuotation.installation_gst_percentage || 18
            ),
          },
          finalCosting: {
            categorizedItems: [], // This would need to be rebuilt from specs
            highSideAmount: parseFloat(
              apiQuotation.high_side_cost_without_gst || 0
            ),
            lowSideAmount: parseFloat(
              apiQuotation.low_side_cost_without_gst || 0
            ),
            installationAmount: parseFloat(
              apiQuotation.installation_cost_without_gst || 0
            ),
            highSideWithGST: parseFloat(
              apiQuotation.high_side_cost_with_gst || 0
            ),
            lowSideWithGST: parseFloat(
              apiQuotation.low_side_cost_with_gst || 0
            ),
            installationWithGST: parseFloat(
              apiQuotation.installation_cost_with_gst || 0
            ),
            totalWithoutGST:
              parseFloat(apiQuotation.high_side_cost_without_gst || 0) +
              parseFloat(apiQuotation.low_side_cost_without_gst || 0) +
              parseFloat(apiQuotation.installation_cost_without_gst || 0),
            totalWithGST:
              parseFloat(apiQuotation.high_side_cost_with_gst || 0) +
              parseFloat(apiQuotation.low_side_cost_with_gst || 0) +
              parseFloat(apiQuotation.installation_cost_with_gst || 0),
            totalGSTAmount:
              parseFloat(apiQuotation.high_side_cost_with_gst || 0) -
              parseFloat(apiQuotation.high_side_cost_without_gst || 0) +
              (parseFloat(apiQuotation.low_side_cost_with_gst || 0) -
                parseFloat(apiQuotation.low_side_cost_without_gst || 0)) +
              (parseFloat(apiQuotation.installation_cost_with_gst || 0) -
                parseFloat(apiQuotation.installation_cost_without_gst || 0)),
          },

          // Step 5: Comments - Direct mapping
          comments: (apiQuotation.comments || []).map((comment: any) => ({
            id: comment.id?.toString() || Date.now().toString(),
            text: comment.comment || comment.text || "",
            author: comment.author || "Unknown",
            timestamp:
              comment.created_at ||
              comment.timestamp ||
              new Date().toISOString(),
          })),

          // Legacy fields for backward compatibility
          workType: apiQuotation.work_type || quotation.workType,
          totalValue: `₹${(
            parseFloat(apiQuotation.high_side_cost_with_gst || 0) +
            parseFloat(apiQuotation.low_side_cost_with_gst || 0) +
            parseFloat(apiQuotation.installation_cost_with_gst || 0)
          ).toLocaleString("en-IN")}`,
          createdBy: apiQuotation.created_by || quotation.createdBy,
          createdDate: apiQuotation.quotation_date || quotation.createdDate,
          status:
            apiQuotation.approval_status?.toLowerCase() || quotation.status,

          // Quotation current step for edit mode validation
          currentQuotationStep: apiQuotation.step,
        };
        console.log("Mapped Quotation for Edit:", mappedQuotationForEdit);
        setQuotationDetailsForEdit(mappedQuotationForEdit);
        setQuotationDetails(mappedQuotation);
      } catch (error) {
        console.error("Error fetching quotation details:", error);
        // Fallback to the quotation data passed as prop
        setQuotationDetails(quotation);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationDetails();
  }, [quotation, isEditModalOpen]);

  if (!quotation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a quotation</h3>
          <p className="text-sm">
            Choose a quotation from the list to view details
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <FileSpreadsheet className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading quotation details...</h3>
        </div>
      </div>
    );
  }

  // Use detailed quotation data if available, otherwise fallback to prop data
  const displayQuotation = quotationDetails || quotation;

  // Extract quotation items from API data
  const quotationItems =
    displayQuotation.specs?.reduce((items: any[], spec: any) => {
      const specItems =
        spec.items?.map((item: any) => ({
          id: item.id,
          itemCode: item.item_code,
          itemName: item.item_name,
          uomName: item.uom_value || "Nos",
          supplyRate: parseFloat(item.supply_rate || 0),
          installationRate: parseFloat(item.installation_rate || 0),
          quantity: parseFloat(item.required_qty || 0),
          supplyPrice: parseFloat(item.supply_price || 0),
          installationPrice: parseFloat(item.installation_price || 0),
        })) || [];
      return [...items, ...specItems];
    }, []) || [];

  const costingSummary = {
    supplySubtotal: displayQuotation.totalSupplyOwnCost || 0,
    supplyMargin:
      displayQuotation.costMargins?.find(
        (margin: any) => margin.cost_type === "supply"
      )?.margin || 0,
    supplySellingAmount:
      displayQuotation.highSideCostWithoutGst +
      displayQuotation.lowSideCostWithoutGst || 0,
    installationSubtotal: displayQuotation.totalInstallationOwnCost || 0,
    installationMargin:
      displayQuotation.costMargins?.find(
        (margin: any) => margin.cost_type === "installation"
      )?.margin || 0,
    installationSellingAmount: displayQuotation.installationCostWithoutGst || 0,
    totalSellingAmount:
      (displayQuotation.highSideCostWithoutGst || 0) +
      (displayQuotation.lowSideCostWithoutGst || 0) +
      (displayQuotation.installationCostWithoutGst || 0),
    gstRate: 18, // Can be calculated as weighted average if needed
    gstAmount:
      displayQuotation.highSideCostWithGst -
      displayQuotation.highSideCostWithoutGst +
      (displayQuotation.lowSideCostWithGst -
        displayQuotation.lowSideCostWithoutGst) +
      (displayQuotation.installationCostWithGst -
        displayQuotation.installationCostWithoutGst),
    grandTotal:
      displayQuotation.highSideCostWithGst +
      displayQuotation.lowSideCostWithGst +
      displayQuotation.installationCostWithGst,
  };

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
      case "expired":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "summary", name: "Summary" },
    { id: "costingSheet", name: "Costing Sheet" },
    { id: "poc", name: "POC" },
    { id: "finalCosting", name: "Final Costing" },
    { id: "comments", name: "Comments" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Quotation Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {quotation.leadName}
            </h2>
            <p className="text-sm text-gray-600">{quotation.businessName}</p>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm font-semibold text-blue-700">
                Quotation : {quotation.quotationNumber || "-"}
              </p>
              <p className="text-sm font-semibold text-blue-500">
                Lead : {quotation.leadNumber || "-"}
              </p>
              <p className="text-sm font-semibold text-blue-400">
                BOM : {quotation.bomNumber || "-"}
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  quotation.status
                )}`}
              >
                {quotation.status.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-500">
                Created:{" "}
                {new Date(quotation.createdDate).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-2xl font-bold text-green-600">
              {quotation.totalValue}
            </div>
            <p className="text-xs text-gray-500">
              Expires:{" "}
              {new Date(quotation.expiryDate).toLocaleDateString("en-IN")}
            </p>
            <div className="flex space-x-2 mt-2 items-center">
              {/* <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-3 w-3 mr-1" />
                Export
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Printer className="h-3 w-3 mr-1" />
                Print
              </button> */}
              {(quotation.status === "pending" ||
                quotation.status === "draft") && hasActionAccess("Edit ", "All Quotations", "Quotations") && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                )}
              {(quotation.status === "pending" ||
                quotation.status === "draft") && (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quotation Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Supply Subtotal:
                    </span>
                    <span className="text-sm font-medium">
                      ₹{costingSummary.supplySubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Supply Margin ({costingSummary.supplyMargin}%):
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {(
                        (costingSummary.supplySubtotal *
                          costingSummary.supplyMargin) /
                        100
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Supply Selling Amount:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {costingSummary.supplySellingAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Installation Subtotal:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {costingSummary.installationSubtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Installation Margin ({costingSummary.installationMargin}
                      %):
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {(
                        (costingSummary.installationSubtotal *
                          costingSummary.installationMargin) /
                        100
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Installation Selling Amount:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {costingSummary.installationSellingAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Selling Amount:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {costingSummary.totalSellingAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      GST ({costingSummary.gstRate}%):
                    </span>
                    <span className="text-sm font-medium">
                      ₹{costingSummary.gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-sm text-gray-900">Grand Total:</span>
                    <span className="text-sm text-green-600">
                      ₹{costingSummary.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quotation Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Business</p>
                      <p className="text-sm font-medium text-gray-900">
                        {quotation.businessName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Work Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {quotation.workType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-medium text-gray-900">
                        {quotation.createdBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.createdDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(quotation.expiryDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quotation Items
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Item Code
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Item Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        UOM
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Supply Rate
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Supply Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Install Rate
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Install Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.itemCode}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.uomName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.supplyRate.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{item.supplyPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.installationRate.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{item.installationPrice.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-medium text-right"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ₹
                        {quotationItems
                          .reduce(
                            (sum: number, item: any) => sum + item.supplyPrice,
                            0
                          )
                          .toLocaleString("en-IN")}
                      </td>
                      <td></td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ₹
                        {quotationItems
                          .reduce(
                            (sum: number, item: any) =>
                              sum + item.installationPrice,
                            0
                          )
                          .toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "costingSheet" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Costing Sheet
              </h3>
              <p className="text-sm text-gray-600">
                Detailed breakdown of costs for this quotation.
              </p>
            </div>

            {/* Render costing details organized by spec groups */}
            {displayQuotation.specs?.map((spec: any, specIndex: number) => (
              <div
                key={spec.id || specIndex}
                className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50"
              >
                {/* Spec Header */}
                <div className="mb-6 border-b border-blue-300 pb-4">
                  <h3 className="text-xl font-semibold text-blue-900">
                    {spec.spec_description}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-blue-700">
                      Spec ID: {spec.id}
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      ₹
                      {parseFloat(spec.spec_price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Items within this spec */}
                <div className="space-y-4">
                  {spec.items?.map((item: any, itemIndex: number) => (
                    <div
                      key={item.id || itemIndex}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                    >
                      {/* Item Header */}
                      <div className="mb-4 border-b border-gray-100 pb-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.item_name}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm font-medium text-gray-700">
                            {item.item_code}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {item.id}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {item.material_type}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Supply Cost Details */}
                        <div className="space-y-4">
                          <h5 className="text-md font-medium text-gray-900">
                            Supply Cost Breakdown
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Base Supply Rate:
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_rate || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Quantity:
                              </span>
                              <span className="text-sm font-medium">
                                {parseFloat(item.required_qty || 0)}{" "}
                                {item.uom_value || "Nos"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply Wastage ({item.supply_wastage_pct || 0}
                                %):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_wastage_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply Transportation (
                                {item.supply_transportation_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_transportation_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply Contingency (
                                {item.supply_contingency_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_contingency_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply Miscellaneous (
                                {item.supply_miscellaneous_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_miscellaneous_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply Office Overhead (
                                {item.supply_office_overhead_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_office_overhead_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Supply PO-variance (
                                {item.supply_povariance_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.supply_povariance_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between font-medium">
                                <span className="text-sm text-gray-900">
                                  Total Supply Cost:
                                </span>
                                <span className="text-sm text-gray-900">
                                  ₹
                                  {parseFloat(
                                    item.total_supply_amt || 0
                                  ).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Installation Cost Details */}
                        <div className="space-y-4">
                          <h5 className="text-md font-medium text-gray-900">
                            Installation Cost Breakdown
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Base Installation Rate:
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_rate || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Quantity:
                              </span>
                              <span className="text-sm font-medium">
                                {parseFloat(item.required_qty || 0)}{" "}
                                {item.uom_value || "Nos"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Installation Wastage (
                                {item.installation_wastage_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_wastage_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Installation Transportation (
                                {item.installation_transportation_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_transportation_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Installation Contingency (
                                {item.installation_contingency_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_contingency_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Installation Miscellaneous (
                                {item.installation_miscellaneous_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_miscellaneous_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Installation Office Overhead (
                                {item.installation_office_overhead_pct || 0}%):
                              </span>
                              <span className="text-sm font-medium">
                                ₹
                                {parseFloat(
                                  item.installation_office_overhead_amt || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between font-medium">
                                <span className="text-sm text-gray-900">
                                  Total Installation Cost:
                                </span>
                                <span className="text-sm text-gray-900">
                                  ₹
                                  {parseFloat(
                                    item.total_installation_amt || 0
                                  ).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                        <div className="flex justify-between font-semibold text-gray-900">
                          <span>Total Item Cost (Supply + Installation):</span>
                          <span>
                            ₹
                            {(
                              parseFloat(item.total_supply_amt || 0) +
                              parseFloat(item.total_installation_amt || 0)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || (
                      <div className="text-center py-4 text-gray-500">
                        <p>No items found for this specification.</p>
                      </div>
                    )}
                </div>

                {/* Spec Total */}
                <div className="mt-6 pt-4 border-t border-blue-300 bg-blue-100 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                  <div className="flex justify-between font-bold text-blue-900">
                    <span className="text-lg">Specification Total:</span>
                    <span className="text-lg">
                      ₹
                      {parseFloat(spec.spec_price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )) || (
                <div className="text-center py-8 text-gray-500">
                  <p>No specifications found for this quotation.</p>
                </div>
              )}

            {/* Overall Summary */}
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Overall Costing Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Supply Own Cost:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {displayQuotation.totalSupplyOwnCost.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Installation Own Cost:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {displayQuotation.totalInstallationOwnCost.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total POC Overheads:
                    </span>
                    <span className="text-sm font-medium">
                      ₹
                      {displayQuotation.totalPocOverheadsCost.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Grand Total Cost:</span>
                    <span>
                      ₹
                      {(
                        displayQuotation.totalSupplyOwnCost +
                        displayQuotation.totalInstallationOwnCost +
                        displayQuotation.totalPocOverheadsCost
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "poc" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Project Management & Site Establishment Cost
              </h3>
              <p className="text-sm text-gray-600">
                Overhead costs associated with this project.
              </p>
            </div>

            {/* Render POC Expenses dynamically from API data */}
            {displayQuotation.pocExpenses &&
              Object.entries(displayQuotation.pocExpenses).map(
                ([category, expenses]) => {
                  const expenseArray = Array.isArray(expenses) ? expenses : [];
                  return (
                    <div
                      key={category}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        {category}
                      </h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Description
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Measurement
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Monthly Expense
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Months
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Diversity
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {expenseArray.map((expense: any, index: number) => (
                            <tr key={expense.id || index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {expense.description}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {expense.measurement}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                ₹
                                {parseFloat(
                                  expense.monthly_expense || 0
                                ).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {expense.months}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {expense.diversity}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹
                                {parseFloat(expense.total || 0).toLocaleString(
                                  "en-IN"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-2 text-sm font-medium text-right"
                            >
                              Total {category}:
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              ₹
                              {expenseArray
                                .reduce(
                                  (sum: number, expense: any) =>
                                    sum + parseFloat(expense.total || 0),
                                  0
                                )
                                .toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                }
              )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between font-medium">
                <span className="text-md text-gray-900">
                  Total Overheads Cost:
                </span>
                <span className="text-md text-gray-900">
                  ₹
                  {displayQuotation.totalPocOverheadsCost.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "finalCosting" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Final Costing Sheet
              </h3>
              <p className="text-sm text-gray-600">
                Customer-facing summary of costs.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Itemized List
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Item Code
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Item Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        UOM
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Supply Rate
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Supply Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Install Rate
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Install Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.itemCode}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.uomName}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.supplyRate.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{item.supplyPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.installationRate.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{item.installationPrice.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-2 text-sm font-medium text-right"
                      >
                        Subtotal:
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ₹
                        {quotationItems
                          .reduce(
                            (sum: number, item: any) => sum + item.supplyPrice,
                            0
                          )
                          .toLocaleString("en-IN")}
                      </td>
                      <td></td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        ₹
                        {quotationItems
                          .reduce(
                            (sum: number, item: any) =>
                              sum + item.installationPrice,
                            0
                          )
                          .toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                GST Summary
              </h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      GST %
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      GST Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      High Side Supply
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {displayQuotation.highSideCostWithoutGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {displayQuotation.highSideGstPercentage}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {(
                        displayQuotation.highSideCostWithGst -
                        displayQuotation.highSideCostWithoutGst
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹
                      {displayQuotation.highSideCostWithGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      Low Side Supply
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {displayQuotation.lowSideCostWithoutGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {displayQuotation.lowSideGstPercentage}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {(
                        displayQuotation.lowSideCostWithGst -
                        displayQuotation.lowSideCostWithoutGst
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹
                      {displayQuotation.lowSideCostWithGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      Installation
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {displayQuotation.installationCostWithoutGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {displayQuotation.installationGstPercentage}%
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹
                      {(
                        displayQuotation.installationCostWithGst -
                        displayQuotation.installationCostWithoutGst
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹
                      {displayQuotation.installationCostWithGst.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-sm font-medium text-right"
                    >
                      Grand Total:
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      ₹{costingSummary.gstAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">
                      ₹{costingSummary.grandTotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Quotation Comments
              </h3>
              <p className="text-sm text-gray-600">
                Internal communication regarding this quotation.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {displayQuotation.comments &&
                  displayQuotation.comments.length > 0 ? (
                  displayQuotation.comments.map(
                    (comment: any, index: number) => (
                      <div
                        key={comment.id || index}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {comment.created_by
                              ? comment.created_by.substring(0, 2).toUpperCase()
                              : "U"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-md font-medium text-gray-900">
                              {comment.comment}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.created_at
                                ? new Date(comment.created_at).toLocaleString(
                                  "en-IN"
                                )
                                : "Unknown Date"}
                            </span>
                          </div>
                          <p className="text-[0.6rem] text-gray-700">
                            {comment.created_by || "Unknown User"}
                          </p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <CreateQuotationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
          }}
          onSubmit={(updatedQuotation) => {
            console.log("Updated quotation:", updatedQuotation);
            // In a real app, this would update the quotation in the database
            setIsEditModalOpen(false);
          }}
          initialData={quotationDetailsForEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Quotation
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this quotation? This action
                cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">{quotation.leadName}</span> -{" "}
                {quotation.totalValue}
              </p>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuotation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Quotation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetails;

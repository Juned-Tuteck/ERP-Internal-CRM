import React, { useState, useEffect } from "react";
import { X, Save, ChevronLeft, ChevronRight } from "lucide-react";
import QuotationStep1 from "./QuotationSteps/QuotationStep1";
import QuotationStep2 from "./QuotationSteps/QuotationStep2";
import QuotationStep3 from "./QuotationSteps/QuotationStep3";
import QuotationStep4 from "./QuotationSteps/QuotationStep4";
import QuotationStep5 from "./QuotationSteps/QuotationStep5";
import {
  createQuotation,
  createQuotationSpecs,
  createQuotationItemDetails,
  createPOCExpenses,
  updateQuotation,
  createCostMargins,
  createQuotationComment,
  updateQuotationBOMSpec,
  updateQuotationBOMItemDetail,
  updateQuotationPOCExpense,
  updateQuotationCostMargin,
  updateQuotationComment,
} from "../../../utils/quotationApi";


import useNotifications from '../../../hook/useNotifications';
import { useCRM } from '../../../context/CRMContext';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: any) => void;
  initialData?: any;
}

const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuotationId, setCreatedQuotationId] = useState<string | null>(
    null
  );

  const getDefaultFormData = () => ({
    // Step 1: Costing Sheet
    leadId: "",
    leadName: "",
    businessName: "",
    quotationDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0],
    bomId: "",
    specs: [],
    items: [], // Keep for backward compatibility
    note: "",
    // Step 2: POC
    projectCosts: [],
    supervisionCosts: [],
    financeCosts: [],
    contingencyCosts: [],
    totalOverheadsCost: 0,
    materialCost: 0,
    labourCost: 0,
    totalOwnCost: 0,
    contractValue: 0,
    // Step 3: Summary
    supplySummary: {
      ownAmount: 0,
      overheadsPercentage: 0,
      overheadsAmount: 0,
      marginPercentage: 0,
      subTotal: 0,
      marginAmount: 0,
      sellingAmount: 0,
      mf: 0,
    },
    labourSummary: {
      ownAmount: 0,
      overheadsPercentage: 0,
      overheadsAmount: 0,
      marginPercentage: 0,
      subTotal: 0,
      marginAmount: 0,
      sellingAmount: 0,
      mf: 0,
    },
    sitcSummary: {
      ownAmount: 0,
      overheadsPercentage: 0,
      overheadsAmount: 0,
      marginPercentage: 0,
      subTotal: 0,
      marginAmount: 0,
      sellingAmount: 0,
      mf: 0,
    },
    // Step 4: Final Costing
    gstRates: {
      highSideSupply: 18,
      lowSideSupply: 18,
      installation: 18,
    },
    finalCosting: {
      categorizedItems: [],
      highSideAmount: 0,
      lowSideAmount: 0,
      installationAmount: 0,
      highSideWithGST: 0,
      lowSideWithGST: 0,
      installationWithGST: 0,
      totalWithoutGST: 0,
      totalWithGST: 0,
      totalGSTAmount: 0,
    },
    // Step 5: Comments
    comments: [],
  });

  const [formData, setFormData] = useState(() => {
    const defaultData = getDefaultFormData();

    console.log("Initial Data:", initialData);

    if (initialData) {
      // Find the lead ID based on the lead name if it's not provided
      let leadId = initialData.leadId;

      return {
        ...defaultData,
        ...initialData,
        leadId: leadId || "",
        bomId: initialData.bomId || "",
        specs: initialData.specs || [],
        items: initialData.items || [], // Keep for backward compatibility
        // Step 1: Costing Sheet
        quotationDate: initialData.quotationDate,
        expiryDate: initialData.expiryDate,
        // Step 2: POC
        projectCosts: initialData.projectCosts || [],
        supervisionCosts: initialData.supervisionCosts || [],
        financeCosts: initialData.financeCosts || [],
        contingencyCosts: initialData.contingencyCosts || [],
        totalOverheadsCost: initialData.totalOverheadsCost || 0,
        materialCost: initialData.materialCost || 0,
        labourCost: initialData.labourCost || 0,
        totalOwnCost: initialData.totalOwnCost || 0,
        contractValue: initialData.contractValue || 0,
        // Step 3: Summary
        supplySummary: {
          ...defaultData.supplySummary,
          ...(initialData.supplySummary || {}),
        },
        labourSummary: {
          ...defaultData.labourSummary,
          ...(initialData.labourSummary || {}),
        },
        sitcSummary: {
          ...defaultData.sitcSummary,
          ...(initialData.sitcSummary || {}),
        },
        // Step 4: Final Costing
        gstRates: {
          ...defaultData.gstRates,
          ...(initialData.gstRates || {}),
        },
        finalCosting: {
          ...defaultData.finalCosting,
          ...(initialData.finalCosting || {}),
        },
        // Step 5: Comments
        comments: initialData.comments || [],
      };
    }
    return defaultData;
  });

  const steps = [
    { id: 1, name: "Costing Sheet", description: "Item costs and details" },
    { id: 2, name: "POC", description: "Project overhead costs" },
    { id: 3, name: "Summary", description: "Margin application" },
    { id: 4, name: "Final Costing", description: "Customer-facing summary" },
    { id: 5, name: "Comments", description: "Internal notes" },
  ];

  useEffect(() => {
    if (initialData) {
      const defaultData = getDefaultFormData();

      let leadId = initialData.leadId;

      setFormData({
        ...defaultData,
        ...initialData,
        leadId: leadId || "",
        bomId: initialData.bomId || "",
        specs: initialData.specs || [],
        items: initialData.items || [], // Keep for backward compatibility
        // Step 2: POC
        projectCosts: initialData.projectCosts || [],
        supervisionCosts: initialData.supervisionCosts || [],
        financeCosts: initialData.financeCosts || [],
        contingencyCosts: initialData.contingencyCosts || [],
        totalOverheadsCost: initialData.totalOverheadsCost || 0,
        materialCost: initialData.materialCost || 0,
        labourCost: initialData.labourCost || 0,
        totalOwnCost: initialData.totalOwnCost || 0,
        contractValue: initialData.contractValue || 0,
        // Step 3: Summary
        supplySummary: {
          ...defaultData.supplySummary,
          ...(initialData.supplySummary || {}),
        },
        labourSummary: {
          ...defaultData.labourSummary,
          ...(initialData.labourSummary || {}),
        },
        sitcSummary: {
          ...defaultData.sitcSummary,
          ...(initialData.sitcSummary || {}),
        },
        // Step 4: Final Costing
        gstRates: {
          ...defaultData.gstRates,
          ...(initialData.gstRates || {}),
        },
        finalCosting: {
          ...defaultData.finalCosting,
          ...(initialData.finalCosting || {}),
        },
        // Step 5: Comments
        comments: initialData.comments || [],
      });

      // Set the quotation ID for edit mode
      if (initialData.id) {
        setCreatedQuotationId(initialData.id);
      }
    }
  }, [initialData]);

  const handleNext = async () => {
    if (currentStep === 1) {
      await handleStep1Submit();
    } else if (currentStep === 2) {
      await handleStep2Submit();
    } else if (currentStep === 3) {
      await handleStep3Submit();
    } else if (currentStep === 4) {
      await handleStep4Submit();
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }

    // if (isEditMode) {
    //   // In edit mode, update the current step and move to next
    //   let updateSuccess = false;

    //   if (currentStep === 1) {
    //     updateSuccess = await handleStep1Update();
    //   } else if (currentStep === 2) {
    //     updateSuccess = await handleStep2Update();
    //   } else if (currentStep === 3) {
    //     updateSuccess = await handleStep3Update();
    //   } else if (currentStep === 4) {
    //     updateSuccess = await handleStep4Update();
    //   } else if (currentStep === 5) {
    //     updateSuccess = await handleStep5Update();
    //   }

    //   // Move to next step only if update was successful
    //   if (updateSuccess && currentStep < 5) {
    //     setCurrentStep(currentStep + 1);
    //   }
    // } else {
    // In create mode, use the original logic
    // }
  };

  // Step 1: Create quotation, specs, and item details
  const handleStep1Submit = async () => {
    if (!formData.leadId || !formData.bomId) {
      alert("Please select a lead and ensure BOM is loaded");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate totals
      const totals = calculateTotals();

      // Step 1: Create quotation
      const quotationPayload = {
        lead_id: formData.leadId,
        quotation_date: formData.quotationDate,
        expiry_date: formData.expiryDate,
        note: formData.note || "",
        bom_id: formData.bomId,
        total_installation_own_cost: totals.totalInstallationOwnAmount,
        total_supply_own_cost: totals.totalSupplyOwnAmount,
      };

      const quotationResponse = await createQuotation(quotationPayload);
      const quotationId = quotationResponse.data?.id;

      if (!quotationId) {
        throw new Error("Quotation ID not received from API");
      }

      setCreatedQuotationId(quotationId);

      // Step 2: Create specs
      const specsPayload = formData.specs.map((spec: any) => ({
        customer_quotation_id: quotationId,
        spec_description: spec.name,
        spec_price: spec.items.reduce(
          (sum: number, item: any) =>
            sum +
            (item.supplyOwnAmount || 0) +
            (item.installationOwnAmount || 0),
          0
        ),
      }));

      const specsResponse = await createQuotationSpecs(specsPayload);
      const createdSpecs = specsResponse.data || [];

      // Step 3: Create item details
      const itemDetailsPayload: any[] = [];
      formData.specs.forEach((spec: any, specIndex: number) => {
        const specId = createdSpecs[specIndex]?.id;
        if (specId) {
          spec.items.forEach((item: any) => {
            const costDetails = item.costDetails || {};
            itemDetailsPayload.push({
              customer_quotation_id: quotationId,
              spec_id: specId,
              item_id: item.itemId,
              material_type: item.materialType,
              required_qty: item.quantity,
              base_rate: item.netRate || 0,
              cost_price: item.unitPrice || 0,
              conversion_qty: item.uomValue || 1,
              supply_rate: item.supplyRate,
              installation_rate: item.installationRate,
              supply_price: item.supplyOwnAmount,
              installation_price: item.installationOwnAmount,
              supply_wastage_amt: costDetails.supplyWastageAmount || 0,
              supply_transportation_amt:
                costDetails.supplyTransportationAmount || 0,
              supply_contingency_amt: costDetails.supplyContingencyAmount || 0,
              supply_miscellaneous_amt:
                costDetails.supplyMiscellaneousAmount || 0,
              supply_povariance_amt: costDetails.supplyPOVarianceAmount || 0,
              supply_outstation_amt: costDetails.supplyOutstationAmount || 0,
              supply_office_overhead_amt:
                costDetails.supplyOfficeOverheadAmount || 0,
              supply_wastage_pct: costDetails.supplyWastage || 0,
              supply_transportation_pct: costDetails.supplyTransportation || 0,
              supply_contingency_pct: costDetails.supplyContingency || 0,
              supply_miscellaneous_pct: costDetails.supplyMiscellaneous || 0,
              supply_povariance_pct: costDetails.supplyPOVariance || 0,
              supply_outstation_pct: costDetails.supplyOutstation || 0,
              supply_office_overhead_pct: costDetails.supplyOfficeOverhead || 0,
              installation_wastage_amt:
                costDetails.installationWastageAmount || 0,
              installation_transportation_amt:
                costDetails.installationTransportationAmount || 0,
              installation_contingency_amt:
                costDetails.installationContingencyAmount || 0,
              installation_miscellaneous_amt:
                costDetails.installationMiscellaneousAmount || 0,
              installation_povariance_amt:
                costDetails.installationPOVarianceAmount || 0,
              installation_outstation_amt:
                costDetails.installationOutstationAmount || 0,
              installation_office_overhead_amt:
                costDetails.installationOfficeOverheadAmount || 0,
              installation_wastage_pct: costDetails.installationWastage || 0,
              installation_transportation_pct:
                costDetails.installationTransportation || 0,
              installation_contingency_pct:
                costDetails.installationContingency || 0,
              installation_miscellaneous_pct:
                costDetails.installationMiscellaneous || 0,
              installation_povariance_pct:
                costDetails.installationPOVariance || 0,
              installation_outstation_pct:
                costDetails.installationOutstation || 0,
              installation_office_overhead_pct:
                costDetails.installationOfficeOverhead || 0,
              total_supply_amt: item.supplyOwnAmount || 0,
              total_installation_amt: item.installationOwnAmount || 0,
              spec_discount: 0,
              basic_supply_rate: item.basicSupplyRate || 0,
              basic_installation_rate: item.basicInstallationRate || 0,
            });
          });
        }
      });

      if (itemDetailsPayload.length > 0) {
        await createQuotationItemDetails(itemDetailsPayload);
      }
      setFormData({
        ...formData,
        materialCost: totals.totalSupplyOwnAmount,
        labourCost: totals.totalInstallationOwnAmount,
      });

      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error in Step 1:", error);
      alert("Failed to create quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Create POC expenses
  const handleStep2Submit = async () => {
    if (!createdQuotationId) {
      alert("Quotation not created yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine all POC expenses
      const allPOCExpenses = [
        ...(formData.projectCosts || []).map((cost: any) => ({
          customer_quotation_id: createdQuotationId,
          description: cost.description,
          measurement: parseFloat(cost.nosPercentage) || 0,
          monthly_expense: parseFloat(cost.monthlyExpense) || 0,
          months: parseFloat(cost.months) || 0,
          diversity: parseFloat(cost.diversity) || 0,
          total: parseFloat(cost.total) || 0,
          poc_type: "Project Management & Site Establishment Cost",
        })),
        ...(formData.supervisionCosts || []).map((cost: any) => ({
          customer_quotation_id: createdQuotationId,
          description: cost.description,
          measurement: parseFloat(cost.nosPercentage) || 0,
          monthly_expense: parseFloat(cost.monthlyExpense) || 0,
          months: parseFloat(cost.months) || 0,
          diversity: parseFloat(cost.diversity) || 0,
          total: parseFloat(cost.total) || 0,
          poc_type: "Supervision",
        })),
        ...(formData.financeCosts || []).map((cost: any) => ({
          customer_quotation_id: createdQuotationId,
          description: cost.description,
          measurement: parseFloat(cost.nosPercentage) || 0,
          monthly_expense: parseFloat(cost.monthlyExpense) || 0,
          months: parseFloat(cost.months) || 0,
          diversity: parseFloat(cost.diversity) || 0,
          total: parseFloat(cost.total) || 0,
          poc_type: "Finance Cost",
        })),
        ...(formData.contingencyCosts || []).map((cost: any) => ({
          customer_quotation_id: createdQuotationId,
          description: cost.description,
          measurement: parseFloat(cost.nosPercentage) || 0,
          monthly_expense: parseFloat(cost.monthlyExpense) || 0,
          months: parseFloat(cost.months) || 0,
          diversity: parseFloat(cost.diversity) || 0,
          total: parseFloat(cost.total) || 0,
          poc_type: "Contingencies",
        })),
      ];

      if (allPOCExpenses.length > 0) {
        await createPOCExpenses(allPOCExpenses);
      }

      // Update quotation with total POC overheads cost
      const totalPOCCost = formData.totalOverheadsCost || 0;
      await updateQuotation(createdQuotationId, {
        total_poc_overheads_cost: totalPOCCost,
      });

      // Move to next step
      setCurrentStep(3);
    } catch (error) {
      console.error("Error in Step 2:", error);
      alert("Failed to save POC expenses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Create cost margins
  const handleStep3Submit = async () => {
    if (!createdQuotationId) {
      alert("Quotation not created yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const marginsPayload = [
        {
          customer_quotation_id: createdQuotationId,
          margin: formData.supplySummary?.marginPercentage || 0,
          cost_type: "supply",
        },
        {
          customer_quotation_id: createdQuotationId,
          margin: formData.labourSummary?.marginPercentage || 0,
          cost_type: "labour",
        },
        {
          customer_quotation_id: createdQuotationId,
          margin: formData.sitcSummary?.marginPercentage || 0,
          cost_type: "sitc",
        },
      ];

      await createCostMargins(marginsPayload);

      // Move to next step
      setCurrentStep(4);
    } catch (error) {
      console.error("Error in Step 3:", error);
      alert("Failed to save cost margins. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Update quotation with GST details
  const handleStep4Submit = async () => {
    if (!createdQuotationId) {
      alert("Quotation not created yet. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCosting = formData.finalCosting || {};

      const gstPayload = {
        high_side_cost_without_gst: finalCosting.highSideAmount || 0,
        high_side_gst_percentage: formData.gstRates?.highSideSupply || 18,
        high_side_cost_with_gst: finalCosting.highSideWithGST || 0,
        low_side_cost_without_gst: finalCosting.lowSideAmount || 0,
        low_side_gst_percentage: formData.gstRates?.lowSideSupply || 18,
        low_side_cost_with_gst: finalCosting.lowSideWithGST || 0,
        installation_cost_without_gst: finalCosting.installationAmount || 0,
        installation_gst_percentage: formData.gstRates?.installation || 18,
        installation_cost_with_gst: finalCosting.installationWithGST || 0,
      };

      await updateQuotation(createdQuotationId, gstPayload);

      // Move to next step
      setCurrentStep(5);
    } catch (error) {
      console.error("Error in Step 4:", error);
      alert("Failed to save GST details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Add comment
  const handleAddComment = async (comment: string) => {
    if (!createdQuotationId || !comment.trim()) {
      return;
    }

    try {
      await createQuotationComment({
        customer_quotation_id: createdQuotationId,
        comment: comment.trim(),
      });

      // Add comment to local state for UI update
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: "Current User",
        timestamp: new Date().toISOString(),
      };
      setFormData((prev: any) => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      // ------------------------------------------------------------------------------------------For notifications
        try {
            await sendNotification({
              receiver_ids: ['admin'],
              title: `New Quotation Created Successfully For : ${formData.businessName||'Quotation'}`,
              message: `Quotation Created successfully and sent for approval!by ${userData?.name || 'a user'}`,
              service_type: 'CRM',
              link: '/quotations',
              sender_id: userRole || 'user',
              access: {
                module: "CRM",
                menu: "Quotations",
              }
            });
            console.log(`Notification sent for CRM Quotation of ${formData.businessName||'Quotation'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
      // ----------------------------------------------------------------------------------------

    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  // Calculate totals helper function
  const calculateTotals = () => {
    if (!formData.specs)
      return {
        totalSupplyOwnAmount: 0,
        totalInstallationOwnAmount: 0,
      };

    let totalSupplyOwnAmount = 0;
    let totalInstallationOwnAmount = 0;

    formData.specs.forEach((spec: any) => {
      spec.items.forEach((item: any) => {
        totalSupplyOwnAmount += item.supplyOwnAmount || 0;
        totalInstallationOwnAmount += item.installationOwnAmount || 0;
      });
    });

    return {
      totalSupplyOwnAmount,
      totalInstallationOwnAmount,
    };
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Close modal with success message
    alert("Quotation created successfully!");
    onSubmit(formData);

    // Reset form
    setCurrentStep(1);
    setCreatedQuotationId(null);
    setFormData(getDefaultFormData());
  };

  // Step-specific update handlers for edit mode
  // Step 1 Update: Update quotation basic details and specs/items
  const handleStep1Update = async () => {
    if (!initialData?.id) {
      alert("Quotation ID not found. Please try again.");
      return false;
    }
    console.log("Updating Step 1 with formData:");
    try {
      // Calculate totals
      const totals = calculateTotals();

      // Update quotation basic details
      const quotationUpdatePayload = {
        lead_id: formData.leadId,
        quotation_date: formData.quotationDate,
        expiry_date: formData.expiryDate,
        note: formData.note || "",
        bom_id: formData.bomId,
        total_installation_own_cost: totals.totalInstallationOwnAmount,
        total_supply_own_cost: totals.totalSupplyOwnAmount,
      };

      await updateQuotation(initialData.id, quotationUpdatePayload);

      // Update specs if they exist
      if (initialData.specs && formData.specs) {
        for (let i = 0; i < formData.specs.length; i++) {
          const spec = formData.specs[i];
          if (initialData.specs[i]?.id) {
            const specUpdatePayload = {
              spec_description: spec.name,
              spec_price: spec.items.reduce(
                (sum: number, item: any) =>
                  sum +
                  (item.supplyOwnAmount || 0) +
                  (item.installationOwnAmount || 0),
                0
              ),
            };
            await updateQuotationBOMSpec(
              initialData.specs[i].id,
              specUpdatePayload
            );
          }
        }
      }

      // Update item details if they exist
      if (initialData.specs && formData.specs) {
        for (
          let specIndex = 0;
          specIndex < formData.specs.length;
          specIndex++
        ) {
          const spec = formData.specs[specIndex];
          const initialSpec = initialData.specs[specIndex];

          if (initialSpec?.items) {
            for (
              let itemIndex = 0;
              itemIndex < spec.items.length;
              itemIndex++
            ) {
              const item = spec.items[itemIndex];
              const initialItem = initialSpec.items[itemIndex];

              if (initialItem?.id) {
                const costDetails = item.costDetails || {};
                const itemUpdatePayload = {
                  material_type: item.materialType,
                  required_qty: item.quantity,
                  base_rate: item.netRate || 0,
                  cost_price: item.unitPrice || 0,
                  conversion_qty: item.uomValue || 1,
                  supply_rate: item.supplyRate,
                  installation_rate: item.installationRate,
                  supply_price: item.supplyOwnAmount,
                  installation_price: item.installationOwnAmount,
                  supply_wastage_amt: costDetails.supplyWastageAmount || 0,
                  supply_transportation_amt:
                    costDetails.supplyTransportationAmount || 0,
                  supply_contingency_amt:
                    costDetails.supplyContingencyAmount || 0,
                  supply_miscellaneous_amt:
                    costDetails.supplyMiscellaneousAmount || 0,
                  supply_povariance_amt:
                    costDetails.supplyPOVarianceAmount || 0,
                  supply_outstation_amt:
                    costDetails.supplyOutstationAmount || 0,
                  supply_office_overhead_amt:
                    costDetails.supplyOfficeOverheadAmount || 0,
                  supply_wastage_pct: costDetails.supplyWastage || 0,
                  supply_transportation_pct:
                    costDetails.supplyTransportation || 0,
                  supply_contingency_pct: costDetails.supplyContingency || 0,
                  supply_miscellaneous_pct:
                    costDetails.supplyMiscellaneous || 0,
                  supply_povariance_pct: costDetails.supplyPOVariance || 0,
                  supply_outstation_pct: costDetails.supplyOutstation || 0,
                  supply_office_overhead_pct:
                    costDetails.supplyOfficeOverhead || 0,
                  installation_wastage_amt:
                    costDetails.installationWastageAmount || 0,
                  installation_transportation_amt:
                    costDetails.installationTransportationAmount || 0,
                  installation_contingency_amt:
                    costDetails.installationContingencyAmount || 0,
                  installation_miscellaneous_amt:
                    costDetails.installationMiscellaneousAmount || 0,
                  installation_povariance_amt:
                    costDetails.installationPOVarianceAmount || 0,
                  installation_outstation_amt:
                    costDetails.installationOutstationAmount || 0,
                  installation_office_overhead_amt:
                    costDetails.installationOfficeOverheadAmount || 0,
                  installation_wastage_pct:
                    costDetails.installationWastage || 0,
                  installation_transportation_pct:
                    costDetails.installationTransportation || 0,
                  installation_contingency_pct:
                    costDetails.installationContingency || 0,
                  installation_miscellaneous_pct:
                    costDetails.installationMiscellaneous || 0,
                  installation_povariance_pct:
                    costDetails.installationPOVariance || 0,
                  installation_outstation_pct:
                    costDetails.installationOutstation || 0,
                  installation_office_overhead_pct:
                    costDetails.installationOfficeOverhead || 0,
                  total_supply_amt: item.supplyOwnAmount || 0,
                  total_installation_amt: item.installationOwnAmount || 0,
                  basic_supply_rate: item.basicSupplyRate || 0,
                  basic_installation_rate: item.basicInstallationRate || 0,
                };
                await updateQuotationBOMItemDetail(
                  initialItem.id,
                  itemUpdatePayload
                );
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating Step 1:", error);
      alert("Failed to update quotation details. Please try again.");
      return false;
    }
  };

  // Step 2 Update: Update POC expenses
  const handleStep2Update = async () => {
    if (!initialData?.id) {
      alert("Quotation ID not found. Please try again.");
      return false;
    }
    console.log("Updating Step 2 with formData:", formData);

    try {
      // Update POC expenses if they exist in initialData
      const pocCategories = [
        {
          key: "projectCosts",
          type: "Project Management & Site Establishment Cost",
        },
        { key: "supervisionCosts", type: "Supervision" },
        { key: "financeCosts", type: "Finance Cost" },
        { key: "contingencyCosts", type: "Contingencies" },
      ];

      for (const category of pocCategories) {
        const currentCosts = formData[category.key] || [];
        const initialCosts = initialData[category.key] || [];

        console.log(
          `Updating ${category.key} with current costs:`,
          currentCosts
        );
        console.log(`Initial costs for ${category.key}:`, initialCosts);

        for (let i = 0; i < currentCosts.length; i++) {
          const cost = currentCosts[i];
          const initialCost = initialCosts[i];

          if (initialCost?.id) {
            // Update existing cost
            const pocUpdatePayload = {
              description: cost.description,
              measurement: parseFloat(cost.nosPercentage) || 0,
              monthly_expense: parseFloat(cost.monthlyExpense) || 0,
              months: parseFloat(cost.months) || 0,
              diversity: parseFloat(cost.diversity) || 0,
              total: parseFloat(cost.total) || 0,
              poc_type: category.type,
            };
            await updateQuotationPOCExpense(initialCost.id, pocUpdatePayload);
          } else {
            // Create new cost (no existing ID found)
            console.log(`Creating new cost for ${category.key}:`, cost);
            const pocCreatePayload = {
              customer_quotation_id: initialData.id,
              description: cost.description,
              measurement: parseFloat(cost.nosPercentage) || 0,
              monthly_expense: parseFloat(cost.monthlyExpense) || 0,
              months: parseFloat(cost.months) || 0,
              diversity: parseFloat(cost.diversity) || 0,
              total: parseFloat(cost.total) || 0,
              poc_type: category.type,
            };
            await createPOCExpenses([pocCreatePayload]);
          }
        }
      }

      // Update quotation with total POC overheads cost
      const totalPOCCost = formData.totalOverheadsCost || 0;
      await updateQuotation(initialData.id, {
        total_poc_overheads_cost: totalPOCCost,
      });

      return true;
    } catch (error) {
      console.error("Error updating Step 2:", error);
      alert("Failed to update POC expenses. Please try again.");
      return false;
    }
  };

  // Step 3 Update: Update cost margins
  const handleStep3Update = async () => {
    if (!initialData?.id) {
      alert("Quotation ID not found. Please try again.");
      return false;
    }
    console.log("Updating Step 3 with formData:", formData);

    try {
      const marginCategories = [
        { key: "supplySummary", type: "supply" },
        { key: "labourSummary", type: "labour" },
        { key: "sitcSummary", type: "sitc" },
      ];

      // Update cost margins if they exist in initialData
      for (const category of marginCategories) {
        const currentSummary = formData[category.key];
        const initialMargin = initialData[category.key];

        if (initialMargin?.id && currentSummary) {
          const marginUpdatePayload = {
            margin: currentSummary.marginPercentage || 0,
            cost_type: category.type,
          };
          await updateQuotationCostMargin(
            initialMargin.id,
            marginUpdatePayload
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating Step 3:", error);
      alert("Failed to update cost margins. Please try again.");
      return false;
    }
  };

  // Step 4 Update: Update GST details
  const handleStep4Update = async () => {
    if (!initialData?.id) {
      alert("Quotation ID not found. Please try again.");
      return false;
    }
    console.log("Updating Step 4 with formData:");

    try {
      const finalCosting = formData.finalCosting || {};

      const gstPayload = {
        high_side_cost_without_gst: finalCosting.highSideAmount || 0,
        high_side_gst_percentage: formData.gstRates?.highSideSupply || 18,
        high_side_cost_with_gst: finalCosting.highSideWithGST || 0,
        low_side_cost_without_gst: finalCosting.lowSideAmount || 0,
        low_side_gst_percentage: formData.gstRates?.lowSideSupply || 18,
        low_side_cost_with_gst: finalCosting.lowSideWithGST || 0,
        installation_cost_without_gst: finalCosting.installationAmount || 0,
        installation_gst_percentage: formData.gstRates?.installation || 18,
        installation_cost_with_gst: finalCosting.installationWithGST || 0,
      };

      await updateQuotation(initialData.id, gstPayload);

      return true;
    } catch (error) {
      console.error("Error updating Step 4:", error);
      alert("Failed to update GST details. Please try again.");
      return false;
    }
  };

  // Step 5 Update: Update comments
  const handleStep5Update = async () => {
    if (!initialData?.id) {
      alert("Quotation ID not found. Please try again.");
      return false;
    }
    console.log("Updating Step 5 with formData:");

    try {
      // Update existing comments if they have IDs
      const currentComments = formData.comments || [];
      const initialComments = initialData.comments || [];

      for (let i = 0; i < currentComments.length; i++) {
        const comment = currentComments[i];
        const initialComment = initialComments[i];

        if (initialComment?.id && comment.text !== initialComment.text) {
          const commentUpdatePayload = {
            customer_quotation_id: initialData.id,
            comment: comment.text,
            updated_by: "Current User", // You might want to get this from context
          };
          await updateQuotationComment(initialComment.id, commentUpdatePayload);
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating Step 5:", error);
      alert("Failed to update comments. Please try again.");
      return false;
    }
  };

  // Handle update action in edit mode
  const handleUpdate = async () => {
    if (!isEditMode || !initialData?.id) {
      alert("Cannot update: Not in edit mode or missing quotation data.");
      return;
    }

    setIsSubmitting(true);
    try {
      let updateSuccess = false;

      // Call appropriate update handler based on current step
      if (currentStep === 1) {
        updateSuccess = await handleStep1Update();
      } else if (currentStep === 2) {
        updateSuccess = await handleStep2Update();
      } else if (currentStep === 3) {
        updateSuccess = await handleStep3Update();
      } else if (currentStep === 4) {
        updateSuccess = await handleStep4Update();
      } else if (currentStep === 5) {
        updateSuccess = await handleStep5Update();
      }

      if (updateSuccess) {
        alert("Quotation updated successfully!");
        onClose();

        // Reset form
        setCurrentStep(1);
        setCreatedQuotationId(null);
        setFormData(getDefaultFormData());
      }
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      alert("Failed to update quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!initialData;
  const handleBreadcrumbClick = (stepId: number) => {
    if (isEditMode) setCurrentStep(stepId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Quotation" : "Create New Quotation"}
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(step.id)}
                  style={
                    isEditMode ? { cursor: "pointer" } : { cursor: "default" }
                  }
                  className={`flex items-center space-x-2 focus:outline-none ${
                    currentStep === step.id
                      ? "text-blue-600"
                      : currentStep > step.id
                      ? "text-green-600"
                      : isEditMode
                      ? "text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.id
                        ? "bg-blue-100 text-blue-600"
                        : currentStep > step.id
                        ? "bg-green-100 text-green-600"
                        : isEditMode
                        ? "bg-blue-50 text-blue-400"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Costing Sheet */}
          {currentStep === 1 && (
            <QuotationStep1
              formData={formData}
              setFormData={setFormData}
              isEditMode={isEditMode}
            />
          )}

          {/* Step 2: POC */}
          {currentStep === 2 && (
            <QuotationStep2 formData={formData} setFormData={setFormData} />
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <QuotationStep3 formData={formData} setFormData={setFormData} />
          )}

          {/* Step 4: Final Costing */}
          {currentStep === 4 && (
            <QuotationStep4 formData={formData} setFormData={setFormData} />
          )}

          {/* Step 5: Comments */}
          {currentStep === 5 && (
            <QuotationStep5
              formData={formData}
              setFormData={setFormData}
              onAddComment={handleAddComment}
            />
          )}
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div></div>
          {/* <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button> */}

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
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            ) : currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Processing..." : "Next"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Quotation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;

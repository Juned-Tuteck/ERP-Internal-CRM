// Validation utility functions for form validation

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (Indian format)
const PHONE_REGEX = /^[\+]?[0-9]{10,15}$/;

// PAN validation regex
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// GST validation regex
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// IFSC validation regex
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Pincode validation regex
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Bank account number validation regex (6-18 digits)
const BANK_ACCOUNT_REGEX = /^[0-9]{6,18}$/;

// Udyam Registration Number regex (Format: UDYAM-XX-00-0000000 or similar, but often just text is fine for now, user didn't specify strict format. We'll leave it as text but maybe min length)
// const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/; 
// Keeping it simple for now as requested "text".

// TAN validation regex
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export const validationRules = {
  // BOM Header Validations
  leadId: {
    required: true,
    custom: (value: string) => {
      if (!value) return "Please select a lead";
      return null;
    },
  },
  leadName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  workType: {
    required: true,
    custom: (value: string) => {
      if (!value) return "Please select a work type";
      return null;
    },
  },
  bomDate: {
    required: true,
    custom: (value: string) => {
      if (!value) return "Please select a date";

      // Validate date format and create date object
      const selectedDate = new Date(value);
      if (isNaN(selectedDate.getTime())) {
        return "Please enter a valid date";
      }

      // Get current date and set to end of day for comparison
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // Check if selected date is in the future
      if (selectedDate > today) {
        return "Date cannot be in the future. Please select today's date or earlier.";
      }

      return null;
    },
  },

  // BOM Spec Validations
  specName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value: string) => {
      if (!value || value.trim() === "")
        return "Specification name is required";
      return null;
    },
  },

  // BOM Item Validations
  itemId: {
    required: true,
    custom: (value: string) => {
      if (!value) return "Please select an item";
      return null;
    },
  },
  itemQuantity: {
    required: true,
    custom: (value: number) => {
      if (!value || value <= 0) return "Quantity must be greater than 0";
      if (value > 10000) return "Quantity cannot exceed 10,000";
      return null;
    },
  },
  itemSupplyRate: {
    required: true,
    custom: (value: number) => {
      if (value < 0) return "Supply rate cannot be negative";
      if (value > 1000000) return "Supply rate seems too high";
      return null;
    },
  },
  itemInstallationRate: {
    required: true,
    custom: (value: number) => {
      if (value < 0) return "Installation rate cannot be negative";
      if (value > 1000000) return "Installation rate seems too high";
      return null;
    },
  },
  itemNetRate: {
    required: true,
    custom: (value: number) => {
      if (value < 0) return "Net rate cannot be negative";
      if (value > 1000000) return "Net rate seems too high";
      return null;
    },
  },
  materialType: {
    required: true,
    custom: (value: string) => {
      const validTypes = [
        "HIGH SIDE SUPPLY",
        "LOW SIDE SUPPLY",
        "INSTALLATION",
      ];
      if (!value || !validTypes.includes(value)) {
        return "Please select a valid material type";
      }
      return null;
    },
  },
  // Business Details (Common for both Customer and Vendor)
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  contactNo: {
    required: true,
    pattern: PHONE_REGEX,
    custom: (value: string) => {
      if (!value) return null;
      const cleaned = value.replace(/[\s\-\+\(\)]/g, "");
      if (cleaned.length !== 10) {
        return "Phone number must be exactly 10 digits";
      }
      return null;
    },
  },
  email: {
    required: true,
    pattern: EMAIL_REGEX,
  },
  country: {
    required: true,
  },
  currency: {
    required: true,
  },
  state: {
    required: true,
  },
  district: {
    required: true,
  },
  city: {
    required: true,
  },
  customerType: {
    required: true,
  },
  customerPotential: {
    required: true,
  },
  pincode: {
    required: true,
    pattern: PINCODE_REGEX,
  },

  // New Business Details Fields
  customerGroup: {
    required: false,
  },
  customerSubGroup: {
    required: false,
  },
  alternateNumber: {
    required: false,
    pattern: PHONE_REGEX,
    custom: (value: string) => {
      if (!value) return null;
      const cleaned = value.replace(/[\s\-\+\(\)]/g, "");
      if (cleaned.length !== 10) {
        return "Phone number must be exactly 10 digits";
      }
      return null;
    },
  },
  customerClassification: {
    required: false,
  },
  msmeRegistered: {
    required: false,
  },
  udyamRegistrationNumber: {
    required: false, // validated conditionally in component
    minLength: 5,
  },

  // Vendor-specific validations
  vendorCategory: {
    required: true,
  },
  vendorType: {
    required: true,
  },

  // Bank Details (now mandatory for vendors)
  panNumber: {
    required: true,
    pattern: PAN_REGEX,
  },
  tanNumber: {
    required: true,
    pattern: TAN_REGEX,
  },
  gstNumber: {
    required: true,
    pattern: GST_REGEX,
  },
  bankName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  bankAccountNumber: {
    required: true,
    pattern: BANK_ACCOUNT_REGEX,
  },
  branchName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  ifscCode: {
    required: true,
    pattern: IFSC_REGEX,
  },

  // Contact Person validations
  contactPersonName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  contactPersonPhone: {
    required: true,
    pattern: PHONE_REGEX,
    custom: (value: string) => {
      if (!value) return null;
      const cleaned = value.replace(/[\s\-\+\(\)]/g, "");
      if (cleaned.length !== 10) {
        return "Phone number must be exactly 10 digits";
      }
      return null;
    },
  },
  contactPersonEmail: {
    required: true,
    pattern: EMAIL_REGEX,
  },
  contactPersonDesignation: {
    required: false,
    maxLength: 50,
  },

  // Branch validations (same as business details for consistency)
  branchBranchName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  branchContactNumber: {
    required: true,
    pattern: PHONE_REGEX,
    custom: (value: string) => {
      if (!value) return null;
      const cleaned = value.replace(/[\s\-\+\(\)]/g, "");
      if (cleaned.length !== 10) {
        return "Phone number must be exactly 10 digits";
      }
      return null;
    },
  },
  branchEmail: {
    required: true,
    pattern: EMAIL_REGEX,
  },
  branchCountry: {
    required: true,
  },
  branchCurrency: {
    required: true,
  },
  branchState: {
    required: true,
  },
  branchDistrict: {
    required: true,
  },
  branchCity: {
    required: true,
  },
  branchPincode: {
    required: true,
    pattern: PINCODE_REGEX,
  },
  branchPanNumber: {
    required: false,
    pattern: PAN_REGEX,
  },
  branchTanNumber: {
    required: false,
    pattern: TAN_REGEX,
  },
  branchGstNumber: {
    required: false,
    pattern: GST_REGEX,
  },
  branchBankName: {
    required: false,
    minLength: 2,
    maxLength: 100,
  },
  branchBankAccountNumber: {
    required: false,
    pattern: BANK_ACCOUNT_REGEX,
  },
  branchIfscCode: {
    required: false,
    pattern: IFSC_REGEX,
  },
};

export const validateField = (
  fieldName: string,
  value: any,
  rule: ValidationRule
): string | null => {
  // Handle required validation
  if (
    rule.required &&
    (!value || (typeof value === "string" && value.trim() === ""))
  ) {
    return `${getFieldDisplayName(fieldName)} is required`;
  }

  // If field is empty and not required, skip other validations
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return null;
  }

  // Handle string-based validations
  if (typeof value === "string") {
    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `${getFieldDisplayName(fieldName)} must be at least ${rule.minLength
        } characters`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${getFieldDisplayName(fieldName)} must not exceed ${rule.maxLength
        } characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return getPatternErrorMessage(fieldName);
    }
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

export const validateForm = (
  data: any,
  rules: Record<string, ValidationRule>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((fieldName) => {
    const rule = rules[fieldName];
    const value = data[fieldName];
    const error = validateField(fieldName, value, rule);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

export const validateContactPerson = (contactPerson: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  const nameError = validateField(
    "contactPersonName",
    contactPerson.name,
    validationRules.contactPersonName
  );
  if (nameError) errors.name = nameError;

  const phoneError = validateField(
    "contactPersonPhone",
    contactPerson.phone,
    validationRules.contactPersonPhone
  );
  if (phoneError) errors.phone = phoneError;

  const emailError = validateField(
    "contactPersonEmail",
    contactPerson.email,
    validationRules.contactPersonEmail
  );
  if (emailError) errors.email = emailError;

  const designationError = validateField(
    "contactPersonDesignation",
    contactPerson.designation,
    validationRules.contactPersonDesignation
  );
  if (designationError) errors.designation = designationError;

  return errors;
};

export const validateBranch = (branch: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  const branchNameError = validateField(
    "branchBranchName",
    branch.branchName,
    validationRules.branchBranchName
  );
  if (branchNameError) errors.branchName = branchNameError;

  const contactNumberError = validateField(
    "branchContactNumber",
    branch.contactNumber,
    validationRules.branchContactNumber
  );
  if (contactNumberError) errors.contactNumber = contactNumberError;

  const emailError = validateField(
    "branchEmail",
    branch.email,
    validationRules.branchEmail
  );
  if (emailError) errors.email = emailError;

  const countryError = validateField(
    "branchCountry",
    branch.country,
    validationRules.branchCountry
  );
  if (countryError) errors.country = countryError;

  const currencyError = validateField(
    "branchCurrency",
    branch.currency,
    validationRules.branchCurrency
  );
  if (currencyError) errors.currency = currencyError;

  const stateError = validateField(
    "branchState",
    branch.state,
    validationRules.branchState
  );
  if (stateError) errors.state = stateError;

  const districtError = validateField(
    "branchDistrict",
    branch.district,
    validationRules.branchDistrict
  );
  if (districtError) errors.district = districtError;

  const cityError = validateField(
    "branchCity",
    branch.city,
    validationRules.branchCity
  );
  if (cityError) errors.city = cityError;

  const pincodeError = validateField(
    "branchPincode",
    branch.pincode,
    validationRules.branchPincode
  );
  if (pincodeError) errors.pincode = pincodeError;

  if (pincodeError) errors.pincode = pincodeError;

  const panNumberError = validateField(
    "branchPanNumber",
    branch.panNumber,
    validationRules.branchPanNumber
  );
  if (panNumberError) errors.panNumber = panNumberError;

  const tanNumberError = validateField(
    "branchTanNumber",
    branch.tanNumber,
    validationRules.branchTanNumber
  );
  if (tanNumberError) errors.tanNumber = tanNumberError;

  const gstNumberError = validateField(
    "branchGstNumber",
    branch.gstNumber,
    validationRules.branchGstNumber
  );
  if (gstNumberError) errors.gstNumber = gstNumberError;

  const bankNameError = validateField(
    "branchBankName",
    branch.bankName,
    validationRules.branchBankName
  );
  if (bankNameError) errors.bankName = bankNameError;

  const bankAccountNumberError = validateField(
    "branchBankAccountNumber",
    branch.bankAccountNumber,
    validationRules.branchBankAccountNumber
  );
  if (bankAccountNumberError) errors.bankAccountNumber = bankAccountNumberError;

  const ifscCodeError = validateField(
    "branchIfscCode",
    branch.ifscCode,
    validationRules.branchIfscCode
  );
  if (ifscCodeError) errors.ifscCode = ifscCodeError;

  return errors;
};

export const validateVendor = (vendorData: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate vendor-specific fields
  const vendorCategoryError = validateField(
    "vendorCategory",
    vendorData.vendorCategory,
    validationRules.vendorCategory
  );
  if (vendorCategoryError) errors.vendorCategory = vendorCategoryError;

  const vendorTypeError = validateField(
    "vendorType",
    vendorData.vendorType,
    validationRules.vendorType
  );
  if (vendorTypeError) errors.vendorType = vendorTypeError;

  // Validate common business fields
  const businessNameError = validateField(
    "businessName",
    vendorData.businessName,
    validationRules.businessName
  );
  if (businessNameError) errors.businessName = businessNameError;

  const contactNoError = validateField(
    "contactNo",
    vendorData.contactNo,
    validationRules.contactNo
  );
  if (contactNoError) errors.contactNo = contactNoError;

  const emailError = validateField(
    "email",
    vendorData.email,
    validationRules.email
  );
  if (emailError) errors.email = emailError;

  const countryError = validateField(
    "country",
    vendorData.country,
    validationRules.country
  );
  if (countryError) errors.country = countryError;

  const currencyError = validateField(
    "currency",
    vendorData.currency,
    validationRules.currency
  );
  if (currencyError) errors.currency = currencyError;

  const stateError = validateField(
    "state",
    vendorData.state,
    validationRules.state
  );
  if (stateError) errors.state = stateError;

  const districtError = validateField(
    "district",
    vendorData.district,
    validationRules.district
  );
  if (districtError) errors.district = districtError;

  const cityError = validateField(
    "city",
    vendorData.city,
    validationRules.city
  );
  if (cityError) errors.city = cityError;

  const pincodeError = validateField(
    "pincode",
    vendorData.pincode,
    validationRules.pincode
  );
  if (pincodeError) errors.pincode = pincodeError;

  // Validate bank details (optional fields)
  const panNumberError = validateField(
    "panNumber",
    vendorData.panNumber,
    validationRules.panNumber
  );
  if (panNumberError) errors.panNumber = panNumberError;

  const tanNumberError = validateField(
    "tanNumber",
    vendorData.tanNumber,
    validationRules.tanNumber
  );
  if (tanNumberError) errors.tanNumber = tanNumberError;

  const gstNumberError = validateField(
    "gstNumber",
    vendorData.gstNumber,
    validationRules.gstNumber
  );
  if (gstNumberError) errors.gstNumber = gstNumberError;

  const bankNameError = validateField(
    "bankName",
    vendorData.bankName,
    validationRules.bankName
  );
  if (bankNameError) errors.bankName = bankNameError;

  const bankAccountNumberError = validateField(
    "bankAccountNumber",
    vendorData.bankAccountNumber,
    validationRules.bankAccountNumber
  );
  if (bankAccountNumberError) errors.bankAccountNumber = bankAccountNumberError;

  const branchNameError = validateField(
    "branchName",
    vendorData.branchName,
    validationRules.branchName
  );
  if (branchNameError) errors.branchName = branchNameError;

  const ifscCodeError = validateField(
    "ifscCode",
    vendorData.ifscCode,
    validationRules.ifscCode
  );
  if (ifscCodeError) errors.ifscCode = ifscCodeError;

  return errors;
};

const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    businessName: "Business Name",
    contactNo: "Contact Number",
    email: "Email",
    country: "Country",
    currency: "Currency",
    state: "State",
    district: "District",
    city: "City",
    customerType: "Customer Type",
    customerPotential: "Customer Potential",
    vendorCategory: "Vendor Category",
    vendorType: "Vendor Type",
    pincode: "Pincode",
    panNumber: "PAN Number",
    tanNumber: "TAN Number",
    gstNumber: "GST Number",
    bankName: "Bank Name",
    bankAccountNumber: "Bank Account Number",
    branchName: "Branch Name",
    ifscCode: "IFSC Code",
    contactPersonName: "Name",
    contactPersonPhone: "Phone",
    contactPersonEmail: "Email",
    contactPersonDesignation: "Designation",
    branchBranchName: "Branch Name",
    branchContactNumber: "Contact Number",
    branchEmail: "Email",
    branchCountry: "Country",
    branchCurrency: "Currency",
    branchState: "State",
    branchDistrict: "District",
    branchCity: "City",
    branchPincode: "Pincode",
    branchPanNumber: "PAN Number",
    branchTanNumber: "TAN Number",
    branchGstNumber: "GST Number",
    branchBankName: "Bank Name",
    branchBankAccountNumber: "Bank Account Number",
    branchIfscCode: "IFSC Code",
    customerGroup: "Customer Group",
    customerSubGroup: "Customer Sub Group",
    alternateNumber: "Alternate Number",
    customerClassification: "Customer Classification",
    msmeRegistered: "MSME Registered",
    udyamRegistrationNumber: "Udyam Registration Number",
  };

  return fieldNames[fieldName] || fieldName;
};

const getPatternErrorMessage = (fieldName: string): string => {
  const patternMessages: Record<string, string> = {
    contactNo: "Please enter a valid phone number",
    contactPersonPhone: "Please enter a valid phone number",
    branchContactNumber: "Please enter a valid phone number",
    email: "Please enter a valid email address",
    contactPersonEmail: "Please enter a valid email address",
    branchEmail: "Please enter a valid email address",
    panNumber: "Please enter a valid PAN number (e.g., ABCDE1234F)",
    tanNumber: "Please enter a valid TAN number (e.g., ABCD12345E)",
    gstNumber: "Please enter a valid GST number (e.g., 27ABCDE1234F1Z5)",
    ifscCode: "Please enter a valid IFSC code (e.g., SBIN0001234)",
    pincode: "Please enter a valid pincode (6 digits, not starting with 0)",
    branchPincode:
      "Please enter a valid pincode (6 digits, not starting with 0)",
    bankAccountNumber: "Please enter a valid bank account number (6-18 digits)",
    branchBankAccountNumber: "Please enter a valid bank account number (6-18 digits)",
  };

  return (
    patternMessages[fieldName] ||
    `Please enter a valid ${getFieldDisplayName(fieldName)}`
  );
};

export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors: ValidationErrors): string | null => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

// BOM-specific validation functions
export const validateBOMHeader = (bomData: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  const leadIdError = validateField(
    "leadId",
    bomData.leadId,
    validationRules.leadId
  );
  if (leadIdError) errors.leadId = leadIdError;

  const leadNameError = validateField(
    "leadName",
    bomData.leadName,
    validationRules.leadName
  );
  if (leadNameError) errors.leadName = leadNameError;

  const workTypeError = validateField(
    "workType",
    bomData.workType,
    validationRules.workType
  );
  if (workTypeError) errors.workType = workTypeError;

  const dateError = validateField(
    "bomDate",
    bomData.date,
    validationRules.bomDate
  );
  if (dateError) errors.date = dateError;

  return errors;
};

export const validateBOMSpec = (spec: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  const nameError = validateField(
    "specName",
    spec.name,
    validationRules.specName
  );
  if (nameError) errors.name = nameError;

  // Check if spec has items
  if (!spec.items || spec.items.length === 0) {
    errors.items = "At least one item is required in the specification";
  }

  return errors;
};

export const validateBOMItem = (item: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  const itemIdError = validateField("itemId", item.id, validationRules.itemId);
  if (itemIdError) errors.id = itemIdError;

  const quantityError = validateField(
    "itemQuantity",
    item.quantity,
    validationRules.itemQuantity
  );
  if (quantityError) errors.quantity = quantityError;

  const supplyRateError = validateField(
    "itemSupplyRate",
    item.supplyRate,
    validationRules.itemSupplyRate
  );
  if (supplyRateError) errors.supplyRate = supplyRateError;

  const installationRateError = validateField(
    "itemInstallationRate",
    item.installationRate,
    validationRules.itemInstallationRate
  );
  if (installationRateError) errors.installationRate = installationRateError;

  const netRateError = validateField(
    "itemNetRate",
    item.netRate,
    validationRules.itemNetRate
  );
  if (netRateError) errors.netRate = netRateError;

  const materialTypeError = validateField(
    "materialType",
    item.materialType,
    validationRules.materialType
  );
  if (materialTypeError) errors.materialType = materialTypeError;

  return errors;
};

export const validateBOMComplete = (bomData: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate header
  const headerErrors = validateBOMHeader(bomData);
  Object.assign(errors, headerErrors);

  // Validate specs and items
  if (!bomData.specs || bomData.specs.length === 0) {
    errors.specs = "At least one specification is required";
    return errors;
  }

  let hasValidSpecs = false;
  bomData.specs.forEach((spec: any, specIndex: number) => {
    const specErrors = validateBOMSpec(spec);

    // Add spec-specific errors with prefix
    Object.keys(specErrors).forEach((key) => {
      errors[`spec_${specIndex}_${key}`] = specErrors[key];
    });

    // If spec has name and items, validate each item
    if (spec.name && spec.items && spec.items.length > 0) {
      hasValidSpecs = true;
      spec.items.forEach((item: any, itemIndex: number) => {
        const itemErrors = validateBOMItem(item);

        // Add item-specific errors with prefix
        Object.keys(itemErrors).forEach((key) => {
          errors[`spec_${specIndex}_item_${itemIndex}_${key}`] =
            itemErrors[key];
        });
      });
    }
  });

  if (!hasValidSpecs) {
    errors.general =
      "Please fill in at least one complete specification with items";
  }

  return errors;
};

export const hasEmptySpecs = (specs: any[]): boolean => {
  return specs.some(
    (spec) =>
      !spec.name ||
      spec.name.trim() === "" ||
      !spec.items ||
      spec.items.length === 0
  );
};

export const getIncompleteSpecsCount = (specs: any[]): number => {
  return specs.filter(
    (spec) =>
      !spec.name ||
      spec.name.trim() === "" ||
      !spec.items ||
      spec.items.length === 0
  ).length;
};

// BOM Date Validation Testing Functions
export const testBOMDateValidation = (): void => {
  console.log("=== BOM Date Validation Tests ===");

  // Test 1: Valid date (today)
  const today = new Date().toISOString().split("T")[0];
  const validBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: today,
  };
  console.log("Test 1 - Today's date:", validateBOMHeader(validBOM));

  // Test 2: Valid date (yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: yesterday.toISOString().split("T")[0],
  };
  console.log("Test 2 - Yesterday's date:", validateBOMHeader(yesterdayBOM));

  // Test 3: Invalid date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: tomorrow.toISOString().split("T")[0],
  };
  console.log(
    "Test 3 - Tomorrow's date (should fail):",
    validateBOMHeader(futureBOM)
  );

  // Test 4: Invalid date (next week)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const futureWeekBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: nextWeek.toISOString().split("T")[0],
  };
  console.log(
    "Test 4 - Next week's date (should fail):",
    validateBOMHeader(futureWeekBOM)
  );

  // Test 5: Empty date
  const emptyDateBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: "",
  };
  console.log(
    "Test 5 - Empty date (should fail):",
    validateBOMHeader(emptyDateBOM)
  );

  // Test 6: Invalid date format
  const invalidFormatBOM = {
    leadId: "test-lead-id",
    leadName: "Test Lead",
    workType: "HVAC Systems",
    date: "invalid-date",
  };
  console.log(
    "Test 6 - Invalid date format (should fail):",
    validateBOMHeader(invalidFormatBOM)
  );
};

// Utility function to get today's date in YYYY-MM-DD format
export const getTodaysDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Utility function to check if a date is in the future
export const isDateInFuture = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today;
};

// Utility function to validate date format
export const isValidDateFormat = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.length === 10;
};

import axios from "axios";

export const vendorBranchContactBulkUpload = async (payload: any[]) => {
  const response = await axios.post(
    "http://localhost:3000/api/vendor-branch-contact/bulk",
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

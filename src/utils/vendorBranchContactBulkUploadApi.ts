import axios from "axios";

export const vendorBranchContactBulkUpload = async (payload: any[]) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/vendor-branch-contact/bulk`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

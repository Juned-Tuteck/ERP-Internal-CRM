import axios from "axios";

export const updateVendorBranch = async (branchId: string, data: any) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/vendor-branch/${branchId}`,
    data
  );
  return response.data;
};

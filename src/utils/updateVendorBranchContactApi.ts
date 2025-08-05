import axios from "axios";

export const updateVendorBranchContact = async (
  contactId: string,
  data: any
) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/vendor-branch-contact/${contactId}`,
    data
  );
  return response.data;
};

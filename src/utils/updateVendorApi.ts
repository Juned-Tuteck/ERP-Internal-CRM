import axios from "axios";

export const updateVendor = async (vendorId: string, data: any) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/${vendorId}`,
    data
  );
  return response.data;
};

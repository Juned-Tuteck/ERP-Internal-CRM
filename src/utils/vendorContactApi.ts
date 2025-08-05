import axios from "axios";

export const updateVendorContact = async (contactId: string, data: any) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/vendor-contact/${contactId}`,
    data
  );
  return response.data;
};

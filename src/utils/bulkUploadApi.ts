import axios from "axios";

export const bulkUpload = async (payload: any) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/vendor-contact/bulk-upload`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

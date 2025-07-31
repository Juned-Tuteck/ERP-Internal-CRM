import axios from "axios";

export const bulkUpload = async (payload: any) => {
  const response = await axios.post(
    "http://localhost:3000/api/vendor-contact/bulk-upload",
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

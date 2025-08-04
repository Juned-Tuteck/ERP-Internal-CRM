import axios from "axios";

export const registerVendorBranch = async (payload: any) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/vendor-branch`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

import axios from "axios";

export const registerVendorBranch = async (payload: any) => {
  const response = await axios.post(
    "http://localhost:3000/api/vendor-branch",
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

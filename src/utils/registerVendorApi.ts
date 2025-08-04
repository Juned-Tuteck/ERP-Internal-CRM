import axios from "axios";
import { Vendor } from "../pages/Vendors/components/VendorList";

export const registerVendor = async (vendorData: any): Promise<Vendor> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/vendor`,
    vendorData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  // Optionally map backend response to Vendor interface if needed
  return response.data;
};

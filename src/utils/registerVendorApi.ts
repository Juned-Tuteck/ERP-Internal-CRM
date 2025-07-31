import axios from "axios";
import { Vendor } from "../pages/Vendors/components/VendorList";

export const registerVendor = async (vendorData: any): Promise<Vendor> => {
  const response = await axios.post(
    "http://localhost:3000/api/vendor",
    vendorData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  // Optionally map backend response to Vendor interface if needed
  return response.data;
};

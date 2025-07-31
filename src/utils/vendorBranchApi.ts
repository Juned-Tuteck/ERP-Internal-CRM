import axios from "axios";

export const getVendorBranchById = async (branchId: string): Promise<any> => {
  const response = await axios.get(
    `http://localhost:3000/api/vendor-branch/${branchId}`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  const b = response.data?.data || response.data;
  return {
    id: b.branch_id,
    branchName: b.branch_name,
    contactNumber: b.contact_number,
    email: b.email,
    address:
      b.address ||
      [b.city, b.district, b.state, b.pincode].filter(Boolean).join(", "),
    country: b.country,
    currency: b.currency,
    state: b.state,
    district: b.district,
    city: b.city,
    pincode: b.pincode,
    contactPersons: Array.isArray(b.contact_persons)
      ? b.contact_persons.map((cp: any) => ({
          id: cp.id || cp.contact_person_id || "",
          name: cp.name || "",
          phone: cp.phone || "",
          email: cp.email || "",
          designation: cp.designation || "",
          photo: cp.photo || "",
        }))
      : [],
    // Add more fields as needed
    ...b,
  };
};

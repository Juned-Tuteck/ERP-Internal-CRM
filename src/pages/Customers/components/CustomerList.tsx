import React, { useEffect, useState } from "react";
import { Building2, MapPin, DollarSign, Calendar } from "lucide-react";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  industry: string;
  location: string;
  revenue: string;
  joinDate: string;
  status: "active" | "inactive" | "pending";
  avatar: string;
  dealCount: number;
}

interface CustomerListProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  screenRefresh: number;
}

const CustomerList: React.FC<CustomerListProps> = ({
  selectedCustomer,
  onSelectCustomer,
  screenRefresh,
}) => {
  const [apiCustomerList, setApiCustomerList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/customer/`
        );
        setApiCustomerList(response.data.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, [screenRefresh]);

  const customers = apiCustomerList.map((customer) => ({
    id: customer.customer_id,
    name: customer.business_name,
    customerNumber: customer.customer_number,
    industry: customer.customer_type,
    location: `${customer.city}, ${customer.state}`,
    revenue: `${customer.currency} ${customer.customer_potential}`,
    joinDate: new Date(customer.created_at).toISOString(),
    status: customer.approval_status.toLowerCase(),
    avatar: customer.business_name
      .split(" ")
      .map((word: string) => word[0])
      .join(""),
    dealCount: customer.is_active ? 1 : 0,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const filteredCustomers = customers.filter((customer) => {
    const valuesToSearch = [
      customer.name,
      customer.customerNumber,
      customer.industry,
      customer.location,
      customer.revenue,
      customer.status,
      new Date(customer.joinDate).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      String(customer.dealCount),
    ]
      .join(" ")
      .toLowerCase();
    return valuesToSearch.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Customers</h3>
        <p className="text-sm text-gray-500">
          {customers.length} total customers
        </p>
        <input
          type="text"
          placeholder="Search customers by any attribute..."
          className="mt-3 px-3 py-1 border border-blue-300 rounded w-full focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => onSelectCustomer(customer)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
              selectedCustomer?.id === customer.id
                ? "bg-blue-50 border-r-2 border-blue-600"
                : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {customer.avatar}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.name}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      customer.status
                    )}`}
                  >
                    {customer.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {customer.industry}
                </p>
                <p className="text-xs font-bold text-blue-600 truncate">
                  Customer : {customer.customerNumber || "-"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {customer.location.split(",")[0]}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {customer.revenue.replace("₹", "₹")}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Since{" "}
                    {new Date(customer.joinDate).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-blue-600">
                    {customer.dealCount} deals
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;

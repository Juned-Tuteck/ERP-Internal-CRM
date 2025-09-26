import { Navigate } from "react-router-dom";
import { useCRM } from "../context/CRMContext";

const HomeRedirect: React.FC = () => {
  const { hasMenuAccess } = useCRM();

  // Check if user has access to Dashboard (from IMS)
  if (hasMenuAccess("Dashboard")) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no Dashboard access, redirect to first accessible CRM page
  const crmPages = [
    { path: "/customers", accessKey: "customers" },
    { path: "/vendors", accessKey: "Vendors" },
    { path: "/leads", accessKey: "Lead" },
    { path: "/bom", accessKey: "BOM" },
    { path: "/quotations", accessKey: "Quotations" },
    { path: "/sales-orders", accessKey: "Sales Order" },
    { path: "/projects", accessKey: "Projects" },
    { path: "/reports", accessKey: "Reports" },
  ];

  // Find first accessible page
  const firstAccessiblePage = crmPages.find((page) =>
    hasMenuAccess(page.accessKey)
  );

  if (firstAccessiblePage) {
    return <Navigate to={firstAccessiblePage.path} replace />;
  }

  // If no access to any CRM pages, show access denied
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-gray-400 text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access any CRM features.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator for access.
        </p>
      </div>
    </div>
  );
};

export default HomeRedirect;

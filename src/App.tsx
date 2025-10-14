import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./pages/Dashboard/Dashboard";
import Leads from "./pages/Leads/Leads";
import Customers from "./pages/Customers/Customers";
import Vendors from "./pages/Vendors/Vendors";
import Associates from "./pages/Associates/Associates";
import BOM from "./pages/BOM/BOM";
import Projects from "./pages/Projects/Projects";
import Quotations from "./pages/Quotations/Quotations";
import SalesOrders from "./pages/SalesOrders/SalesOrders";
import Reports from "./pages/Reports/Reports";
import Settings from "./pages/Settings/Settings";
import HomeRedirect from "./components/HomeRedirect";
import { CRMProvider, useCRM } from "./context/CRMContext";
import { validateUserAccessWithCRM } from "./utils/accessValidationApi";

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    setUserData,
    setUserAccesses,
    setIsAccessLoading,
    setAccessError,
    isAccessLoading,
    accessError,
  } = useCRM();

  useEffect(() => {
    const initializeApp = async () => {
      // Handle token from URL params
      const params = new URLSearchParams(window.location.search);
      const rawToken = params.get("token");

      if (rawToken) {
        const decodedToken = decodeURIComponent(rawToken);
        localStorage.setItem("auth_token", decodedToken);

        // Clean the URL (remove ?token=... from history)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      // Validate user access with CRM
      const token = localStorage.getItem("auth_token");
      if (token) {
        setIsAccessLoading(true);
        setAccessError(null);

        try {
          const response = await validateUserAccessWithCRM();

          if (response.success) {
            const { accesses, ...userData } = response.data.decoded;
            setUserData(userData);
            setUserAccesses(accesses);
          } else {
            setAccessError("Failed to validate user access");
          }
        } catch (error) {
          console.error("Access validation error:", error);
          setAccessError("Failed to validate user access");
        } finally {
          setIsAccessLoading(false);
        }
      }
    };

    initializeApp();
  }, [setUserData, setUserAccesses, setIsAccessLoading, setAccessError]);

  // Show loading screen while validating access
  if (isAccessLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Loading your access permissions...
          </p>
        </div>
      </div>
    );
  }

  // Show error screen if access validation failed
  if (accessError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Validation Failed
          </h2>
          <p className="text-gray-600 mb-4">{accessError}</p>
          <button
            onClick={() => (window.location.href = `${import.meta.env.VITE_AUTH_UI_BASE_URL}/signin`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/associates" element={<Associates />} />
              <Route path="/bom" element={<BOM />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}

export default App;

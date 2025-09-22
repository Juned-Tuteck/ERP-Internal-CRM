import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard/Dashboard';
import Leads from './pages/Leads/Leads';
import Customers from './pages/Customers/Customers';
import Vendors from './pages/Vendors/Vendors';
import Associates from './pages/Associates/Associates';
import BOM from './pages/BOM/BOM';
import Projects from './pages/Projects/Projects';
import Quotations from './pages/Quotations/Quotations';
import SalesOrders from './pages/SalesOrders/SalesOrders';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import { CRMProvider } from './context/CRMContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const rawToken = params.get('token');

        if (rawToken) {
          const decodedToken = decodeURIComponent(rawToken);
          localStorage.setItem('auth_token', decodedToken);

          // clean the URL (remove ?token=... from history)
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, []);
      
  return (
    <CRMProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
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
    </CRMProvider>
  );
}

export default App;
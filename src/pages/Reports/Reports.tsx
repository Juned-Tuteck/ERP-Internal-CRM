import React, { useState } from 'react';
import SalesReport from './components/SalesReport';
import LeadsReport from './components/LeadsReport';
import PerformanceReport from './components/PerformanceReport';
import { BarChart3, Download, Calendar, Filter } from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', name: 'Sales Report', icon: BarChart3 },
    { id: 'leads', name: 'Leads Report', icon: BarChart3 },
    { id: 'performance', name: 'Performance Report', icon: BarChart3 },
  ];

  const renderActiveReport = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesReport />;
      case 'leads':
        return <LeadsReport />;
      case 'performance':
        return <PerformanceReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      {renderActiveReport()}
    </div>
  );
};

export default Reports;
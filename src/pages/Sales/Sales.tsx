import React, { useState } from 'react';
import SalesPipeline from './components/SalesPipeline';
import SalesMetrics from './components/SalesMetrics';
import OpportunityDetails from './components/OpportunityDetails';
import { TrendingUp, Filter, Plus } from 'lucide-react';

const Sales: React.FC = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </button>
        </div>
      </div>

      <SalesMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesPipeline onSelectOpportunity={setSelectedOpportunity} />
        </div>
        <div className="lg:col-span-1">
          <OpportunityDetails opportunity={selectedOpportunity} />
        </div>
      </div>
    </div>
  );
};

export default Sales;
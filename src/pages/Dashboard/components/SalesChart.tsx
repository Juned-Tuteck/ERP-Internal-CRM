import React from 'react';
import { BarChart3 } from 'lucide-react';

const SalesChart: React.FC = () => {
  const data = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 85 },
    { month: 'Mar', value: 75 },
    { month: 'Apr', value: 95 },
    { month: 'May', value: 80 },
    { month: 'Jun', value: 100 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Sales Performance</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.month} className="flex items-center">
            <div className="w-8 text-sm text-gray-600">{item.month}</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-16 text-sm text-gray-900 text-right">₹{item.value}L</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Total sales this quarter: <span className="font-semibold text-gray-900">₹4.5 Crores</span>
      </div>
    </div>
  );
};

export default SalesChart;
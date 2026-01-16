import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Users } from 'lucide-react';

const SalesReport: React.FC = () => {
  const salesMetrics = [
    {
      name: 'Total Sales',
      value: '₹2.4 Cr',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      name: 'Deals Closed',
      value: '156',
      change: '+12.5%',
      trend: 'up',
      icon: Target,
    },
    {
      name: 'Avg Deal Size',
      value: '₹5.2L',
      change: '-3.1%',
      trend: 'down',
      icon: TrendingUp,
    },
    {
      name: 'Sales Team',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Users,
    },
  ];

  const monthlyData = [
    { month: 'Jan', sales: 185, deals: 12 },
    { month: 'Feb', sales: 220, deals: 15 },
    { month: 'Mar', sales: 195, deals: 13 },
    { month: 'Apr', sales: 275, deals: 18 },
    { month: 'May', sales: 240, deals: 16 },
    { month: 'Jun', sales: 320, deals: 22 },
  ];

  const topPerformers = [
    { name: 'Rajesh Kumar', sales: '₹45L', deals: 23, target: 95 },
    { name: 'Priya Sharma', sales: '₹38L', deals: 19, target: 88 },
    { name: 'Amit Singh', sales: '₹35L', deals: 17, target: 82 },
    { name: 'Sneha Patel', sales: '₹32L', deals: 16, target: 78 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {salesMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className="bg-primary-500 rounded-lg p-3">
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`ml-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {metric.change}
              </span>
              <span className="ml-1 text-sm text-gray-500">from last period</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Sales Performance</h3>
          <div className="space-y-4">
            {monthlyData.map((item) => {
              const maxSales = Math.max(...monthlyData.map(d => d.sales));
              return (
                <div key={item.month} className="flex items-center">
                  <div className="w-8 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-500 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${(item.sales / maxSales) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">₹{item.sales}L</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">{item.deals} deals</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Sales Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <span className="text-sm font-semibold text-green-600">{performer.sales}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{performer.deals} deals</span>
                    <span className="text-xs text-blue-600">{performer.target}% of target</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${performer.target}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Pipeline Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { stage: 'Prospecting', count: 25, value: '₹45L' },
            { stage: 'Qualification', count: 18, value: '₹38L' },
            { stage: 'Proposal', count: 12, value: '₹52L' },
            { stage: 'Negotiation', count: 8, value: '₹67L' },
            { stage: 'Closed Won', count: 15, value: '₹89L' },
          ].map((stage) => (
            <div key={stage.stage} className="text-center p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">{stage.stage}</h4>
              <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
              <p className="text-sm text-green-600 font-medium">{stage.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
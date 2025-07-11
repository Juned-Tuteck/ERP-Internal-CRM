import React from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Clock } from 'lucide-react';

const SalesMetrics: React.FC = () => {
  const metrics = [
    {
      name: 'Pipeline Value',
      value: '₹2.4 Cr',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Opportunities',
      value: '47',
      change: '+12.5%',
      trend: 'up',
      icon: Target,
      color: 'bg-green-500',
    },
    {
      name: 'Avg. Deal Size',
      value: '₹5.2L',
      change: '-3.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Sales Cycle',
      value: '45 days',
      change: '-8.5%',
      trend: 'up',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
            <div className={`${metric.color} rounded-lg p-3`}>
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
            <span className="ml-1 text-sm text-gray-500">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesMetrics;
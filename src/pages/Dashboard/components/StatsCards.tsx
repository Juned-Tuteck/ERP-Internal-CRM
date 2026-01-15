import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Phone } from 'lucide-react';

const StatsCards: React.FC = () => {
  const stats = [
    {
      name: 'Total Revenue',
      value: '₹45,32,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Active Leads',
      value: '234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-primary-500',
    },
    {
      name: 'Conversion Rate',
      value: '18.4%',
      change: '-2.1%',
      trend: 'down',
      icon: Target,
      color: 'bg-purple-500',
    },
    {
      name: 'Calls Made',
      value: '1,247',
      change: '+15.3%',
      trend: 'up',
      icon: Phone,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} rounded-lg p-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {stat.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`ml-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {stat.change}
            </span>
            <span className="ml-1 text-sm text-gray-500">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
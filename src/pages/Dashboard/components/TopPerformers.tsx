import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

const TopPerformers: React.FC = () => {
  const performers = [
    {
      id: 1,
      name: 'Amit Sharma',
      role: 'Senior Sales Executive',
      sales: '₹12,50,000',
      deals: 23,
      growth: '+18%',
      avatar: 'AS',
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Sales Manager',
      sales: '₹11,80,000',
      deals: 19,
      growth: '+15%',
      avatar: 'PP',
    },
    {
      id: 3,
      name: 'Rajesh Kumar',
      role: 'Business Development',
      sales: '₹9,75,000',
      deals: 17,
      growth: '+22%',
      avatar: 'RK',
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      role: 'Sales Executive',
      sales: '₹8,90,000',
      deals: 15,
      growth: '+12%',
      avatar: 'SG',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <Trophy className="h-5 w-5 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {performers.map((performer, index) => (
          <div key={performer.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">{performer.avatar}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                  <p className="text-xs text-gray-500">{performer.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{performer.sales}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {performer.growth}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{performer.deals} deals closed</span>
                <span className="flex items-center">
                  #{index + 1}
                  <Trophy className="h-3 w-3 ml-1 text-yellow-500" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;
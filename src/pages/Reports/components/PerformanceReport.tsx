import React from 'react';
import { Users, Target, TrendingUp, Award } from 'lucide-react';

const PerformanceReport: React.FC = () => {
  const teamMetrics = [
    {
      name: 'Team Members',
      value: '12',
      change: '+2',
      icon: Users,
    },
    {
      name: 'Avg Performance',
      value: '87%',
      change: '+5.2%',
      icon: Target,
    },
    {
      name: 'Total Targets Met',
      value: '9/12',
      change: '+1',
      icon: Award,
    },
    {
      name: 'Team Revenue',
      value: '₹3.2Cr',
      change: '+18.5%',
      icon: TrendingUp,
    },
  ];

  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      role: 'Senior Sales Manager',
      target: 95,
      achieved: 92,
      revenue: '₹45L',
      deals: 23,
      rating: 4.8,
    },
    {
      name: 'Priya Sharma',
      role: 'Sales Manager',
      target: 88,
      achieved: 91,
      revenue: '₹38L',
      deals: 19,
      rating: 4.6,
    },
    {
      name: 'Amit Singh',
      role: 'Business Development',
      target: 82,
      achieved: 85,
      revenue: '₹35L',
      deals: 17,
      rating: 4.4,
    },
    {
      name: 'Sneha Patel',
      role: 'Sales Executive',
      target: 78,
      achieved: 82,
      revenue: '₹32L',
      deals: 16,
      rating: 4.5,
    },
    {
      name: 'Vikram Gupta',
      role: 'Sales Executive',
      target: 75,
      achieved: 78,
      revenue: '₹28L',
      deals: 14,
      rating: 4.2,
    },
    {
      name: 'Kavita Reddy',
      role: 'Jr. Sales Executive',
      target: 65,
      achieved: 68,
      revenue: '₹22L',
      deals: 11,
      rating: 4.0,
    },
  ];

  const getPerformanceColor = (achieved: number, target: number) => {
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (achieved: number, target: number) => {
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className="bg-purple-500 rounded-lg p-3">
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-500">{metric.change}</span>
              <span className="ml-1 text-sm text-gray-500">from last quarter</span>
            </div>
          </div>
        ))}
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Individual Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target vs Achieved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => {
                const performancePercentage = (member.achieved / member.target) * 100;
                return (
                  <tr key={member.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.achieved}% / {member.target}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(member.achieved, member.target)}`}
                          style={{ width: `${Math.min(performancePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {member.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.deals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-1">{member.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(member.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(member.achieved, member.target)}`}>
                        {performancePercentage >= 100 ? 'Exceeds' : performancePercentage >= 80 ? 'Meets' : 'Below'} Target
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {teamMembers
              .sort((a, b) => (b.achieved / b.target) - (a.achieved / a.target))
              .slice(0, 3)
              .map((member, index) => (
                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {((member.achieved / member.target) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Exceeding Target</span>
              <span className="text-sm font-bold text-green-600">
                {teamMembers.filter(m => (m.achieved / m.target) >= 1).length} members
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Meeting Target</span>
              <span className="text-sm font-bold text-yellow-600">
                {teamMembers.filter(m => (m.achieved / m.target) >= 0.8 && (m.achieved / m.target) < 1).length} members
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Below Target</span>
              <span className="text-sm font-bold text-red-600">
                {teamMembers.filter(m => (m.achieved / m.target) < 0.8).length} members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
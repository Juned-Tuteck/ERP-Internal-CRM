import React from 'react';
import { Clock, Phone, Mail, Calendar, User } from 'lucide-react';

const RecentActivities: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'call',
      description: 'Called Priya Sharma regarding software demo',
      time: '2 hours ago',
      icon: Phone,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      id: 2,
      type: 'email',
      description: 'Sent proposal to Rajesh Kumar at TechCorp',
      time: '4 hours ago',
      icon: Mail,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 3,
      type: 'meeting',
      description: 'Meeting scheduled with Anita Patel for next week',
      time: '6 hours ago',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 4,
      type: 'contact',
      description: 'New lead added: Vikram Singh from Delhi',
      time: '1 day ago',
      icon: User,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      id: 5,
      type: 'call',
      description: 'Follow-up call with Suresh Gupta',
      time: '2 days ago',
      icon: Phone,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`${activity.bg} rounded-full p-2`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
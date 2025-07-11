import React from 'react';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';

const UpcomingTasks: React.FC = () => {
  const tasks = [
    {
      id: 1,
      title: 'Follow up with Arjun Mehta',
      description: 'Send pricing proposal for ERP solution',
      priority: 'high',
      dueDate: 'Today, 2:00 PM',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Demo preparation for TechnoSoft',
      description: 'Prepare product demo for 50+ users',
      priority: 'medium',
      dueDate: 'Tomorrow, 10:00 AM',
      status: 'in-progress',
    },
    {
      id: 3,
      title: 'Call Sonia Kapoor',
      description: 'Discuss contract renewal terms',
      priority: 'high',
      dueDate: 'Today, 4:30 PM',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Send quotation to Mumbai office',
      description: 'Custom software development quote',
      priority: 'low',
      dueDate: 'Friday, 11:00 AM',
      status: 'pending',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
        <CheckSquare className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const PriorityIcon = getPriorityIcon(task.priority);
          return (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      <PriorityIcon className="h-3 w-3 mr-1" />
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.dueDate}
                  </div>
                </div>
                <button className="ml-4 text-blue-600 hover:text-blue-700">
                  <CheckSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all tasks
        </button>
      </div>
    </div>
  );
};

export default UpcomingTasks;
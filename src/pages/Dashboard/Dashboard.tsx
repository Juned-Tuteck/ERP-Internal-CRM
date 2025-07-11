import React from 'react';
import StatsCards from './components/StatsCards';
import SalesChart from './components/SalesChart';
import RecentActivities from './components/RecentActivities';
import TopPerformers from './components/TopPerformers';
import UpcomingTasks from './components/UpcomingTasks';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <RecentActivities />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformers />
        <UpcomingTasks />
      </div>
    </div>
  );
};

export default Dashboard;
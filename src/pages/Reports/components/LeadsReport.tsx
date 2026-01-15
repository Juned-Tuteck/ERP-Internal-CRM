import React from 'react';
import { UserPlus, TrendingUp, Target, Globe } from 'lucide-react';

const LeadsReport: React.FC = () => {
  const leadMetrics = [
    {
      name: 'Total Leads',
      value: '1,234',
      change: '+15.3%',
      icon: UserPlus,
    },
    {
      name: 'Conversion Rate',
      value: '18.4%',
      change: '+2.1%',
      icon: Target,
    },
    {
      name: 'Qualified Leads',
      value: '456',
      change: '+8.7%',
      icon: TrendingUp,
    },
    {
      name: 'Lead Sources',
      value: '8',
      change: '+1',
      icon: Globe,
    },
  ];

  const leadSources = [
    { source: 'Website', leads: 342, percentage: 28 },
    { source: 'LinkedIn', leads: 298, percentage: 24 },
    { source: 'Referrals', leads: 185, percentage: 15 },
    { source: 'Cold Calls', leads: 156, percentage: 13 },
    { source: 'Trade Shows', leads: 128, percentage: 10 },
    { source: 'Email Marketing', leads: 89, percentage: 7 },
    { source: 'Others', leads: 36, percentage: 3 },
  ];

  const conversionFunnel = [
    { stage: 'Total Leads', count: 1234, percentage: 100 },
    { stage: 'Qualified', count: 456, percentage: 37 },
    { stage: 'Opportunity', count: 234, percentage: 19 },
    { stage: 'Proposal', count: 123, percentage: 10 },
    { stage: 'Closed Won', count: 67, percentage: 5.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leadMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className="bg-green-500 rounded-lg p-3">
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-500">{metric.change}</span>
              <span className="ml-1 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Sources</h3>
          <div className="space-y-4">
            {leadSources.map((source) => (
              <div key={source.source} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{source.source}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-900 text-right">{source.leads}</div>
                <div className="w-12 text-sm text-gray-500 text-right">{source.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{stage.count}</span>
                    <span className="text-xs text-gray-500">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-primary-500' :
                      index === 1 ? 'bg-yellow-500' :
                      index === 2 ? 'bg-orange-500' :
                      index === 3 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Quality Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Quality Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">A+</div>
            <div className="text-sm text-gray-600 mb-1">High Quality</div>
            <div className="text-2xl font-semibold text-gray-900">156</div>
            <div className="text-xs text-gray-500">leads (12.6%)</div>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-2">B</div>
            <div className="text-sm text-gray-600 mb-1">Medium Quality</div>
            <div className="text-2xl font-semibold text-gray-900">678</div>
            <div className="text-xs text-gray-500">leads (54.9%)</div>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-2">C</div>
            <div className="text-sm text-gray-600 mb-1">Low Quality</div>
            <div className="text-2xl font-semibold text-gray-900">400</div>
            <div className="text-xs text-gray-500">leads (32.4%)</div>
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Lead Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { region: 'Mumbai', leads: 234, percentage: 19 },
            { region: 'Delhi', leads: 198, percentage: 16 },
            { region: 'Bangalore', leads: 176, percentage: 14 },
            { region: 'Chennai', leads: 134, percentage: 11 },
            { region: 'Pune', leads: 123, percentage: 10 },
            { region: 'Hyderabad', leads: 98, percentage: 8 },
            { region: 'Kolkata', leads: 87, percentage: 7 },
            { region: 'Others', leads: 184, percentage: 15 },
          ].map((region) => (
            <div key={region.region} className="text-center p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">{region.region}</h4>
              <p className="text-xl font-bold text-gray-900">{region.leads}</p>
              <p className="text-xs text-gray-500">{region.percentage}% of total</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${region.percentage * 5}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadsReport;
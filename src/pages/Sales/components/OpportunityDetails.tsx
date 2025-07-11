import React from 'react';
import { DollarSign, Calendar, User, Building, Percent, Tag } from 'lucide-react';

interface OpportunityDetailsProps {
  opportunity: any;
}

const OpportunityDetails: React.FC<OpportunityDetailsProps> = ({ opportunity }) => {
  if (!opportunity) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <DollarSign className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select an opportunity</h3>
          <p className="text-sm">Choose an opportunity from the pipeline to view details</p>
        </div>
      </div>
    );
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600 bg-green-50';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospecting':
        return 'bg-gray-100 text-gray-800';
      case 'Qualification':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">{opportunity.avatar}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.name}</h3>
            <p className="text-sm text-gray-600">{opportunity.company}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
            {opportunity.stage}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(opportunity.probability)}`}>
            {opportunity.probability}% probability
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Deal Value</p>
            <p className="text-lg font-semibold text-green-600">{opportunity.value}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Expected Close Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(opportunity.closeDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Account Owner</p>
            <p className="text-sm font-medium text-gray-900">{opportunity.owner}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Building className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="text-sm font-medium text-gray-900">{opportunity.company}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Progress</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Win Probability</span>
              <span className="font-medium">{opportunity.probability}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  opportunity.probability >= 70 ? 'bg-green-500' : 
                  opportunity.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${opportunity.probability}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Next Steps</h4>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">Schedule technical demo</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">Send detailed proposal</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">Negotiate final terms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;
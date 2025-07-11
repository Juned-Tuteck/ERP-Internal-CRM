import React from 'react';
import { DollarSign, Calendar, User } from 'lucide-react';

interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: string;
  probability: number;
  stage: string;
  owner: string;
  closeDate: string;
  avatar: string;
}

interface SalesPipelineProps {
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

const SalesPipeline: React.FC<SalesPipelineProps> = ({ onSelectOpportunity }) => {
  const stages = [
    { name: 'Prospecting', color: 'bg-gray-500' },
    { name: 'Qualification', color: 'bg-blue-500' },
    { name: 'Proposal', color: 'bg-yellow-500' },
    { name: 'Negotiation', color: 'bg-orange-500' },
    { name: 'Closed Won', color: 'bg-green-500' },
  ];

  const opportunities: Opportunity[] = [
    {
      id: '1',
      name: 'ERP Implementation',
      company: 'TechCorp Solutions',
      value: '₹12,50,000',
      probability: 75,
      stage: 'Negotiation',
      owner: 'Rajesh Kumar',
      closeDate: '2024-02-15',
      avatar: 'TC',
    },
    {
      id: '2',
      name: 'CRM Software License',
      company: 'Innovate India Ltd',
      value: '₹8,75,000',
      probability: 60,
      stage: 'Proposal',
      owner: 'Priya Sharma',
      closeDate: '2024-02-28',
      avatar: 'II',
    },
    {
      id: '3',
      name: 'Digital Transformation',
      company: 'Manufacturing Co',
      value: '₹25,00,000',
      probability: 40,
      stage: 'Qualification',
      owner: 'Amit Singh',
      closeDate: '2024-03-15',
      avatar: 'MC',
    },
    {
      id: '4',
      name: 'Cloud Migration',
      company: 'Financial Services',
      value: '₹15,60,000',
      probability: 85,
      stage: 'Negotiation',
      owner: 'Sneha Patel',
      closeDate: '2024-02-10',
      avatar: 'FS',
    },
    {
      id: '5',
      name: 'Security Audit',
      company: 'Healthcare Plus',
      value: '₹6,25,000',
      probability: 30,
      stage: 'Prospecting',
      owner: 'Vikram Gupta',
      closeDate: '2024-03-30',
      avatar: 'HP',
    },
  ];

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600 bg-green-50';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.name);
          const stageValue = stageOpportunities.reduce(
            (sum, opp) => sum + parseFloat(opp.value.replace(/[₹,]/g, '')),
            0
          );

          return (
            <div key={stage.name} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stage.color} w-3 h-3 rounded-full`}></div>
                <h4 className="text-sm font-medium text-gray-900">{stage.name}</h4>
                <span className="text-xs text-gray-500">
                  ₹{(stageValue / 100000).toFixed(1)}L
                </span>
              </div>
              
              <div className="space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    onClick={() => onSelectOpportunity(opportunity)}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm cursor-pointer transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {opportunity.avatar}
                          </span>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {opportunity.name}
                        </h5>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{opportunity.company}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-xs text-green-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {opportunity.value}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(opportunity.probability)}`}>
                        {opportunity.probability}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {opportunity.owner.split(' ')[0]}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(opportunity.closeDate).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesPipeline;
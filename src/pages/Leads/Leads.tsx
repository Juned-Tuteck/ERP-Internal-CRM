import React, { useState } from 'react';
import LeadList from './components/LeadList';
import LeadDetails from './components/LeadDetails';
import AddLeadModal from './components/AddLeadModal';
import { Plus, Filter, Download } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Leads: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addNotification } = useCRM();

  const handleAddLead = (leadData: any) => {
    console.log('Adding new lead:', leadData);
    addNotification({
      type: 'success',
      message: `Lead ${leadData.name} added successfully!`,
    });
    setIsAddModalOpen(false);
  };

  const handleConvertLead = (leadId: string) => {
    console.log('Converting lead:', leadId);
    addNotification({
      type: 'success',
      message: 'Lead converted to customer successfully!',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeadList
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
          />
        </div>
        <div className="lg:col-span-2">
          <LeadDetails
            lead={selectedLead}
            onConvert={handleConvertLead}
          />
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLead}
      />
    </div>
  );
};

export default Leads;
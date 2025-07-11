import React, { useState } from 'react';
import ContactList from './components/ContactList';
import ContactDetails from './components/ContactDetails';
import AddContactModal from './components/AddContactModal';
import { Plus, Filter, Download } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Contacts: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addNotification } = useCRM();

  const handleAddContact = (contactData: any) => {
    console.log('Adding new contact:', contactData);
    addNotification({
      type: 'success',
      message: `Contact ${contactData.name} added successfully!`,
    });
    setIsAddModalOpen(false);
  };

  const handleEditContact = (contactData: any) => {
    console.log('Editing contact:', contactData);
    addNotification({
      type: 'success',
      message: `Contact ${contactData.name} updated successfully!`,
    });
  };

  const handleDeleteContact = (contactId: string) => {
    console.log('Deleting contact:', contactId);
    addNotification({
      type: 'success',
      message: 'Contact deleted successfully!',
    });
    setSelectedContact(null);
  };

  const handleExportContacts = () => {
    console.log('Exporting contacts...');
    addNotification({
      type: 'info',
      message: 'Contact export initiated. Download will start shortly.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportContacts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
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
            Add Contact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ContactList
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </div>
        <div className="lg:col-span-2">
          <ContactDetails
            contact={selectedContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />
        </div>
      </div>

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContact}
      />
    </div>
  );
};

export default Contacts;
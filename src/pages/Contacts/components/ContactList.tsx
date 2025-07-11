import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  avatar: string;
  status: 'active' | 'inactive';
}

interface ContactListProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ selectedContact, onSelectContact }) => {
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@techcorp.in',
      phone: '+91 98765 43210',
      company: 'TechCorp Solutions',
      location: 'Mumbai, Maharashtra',
      avatar: 'RK',
      status: 'active',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@innovate.co.in',
      phone: '+91 87654 32109',
      company: 'Innovate India Ltd',
      location: 'Delhi, Delhi',
      avatar: 'PS',
      status: 'active',
    },
    {
      id: '3',
      name: 'Ankit Gupta',
      email: 'ankit@digitalsolutions.in',
      phone: '+91 76543 21098',
      company: 'Digital Solutions Pvt Ltd',
      location: 'Bangalore, Karnataka',
      avatar: 'AG',
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Sneha Patel',
      email: 'sneha.patel@webtech.co.in',
      phone: '+91 65432 10987',
      company: 'WebTech Industries',
      location: 'Pune, Maharashtra',
      avatar: 'SP',
      status: 'active',
    },
    {
      id: '5',
      name: 'Vikram Singh',
      email: 'vikram@startupindia.com',
      phone: '+91 54321 09876',
      company: 'Startup India Ventures',
      location: 'Gurgaon, Haryana',
      avatar: 'VS',
      status: 'active',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Contacts</h3>
        <p className="text-sm text-gray-500">{contacts.length} total contacts</p>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
              selectedContact?.id === contact.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{contact.avatar}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    contact.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {contact.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{contact.company}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Phone className="h-3 w-3 mr-1" />
                    {contact.phone.replace('+91 ', '')}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {contact.location.split(',')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
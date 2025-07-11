import React from 'react';
import { HardHat, MapPin, DollarSign, Calendar, Tag, Phone, Mail } from 'lucide-react';

interface Associate {
  id: string;
  name: string;
  category: string;
  type: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
}

interface AssociateListProps {
  selectedAssociate: Associate | null;
  onSelectAssociate: (associate: Associate) => void;
}

const AssociateList: React.FC<AssociateListProps> = ({ selectedAssociate, onSelectAssociate }) => {
  const associates: Associate[] = [
    {
      id: '1',
      name: 'Sharma & Associates',
      category: 'Architect',
      type: 'Consultant',
      location: 'Mumbai, Maharashtra',
      contactPerson: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: 'rajesh.sharma@architect.in',
      joinDate: '2023-06-15',
      status: 'active',
      avatar: 'SA',
    },
    {
      id: '2',
      name: 'Patel Engineering Consultants',
      category: 'Engineer',
      type: 'Consultant',
      location: 'Ahmedabad, Gujarat',
      contactPerson: 'Amit Patel',
      phone: '+91 87654 32109',
      email: 'amit.patel@pec.co.in',
      joinDate: '2023-08-22',
      status: 'active',
      avatar: 'PE',
    },
    {
      id: '3',
      name: 'Mehta Interior Designs',
      category: 'Interior Designer',
      type: 'Designer',
      location: 'Delhi, Delhi',
      contactPerson: 'Neha Mehta',
      phone: '+91 76543 21098',
      email: 'neha@mehtadesigns.in',
      joinDate: '2023-04-10',
      status: 'active',
      avatar: 'MI',
    },
    {
      id: '4',
      name: 'Verma Structural Engineers',
      category: 'Structural Engineer',
      type: 'Consultant',
      location: 'Pune, Maharashtra',
      contactPerson: 'Sunil Verma',
      phone: '+91 65432 10987',
      email: 'sunil.verma@vstructural.in',
      joinDate: '2023-02-05',
      status: 'inactive',
      avatar: 'VS',
    },
    {
      id: '5',
      name: 'Gupta & Sons Contractors',
      category: 'Contractor',
      type: 'Service Provider',
      location: 'Bangalore, Karnataka',
      contactPerson: 'Vikram Gupta',
      phone: '+91 54321 09876',
      email: 'vikram@guptacontractors.com',
      joinDate: '2023-09-18',
      status: 'pending',
      avatar: 'GS',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Architect':
        return 'bg-blue-100 text-blue-800';
      case 'Engineer':
        return 'bg-purple-100 text-purple-800';
      case 'Interior Designer':
        return 'bg-pink-100 text-pink-800';
      case 'Structural Engineer':
        return 'bg-indigo-100 text-indigo-800';
      case 'Contractor':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Associates</h3>
        <p className="text-sm text-gray-500">{associates.length} total associates</p>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {associates.map((associate) => (
          <div
            key={associate.id}
            onClick={() => onSelectAssociate(associate)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
              selectedAssociate?.id === associate.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{associate.avatar}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{associate.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(associate.status)}`}>
                    {associate.status}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getCategoryColor(associate.category)}`}>
                    {associate.category}
                  </span>
                  <span className="text-xs text-gray-500">{associate.type}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {associate.location.split(',')[0]}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    Since {new Date(associate.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {associate.phone}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssociateList;
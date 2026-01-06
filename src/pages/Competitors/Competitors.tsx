import React, { useState } from 'react';
import axios from 'axios';
import CompetitorList from './components/CompetitorList';
import CompetitorDetails from './components/CompetitorDetails';
import AddCompetitorModal from './components/AddCompetitorModal';
import CompetitorApproval from './components/CompetitorApproval';
import { Building2, Filter, Download, Plus, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Competitors: React.FC = () => {
    const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('competitors');
    const [competitorInitialData, setCompetitorInitialData] = useState(null);
    const [screenRefresh, setScreenRefresh] = useState(0);
    const { addNotification, hasSubmenuAccess, hasActionAccess } = useCRM();

    const handleAddCompetitor = (competitorData: any) => {
        console.log('Adding new competitor:', competitorData);
        addNotification({
            type: 'success',
            message: `Competitor ${competitorData.companyName} registered successfully and sent for approval!`,
        });
        setIsAddModalOpen(false);
    };

    const handleApprovalAction = (competitorId: string, action: 'approve' | 'reject', reason?: string) => {
        console.log(`${action} competitor:`, competitorId, reason);
        addNotification({
            type: action === 'approve' ? 'success' : 'warning',
            message: `Competitor ${action}d successfully!`,
        });
    };

    const handleExportCompetitors = () => {
        console.log('Exporting competitors...');
        addNotification({
            type: 'info',
            message: 'Competitor export initiated. Download will start shortly.',
        });
    };

    // Define all tabs with their access requirements
    const allTabs = [
        { id: 'competitors', name: 'All Competitors', icon: Building2, accessKey: 'All competitors' },
        { id: 'approval', name: 'Competitor Approval', icon: CheckCircle, accessKey: 'Competitor Approval' },
    ];

    // Filter tabs based on user submenu access permissions
    const tabs = allTabs.filter(tab => hasSubmenuAccess(tab.accessKey));

    // Ensure active tab is accessible, if not set to first available tab
    React.useEffect(() => {
        if (tabs.length > 0 && !tabs.some(tab => tab.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    // If no tabs are accessible, show access denied message
    if (tabs.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Competitor Management</h1>
                </div>
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔒</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                    <p className="text-gray-500">You don't have permission to access any competitor sections.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Competitor Management</h1>
                <div className="flex space-x-3">
                    {/* <button
            onClick={handleExportCompetitors}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
                    {activeTab === 'competitors' && hasActionAccess('Register Competitor', 'All competitors', 'competitors') && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Register Competitor
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <tab.icon className="h-5 w-5" />
                                <span>{tab.name}</span>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'competitors' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                    <div className="lg:col-span-1 h-full overflow-hidden">
                        <CompetitorList
                            selectedCompetitor={selectedCompetitor}
                            onSelectCompetitor={setSelectedCompetitor}
                            screenRefresh={screenRefresh}
                        />
                    </div>
                    <div className="lg:col-span-2 h-full overflow-y-auto">
                        <CompetitorDetails Competitor={selectedCompetitor} setCompetitorInitialData={setCompetitorInitialData} />
                    </div>
                </div>
            ) : (
                <CompetitorApproval onApprovalAction={handleApprovalAction} />
            )}

            <AddCompetitorModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setScreenRefresh(prev => prev + 1); }}
                onSubmit={handleAddCompetitor}
            />
        </div>
    );
};

export default Competitors;

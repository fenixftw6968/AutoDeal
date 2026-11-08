import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CampaignCard } from './components/CampaignCard';
import { CampaignDetail } from './components/CampaignDetail';
import { DealerDashboard } from './components/DealerDashboard';
import { AuthModal } from './components/AuthModal';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { api } from './services/api';
import { Campaign, Car } from './types';
import { Car as CarIcon, PlusCircle, Search } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'campaigns' | 'my-campaigns' | 'dealer-dashboard'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filters for browse
  const [brandFilter, setBrandFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [cList, carList] = await Promise.all([
        api.campaigns.getAll(),
        api.cars.getAll(),
      ]);
      setCampaigns(cList);
      setCars(carList);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (!user) {
      handleOpenAuth('login');
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleSelectCampaign = (c: Campaign) => {
    setSelectedCampaignId(c.id);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesBrand = brandFilter === 'All' || c.brand.toLowerCase() === brandFilter.toLowerCase();
    const matchesCity = cityFilter === 'All' || c.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesCity && matchesStatus && matchesSearch;
  });

  const myCampaigns = campaigns.filter((c) => user && c.participantIds.includes(user.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedCampaignId(null);
          setCurrentTab(tab as any);
        }}
        onOpenAuth={handleOpenAuth}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {selectedCampaignId ? (
          <CampaignDetail
            campaignId={selectedCampaignId}
            onBack={() => setSelectedCampaignId(null)}
            onOpenAuth={handleOpenAuth}
          />
        ) : currentTab === 'campaigns' ? (
          <LandingPage
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onOpenCreateModal={handleOpenCreateModal}
          />
        ) : currentTab === 'my-campaigns' ? (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6">
            <h1 className="text-xl font-bold text-stone-900">Your Joined Campaigns ({myCampaigns.length})</h1>
            {myCampaigns.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
                <p className="text-xs text-stone-500">You haven't joined or created any campaigns yet.</p>
                <button
                  onClick={() => setCurrentTab('campaigns')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
                >
                  Browse Group Deals
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myCampaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} onSelect={handleSelectCampaign} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <DealerDashboard onSelectCampaign={handleSelectCampaign} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500 w-full">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">AutoDeal</span>
            <span>• Group Car Buying Platform</span>
          </div>
          <div>All quotations reflect actual dealership submissions.</div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={createModalOpen}
        cars={cars}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newC) => {
          setCampaigns((prev) => [newC, ...prev]);
          setSelectedCampaignId(newC.id);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

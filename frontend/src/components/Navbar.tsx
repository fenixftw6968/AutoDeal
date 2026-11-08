import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, PlusCircle, Store } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenCreateModal
}) => {
  const { user, logout } = useAuth();
  const isDealer = user?.roles.includes('ROLE_DEALER');

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onSelectTab('campaigns')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900">AutoDeal</span>
                <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">Group Buy</span>
              </div>
            </button>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => onSelectTab('campaigns')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentTab === 'campaigns'
                    ? 'text-stone-900 bg-stone-100 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Group Deals
              </button>
              {user && (
                <button
                  onClick={() => onSelectTab('my-campaigns')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    currentTab === 'my-campaigns'
                      ? 'text-stone-900 bg-stone-100 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  My Campaigns
                </button>
              )}
              {isDealer && (
                <button
                  onClick={() => onSelectTab('dealer-dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    currentTab === 'dealer-dashboard'
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-stone-600 hover:text-blue-600 hover:bg-stone-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-blue-600" />
                  Dealership Portal
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Start Campaign
                </button>

                <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-stone-900">{user.fullName}</div>
                    <div className="text-[11px] text-stone-500 capitalize">
                      {isDealer ? 'Verified Dealer' : 'Buyer'}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors cursor-pointer shadow-sm"
                >
                  Join AutoDeal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { Campaign } from '../types';
import { CampaignCard } from './CampaignCard';
import {
  Users,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronDown,
  Car as CarIcon,
  BadgePercent
} from 'lucide-react';

interface LandingPageProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenCreateModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesBrand = selectedBrand === 'All' || c.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesCity = selectedCity === 'All' || c.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesQuery =
      c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesCity && matchesQuery;
  });

  const faqs = [
    {
      q: 'How does group buying save money on new cars?',
      a: 'Car dealerships have monthly wholesale volume quotas set by manufacturers. By combining verified buyers purchasing the exact model in the same city, dealers provide corporate fleet-level margins and bundled insurance discounts that individuals cannot get alone.',
    },
    {
      q: 'Do buyers have to share the invoice or financing?',
      a: 'No. Each buyer receives their own individual retail invoice, loan arrangement, registration number, and warranty directly from the authorized dealership showroom. Only the pricing negotiation is conducted as a collective group.',
    },
    {
      q: 'Is there any upfront financial commitment to join a campaign?',
      a: 'Zero upfront financial commitment. Joining a campaign registers your verified intent and opens access to the private group room chat. Official booking amounts are paid directly to the dealership only after the winning quotation is published and approved by you.',
    },
    {
      q: 'Can dealerships view my personal identity before quoting?',
      a: 'Dealerships only see aggregated group demand (e.g. "5 buyers committed in Bangalore") until you choose to finalize the booking with their showroom.',
    },
  ];

  return (
    <div className="w-full space-y-12 pb-16">
      {/* Hero Section - Full viewport width */}
      <section className="w-full bg-white border-b border-stone-200">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold mb-4 border border-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Collective Buying Power for New Cars</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-[1.15]">
              Stop negotiating alone. <br />
              <span className="text-stone-900 underline decoration-blue-600 decoration-4">Buy in groups</span>, unlock fleet pricing.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-3xl">
              AutoDeal connects verified buyers seeking the same car model in the same metro area. We pool demand and solicit binding, competitive bids from authorized dealerships.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenCreateModal}
                className="px-5 py-3 bg-stone-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                Start a Group Deal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar - Full screen span */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search car model (e.g. Creta, Seltos, XUV700, Harrier, Safari, Thar)..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
            >
              <option value="All">All Brands</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
              <option value="Tata">Tata</option>
              <option value="Mahindra">Mahindra</option>
              <option value="Maruti Suzuki">Maruti Suzuki</option>
              <option value="Toyota">Toyota</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Skoda">Skoda</option>
              <option value="Honda">Honda</option>
              <option value="MG">MG</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
            >
              <option value="All">All Cities</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>
        </div>
      </section>

      {/* Group Deals Grid - Full Screen Width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Active Group Buying Deals</h2>
          <p className="text-xs text-stone-500">Live buyer groups across India securing dealership fleet quotations</p>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
            <CarIcon className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-800">No campaigns found matching your filter</p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
            >
              Start this Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} onSelect={onSelectCampaign} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Transparency Indicators - Full Screen Width */}
      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="bg-white rounded-xl border border-stone-200 p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Zero Price Inflation</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Direct line-item savings on ex-showroom, bundled insurance, and dealer showroom handling.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Authorized Showrooms</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Dealers are vetted commercial license holders with full OEM warranty and delivery backing.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Verified Buyer Groups</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Persistent group chats with STOMP WebSockets ensure transparent member coordination.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-stone-500 mt-1">Clear answers to group car buying mechanics</p>
        </div>

        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center text-left text-xs font-semibold text-stone-900 hover:text-blue-600 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      isOpen ? 'rotate-180 text-stone-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed pl-1">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

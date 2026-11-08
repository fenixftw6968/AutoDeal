import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { Campaign, DealerOffer, LiveCampaignEvent } from '../types';
import { CampaignChat } from './CampaignChat';
import { OfferComparison } from './OfferComparison';
import { SubmitOfferModal } from './SubmitOfferModal';
import {
  ArrowLeft,
  Users,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaignId,
  onBack,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [offers, setOffers] = useState<DealerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'offers'>('overview');
  const [preferredColor, setPreferredColor] = useState('Abyss Black');
  const [isSubmitOfferOpen, setIsSubmitOfferOpen] = useState(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  const isMember = !!(user && campaign?.participantIds.includes(user.id));
  const isDealer = !!user?.roles.includes('ROLE_DEALER');
  const isCreator = !!(user && campaign?.creatorId === user.id);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, oData] = await Promise.all([
        api.campaigns.getById(campaignId),
        api.offers.getByCampaign(campaignId),
      ]);
      setCampaign(cData);
      setOffers(oData);
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  useEffect(() => {
    const unsubscribe = wsService.subscribeToCampaignEvents(
      campaignId,
      (event: LiveCampaignEvent) => {
        setCampaign((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentBuyers: event.currentBuyers,
            status:
              event.eventType === 'TARGET_REACHED'
                ? 'TARGET_REACHED'
                : event.eventType === 'OFFER_SUBMITTED'
                ? 'OFFER_AVAILABLE'
                : prev.status,
          };
        });

        setLiveNotification(event.message);
        setTimeout(() => setLiveNotification(null), 5000);

        if (event.eventType === 'OFFER_SUBMITTED') {
          api.offers.getByCampaign(campaignId).then(setOffers).catch(console.error);
        }
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [campaignId]);

  const handleJoin = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      const updated = await api.campaigns.join(campaignId, preferredColor);
      setCampaign(updated);
      setActiveTab('chat');
    } catch (err: any) {
      setError(err.message || 'Failed to join campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to withdraw from this group campaign?')) return;
    try {
      setActionLoading(true);
      setError(null);
      const updated = await api.campaigns.leave(campaignId);
      setCampaign(updated);
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || 'Failed to leave campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-12 py-16 text-center text-sm text-stone-500">
        Loading campaign details...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-12 py-16 text-center">
        <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-stone-800">Campaign not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-md"
        >
          Return to Campaigns
        </button>
      </div>
    );
  }

  const progress = Math.min(
    Math.round((campaign.currentBuyers / (campaign.targetBuyers || 1)) * 100),
    100
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6">
      {/* Top back button & live notification banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deals
        </button>

        {liveNotification && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-medium animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{liveNotification}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-5 relative aspect-16/10 lg:aspect-auto bg-stone-100 min-h-[300px]">
          <img
            src={
              campaign.carImageUrl ||
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
            }
            alt={campaign.model}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded">
            {campaign.brand} {campaign.model}
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-stone-100 text-stone-800 border border-stone-200">
                {campaign.status.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <MapPin className="w-3.5 h-3.5" /> {campaign.city}, {campaign.state || 'IN'}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500">
                Target Trim: <strong className="text-stone-700">{campaign.variant}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {campaign.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              {campaign.description ||
                `Buyers pooling purchasing power in ${campaign.city} to negotiate fleet discounts for ${campaign.brand} ${campaign.model}.`}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
            {/* Quota Progress */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-stone-500" />
                  <strong>{campaign.currentBuyers}</strong> of {campaign.targetBuyers} buyers committed
                </span>
                <span className="font-bold text-stone-700">{progress}% complete</span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress >= 100 ? 'bg-emerald-500' : 'bg-stone-900'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-stone-500">
                Deadline: <strong className="text-stone-800">{campaign.deadline}</strong> • Organizer:{' '}
                <span className="text-stone-700">{campaign.creatorName}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isMember ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={preferredColor}
                      onChange={(e) => setPreferredColor(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:outline-none"
                    >
                      <option value="Black">Color: Black</option>
                      <option value="White">Color: White</option>
                      <option value="Grey">Color: Grey</option>
                      <option value="Any">Color: Any</option>
                    </select>

                    <button
                      onClick={handleJoin}
                      disabled={actionLoading || campaign.status === 'COMPLETED' || campaign.status === 'EXPIRED'}
                      className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      {actionLoading ? 'Joining...' : 'Join Group Buy'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Active Member
                    </span>
                    {!isCreator && (
                      <button
                        onClick={handleLeave}
                        disabled={actionLoading}
                        className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        Leave Group
                      </button>
                    )}
                  </div>
                )}

                {isDealer && (
                  <button
                    onClick={() => setIsSubmitOfferOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Submit Quotation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Group Details & Buyers ({campaign.currentBuyers})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-colors ${
            activeTab === 'chat'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Group Room Chat
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-colors ${
            activeTab === 'offers'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Dealer Quotations ({offers.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                Campaign Mechanics & Terms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="font-semibold text-stone-900 block mb-1">Quota Commitment</span>
                  Once {campaign.targetBuyers} verified buyers join, the platform requests formal quotations from authorized local dealerships.
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="font-semibold text-stone-900 block mb-1">Pricing Guarantee</span>
                  Dealerships submit on-road binding quotes with explicit line-item savings, insurance waivers, and accessory inclusions.
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="font-semibold text-stone-900 block mb-1">Individual Delivery</span>
                  Each buyer receives their individual invoice, registration, and VIN allocation directly from the selected dealership showroom.
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <span className="font-semibold text-stone-900 block mb-1">Zero Obligation</span>
                  Joining a campaign indicates genuine intent; financial booking occurs only after reviewing the winning dealer offer.
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                Committed Group Buyers ({campaign.participants?.length || 0})
              </h3>
              <div className="divide-y divide-stone-100">
                {campaign.participants?.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                        {p.fullName ? p.fullName.charAt(0) : 'B'}
                      </div>
                      <div>
                        <span className="font-semibold text-stone-900">{p.fullName}</span>
                        <span className="text-stone-400 text-[11px] block">
                          Prefers: {p.preferredColor}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      Joined {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Quick Deal Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Car</span>
                  <span className="font-semibold text-stone-800">{campaign.brand} {campaign.model}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Trim</span>
                  <span className="font-semibold text-stone-800">{campaign.variant}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Market MSRP</span>
                  <span className="font-semibold text-stone-800">
                    ₹{(Number(campaign.estimatedMSRP || 1800000) / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Metro Hub</span>
                  <span className="font-semibold text-stone-800">{campaign.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Quotes Received</span>
                  <span className="font-semibold text-emerald-600">{offers.length} Dealerships</span>
                </div>
              </div>

              {!isMember && (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                >
                  Join Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <CampaignChat
          campaign={campaign}
          isMember={isMember}
          onJoinClick={handleJoin}
        />
      )}

      {activeTab === 'offers' && (
        <OfferComparison
          offers={offers}
          isDealer={isDealer}
          onOpenSubmitOffer={() => setIsSubmitOfferOpen(true)}
        />
      )}

      {isSubmitOfferOpen && (
        <SubmitOfferModal
          isOpen={isSubmitOfferOpen}
          campaign={campaign}
          onClose={() => setIsSubmitOfferOpen(false)}
          onSuccess={(newOffer) => {
            setOffers((prev) => [...prev, newOffer]);
            setActiveTab('offers');
          }}
        />
      )}
    </div>
  );
};

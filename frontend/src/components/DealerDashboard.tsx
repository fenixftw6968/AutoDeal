import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Campaign, DealerOffer } from '../types';
import { Store, ShieldCheck, Tag, PlusCircle, AlertCircle } from 'lucide-react';
import { SubmitOfferModal } from './SubmitOfferModal';

interface DealerDashboardProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export const DealerDashboard: React.FC<DealerDashboardProps> = ({ onSelectCampaign }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myOffers, setMyOffers] = useState<DealerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allC, offers] = await Promise.all([
        api.campaigns.getAll(),
        api.offers.getMyOffers(),
      ]);
      setCampaigns(allC);
      setMyOffers(offers);
    } catch (err: any) {
      console.error('Error loading dealer data:', err);
      setError(err.message || 'Failed to load dealership dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdrawOffer = async (offerId: string) => {
    if (!window.confirm('Withdraw this quotation?')) return;
    try {
      await api.offers.withdraw(offerId);
      setMyOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: 'WITHDRAWN' } : o))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw quotation');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter campaigns with high buyer demand
  const activeOpportunities = campaigns.filter(
    (c) => c.status === 'OPEN' || c.status === 'TARGET_REACHED' || c.status === 'OFFER_AVAILABLE'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dealer Portal Header */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-stone-900">
              {user?.dealershipName || 'Partner Dealership Portal'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Commercial Partner
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Access concentrated group buyer volume, eliminate individual customer acquisition costs, and issue bulk quota quotes.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-stone-50 rounded-lg border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Active Buyer Groups</span>
            <span className="text-lg font-bold text-stone-900">{activeOpportunities.length}</span>
          </div>
          <div className="px-4 py-2 bg-stone-50 rounded-lg border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Submitted Quotations</span>
            <span className="text-lg font-bold text-blue-600">{myOffers.length}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* High-Intent Buyer Demand Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">Regional Group Buying Demands</h2>
          <span className="text-xs text-stone-500">Live verified buyer pools ready for dealer quoting</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOpportunities.map((c) => {
            const hasSubmitted = myOffers.some((o) => o.campaignId === c.id);
            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl border border-stone-200 hover:border-stone-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-700">
                      {c.city} • {c.variant}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {c.currentBuyers} / {c.targetBuyers} Buyers
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900">
                    {c.brand} {c.model}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {c.description || `Group pooling in ${c.city}. Ready for quotation review.`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectCampaign(c)}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Inspect Group
                  </button>

                  <button
                    onClick={() => setActiveModalCampaign(c)}
                    disabled={hasSubmitted}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      hasSubmitted
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasSubmitted ? 'Quote Submitted' : 'Submit Quotation'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submitted Quotations Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-stone-900">Your Transmitted Quotations ({myOffers.length})</h2>

        {myOffers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
            No quotations submitted yet. Review open buyer pools above to submit your first fleet discount offer.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
            {myOffers.map((o) => (
              <div key={o.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{o.carVariant}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-1">
                    <span>Ex-Showroom: {formatCurrency(o.exShowroomPrice)}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">
                      Discount: - {formatCurrency(o.groupDiscountAmount)}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-stone-800">
                      Est. On-Road: {formatCurrency(o.estimatedOnRoadPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-400">Valid until {o.validityPeriod}</span>
                  {o.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleWithdrawOffer(o.id)}
                      className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeModalCampaign && (
        <SubmitOfferModal
          isOpen={!!activeModalCampaign}
          campaign={activeModalCampaign}
          onClose={() => setActiveModalCampaign(null)}
          onSuccess={(newOffer) => {
            setMyOffers((prev) => [newOffer, ...prev]);
            setActiveModalCampaign(null);
          }}
        />
      )}
    </div>
  );
};

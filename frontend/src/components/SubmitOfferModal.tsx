import React, { useState } from 'react';
import { api } from '../services/api';
import { Campaign, DealerOffer } from '../types';
import { X, Tag, ShieldCheck, AlertCircle } from 'lucide-react';

interface SubmitOfferModalProps {
  isOpen: boolean;
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (offer: DealerOffer) => void;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  isOpen,
  campaign,
  onClose,
  onSuccess,
}) => {
  const [carVariant, setCarVariant] = useState(campaign.variant);
  const [exShowroomPrice, setExShowroomPrice] = useState<number>(
    campaign.estimatedMSRP || 1800000
  );
  const [groupDiscountAmount, setGroupDiscountAmount] = useState<number>(75000);
  const [estimatedOnRoadPrice, setEstimatedOnRoadPrice] = useState<number>(
    (campaign.estimatedMSRP || 1800000) - 75000 + 220000 // tax/insurance approx
  );
  const [inclusions, setInclusions] = useState(
    'Zero-Depreciation Insurance, Fastag & RTO Registration, 3-Year Roadside Assistance'
  );
  const [exclusions, setExclusions] = useState('Extended Warranty, Chrome Accessory Kit');
  const [validityPeriod, setValidityPeriod] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    'Valid for minimum 3 vehicles booked together. Delivery within 21 days from allocation.'
  );
  const [minimumCommitmentUnits, setMinimumCommitmentUnits] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const offer = await api.offers.submit({
        campaignId: campaign.id,
        carVariant,
        exShowroomPrice: Number(exShowroomPrice),
        groupDiscountAmount: Number(groupDiscountAmount),
        estimatedOnRoadPrice: Number(estimatedOnRoadPrice),
        inclusions: inclusions.split(',').map((s) => s.trim()).filter(Boolean),
        exclusions: exclusions.split(',').map((s) => s.trim()).filter(Boolean),
        validityPeriod,
        termsAndConditions,
        minimumCommitmentUnits: Number(minimumCommitmentUnits),
      });

      onSuccess(offer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Submit Dealership Quotation</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Target: {campaign.brand} {campaign.model} ({campaign.currentBuyers} verified buyers in {campaign.city})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Car Variant / Trim</label>
            <input
              type="text"
              required
              value={carVariant}
              onChange={(e) => setCarVariant(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Ex-Showroom (₹)</label>
              <input
                type="number"
                required
                value={exShowroomPrice}
                onChange={(e) => setExShowroomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1">Group Discount (₹)</label>
              <input
                type="number"
                required
                value={groupDiscountAmount}
                onChange={(e) => setGroupDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-emerald-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-emerald-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Est. On-Road (₹)</label>
              <input
                type="number"
                required
                value={estimatedOnRoadPrice}
                onChange={(e) => setEstimatedOnRoadPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Offer Validity Date</label>
              <input
                type="date"
                required
                value={validityPeriod}
                onChange={(e) => setValidityPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Min. Units Commitment</label>
              <input
                type="number"
                min="1"
                required
                value={minimumCommitmentUnits}
                onChange={(e) => setMinimumCommitmentUnits(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Inclusions (Comma separated)</label>
            <input
              type="text"
              value={inclusions}
              onChange={(e) => setInclusions(e.target.value)}
              placeholder="e.g. 1 Year Insurance, Floor Mats, Mudflaps"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Exclusions (Comma separated)</label>
            <input
              type="text"
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              placeholder="e.g. Extended Warranty, Fastag Recharge"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Terms & Delivery Conditions</label>
            <textarea
              rows={2}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Submitting Quotation...' : 'Transmit Verified Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

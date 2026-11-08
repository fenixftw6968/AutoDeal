import React, { useState } from 'react';
import { DealerOffer } from '../types';
import { ShieldCheck, Tag, Check } from 'lucide-react';

interface OfferComparisonProps {
  offers: DealerOffer[];
  isDealer?: boolean;
  onOpenSubmitOffer?: () => void;
}

export const OfferComparison: React.FC<OfferComparisonProps> = ({
  offers,
  isDealer,
  onOpenSubmitOffer,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(
    offers[0]?.id || null
  );

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (offers.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Tag className="w-10 h-10 text-stone-400 mb-3" />
        <h4 className="text-sm font-semibold text-stone-900">No Dealership Quotations Yet</h4>
        <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
          Once this campaign meets its minimum buyer pool target, verified regional dealerships will submit competitive bulk purchase quotes.
        </p>
        {isDealer && onOpenSubmitOffer && (
          <button
            onClick={onOpenSubmitOffer}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Submit Dealership Quotation
          </button>
        )}
      </div>
    );
  }

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  return (
    <div className="space-y-4">
      {/* Quotation cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => {
          const isSelected = offer.id === selectedOffer?.id;
          return (
            <div
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-stone-900 bg-white shadow-md ring-1 ring-stone-900'
                  : 'border-stone-200 bg-white hover:border-stone-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">{offer.dealershipName}</span>
                    {offer.verifiedDealer && (
                      <span className="inline-flex items-center text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500">{offer.dealershipCity}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                    Group Discount
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    - {formatCurrency(offer.groupDiscountAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                    Est. On-Road Price
                  </span>
                  <span className="text-base font-bold text-stone-900">
                    {formatCurrency(offer.estimatedOnRoadPrice)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Offer Detail Breakdown */}
      {selectedOffer && (
        <div className="bg-stone-50/70 border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Quotation Breakdown: {selectedOffer.dealershipName}
              </h5>
              <span className="text-[11px] text-stone-500">
                Variant: <strong className="text-stone-700">{selectedOffer.carVariant}</strong> • Min. Group Commitment: {selectedOffer.minimumCommitmentUnits} vehicles
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500">Validity: Until {selectedOffer.validityPeriod}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-white p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Ex-Showroom Price</span>
              <span className="text-sm font-semibold text-stone-900">
                {formatCurrency(selectedOffer.exShowroomPrice)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Group Volume Discount</span>
              <span className="text-sm font-semibold text-emerald-600">
                - {formatCurrency(selectedOffer.groupDiscountAmount)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">Estimated On-Road Total</span>
              <span className="text-sm font-bold text-stone-900">
                {formatCurrency(selectedOffer.estimatedOnRoadPrice)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-stone-800 block mb-2">
                Inclusions & Dealership Benefits:
              </span>
              <ul className="space-y-1 text-xs text-stone-600">
                {selectedOffer.inclusions?.map((inc, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-800 block mb-2">
                Exclusions / Optional Extras:
              </span>
              <ul className="space-y-1 text-xs text-stone-500">
                {selectedOffer.exclusions?.map((exc, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {selectedOffer.termsAndConditions && (
            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500">
              <strong className="text-stone-700">Terms & Conditions:</strong>{' '}
              {selectedOffer.termsAndConditions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

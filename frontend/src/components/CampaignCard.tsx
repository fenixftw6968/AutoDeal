import React, { useState } from 'react';
import { Campaign } from '../types';
import { Users, Calendar, MapPin, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onSelect }) => {
  const progress = Math.min(
    Math.round((campaign.currentBuyers / (campaign.targetBuyers || 1)) * 100),
    100
  );

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'OPEN':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-stone-100 text-stone-700 border border-stone-200">
            Open Pool
          </span>
        );
      case 'TARGET_REACHED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-50 text-amber-700 border border-amber-200">
            Target Reached
          </span>
        );
      case 'NEGOTIATING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
            Dealer Negotiating
          </span>
        );
      case 'OFFER_AVAILABLE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Offers Available
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-50 text-purple-700 border border-purple-200">
            Completed
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-stone-100 text-stone-500 border border-stone-200">
            Expired
          </span>
        );
    }
  };

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div
      onClick={() => onSelect(campaign)}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Image container */}
      <div className="relative aspect-16/9 overflow-hidden bg-stone-100">
        <img
          src={
            campaign.carImageUrl ||
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
          }
          alt={`${campaign.brand} ${campaign.model}`}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">{getStatusBadge()}</div>
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
          {daysLeft > 0 ? `${daysLeft} days left` : 'Closing today'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{campaign.city}</span>
            <span>•</span>
            <span>{campaign.variant}</span>
          </div>

          <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {campaign.brand} {campaign.model}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 mb-3">
            {campaign.description || `Group buying campaign pooling buyers in ${campaign.city} for ${campaign.model}.`}
          </p>
        </div>

        <div>
          {/* Progress bar */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                {campaign.currentBuyers} of {campaign.targetBuyers} buyers
              </span>
              <span className="text-stone-500 font-medium">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-emerald-500' : 'bg-stone-900'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 text-xs">
            <span className="text-[11px] text-stone-500">
              Est. MSRP: ₹{(Number(campaign.estimatedMSRP || 1800000) / 100000).toFixed(2)}L
            </span>
            <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              View Deal <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { api } from '../services/api';
import { Car, Campaign } from '../types';
import { X, Calendar, Users, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: Campaign) => void;
  cars: Car[];
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cars,
}) => {
  const [selectedCarId, setSelectedCarId] = useState<string>(cars[0]?.id || '');
  const selectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  const [title, setTitle] = useState('');
  const [variant, setVariant] = useState(selectedCar?.availableVariants[0] || '');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [targetBuyers, setTargetBuyers] = useState<number>(5);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [preferredColor, setPreferredColor] = useState('Any');
  const [description, setDescription] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
    const car = cars.find((c) => c.id === carId);
    if (car) {
      setVariant(car.availableVariants[0] || '');
      setTitle(`${car.brand} ${car.model} Group Buy - ${city}`);
      setCustomImageUrl(car.imageUrl || '');
    }
  };

  const activePhoto = customImageUrl || selectedCar?.imageUrl || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    setError(null);
    setLoading(true);

    try {
      const campaign = await api.campaigns.create({
        title: title || `${selectedCar.brand} ${selectedCar.model} Group Buy - ${city}`,
        brand: selectedCar.brand,
        model: selectedCar.model,
        variant,
        city,
        state,
        targetBuyers,
        deadline,
        preferredColor,
        description,
        carImageUrl: activePhoto,
        estimatedMSRP: selectedCar.startingMsrp,
      });

      onSuccess(campaign);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Start a Group-Buy Campaign</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Combine buyer volume in your city to unlock direct dealer fleet discounts
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

          {/* Car Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target Vehicle</label>
            <select
              value={selectedCarId}
              onChange={(e) => handleCarChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} (MSRP from ₹{(c.startingMsrp / 100000).toFixed(2)} Lakh)
                </option>
              ))}
            </select>
          </div>

          {/* Real Photo Preview & Custom URL Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Vehicle Photo
            </label>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                {activePhoto ? (
                  <img src={activePhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Paste direct image URL or use default"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  You can paste any real vehicle photo link or keep the catalog image.
                </span>
              </div>
            </div>
          </div>

          {/* Preferred Variant */}
          {selectedCar && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Variant / Trim</label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                {selectedCar.availableVariants.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campaign Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Campaign Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bangalore Hyundai Creta Group Buy"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Metro / City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Target Buyers & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Buyers</label>
              <div className="relative">
                <Users className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="2"
                  max="50"
                  required
                  value={targetBuyers}
                  onChange={(e) => setTargetBuyers(parseInt(e.target.value) || 2)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Closing Deadline</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Your Preferred Color */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Color</label>
            <input
              type="text"
              value={preferredColor}
              onChange={(e) => setPreferredColor(e.target.value)}
              placeholder="e.g. Black, White, or Any"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Requirements</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Requirements for dealers (e.g. delivery timeframe, preferred accessories)"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-md hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Creating Campaign...' : 'Launch Group Buy Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

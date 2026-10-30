import React, { useState } from 'react';
import { Search, MapPin, Phone, Star, Building2, PlusCircle, Check, Sparkles, X, Store } from 'lucide-react';
import { usePlacesAutocomplete, AutocompleteResultItem } from '../hooks/usePlacesAutocomplete';
import { ShopInfo } from '../types/pos';
import { PRESET_SHOPS } from '../data/presetData';
import { ALL_FAMOUS_RESTAURANTS } from '../data/famousRestaurantsData';

interface PlaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShop: ShopInfo;
  onSelectShop: (shop: ShopInfo) => void;
}

export const PlaceSearchModal: React.FC<PlaceSearchModalProps> = ({
  isOpen,
  onClose,
  currentShop,
  onSelectShop,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'presets'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Custom shop form state
  const [customForm, setCustomForm] = useState<ShopInfo>({
    name: currentShop.name,
    address: currentShop.address,
    phone: currentShop.phone,
    taxId: currentShop.taxId,
    tagline: currentShop.tagline,
    fssaiNumber: currentShop.fssaiNumber || '',
    source: 'custom',
  });

  const { suggestions, isLoading, error: searchError, resetSession } = usePlacesAutocomplete(searchTerm);

  if (!isOpen) return null;

  const handleSelectSuggestion = async (item: AutocompleteResultItem) => {
    setIsFetchingDetails(true);
    setFetchError(null);

    try {
      const place = item.rawSuggestion.placePrediction?.toPlace();
      if (!place) {
        throw new Error('Place not available');
      }

      await place.fetchFields({
        fields: [
          'displayName',
          'formattedAddress',
          'nationalPhoneNumber',
          'internationalPhoneNumber',
          'rating',
          'userRatingCount',
          'location',
          'types',
        ],
      });

      const shopName = place.displayName || item.mainText || 'Local Restaurant';
      const address = place.formattedAddress || item.secondaryText || 'Address not listed';
      const phone = place.nationalPhoneNumber || place.internationalPhoneNumber || '+91 98765 43210';

      const updatedShop: ShopInfo = {
        name: shopName,
        address: address,
        phone: phone,
        taxId: currentShop.taxId || '07AAAAA0000A1Z5',
        tagline: 'Authentic Delicious Food & Warm Hospitality',
        source: 'google_places',
        placeId: item.placeId,
        rating: place.rating ?? 4.5,
        userRatingsTotal: place.userRatingCount ?? 120,
      };

      resetSession();
      onSelectShop(updatedShop);
      onClose();
    } catch (err) {
      console.error('Error fetching place details:', err);
      const errStr = String(err);
      if (errStr.includes('OverQuota') || errStr.includes('RESOURCE_EXHAUSTED')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      // Fallback with prediction info so user is never blocked
      const fallbackShop: ShopInfo = {
        name: item.mainText || 'Selected Venue',
        address: item.secondaryText || item.fullText || 'Local Area',
        phone: currentShop.phone || '+91 98765 43210',
        taxId: currentShop.taxId || '07AAAAA0000A1Z5',
        tagline: 'Quality Food & Fast Service',
        source: 'google_places',
        placeId: item.placeId,
      };
      onSelectShop(fallbackShop);
      onClose();
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleSaveCustomShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;

    onSelectShop({
      ...customForm,
      source: 'custom',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">Select Shop / Restaurant</h2>
              <p className="text-xs text-stone-500">Search on Google Places or enter custom business details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'search'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Places</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Popular Venues</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Custom Shop</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search restaurant, dhaba, hotel, cafe or shop..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm outline-hidden transition-all bg-white"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      resetSession();
                    }}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status / Loader */}
              {(isLoading || isFetchingDetails) && (
                <div className="flex items-center justify-center py-8 gap-2 text-stone-500 text-xs">
                  <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span>{isFetchingDetails ? 'Fetching restaurant details...' : 'Searching Google Places...'}</span>
                </div>
              )}

              {(fetchError || searchError) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  {fetchError || searchError}
                </div>
              )}

              {/* Autocomplete Results */}
              {!isLoading && suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-stone-400 px-1">
                    Matching Places
                  </div>
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left p-3.5 hover:bg-rose-50/50 transition-colors flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-rose-100 text-stone-600 group-hover:text-rose-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-stone-900 group-hover:text-rose-600 transition-colors truncate">
                            {suggestion.mainText}
                          </div>
                          <div className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                            <span>{suggestion.secondaryText || suggestion.fullText}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && !searchTerm && (
                <div className="text-center py-6 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <MapPin className="w-8 h-8 text-rose-500/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700">Type any venue name</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                    e.g. "Haldiram", "Murthal Dhaba", "Karim's Delhi", "Starbucks Connaught Place", or your local shop.
                  </p>
                </div>
              )}

              {!isLoading && searchTerm && suggestions.length === 0 && (
                <div className="text-center py-8 px-4 bg-stone-50 rounded-xl border border-stone-200">
                  <p className="text-sm font-semibold text-stone-700">No places found for "{searchTerm}"</p>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Would you like to manually enter your shop and restaurant details instead?
                  </p>
                  <button
                    onClick={() => {
                      setCustomForm((prev) => ({ ...prev, name: searchTerm }));
                      setActiveTab('custom');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create "{searchTerm}" as Custom Shop</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Section 1: Chandigarh & Ludhiana Famous */}
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-rose-600 px-1 mb-2 flex items-center justify-between">
                  <span>Chandigarh & Ludhiana Famous Food Institutions</span>
                  <span className="text-[10px] font-semibold text-stone-500">Auto-loads Public Menu</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_FAMOUS_RESTAURANTS.map((prof) => {
                    const shop = prof.shop;
                    const isCurrent = currentShop.name === shop.name || currentShop.restaurantKey === shop.restaurantKey;
                    return (
                      <button
                        key={shop.name}
                        onClick={() => {
                          onSelectShop(shop);
                          onClose();
                        }}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isCurrent
                            ? 'border-rose-500 bg-rose-50/40 shadow-xs ring-1 ring-rose-500'
                            : 'border-stone-200 hover:border-rose-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs">
                          {shop.city === 'Chandigarh' ? 'CHD' : 'LDH'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{shop.name}</h4>
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-sm font-medium">
                                {shop.city}
                              </span>
                            </div>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-rose-600 font-semibold mt-0.5 truncate">{prof.famousFor}</p>
                          <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                            <span>{shop.address}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Highway Dhabas & Regional Venues */}
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-stone-400 px-1 mb-2">
                  Highway Dhabas & Regional Venues
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_SHOPS.map((shop) => {
                    const isCurrent = currentShop.name === shop.name;
                    return (
                      <button
                        key={shop.name}
                        onClick={() => {
                          onSelectShop(shop);
                          onClose();
                        }}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isCurrent
                            ? 'border-rose-500 bg-rose-50/40 shadow-xs ring-1 ring-rose-500'
                            : 'border-stone-200 hover:border-rose-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-700 font-bold text-xs">
                          {shop.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{shop.name}</h4>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                                <Check className="w-3 h-3" /> Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5 truncate">{shop.tagline}</p>
                          <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                            <span>{shop.address}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleSaveCustomShop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Shop / Restaurant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  placeholder="e.g. Murthal Highway Dhaba & Sweets"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Street Address</label>
                <textarea
                  rows={2}
                  value={customForm.address}
                  onChange={(e) => setCustomForm({ ...customForm, address: e.target.value })}
                  placeholder="e.g. Shop #12, Market Square, Sector 18, City - 110001"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customForm.phone}
                    onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tax ID / GSTIN / TRN</label>
                  <input
                    type="text"
                    value={customForm.taxId}
                    onChange={(e) => setCustomForm({ ...customForm, taxId: e.target.value })}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tagline or Slogan</label>
                  <input
                    type="text"
                    value={customForm.tagline}
                    onChange={(e) => setCustomForm({ ...customForm, tagline: e.target.value })}
                    placeholder="e.g. Authentic Taste, Pure Desi Ghee"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">FSSAI / Health Permit No.</label>
                  <input
                    type="text"
                    value={customForm.fssaiNumber || ''}
                    onChange={(e) => setCustomForm({ ...customForm, fssaiNumber: e.target.value })}
                    placeholder="e.g. 10821005000412"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs transition-colors"
                >
                  Save & Apply to Receipts
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

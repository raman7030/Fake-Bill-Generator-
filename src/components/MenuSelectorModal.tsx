import React, { useState } from 'react';
import {
  X,
  MapPin,
  UtensilsCrossed,
  Check,
  Building2,
  ArrowRight,
  Flame,
  Star,
  Layers,
} from 'lucide-react';
import { ShopInfo } from '../types/pos';
import {
  REGIONAL_DINING_PROFILES,
  PUNJABI_ALL_DISHES,
  FAMOUS_INDIAN_DISHES,
  MASTER_ALL_MENU_ITEMS,
  FamousRestaurantProfile,
} from '../data/famousRestaurantsData';
import { getDishImageUrl } from '../utils/dishImageHelper';

interface MenuSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShop: ShopInfo;
  activeMenuSourceLabel: string;
  onSelectRestaurantProfile: (profile: FamousRestaurantProfile, updateShopInfo: boolean) => void;
  onLoadMasterCatalog: () => void;
}

export const MenuSelectorModal: React.FC<MenuSelectorModalProps> = ({
  isOpen,
  onClose,
  currentShop,
  activeMenuSourceLabel,
  onSelectRestaurantProfile,
  onLoadMasterCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'punjab' | 'india' | 'all'>('all');
  const [updateShopDetails, setUpdateShopDetails] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                Select Menu Cuisines & Themes
              </h2>
              <p className="text-xs text-stone-500">
                Load authentic dishes from Punjab and iconic regional cuisines across India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Bar & Settings */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="font-semibold text-stone-500">Current Venue:</span>
            <span className="font-bold text-stone-900">{currentShop.name}</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700 font-medium">
            <input
              type="checkbox"
              checked={updateShopDetails}
              onChange={(e) => setUpdateShopDetails(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span>Also update Store details on bill</span>
          </label>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Master Menu ({MASTER_ALL_MENU_ITEMS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('punjab')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'punjab'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Punjab Specials ({PUNJABI_ALL_DISHES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('india')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'india'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Famous Dishes of India ({FAMOUS_INDIAN_DISHES.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'all' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Complete Master Catalog (All Punjab & Pan-Indian Dishes)</span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Loads all {MASTER_ALL_MENU_ITEMS.length} dishes including Sarson Da Saag, Amritsari Kulcha, Butter Chicken Handi, Cream Chicken, Hyderabadi Biryani, Kashmiri Rogan Josh, Mumbai Pav Bhaji, South Indian Masala Dosa, fast food, snacks and desserts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onLoadMasterCatalog();
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Load All Dishes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-emerald-200/60">
                {MASTER_ALL_MENU_ITEMS.slice(0, 10).map((d) => (
                  <span
                    key={d.id}
                    className="text-[11px] bg-white text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 font-medium"
                  >
                    {d.name}
                  </span>
                ))}
                <span className="text-[11px] text-emerald-700 font-semibold px-1 py-0.5">
                  +{MASTER_ALL_MENU_ITEMS.length - 10} more dishes
                </span>
              </div>
            </div>
          )}

          {/* Regional Profiles */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
              Curated Theme & Regional Cuisines
            </div>

            {REGIONAL_DINING_PROFILES.map((prof) => {
              const isCurrentActive =
                currentShop.name.toLowerCase() === prof.shop.name.toLowerCase() ||
                currentShop.restaurantKey === prof.shop.restaurantKey;

              return (
                <div
                  key={prof.shop.restaurantKey || prof.shop.name}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrentActive
                      ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-stone-900">{prof.shop.name}</h4>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {prof.historyBadge}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {prof.shop.cuisine}
                        </span>
                      </div>

                      <div className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
                        <span>{prof.famousFor}</span>
                      </div>

                      <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{prof.shop.address}</span>
                      </div>

                      {/* Dishes Quick Badges with Mini Thumbnails */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prof.dishes.slice(0, 6).map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-700 pl-1 pr-2 py-0.5 rounded-md font-medium"
                          >
                            <img
                              src={getDishImageUrl(d.name, d.category, d.isVeg, d.image)}
                              alt=""
                              className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span>{d.name}</span>
                          </span>
                        ))}
                        {prof.dishes.length > 6 && (
                          <span className="text-[10px] text-stone-400 font-medium px-1 py-0.5">
                            +{prof.dishes.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-[11px] font-bold text-stone-500">
                        {prof.dishes.length} Dishes
                      </span>
                      <button
                        onClick={() => {
                          onSelectRestaurantProfile(prof, updateShopDetails);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrentActive
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xs'
                        }`}
                      >
                        {isCurrentActive ? (
                          <>
                            <Check className="w-3 h-3 text-rose-600" />
                            <span>Active Menu</span>
                          </>
                        ) : (
                          <>
                            <span>Load Menu</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>{MASTER_ALL_MENU_ITEMS.length} authentic dishes loaded</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

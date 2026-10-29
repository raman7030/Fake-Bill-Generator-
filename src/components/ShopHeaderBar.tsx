import React from 'react';
import { Store, MapPin, Phone, Star, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ShopInfo } from '../types/pos';

interface ShopHeaderBarProps {
  shop: ShopInfo;
  onOpenSearch: () => void;
  onOpenEdit: () => void;
  menuToolsOpen: boolean;
  onToggleMenuTools: () => void;
  currencySymbol: string;
}

export const ShopHeaderBar: React.FC<ShopHeaderBarProps> = ({
  shop,
  onOpenSearch,
  onOpenEdit,
  menuToolsOpen,
  onToggleMenuTools,
}) => {
  return (
    <header className="bg-white border-b border-stone-200/90 shadow-2xs sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Venue */}
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onOpenSearch} aria-label="Change restaurant" title="Search and change restaurant" className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/20 shrink-0 hover:brightness-105 active:scale-95 transition">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button type="button" onClick={onOpenEdit} className="text-left text-sm sm:text-base font-extrabold text-stone-900 truncate leading-tight hover:text-rose-700" title="Edit restaurant details">
                {shop.name}
              </button>

              {shop.source === 'google_places' && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Google Places
                </span>
              )}

              {shop.rating && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {shop.rating}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 truncate mt-0.5">
              <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-md">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{shop.address}</span>
              </span>
              <span className="hidden md:inline text-stone-300">•</span>
              <span className="hidden md:flex items-center gap-1 text-stone-600 font-medium shrink-0">
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{shop.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top-right menu options beside restaurant identity */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMenuTools}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${menuToolsOpen ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'}`}
            aria-expanded={menuToolsOpen}
            title="Open menu options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Menu Options</span>
          </button>
        </div>
      </div>
    </header>
  );
};

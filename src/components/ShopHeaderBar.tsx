import React from 'react';
import { Store, MapPin, Phone, Star, Edit, Search, Sparkles } from 'lucide-react';
import { ShopInfo } from '../types/pos';

interface ShopHeaderBarProps {
  shop: ShopInfo;
  onOpenSearch: () => void;
  onOpenEdit: () => void;
  currencySymbol: string;
}

export const ShopHeaderBar: React.FC<ShopHeaderBarProps> = ({
  shop,
  onOpenSearch,
  onOpenEdit,
}) => {
  return (
    <header className="bg-white border-b border-stone-200/90 shadow-2xs sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Identity & Active Venue */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/20 shrink-0">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 truncate leading-tight">
                {shop.name}
              </h2>

              {/* Quick Edit Icon Button directly next to name */}
              <button
                onClick={onOpenEdit}
                className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Edit Restaurant Name & Details"
              >
                <Edit className="w-3.5 h-3.5" />
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

        {/* Right: Edit & Switch Venue Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all active:scale-95 border border-rose-200/80 cursor-pointer"
            title="Edit shop details, GSTIN, and phone"
          >
            <Edit className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Edit Restaurant</span>
            <span className="sm:hidden">Edit</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold transition-all active:scale-95 border border-stone-200/60 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Change Venue</span>
            <span className="sm:hidden">Change</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, PlusCircle, Sparkles, Flame, Check, UtensilsCrossed, Layers, Trash2, RotateCcw, PanelRightOpen, X } from 'lucide-react';
import { MenuItem, CartItem, ShopInfo } from '../types/pos';
import { MENU_CATEGORIES } from '../data/presetData';

interface MenuCatalogProps {
  items: MenuItem[];
  cart: CartItem[];
  currencySymbol: string;
  currentShop: ShopInfo;
  activeMenuSourceLabel: string;
  isMasterMenuLoaded: boolean;
  onUpdateQuantity: (item: MenuItem, delta: number) => void;
  onOpenAddCustom: () => void;
  onOpenMenuSelector: () => void;
  onToggleMasterMenu: () => void;
  onRemoveDish?: (dishId: string) => void;
  onResetMenu?: () => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  items,
  cart,
  currencySymbol,
  currentShop,
  activeMenuSourceLabel,
  isMasterMenuLoaded,
  onUpdateQuantity,
  onOpenAddCustom,
  onOpenMenuSelector,
  onToggleMasterMenu,
  onRemoveDish,
  onResetMenu,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [menuToolsOpen, setMenuToolsOpen] = useState<boolean>(false);

  // Map cart items for fast lookup of current quantity
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((c) => {
      map.set(c.item.id, (map.get(c.item.id) || 0) + c.quantity);
    });
    return map;
  }, [cart]);

  // Filter items based on category, search, and veg filter
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (vegOnly && !item.isVeg) return false;
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Bestsellers' && !item.popular) return false;
        if (selectedCategory !== 'Bestsellers' && item.category !== selectedCategory) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery, vegOnly]);

  return (
    <div className="w-full pb-28 md:pb-20">
      {/* Side-mounted menu tools: kept off the main page until requested */}
      <button
        type="button"
        onClick={() => setMenuToolsOpen(true)}
        aria-label="Open menu options"
        title="Menu options"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 rounded-l-xl border border-stone-300 border-r-0 bg-white/95 text-stone-700 shadow-lg px-2.5 py-3 hover:bg-stone-50 active:scale-[0.98] backdrop-blur"
      >
        <PanelRightOpen className="w-5 h-5" />
        <span className="text-xs font-bold [writing-mode:vertical-rl] rotate-180">Menu Options</span>
      </button>

      {menuToolsOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu options"
            onClick={() => setMenuToolsOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu options"
            className="absolute right-0 top-0 h-full w-[min(88vw,360px)] overflow-y-auto bg-white shadow-2xl border-l border-stone-200 p-5"
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-stone-900">Menu Options</h2>
                <p className="text-xs text-stone-500 mt-1">{activeMenuSourceLabel || 'All Punjab & Famous Indian Dishes'} · {items.length} dishes</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuToolsOpen(false)}
                aria-label="Close menu options"
                className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-4">
              <button
                onClick={() => { onOpenAddCustom(); setMenuToolsOpen(false); }}
                className="w-full flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-emerald-800 hover:bg-emerald-100"
              >
                <PlusCircle className="w-5 h-5" />
                <span><span className="block text-sm font-bold">Add Dish</span><span className="block text-xs opacity-75">Create a custom menu item</span></span>
              </button>
              <button
                onClick={() => { onOpenMenuSelector(); setMenuToolsOpen(false); }}
                className="w-full flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-800 hover:bg-rose-100"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span><span className="block text-sm font-bold">Select Menu Style</span><span className="block text-xs opacity-75">Choose a cuisine or preset menu</span></span>
              </button>
              <button
                onClick={() => { onToggleMasterMenu(); setMenuToolsOpen(false); }}
                className="w-full flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-stone-800 hover:bg-stone-100"
              >
                <Layers className="w-5 h-5" />
                <span><span className="block text-sm font-bold">{isMasterMenuLoaded ? 'All Dishes Active' : 'Show All Dishes'}</span><span className="block text-xs text-stone-500">Toggle the complete dish catalog</span></span>
              </button>
              {onResetMenu && (
                <button
                  onClick={() => { onResetMenu(); setMenuToolsOpen(false); }}
                  className="w-full flex items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 text-left text-stone-700 hover:bg-stone-50"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span><span className="block text-sm font-bold">Reset Menu</span><span className="block text-xs text-stone-500">Restore the default dish catalog</span></span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md pt-3 pb-2 border-b border-stone-200/80 px-3 sm:px-4 space-y-2.5">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Butter Chicken, Cream Chicken, Biryani, Kulcha, Dosa, Waffle, Lassi)..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-hidden transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Dish Button */}
          <button
            onClick={onOpenAddCustom}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
            title="Add a new dish to the menu catalog"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Dish</span>
          </button>
        </div>

        {/* Filter Pills & Veg-Only Toggle */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar max-w-5xl mx-auto pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
            {MENU_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-100/50'
                  }`}
                >
                  {cat === 'Bestsellers' && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Veg Only Toggle Button */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 shadow-2xs cursor-pointer ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            <span className="w-3 h-3 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-600'}`} />
            </span>
            <span className="hidden sm:inline">Pure Veg Only</span>
            <span className="sm:hidden">Veg</span>
            {vegOnly && <Check className="w-3 h-3 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Food Items Catalog */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-stone-700">No matching dishes found in this category</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-4">
              Try searching a different item or switch category to "All" to view all Punjab dishes and famous dishes of India.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onToggleMasterMenu}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Load All Dishes Catalog</span>
              </button>
              <button
                onClick={onOpenAddCustom}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Custom Dish</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const qty = cartQuantityMap.get(item.id) || 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all flex gap-3.5 group hover:shadow-md relative ${
                    qty > 0 ? 'border-rose-300 ring-1 ring-rose-300/50 bg-rose-50/10' : 'border-stone-200/90'
                  }`}
                >
                  {/* Left: Info & Price */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Dietary Symbol & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.isVeg ? (
                            <span
                              className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center shrink-0"
                              title="Pure Vegetarian"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            </span>
                          ) : (
                            <span
                              className="w-3.5 h-3.5 border-2 border-rose-600 rounded-xs flex items-center justify-center shrink-0"
                              title="Non-Vegetarian"
                            >
                              <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-rose-600" />
                            </span>
                          )}

                          {item.popular && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Bestseller
                            </span>
                          )}

                          <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm font-medium truncate">
                            {item.category}
                          </span>
                        </div>

                        {/* Remove Dish Option */}
                        {onRemoveDish && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveDish(item.id);
                            }}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title={`Remove "${item.name}" from active menu`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Name (Clean culinary name, zero branding) */}
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-rose-600 transition-colors leading-snug">
                        {item.name}
                      </h4>

                      {/* Price */}
                      <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-1 flex items-baseline gap-1">
                        <span>{currencySymbol}</span>
                        <span>{item.price.toFixed(2)}</span>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Small mobile quantity counter or item tag */}
                    <div className="pt-2">
                      <span className="text-[11px] text-stone-400">
                        {qty > 0 ? (
                          <span className="font-semibold text-rose-600">
                            {qty} in order ({currencySymbol}{(qty * item.price).toFixed(2)})
                          </span>
                        ) : (
                          <span>Freshly Prepared</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Food Image with Overlay Add Button */}
                  <div className="relative w-28 sm:w-32 shrink-0 flex flex-col items-center">
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
                          <Sparkles className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Quantity Pill / Add Button (Zomato/Swiggy signature placement) */}
                    <div className="absolute -bottom-2 w-24">
                      {qty === 0 ? (
                        <button
                          onClick={() => onUpdateQuantity(item, 1)}
                          className="w-full py-1.5 px-3 bg-white text-rose-600 border border-rose-300 hover:border-rose-500 rounded-lg text-xs font-extrabold uppercase shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <span>ADD</span>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      ) : (
                        <div className="w-full py-1 px-1 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-between border border-rose-700 animate-in zoom-in-95 duration-150">
                          <button
                            onClick={() => onUpdateQuantity(item, -1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-rose-700 rounded-md active:scale-90 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold px-1 text-sm">{qty}</span>
                          <button
                            onClick={() => onUpdateQuantity(item, 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-rose-700 rounded-md active:scale-90 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

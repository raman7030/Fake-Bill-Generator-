import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types/pos';

interface FloatingCartBannerProps {
  cart: CartItem[];
  currencySymbol: string;
  onReviewBill: () => void;
}

export const FloatingCartBanner: React.FC<FloatingCartBannerProps> = ({
  cart,
  currencySymbol,
  onReviewBill,
}) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const price = item.customPrice !== undefined ? item.customPrice : item.item.price;
    return sum + price * item.quantity;
  }, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 px-3 sm:px-6 max-w-xl mx-auto pointer-events-none">
      <div className="bg-stone-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-800 pointer-events-auto transition-all animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-stone-900 rounded-full text-[11px] font-black flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          </div>
          <div>
            <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} Added
            </div>
            <div className="text-base sm:text-lg font-black text-white flex items-baseline gap-1">
              <span>{currencySymbol}</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onReviewBill}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-95 group cursor-pointer"
        >
          <span>Review Bill & Pay</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

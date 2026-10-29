import React, { useState } from 'react';
import { X, Plus, Utensils } from 'lucide-react';
import { MenuItem } from '../types/pos';
import { MENU_CATEGORIES } from '../data/presetData';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onAddItem: (item: MenuItem, quantity: number) => void;
}

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onAddItem,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('Main Course');
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || Number(price) <= 0) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category: category || 'Custom Items',
      price: Number(price),
      isVeg,
      description: description.trim() || 'Custom bill item added by counter staff',
      popular: false,
    };

    onAddItem(newItem, quantity);
    setName('');
    setPrice('');
    setQuantity(1);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Add Custom Item / Special Dish</h3>
              <p className="text-[11px] text-stone-500">Add an unlisted item directly to the current bill</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Item / Dish Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Special Chef Thali, Extra Raita, Mineral Water"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Unit Price ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Quantity</label>
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-stone-100 text-stone-700 font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-sm font-bold outline-hidden py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 hover:bg-stone-100 text-stone-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Veg / Non-Veg Toggle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Dietary Classification</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isVeg
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
                <span>Vegetarian (Veg)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  !isVeg
                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-rose-600 rounded-xs flex items-center justify-center">
                  <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-rose-600" />
                </span>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
            >
              {MENU_CATEGORIES.filter((c) => c !== 'All' && c !== 'Bestsellers').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom Specials">Custom Specials</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Optional Note / Preparation Details</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Extra spicy, less oil, served with mint chutney"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
            />
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
              className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cart ({quantity}x)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

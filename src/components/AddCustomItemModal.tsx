import React, { useState } from 'react';
import { X, Plus, Utensils, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MenuItem } from '../types/pos';
import { MENU_CATEGORIES } from '../data/presetData';
import { getDishImageUrl } from '../utils/dishImageHelper';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onAddItem: (item: MenuItem, quantity: number, addToCartOnly?: boolean) => void;
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
  const [category, setCategory] = useState('Punjab Specials');
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  const handlePhotoPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = new Image();
      source.onload = () => {
        const maxSide = 1000;
        const ratio = Math.min(1, maxSide / Math.max(source.naturalWidth, source.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(source.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(source.naturalHeight * ratio));
        const context = canvas.getContext('2d');
        if (!context) {
          setImageError('Could not process this photo. Please try another image.');
          return;
        }
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        setImageUrl(canvas.toDataURL('image/jpeg', 0.82));
      };
      source.onerror = () => setImageError('Could not read this photo. Please try another image.');
      source.src = String(reader.result);
    };
    reader.onerror = () => setImageError('Could not open this photo. Please try again.');
    reader.readAsDataURL(file);
  };
  const [actionType, setActionType] = useState<'menu_and_cart' | 'menu_only'>('menu_and_cart');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || Number(price) <= 0) return;

    const newItem: MenuItem = {
      id: `dish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category: category || 'Punjab Specials',
      price: Number(price),
      isVeg,
      description: description.trim() || 'Freshly prepared specialty dish',
      popular: false,
      image: imageUrl.trim() || getDishImageUrl(name.trim(), category, isVeg),
    };

    const addQty = actionType === 'menu_and_cart' ? quantity : 0;
    onAddItem(newItem, addQty, false);

    // Reset fields
    setName('');
    setPrice('');
    setQuantity(1);
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Add New Dish to Menu</h3>
              <p className="text-[11px] text-stone-500">Create a dish with custom price and add to catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Dish / Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paneer Lababdar, Garlic Chicken Tikka, Malpua Rabri"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Price ({currencySymbol}) <span className="text-rose-500">*</span>
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
              <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-200 text-xs font-medium focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
              >
                {MENU_CATEGORIES.filter((c) => c !== 'All' && c !== 'Bestsellers').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom Specials">Custom Specials</option>
              </select>
            </div>
          </div>

          {/* Dietary Classification Toggle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Dietary Classification</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
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
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
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
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description / Special Preparation Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cooked in pure desi ghee, served with green chutney & spiced onions"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Dish Photo (optional)</label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-xl border border-dashed border-rose-300 bg-rose-50/60 text-rose-700 text-xs font-bold cursor-pointer hover:bg-rose-50">
                <ImageIcon className="w-4 h-4" />
                <span>Choose Photo from Phone Storage</span>
                <input type="file" accept="image/*" onChange={handlePhotoPick} className="sr-only" />
              </label>
              <div className="text-[10px] text-stone-500">Or paste an image URL below.</div>
              <input
                type="text"
                value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImageError(''); }}
                placeholder="https://example.com/dish-photo.jpg"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
              />
              {imageError && <p className="text-[11px] text-rose-600">{imageError}</p>}
              {imageUrl && (
                <div className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
                  <img src={imageUrl} alt="Dish photo preview" className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                  <div className="min-w-0 flex-1 text-xs text-stone-600">{imageUrl.startsWith('data:image/') ? 'Selected photo' : 'Image URL'}<div className="text-[10px] text-stone-400">Photo preview</div></div>
                  <button type="button" onClick={() => setImageUrl('')} className="px-2 py-1 rounded-md border border-stone-200 text-stone-600 text-xs">Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Action Destination */}
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <span className="text-[11px] font-bold text-stone-700 block">Addition Mode</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-white cursor-pointer select-none">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'menu_and_cart'}
                  onChange={() => setActionType('menu_and_cart')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-stone-800">Add to Menu & Cart</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 rounded-lg border bg-white cursor-pointer select-none">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'menu_only'}
                  onChange={() => setActionType('menu_only')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-stone-800">Menu Catalog Only</span>
              </label>
            </div>

            {actionType === 'menu_and_cart' && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-600">Quantity to add to cart:</span>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 hover:bg-stone-100 text-stone-700 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 hover:bg-stone-100 text-stone-700 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {actionType === 'menu_and_cart' ? `Add to Menu & Cart (${quantity}x)` : 'Add to Menu Catalog'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

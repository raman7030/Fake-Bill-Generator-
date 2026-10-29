import React, { useState, useEffect } from 'react';
import { X, Store, Check, MapPin, Phone, FileText, Tag, ShieldCheck } from 'lucide-react';
import { ShopInfo } from '../types/pos';

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopInfo;
  onSaveShop: (updatedShop: ShopInfo) => void;
}

export const EditShopModal: React.FC<EditShopModalProps> = ({
  isOpen,
  onClose,
  shop,
  onSaveShop,
}) => {
  const [formData, setFormData] = useState<ShopInfo>(shop);

  useEffect(() => {
    setFormData(shop);
  }, [shop, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSaveShop({
      ...formData,
      source: formData.source || 'custom',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">Edit Selected Restaurant Details</h2>
              <p className="text-xs text-stone-500">Changes update live on all generated receipts & invoices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/70 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-rose-500" />
              <span>Restaurant / Shop Name <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. KFC, Subway, Domino's, Sharma Dhaba"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Full Address</span>
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 42, Food Court, 3rd Floor, Mall of India, Noida - 201301"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Phone / Contact Number</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98123 45678"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-800 focus:border-rose-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Tax ID / GSTIN / TRN</span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value.toUpperCase() })}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono font-bold text-stone-800 focus:border-rose-500 outline-hidden uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <span>Tagline / Slogan</span>
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. It's Finger Lickin' Good! / Fresh is What We Do"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-800 focus:border-rose-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>FSSAI / Health Permit License</span>
              </label>
              <input
                type="text"
                value={formData.fssaiNumber || ''}
                onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                placeholder="e.g. 10821005000412"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono text-stone-800 focus:border-rose-500 outline-hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Update All Receipts</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

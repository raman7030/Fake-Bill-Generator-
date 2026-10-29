import React from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  RefreshCw,
  CreditCard,
  Banknote,
  QrCode,
  Globe2,
  Percent,
  Receipt,
  FileText,
  User,
  Hash,
  Clock,
  Sparkles,
  Store,
  Edit,
} from 'lucide-react';
import {
  CartItem,
  DiscountSettings,
  OrderDetails,
  PaymentMethod,
  ServiceChargeSettings,
  ShopInfo,
  TaxCountry,
  TaxSettings,
} from '../types/pos';
import { calculateBill } from '../utils/taxCalculator';
import { COUNTRY_TAX_PRESETS } from '../data/presetData';

interface ReviewBillProps {
  shop: ShopInfo;
  cart: CartItem[];
  taxSettings: TaxSettings;
  discount: DiscountSettings;
  serviceCharge: ServiceChargeSettings;
  orderDetails: OrderDetails;
  onUpdateCartItem: (id: string, updates: Partial<{ name: string; price: number; quantity: number }>) => void;
  onRemoveCartItem: (id: string) => void;
  onAddNewLineItem: () => void;
  onUpdateTaxSettings: (settings: TaxSettings) => void;
  onUpdateDiscount: (discount: DiscountSettings) => void;
  onUpdateServiceCharge: (serviceCharge: ServiceChargeSettings) => void;
  onUpdateOrderDetails: (updates: Partial<OrderDetails>) => void;
  onBackToMenu: () => void;
  onGenerateReceipt: () => void;
  onOpenEditShop?: () => void;
}

export const ReviewBill: React.FC<ReviewBillProps> = ({
  shop,
  cart,
  taxSettings,
  discount,
  serviceCharge,
  orderDetails,
  onUpdateCartItem,
  onRemoveCartItem,
  onAddNewLineItem,
  onUpdateTaxSettings,
  onUpdateDiscount,
  onUpdateServiceCharge,
  onUpdateOrderDetails,
  onBackToMenu,
  onGenerateReceipt,
  onOpenEditShop,
}) => {
  const calculation = calculateBill(cart, taxSettings, discount, serviceCharge, orderDetails.roundOff);

  const handleCountryChange = (country: TaxCountry) => {
    const preset = COUNTRY_TAX_PRESETS[country];
    if (preset) {
      onUpdateTaxSettings({
        ...preset,
        taxIdValue: shop.taxId || preset.taxIdValue,
      });
    }
  };

  const generateRandomOrderId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    onUpdateOrderDetails({ orderId: `#ORD-${randomNum}` });
  };

  const paymentModes: { id: PaymentMethod; label: string; icon: React.ReactNode; sublabel: string }[] = [
    {
      id: 'UPI',
      label: 'UPI / QR',
      icon: <QrCode className="w-4 h-4 text-emerald-600" />,
      sublabel: 'GPay, PhonePe, Paytm',
    },
    {
      id: 'Cash',
      label: 'Cash',
      icon: <Banknote className="w-4 h-4 text-green-600" />,
      sublabel: 'Direct Currency',
    },
    {
      id: 'Card',
      label: 'Card (POS)',
      icon: <CreditCard className="w-4 h-4 text-blue-600" />,
      sublabel: 'Visa, Master, RuPay',
    },
    {
      id: 'Net Banking',
      label: 'Net Banking',
      icon: <Globe2 className="w-4 h-4 text-purple-600" />,
      sublabel: 'Direct Bank Transfer',
    },
    {
      id: 'Wallet',
      label: 'Wallet',
      icon: <Receipt className="w-4 h-4 text-amber-600" />,
      sublabel: 'Prepaid Food Wallet',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-stone-200 pb-3">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-black text-stone-900 leading-tight">Review & Live Bill Editor</h1>
          <p className="text-xs text-stone-500 font-medium">Fine-tune items, taxes, discounts & payment mode</p>
        </div>

        <button
          onClick={onGenerateReceipt}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">View Thermal Receipt</span>
          <span className="sm:hidden">Receipt</span>
        </button>
      </div>

      {/* Active Shop Information Bar */}
      <div className="bg-stone-100/80 rounded-xl p-3 border border-stone-200/80 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-rose-600 font-bold shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 truncate">{shop.name}</span>
              {shop.taxId && (
                <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200 shrink-0">
                  {taxSettings.taxIdLabel}: {shop.taxId}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 truncate">{shop.address} • Ph: {shop.phone}</p>
          </div>
        </div>

        {onOpenEditShop && (
          <button
            type="button"
            onClick={onOpenEditShop}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 rounded-lg text-xs font-bold border border-stone-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Edit className="w-3 h-3 text-rose-600" />
            <span>Edit Shop</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Items Editor & Order Meta */}
        <div className="lg:col-span-7 space-y-4">
          {/* Order Details Metadata Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Order Metadata
              </span>
              <button
                type="button"
                onClick={generateRandomOrderId}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                title="Generate new random order ID"
              >
                <RefreshCw className="w-3 h-3" /> New ID
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Order ID</label>
                <input
                  type="text"
                  value={orderDetails.orderId}
                  onChange={(e) => onUpdateOrderDetails({ orderId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold uppercase text-stone-800 focus:border-rose-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Table / Counter</label>
                <input
                  type="text"
                  value={orderDetails.tableNo}
                  onChange={(e) => onUpdateOrderDetails({ tableNo: e.target.value })}
                  placeholder="e.g. Table 04"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Server / Cashier</label>
                <input
                  type="text"
                  value={orderDetails.serverName}
                  onChange={(e) => onUpdateOrderDetails({ serverName: e.target.value })}
                  placeholder="e.g. Rahul S."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 focus:border-rose-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Date & Time
                </label>
                <input
                  type="text"
                  value={orderDetails.timestamp}
                  onChange={(e) => onUpdateOrderDetails({ timestamp: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-800 focus:border-rose-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-stone-100">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" /> Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={orderDetails.customerName}
                  onChange={(e) => onUpdateOrderDetails({ customerName: e.target.value })}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-800 focus:border-rose-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Customer Phone (Optional)</label>
                <input
                  type="text"
                  value={orderDetails.customerPhone}
                  onChange={(e) => onUpdateOrderDetails({ customerPhone: e.target.value })}
                  placeholder="e.g. +91 98111 22233"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-800 focus:border-rose-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Live Bill Items Table */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Live Itemized Bill Editor</h3>
                <p className="text-[11px] text-stone-500">Edit item name, price, or quantity inline directly on bill</p>
              </div>
              <button
                onClick={onAddNewLineItem}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No items in bill. Click "+ Add Item" or go back to menu.
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                  <div className="col-span-5 sm:col-span-6">Item Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate ({taxSettings.currencySymbol})</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1 text-center"></div>
                </div>

                {/* Items Rows */}
                <div className="divide-y divide-stone-100">
                  {cart.map((cartItem) => {
                    const unitPrice =
                      cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                    const lineTotal = unitPrice * cartItem.quantity;

                    return (
                      <div key={cartItem.id} className="grid grid-cols-12 gap-2 py-2 items-center group">
                        {/* Name Input */}
                        <div className="col-span-5 sm:col-span-6 flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              cartItem.item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <input
                            type="text"
                            value={cartItem.item.name}
                            onChange={(e) => onUpdateCartItem(cartItem.id, { name: e.target.value })}
                            className="w-full px-2 py-1 rounded-md border border-transparent hover:border-stone-200 focus:border-rose-500 text-xs font-semibold text-stone-900 outline-hidden bg-transparent focus:bg-white transition-all"
                          />
                        </div>

                        {/* Quantity Counter */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-white text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCartItem(cartItem.id, { quantity: Math.max(1, cartItem.quantity - 1) })
                              }
                              className="px-1.5 py-0.5 hover:bg-stone-100 text-stone-600 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-stone-900">{cartItem.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartItem(cartItem.id, { quantity: cartItem.quantity + 1 })}
                              className="px-1.5 py-0.5 hover:bg-stone-100 text-stone-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price Input */}
                        <div className="col-span-2 text-right">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={unitPrice}
                            onChange={(e) =>
                              onUpdateCartItem(cartItem.id, {
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full text-right px-1.5 py-1 rounded-md border border-transparent hover:border-stone-200 focus:border-rose-500 text-xs font-bold text-stone-800 outline-hidden bg-transparent focus:bg-white transition-all"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="col-span-2 text-right font-bold text-xs text-stone-900">
                          {taxSettings.currencySymbol}
                          {lineTotal.toFixed(2)}
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => onRemoveCartItem(cartItem.id)}
                            className="p-1 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Payment Method & Settlement
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paymentModes.map((mode) => {
                const isSelected = orderDetails.paymentMethod === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateOrderDetails({ paymentMethod: mode.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-stone-900">{mode.label}</span>
                      {mode.icon}
                    </div>
                    <span className="text-[10px] text-stone-500">{mode.sublabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Country Tax Engine & Calculations */}
        <div className="lg:col-span-5 space-y-4">
          {/* Multi-Country Tax Engine Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-stone-900">Multi-Country Tax Engine</span>
              </div>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                {taxSettings.currencyCode}
              </span>
            </div>

            {/* Country Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-1">Operating Country</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCountryChange('IN')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      taxSettings.country === 'IN'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🇮🇳 India (GST)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCountryChange('US')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      taxSettings.country === 'US'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🇺🇸 USA (Tax)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCountryChange('AE')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      taxSettings.country === 'AE'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🇦🇪 UAE (VAT)
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleCountryChange('GB')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      taxSettings.country === 'GB'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🇬🇧 UK (20% VAT)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCountryChange('AU')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      taxSettings.country === 'AU'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🇦🇺 AU (10% GST)
                  </button>
                </div>
              </div>

              {/* India GST Specific Options */}
              {taxSettings.country === 'IN' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">India GST Slab:</span>
                    <div className="flex gap-1.5">
                      {[5, 12, 18].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => onUpdateTaxSettings({ ...taxSettings, taxRate: rate })}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                            taxSettings.taxRate === rate
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {rate}% GST
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span>
                      Automatic Split: <strong>CGST @ {(taxSettings.taxRate / 2).toFixed(1)}%</strong> +{' '}
                      <strong>SGST @ {(taxSettings.taxRate / 2).toFixed(1)}%</strong>
                    </span>
                    <span className="font-bold text-rose-600">Total {taxSettings.taxRate}%</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">
                      Shop GSTIN / Tax Registration No.
                    </label>
                    <input
                      type="text"
                      value={taxSettings.taxIdValue}
                      onChange={(e) => onUpdateTaxSettings({ ...taxSettings, taxIdValue: e.target.value })}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-mono font-bold uppercase focus:border-rose-500 outline-hidden bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Non-India Tax Configuration */}
              {taxSettings.country !== 'IN' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {taxSettings.taxLabel} Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={taxSettings.taxRate}
                        onChange={(e) =>
                          onUpdateTaxSettings({ ...taxSettings, taxRate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold focus:border-rose-500 outline-hidden bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        {taxSettings.taxIdLabel}
                      </label>
                      <input
                        type="text"
                        value={taxSettings.taxIdValue}
                        onChange={(e) => onUpdateTaxSettings({ ...taxSettings, taxIdValue: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-mono font-bold uppercase focus:border-rose-500 outline-hidden bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-stone-700">Apply Taxes to this Bill</span>
                <button
                  type="button"
                  onClick={() => onUpdateTaxSettings({ ...taxSettings, enabled: !taxSettings.enabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    taxSettings.enabled ? 'bg-rose-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      taxSettings.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Discount & Service Charge Options */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Discounts & Service Fees
            </h3>

            {/* Discount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-rose-500" />
                  <span>Discount</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateDiscount({ ...discount, type: 'percentage' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      discount.type === 'percentage'
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateDiscount({ ...discount, type: 'flat' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      discount.type === 'flat'
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Flat ({taxSettings.currencySymbol})
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateDiscount({ ...discount, enabled: !discount.enabled })}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      discount.enabled ? 'text-emerald-700 bg-emerald-100' : 'text-stone-400 bg-stone-100'
                    }`}
                  >
                    {discount.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              {discount.enabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={discount.value}
                    onChange={(e) =>
                      onUpdateDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })
                    }
                    placeholder={discount.type === 'percentage' ? 'e.g. 10%' : 'e.g. 50'}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold focus:border-rose-500 outline-hidden"
                  />
                  <div className="flex gap-1">
                    {[5, 10, 15, 20].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onUpdateDiscount({ ...discount, type: 'percentage', value: d })}
                        className="px-2 py-1 text-[10px] bg-stone-100 hover:bg-stone-200 rounded font-bold text-stone-700"
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Charge / Tip */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Service Charge / Tip</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateServiceCharge({ ...serviceCharge, type: 'percentage' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      serviceCharge.type === 'percentage'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateServiceCharge({ ...serviceCharge, type: 'flat' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      serviceCharge.type === 'flat'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Flat ({taxSettings.currencySymbol})
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateServiceCharge({ ...serviceCharge, enabled: !serviceCharge.enabled })}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      serviceCharge.enabled ? 'text-amber-800 bg-amber-100' : 'text-stone-400 bg-stone-100'
                    }`}
                  >
                    {serviceCharge.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              {serviceCharge.enabled && (
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={serviceCharge.value}
                  onChange={(e) =>
                    onUpdateServiceCharge({ ...serviceCharge, value: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g. 5"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold focus:border-amber-500 outline-hidden"
                />
              )}
            </div>

            {/* Round Off Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div>
                <span className="text-xs font-semibold text-stone-800 block">Round Off Total</span>
                <span className="text-[10px] text-stone-400">
                  {orderDetails.roundOff ? 'Nearest whole integer (classic math)' : 'Exact decimal amount'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateOrderDetails({ roundOff: !orderDetails.roundOff })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  orderDetails.roundOff ? 'bg-stone-900' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    orderDetails.roundOff ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800 pb-2">
              Financial Summary Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Subtotal ({cart.length} lines)</span>
                <span className="font-semibold">
                  {taxSettings.currencySymbol}
                  {calculation.subtotal.toFixed(2)}
                </span>
              </div>

              {calculation.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    Discount (
                    {discount.type === 'percentage' ? `${discount.value}%` : 'Flat'})
                  </span>
                  <span className="font-semibold">
                    -{taxSettings.currencySymbol}
                    {calculation.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {taxSettings.enabled && taxSettings.splitCgstSgst && (
                <>
                  <div className="flex justify-between text-stone-300">
                    <span>CGST ({(taxSettings.taxRate / 2).toFixed(1)}%)</span>
                    <span className="font-semibold">
                      +{taxSettings.currencySymbol}
                      {calculation.cgstAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>SGST ({(taxSettings.taxRate / 2).toFixed(1)}%)</span>
                    <span className="font-semibold">
                      +{taxSettings.currencySymbol}
                      {calculation.sgstAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {taxSettings.enabled && !taxSettings.splitCgstSgst && (
                <div className="flex justify-between text-stone-300">
                  <span>
                    {taxSettings.taxLabel} ({taxSettings.taxRate}%)
                  </span>
                  <span className="font-semibold">
                    +{taxSettings.currencySymbol}
                    {calculation.totalTaxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {calculation.serviceChargeAmount > 0 && (
                <div className="flex justify-between text-stone-300">
                  <span>Service Charge</span>
                  <span className="font-semibold">
                    +{taxSettings.currencySymbol}
                    {calculation.serviceChargeAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {orderDetails.roundOff && calculation.roundOffDelta !== 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Round Off Delta</span>
                  <span className="font-semibold">
                    {calculation.roundOffDelta >= 0 ? '+' : ''}
                    {taxSettings.currencySymbol}
                    {calculation.roundOffDelta.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-3 border-t border-stone-800 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-black text-white block">GRAND TOTAL</span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Payment via {orderDetails.paymentMethod}
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 flex items-baseline gap-1">
                  <span>{taxSettings.currencySymbol}</span>
                  <span>{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Generate Thermal PDF Button */}
            <button
              onClick={onGenerateReceipt}
              className="w-full mt-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Authentic Thermal Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

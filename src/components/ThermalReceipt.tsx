import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Printer,
  Copy,
  Check,
  Share2,
  ArrowLeft,

  QrCode,
  LayoutTemplate,
  BookmarkCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  CartItem,
  DiscountSettings,
  OrderDetails,
  ReceiptStyle,
  QrCodeType,
  ServiceChargeSettings,
  ShopInfo,
  TaxSettings,
} from '../types/pos';
import { calculateBill } from '../utils/taxCalculator';
import { generateThermalReceiptPdf } from '../utils/pdfGenerator';

interface ThermalReceiptProps {
  shop: ShopInfo;
  cart: CartItem[];
  taxSettings: TaxSettings;
  discount: DiscountSettings;
  serviceCharge: ServiceChargeSettings;
  orderDetails: OrderDetails;
  onUpdateOrderDetails: (updates: Partial<OrderDetails>) => void;
  onBackToReview: () => void;
  onSaveToHistory?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  shop,
  cart,
  taxSettings,
  discount,
  serviceCharge,
  orderDetails,
  onUpdateOrderDetails,
  onBackToReview,
  onSaveToHistory,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const paperWidth = orderDetails.paperWidth || '80mm';
  const receiptStyle = orderDetails.receiptStyle || 'classic_thermal';
  const showQrCode = orderDetails.showQrCode ?? true;
  const qrCodeType = orderDetails.qrCodeType || 'upi';

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculation = calculateBill(cart, taxSettings, discount, serviceCharge, orderDetails.roundOff);

  // Generate QR Code if enabled
  useEffect(() => {
    if (!showQrCode) {
      setQrCodeDataUrl('');
      return;
    }

    let qrPayload = '';
    if (qrCodeType === 'upi') {
      // This app has no configured merchant payment account; encode a clearly marked demo payload.
      qrPayload = `DEMO PAYMENT ONLY\n${shop.name}\n${orderDetails.orderId}\n${taxSettings.currencyCode} ${calculation.grandTotal.toFixed(2)}`;
    } else if (qrCodeType === 'feedback') {
      qrPayload = `DEMO FEEDBACK ONLY\n${shop.name}\n${orderDetails.orderId}`;
    } else {
      qrPayload = `DEMO RECEIPT — NOT A REAL VERIFICATION URL\n${shop.name}\n${orderDetails.orderId}\n${orderDetails.timestamp}`;
    }

    QRCode.toDataURL(qrPayload, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [showQrCode, qrCodeType, shop.name, calculation.grandTotal, orderDetails.orderId, orderDetails.timestamp]);

  // Download high-resolution thermal PDF
  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      await generateThermalReceiptPdf(receiptRef.current, orderDetails.orderId, paperWidth);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveBill = () => {
    if (onSaveToHistory) {
      onSaveToHistory();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleCopyTextReceipt = () => {
    const divider = '------------------------------------------';
    const lines = [
      shop.name.toUpperCase(),
      shop.address,
      `Phone: ${shop.phone}`,
      shop.taxId ? `${taxSettings.taxIdLabel}: ${shop.taxId}` : '',
      divider,
      `ORDER: ${orderDetails.orderId}   TABLE: ${orderDetails.tableNo || 'N/A'}`,
      `DATE: ${orderDetails.timestamp}`,
      `SERVER: ${orderDetails.serverName || 'Staff'}`,
      divider,
      `ITEM                    QTY   RATE    TOTAL`,
      divider,
    ];

    cart.forEach((c) => {
      const price = c.customPrice !== undefined ? c.customPrice : c.item.price;
      const total = price * c.quantity;
      const name = c.item.name.padEnd(20, ' ').substring(0, 20);
      const qty = String(c.quantity).padStart(3, ' ');
      const rate = price.toFixed(2).padStart(7, ' ');
      const tot = total.toFixed(2).padStart(8, ' ');
      lines.push(`${name} ${qty} ${rate} ${tot}`);
    });

    lines.push(divider);
    lines.push(`SUBTOTAL:             ${taxSettings.currencySymbol}${calculation.subtotal.toFixed(2)}`);
    if (calculation.discountAmount > 0) {
      lines.push(`DISCOUNT:            -${taxSettings.currencySymbol}${calculation.discountAmount.toFixed(2)}`);
    }
    if (taxSettings.enabled && taxSettings.splitCgstSgst) {
      lines.push(
        `CGST @ ${(taxSettings.taxRate / 2).toFixed(1)}%:        +${
          taxSettings.currencySymbol
        }${calculation.cgstAmount.toFixed(2)}`
      );
      lines.push(
        `SGST @ ${(taxSettings.taxRate / 2).toFixed(1)}%:        +${
          taxSettings.currencySymbol
        }${calculation.sgstAmount.toFixed(2)}`
      );
    } else if (taxSettings.enabled) {
      lines.push(
        `${taxSettings.taxLabel} (${taxSettings.taxRate}%):      +${
          taxSettings.currencySymbol
        }${calculation.totalTaxAmount.toFixed(2)}`
      );
    }
    if (calculation.serviceChargeAmount > 0) {
      lines.push(
        `SERVICE CHARGE:       +${taxSettings.currencySymbol}${calculation.serviceChargeAmount.toFixed(2)}`
      );
    }
    if (orderDetails.roundOff && calculation.roundOffDelta !== 0) {
      lines.push(
        `ROUND OFF:            ${calculation.roundOffDelta >= 0 ? '+' : ''}${
          taxSettings.currencySymbol
        }${calculation.roundOffDelta.toFixed(2)}`
      );
    }
    lines.push(divider);
    lines.push(`GRAND TOTAL:          ${taxSettings.currencySymbol}${calculation.grandTotal.toFixed(2)}`);
    lines.push(divider);
    lines.push(`PAYMENT STATUS: ${orderDetails.paymentStatus}`);
    lines.push(`PAYMENT METHOD: ${orderDetails.paymentMethod.toUpperCase()}`);
    lines.push('DEMO RECEIPT — NOT PROOF OF PAYMENT');
    lines.push(`*** THANK YOU! VISIT AGAIN ***`);

    void navigator.clipboard.writeText(lines.filter(Boolean).join('\n')).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      window.alert('Clipboard access was blocked. Please copy the receipt text manually.');
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*${shop.name} - Receipt ${orderDetails.orderId}*\nTotal Amount: *${
        taxSettings.currencySymbol
      }${calculation.grandTotal.toFixed(2)}*\nPaid via: ${orderDetails.paymentMethod}\nDate: ${
        orderDetails.timestamp
      }\nThank you for dining with us!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const is58mm = paperWidth === '58mm';

  const receiptStylesList: { id: ReceiptStyle; name: string; desc: string; icon: string }[] = [
    {
      id: 'kfc_style',
      name: 'Fastfood Combo',
      desc: 'Bold franchise layout with Eat-In banner, meal sides & survey code',
      icon: '🍟',
    },
    {
      id: 'dominos_style',
      name: 'Pizzeria & Oven',
      desc: 'Pizza bakehouse layout with Kitchen Tracker ID & box count summary',
      icon: '🍕',
    },
    {
      id: 'subway_style',
      name: 'Fresh Deli Subs',
      desc: 'Deli sandwich artisan layout with bread modifiers & rewards tokens',
      icon: '🥪',
    },
    {
      id: 'starbucks_cafe',
      name: 'Cafe & Roastery',
      desc: 'Boutique coffeehouse format with Barista name & loyalty stars',
      icon: '☕',
    },
    {
      id: 'fine_dining',
      name: 'Fine Dining Elegance',
      desc: 'Serif classic layout with table seatings, ornaments & gratuity guide',
      icon: '🍷',
    },
    {
      id: 'asian_minimal',
      name: 'Izakaya Minimalist',
      desc: 'Clean geometric lines, compact spacing & official chop stamp box',
      icon: '🥢',
    },
    {
      id: 'supermarket_retail',
      name: 'Supermarket Retail',
      desc: 'Retail mart layout with item units count, savings tag & dual barcodes',
      icon: '🛒',
    },
    {
      id: 'classic_thermal',
      name: 'Classic Dhaba / Roll',
      desc: 'Standard physical POS roll format with Space Mono & dashed lines',
      icon: '🧾',
    },
    {
      id: 'modern_bistro',
      name: 'Modern Bistro',
      desc: 'Clean sans-serif typography, subtle dividers & contemporary check card',
      icon: '🍽️',
    },
    {
      id: 'retro_dotmatrix',
      name: 'Retro Dot-Matrix',
      desc: '90s impact pin printer style with VT323 font & starred borders',
      icon: '📠',
    },
    {
      id: 'compact_express',
      name: 'Takeaway Express',
      desc: 'Quick service counter with prominent order token callout',
      icon: '⚡',
    },
    {
      id: 'gst_tax_invoice',
      name: 'GST Tax Invoice',
      desc: 'Formal boxed invoice layout with HSN and split CGST/SGST tax grid',
      icon: '📑',
    },

    {
      id: 'delivery_card',
      name: 'Delivery • Premium Card',
      desc: 'App-style order summary with delivery, fees and payment breakdown',
      icon: '🛵',
    },
    {
      id: 'delivery_minimal',
      name: 'Delivery • Minimal',
      desc: 'Clean editorial delivery receipt with bold totals and compact line items',
      icon: '📦',
    },
    {
      id: 'delivery_dark',
      name: 'Delivery • Night',
      desc: 'High-contrast dark header, order capsule and itemized service fees',
      icon: '🌙',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28">
      {/* Top Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-stone-200 pb-3 no-print">
        <button
          onClick={onBackToReview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Bill / Taxes</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSaveToHistory && (
            <button
              onClick={handleSaveBill}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkCheck className="w-3.5 h-3.5 text-stone-500" />}
              <span>{savedSuccess ? 'Saved in History!' : 'Save Bill'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Direct thermal printing for 58mm/80mm roll printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thermal Print</span>
            <span className="sm:hidden">Print</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Rendering PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Style & Options Control Panel (No Print) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs mb-6 space-y-3.5 no-print">
        {/* Template Style Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4 text-rose-600" />
              <span>Choose Premium Receipt Layout / Style:</span>
            </span>
            
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {receiptStylesList.map((tpl) => {
              const isSelected = receiptStyle === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => onUpdateOrderDetails({ receiptStyle: tpl.id })}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/80 ring-1 ring-rose-500 shadow-2xs'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{tpl.icon}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 leading-tight">{tpl.name}</div>
                    <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{tpl.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paper Width & QR Options Row */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          {/* QR Code Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateOrderDetails({ showQrCode: !showQrCode })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showQrCode
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
            >
              {showQrCode ? <Eye className="w-3.5 h-3.5 text-rose-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showQrCode ? 'QR Code: ON' : 'QR Code: OFF (Without QR)'}</span>
            </button>

            {showQrCode && (
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-stone-500 px-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Target:
                </span>
                <button
                  onClick={() => onUpdateOrderDetails({ qrCodeType: 'upi' })}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    qrCodeType === 'upi' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  UPI Pay
                </button>
                <button
                  onClick={() => onUpdateOrderDetails({ qrCodeType: 'verify' })}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    qrCodeType === 'verify' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  E-Bill Verify
                </button>
                <button
                  onClick={() => onUpdateOrderDetails({ qrCodeType: 'feedback' })}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    qrCodeType === 'feedback' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Review / Feedback
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tagline and promotional box controls */}
        <div className="mt-3 border-t border-stone-100 pt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-stone-800">Restaurant tagline / slogan</div>
              <div className="text-[10px] text-stone-500">Show or hide the slogan printed under the restaurant name.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={orderDetails.showTagline}
              onClick={() => onUpdateOrderDetails({ showTagline: !orderDetails.showTagline })}
              className={`rounded-full px-3 py-1.5 text-xs font-bold border ${orderDetails.showTagline ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-stone-100 border-stone-200 text-stone-600'}`}
            >{orderDetails.showTagline ? 'Tagline: ON' : 'Tagline: OFF'}</button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-stone-800">Promotional box</div>
              <div className="text-[10px] text-stone-500">Optional editable message box on supported templates.</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={orderDetails.showPromotionalBoxes}
              onClick={() => onUpdateOrderDetails({ showPromotionalBoxes: !orderDetails.showPromotionalBoxes })}
              className={`rounded-full px-3 py-1.5 text-xs font-bold border ${orderDetails.showPromotionalBoxes ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-stone-100 border-stone-200 text-stone-600'}`}
            >{orderDetails.showPromotionalBoxes ? 'Promotional box: ON' : 'Promotional box: OFF'}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="block text-[11px] font-semibold text-stone-600">
              Box heading
              <input
                value={orderDetails.promotionalTitle}
                onChange={(e) => onUpdateOrderDetails({ promotionalTitle: e.target.value })}
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-rose-400"
                placeholder="Promotional heading"
              />
            </label>
            <label className="block text-[11px] font-semibold text-stone-600">
              Box message
              <input
                value={orderDetails.promotionalMessage}
                onChange={(e) => onUpdateOrderDetails({ promotionalMessage: e.target.value })}
                maxLength={180}
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 outline-none focus:border-rose-400"
                placeholder="Short promotional message"
              />
            </label>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <div className="text-[11px] text-stone-500">
            Active Layout: <span className="font-bold text-stone-800 capitalize">{receiptStyle.replace('_', ' ')}</span> ({paperWidth})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTextReceipt}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Text!' : 'Copy Plaintext'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authentic Receipt Render Container */}
      <div className="flex justify-center">
        <div
          ref={receiptRef}
          id="thermal-receipt-printable"
          className={`transition-all text-black bg-[#fffdfa] receipt-paper-shadow border border-stone-300/70 p-4 sm:p-5 thermal-receipt-container receipt-style-${receiptStyle} ${
            is58mm ? 'w-[320px]' : 'w-[420px]'
          }`}
          style={{
            fontFamily:
              receiptStyle === 'retro_dotmatrix'
                ? '"VT323", monospace'
                : receiptStyle === 'modern_bistro' || receiptStyle === 'starbucks_cafe' || receiptStyle === 'asian_minimal' || receiptStyle === 'delivery_card' || receiptStyle === 'delivery_minimal' || receiptStyle === 'delivery_dark'
                ? '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
                : receiptStyle === 'fine_dining'
                ? 'Georgia, Cambria, "Times New Roman", serif'
                : '"Roboto Mono", "Space Mono", "Courier New", Courier, monospace',
            letterSpacing:
              receiptStyle === 'modern_bistro' || receiptStyle === 'starbucks_cafe' || receiptStyle === 'asian_minimal' || receiptStyle === 'delivery_card' || receiptStyle === 'delivery_minimal' || receiptStyle === 'delivery_dark'
                ? 'normal'
                : '0',
            fontVariantNumeric: 'tabular-nums lining-nums',
          }}
        >

          {/* PREMIUM GENERIC DELIVERY TEMPLATES — original layouts, no third-party branding */}
          {receiptStyle === 'delivery_card' && (
            <div className="font-sans text-stone-900 -m-4 sm:-m-5">
              <div className="bg-emerald-700 text-white px-5 py-5 rounded-t-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-100 font-bold">Order confirmed · Demo</div>
                    <h2 className="text-xl font-black tracking-tight mt-1">{shop.name}</h2>
                    <p className="text-[10px] text-emerald-50 mt-1 leading-relaxed">{shop.address}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 border border-white/25 p-2 text-2xl">✦</div>
                </div>
                <div className="mt-4 inline-flex rounded-full bg-white text-emerald-800 px-3 py-1 text-[10px] font-extrabold tracking-wide">ORDER {orderDetails.orderId}</div>
              </div>
              <div className="bg-white px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                    <span className="block text-[9px] uppercase tracking-widest text-stone-500 font-bold">Placed at</span>
                    <span className="mt-1 block text-xs font-bold">{orderDetails.timestamp}</span>
                  </div>
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-3">
                    <span className="block text-[9px] uppercase tracking-widest text-stone-500 font-bold">Fulfilment</span>
                    <span className="mt-1 block text-xs font-bold">{orderDetails.tableNo || 'Pickup / Delivery'}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-1">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-stone-500">Your order</h3>
                    <span className="text-[10px] text-stone-500">{cart.reduce((s, item) => s + item.quantity, 0)} items</span>
                  </div>
                  {cart.map((cartItem) => {
                    const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                    return (
                      <div key={cartItem.id} className="flex items-start justify-between gap-3 py-2.5 border-b border-dashed border-stone-200">
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-snug">{cartItem.item.name}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">Qty {cartItem.quantity} × {taxSettings.currencySymbol}{price.toFixed(2)}</div>
                          {cartItem.notes && <div className="text-[10px] text-stone-500 italic mt-1">{cartItem.notes}</div>}
                        </div>
                        <div className="text-xs font-extrabold tabular-nums whitespace-nowrap">{taxSettings.currencySymbol}{(price * cartItem.quantity).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 space-y-2 text-[11px]">
                  <div className="flex justify-between"><span className="text-stone-600">Item subtotal</span><span>{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span></div>
                  {calculation.discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−{taxSettings.currencySymbol}{calculation.discountAmount.toFixed(2)}</span></div>}
                  {taxSettings.enabled && <div className="flex justify-between"><span className="text-stone-600">{taxSettings.taxLabel} ({taxSettings.taxRate}%)</span><span>{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span></div>}
                  {calculation.serviceChargeAmount > 0 && <div className="flex justify-between"><span className="text-stone-600">Service / delivery fee</span><span>{taxSettings.currencySymbol}{calculation.serviceChargeAmount.toFixed(2)}</span></div>}
                  {orderDetails.roundOff && calculation.roundOffDelta !== 0 && <div className="flex justify-between"><span className="text-stone-600">Rounding</span><span>{calculation.roundOffDelta >= 0 ? '+' : '−'}{taxSettings.currencySymbol}{Math.abs(calculation.roundOffDelta).toFixed(2)}</span></div>}
                  <div className="border-t border-stone-300 pt-3 mt-1 flex justify-between items-baseline"><span className="font-extrabold text-xs">Total</span><span className="font-black text-xl tracking-tight">{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-[10px] text-stone-500"><span>Payment method</span><span>{orderDetails.paymentMethod}</span></div>
                  <div className="flex justify-between text-[10px] font-bold"><span>Payment status</span><span>{orderDetails.paymentStatus}</span></div>
                </div>
                <div className="text-center border-t border-stone-200 pt-3">
                  <div className="text-xs font-extrabold">{orderDetails.footerNote || 'Thanks for ordering'}</div>
                  <div className="text-[9px] text-stone-400 mt-1 uppercase tracking-[0.18em]">Illustrative delivery receipt</div>
                </div>
              </div>
            </div>
          )}

          {receiptStyle === 'delivery_minimal' && (
            <div className="font-sans text-stone-900 -m-4 sm:-m-5">
              <div className="px-5 pt-5 pb-4 border-b-2 border-stone-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] tracking-[0.25em] uppercase font-black text-stone-500">Order note / demo</div>
                  <div className="text-[10px] font-bold border border-stone-300 rounded-full px-2 py-1">{orderDetails.orderId}</div>
                </div>
                <h2 className="text-2xl font-black tracking-[-0.06em] leading-tight mt-4">{shop.name}</h2>
                <p className="text-[10px] text-stone-500 mt-1">{shop.address}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 text-[10px]">
                  <div><span className="block text-stone-400 uppercase tracking-wider">Order date</span><span className="font-bold mt-1 block">{orderDetails.timestamp}</span></div>
                  <div><span className="block text-stone-400 uppercase tracking-wider">Guest</span><span className="font-bold mt-1 block">{orderDetails.customerName || 'Walk-in customer'}</span></div>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400 mb-3">Items</div>
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="flex justify-between gap-3 py-2 border-b border-stone-100">
                      <div className="text-xs min-w-0"><span className="font-black mr-2">{String(cartItem.quantity).padStart(2, '0')}</span><span className="font-semibold">{cartItem.item.name}</span>{cartItem.notes && <div className="text-[10px] text-stone-500 pl-7 mt-1">{cartItem.notes}</div>}</div>
                      <div className="font-bold text-xs whitespace-nowrap">{taxSettings.currencySymbol}{(price * cartItem.quantity).toFixed(2)}</div>
                    </div>
                  );
                })}
                <div className="space-y-2 mt-4 text-[11px]">
                  <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span></div>
                  {calculation.discountAmount > 0 && <div className="flex justify-between"><span className="text-stone-500">Offer / discount</span><span>−{taxSettings.currencySymbol}{calculation.discountAmount.toFixed(2)}</span></div>}
                  {taxSettings.enabled && <div className="flex justify-between"><span className="text-stone-500">{taxSettings.taxLabel}</span><span>{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span></div>}
                  {calculation.serviceChargeAmount > 0 && <div className="flex justify-between"><span className="text-stone-500">Delivery / service</span><span>{taxSettings.currencySymbol}{calculation.serviceChargeAmount.toFixed(2)}</span></div>}
                </div>
                <div className="mt-4 pt-3 border-t-2 border-stone-900">
                  <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest">Amount due</span><span className="text-2xl font-black tracking-tight">{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span></div>
                  {orderDetails.roundOff && calculation.roundOffDelta !== 0 && <div className="text-right text-[10px] text-stone-500 mt-1">Includes rounding {calculation.roundOffDelta >= 0 ? '+' : '−'}{taxSettings.currencySymbol}{Math.abs(calculation.roundOffDelta).toFixed(2)}</div>}
                </div>
                <div className="mt-5 flex justify-between items-center border-t border-stone-200 pt-3 text-[10px]"><span className="uppercase tracking-wider font-bold text-stone-500">Paid / pending</span><span className="font-black">{orderDetails.paymentStatus} · {orderDetails.paymentMethod}</span></div>
                <div className="text-center pt-4 text-[10px] text-stone-400">THANK YOU · MADE FOR DEMONSTRATION</div>
              </div>
            </div>
          )}

          {receiptStyle === 'delivery_dark' && (
            <div className="font-sans text-stone-100 bg-[#151a17] -m-4 sm:-m-5">
              <div className="px-5 py-5 bg-[#202b25] border-b border-emerald-300/20 rounded-t-xl">
                <div className="flex justify-between items-start gap-3">
                  <div><div className="text-[9px] uppercase tracking-[0.25em] text-emerald-300 font-black">Digital order receipt · demo</div><h2 className="text-xl font-black mt-2 leading-tight">{shop.name}</h2><p className="text-[10px] text-stone-400 mt-1">{shop.address}</p></div>
                  <span className="text-xl">◈</span>
                </div>
                <div className="mt-4 flex items-center justify-between border border-white/10 rounded-xl bg-black/20 p-3"><span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Order ID</span><span className="font-mono font-bold text-xs">{orderDetails.orderId}</span></div>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex justify-between gap-3 text-[10px] text-stone-400"><span>{orderDetails.timestamp}</span><span>{orderDetails.tableNo || 'Delivery order'}</span></div>
                <div><h3 className="text-[9px] uppercase tracking-[0.22em] text-emerald-300 font-black mb-2">Order details</h3>
                  {cart.map((cartItem) => { const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price; return <div key={cartItem.id} className="flex justify-between gap-3 py-2 border-b border-white/10"><div className="min-w-0"><div className="text-xs font-semibold">{cartItem.quantity} × {cartItem.item.name}</div>{cartItem.notes && <div className="text-[10px] text-stone-400 mt-1">{cartItem.notes}</div>}</div><span className="text-xs font-bold whitespace-nowrap">{taxSettings.currencySymbol}{(price * cartItem.quantity).toFixed(2)}</span></div>; })}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-[11px]"><div className="flex justify-between"><span className="text-stone-400">Subtotal</span><span>{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span></div>{calculation.discountAmount > 0 && <div className="flex justify-between text-emerald-300"><span>Discount</span><span>−{taxSettings.currencySymbol}{calculation.discountAmount.toFixed(2)}</span></div>}{taxSettings.enabled && <div className="flex justify-between"><span className="text-stone-400">{taxSettings.taxLabel} ({taxSettings.taxRate}%)</span><span>{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span></div>}{calculation.serviceChargeAmount > 0 && <div className="flex justify-between"><span className="text-stone-400">Delivery / service</span><span>{taxSettings.currencySymbol}{calculation.serviceChargeAmount.toFixed(2)}</span></div>}<div className="border-t border-white/15 pt-3 flex justify-between items-baseline"><span className="font-bold">TOTAL</span><span className="text-2xl font-black text-white">{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span></div><div className="flex justify-between text-[10px] text-stone-400"><span>{orderDetails.paymentMethod}</span><span className="text-emerald-300 font-bold">{orderDetails.paymentStatus}</span></div></div>
                <div className="border-t border-white/10 pt-3 text-center"><div className="text-xs font-bold">{orderDetails.footerNote || 'Thank you for your order'}</div><div className="text-[9px] uppercase tracking-[0.2em] text-stone-500 mt-2">Sample only · not a proof of payment</div></div>
              </div>
            </div>
          )}

          <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-900" role="note">
            DEMO / SAMPLE RECEIPT — NOT A VALID TAX INVOICE OR PROOF OF PAYMENT
          </div>

          {/* ========================================================= */}
          {/* TEMPLATE 1: FASTFOOD COMBO STYLE (Bold Franchise Layout)  */}
          {/* Always displays actual shop.name, never third-party brand  */}
          {/* ========================================================= */}
          {receiptStyle === 'kfc_style' && (
            <div className="font-receipt space-y-2 text-stone-900">
              {/* Actual Restaurant Header */}
              <div className="text-center space-y-0.5 pb-1">
                <div className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase">
                  {shop.name}
                </div>
                <div className="text-[11px] font-bold text-stone-800 uppercase">
                  STORE #1084 • TEL: {shop.phone}
                </div>
                <div className="text-[10px] text-stone-600 leading-tight px-2">{shop.address}</div>
                {taxSettings.taxIdValue && (
                  <div className="text-[10px] font-mono font-bold text-stone-800">
                    {taxSettings.taxIdLabel}: {taxSettings.taxIdValue}
                  </div>
                )}
                {orderDetails.showTagline && shop.tagline && <div className="text-[9px] italic text-stone-500">"{shop.tagline}"</div>}
              </div>

              {/* Bold Eat-In / Takeaway Banner */}
              <div className="border-t-2 border-b-2 border-stone-950 py-1 text-center select-none">
                <span className="text-base sm:text-lg font-black tracking-widest uppercase">
                  *** {orderDetails.tableNo ? `EAT IN - ${orderDetails.tableNo.toUpperCase()}` : 'TAKE AWAY'} ***
                </span>
              </div>

              {/* Order Meta */}
              <div className="text-[11px] font-bold py-1 leading-snug space-y-0.5">
                <div className="flex justify-between">
                  <span>ORDER: {orderDetails.orderId}</span>
                  <span>REG: 03</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE: {orderDetails.timestamp}</span>
                  <span>POS: COUNTER-1</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: {orderDetails.serverName || 'STAFF'}</span>
                  <span>GUEST: {orderDetails.customerName || 'WALK-IN'}</span>
                </div>
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                -------------------------------------------
              </div>

              {/* Items Section with Franchise Combo Formatting */}
              <div className="text-[11px] font-black uppercase grid grid-cols-12 py-0.5 border-b border-stone-900">
                <div className="col-span-7">ITEM & DESCRIPTION</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-3 text-right">AMOUNT</div>
              </div>

              <div className="divide-y divide-dashed divide-stone-300 py-1 text-[11px] font-bold">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  const total = price * cartItem.quantity;
                  return (
                    <div key={cartItem.id} className="py-1">
                      <div className="grid grid-cols-12">
                        <span className="col-span-7 uppercase truncate">{cartItem.item.name}</span>
                        <span className="col-span-2 text-center">{cartItem.quantity}</span>
                        <span className="col-span-3 text-right font-black">{total.toFixed(2)}</span>
                      </div>
                      <div className="pl-3 text-[9px] font-normal text-stone-600 space-y-0.5 mt-0.5">
                        <div>+ 1x FRESH INGREDIENTS & SEASONING</div>
                        <div>+ REGULAR COMBO SIDES & DIP</div>
                        {cartItem.notes && <div className="italic">* {cartItem.notes}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                -------------------------------------------
              </div>

              {/* Totals */}
              <div className="text-[11px] space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>NET TOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>DISCOUNT COUPON:</span>
                    <span>-{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings.enabled && (
                  <div className="flex justify-between">
                    <span>{taxSettings.taxLabel} ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-b-2 border-stone-950 py-1.5 my-1">
                <div className="flex justify-between items-baseline text-lg font-black">
                  <span>TOTAL DUE:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span>PAID VIA:</span>
                  <span className="uppercase">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>DEMO AUTH CODE:</span>
                  <span>NOT ISSUED</span>
                </div>
              </div>

              {orderDetails.showPromotionalBoxes && (
                <div className="border border-stone-300 rounded-lg p-3 my-2 text-center space-y-1.5 bg-stone-100">
                  <div className="text-xs font-black uppercase tracking-wide">{orderDetails.promotionalTitle || 'Promotion'}</div>
                  <div className="text-[10px] text-stone-700">{orderDetails.promotionalMessage}</div>
                </div>
              )}

              {/* Barcode & QR */}
              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Receipt QR" className="w-22 h-22 object-contain" />
                  <span className="text-[9px] font-bold uppercase mt-1">Scan for Survey & E-Receipt</span>
                </div>
              )}

              <div className="text-center pt-1 text-[10px] font-bold uppercase">
                *** THANK YOU FOR VISITING {shop.name.toUpperCase()}! ***
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 2: PIZZERIA & BAKEHOUSE (Live Tracker & Boxes)   */}
          {/* Always displays actual shop.name, never third-party brand  */}
          {/* ========================================================= */}
          {receiptStyle === 'dominos_style' && (
            <div className="font-receipt space-y-2 text-stone-900">
              {/* Actual Restaurant Header */}
              <div className="text-center space-y-0.5">
                <div className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-1.5">
                  <span>🍕</span>
                  <span>{shop.name}</span>
                </div>
                <div className="text-[10px] font-bold uppercase text-stone-800">
                  DEMO STORE • TEL: {shop.phone}
                </div>
                <div className="text-[10px] text-stone-600 px-2 leading-tight">{shop.address}</div>
                {taxSettings.taxIdValue && (
                  <div className="text-[9px] font-mono font-bold text-stone-700">
                    {taxSettings.taxIdLabel}: {taxSettings.taxIdValue}
                  </div>
                )}
              </div>

              {/* Order Tracker ID Callout Banner */}
              <div className="bg-stone-100 text-stone-900 border border-stone-200 p-2.5 rounded-xl text-center space-y-0.5 my-1.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block">
                  ORDER REFERENCE · DEMO
                </span>
                <span className="text-base sm:text-lg font-black tracking-tight text-stone-900 block font-mono">
                  #TRK-{orderDetails.orderId.replace(/[^0-9]/g, '') || '94821'}
                </span>
                <span className="text-[10px] text-stone-600 font-semibold block">
                  {orderDetails.tableNo ? `DINE-IN • ${orderDetails.tableNo}` : 'HOT & FRESH CARRYOUT'}
                </span>
              </div>

              <div className="text-[10px] font-bold space-y-0.5 py-0.5">
                <div className="flex justify-between">
                  <span>OVEN-FRESH GUARANTEE</span>
                  <span>EST. TIME: 15-20 MIN</span>
                </div>
                <div className="flex justify-between">
                  <span>PLACED: {orderDetails.timestamp}</span>
                  <span>BAKER / CREW: {orderDetails.serverName || 'STAFF'}</span>
                </div>
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                ===========================================
              </div>

              {/* Items Section with Customization Sub-items */}
              <div className="text-[11px] font-black uppercase py-0.5 grid grid-cols-12 border-b border-stone-900">
                <div className="col-span-8">CRUST & MENU ITEM</div>
                <div className="col-span-1 text-center">QTY</div>
                <div className="col-span-3 text-right">TOTAL</div>
              </div>

              <div className="divide-y divide-dashed divide-stone-300 py-1 text-[11px] font-bold">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  const total = price * cartItem.quantity;
                  return (
                    <div key={cartItem.id} className="py-1">
                      <div className="grid grid-cols-12">
                        <span className="col-span-8 truncate uppercase">{cartItem.item.name}</span>
                        <span className="col-span-1 text-center">{cartItem.quantity}</span>
                        <span className="col-span-3 text-right font-black">{total.toFixed(2)}</span>
                      </div>
                      {cartItem.notes && (
                        <div className="pl-3 text-[9px] font-normal italic text-stone-600 mt-0.5">
                          Note: {cartItem.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                -------------------------------------------
              </div>

              {/* Financials */}
              <div className="text-[11px] space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>ITEM TOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>SPECIAL PROMO:</span>
                    <span>-{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings.enabled && (
                  <div className="flex justify-between">
                    <span>TAXES ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                {orderDetails.roundOff && calculation.roundOffDelta !== 0 && (
                  <div className="flex justify-between">
                    <span>ROUND OFF:</span>
                    <span>{calculation.roundOffDelta >= 0 ? '+' : ''}{calculation.roundOffDelta.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-1 my-1">
                <div className="flex justify-between items-baseline text-base sm:text-lg font-black">
                  <span>AMOUNT PAID:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[10px] font-bold flex justify-between">
                <span>PAYMENT: {orderDetails.paymentMethod.toUpperCase()}</span>
                <span>STATUS: {orderDetails.paymentStatus}</span>
              </div>

              {/* Tracker QR */}
              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1.5">
                  <img src={qrCodeDataUrl} alt="Tracker QR" className="w-22 h-22 object-contain" />
                  <span className="text-[9px] font-bold uppercase mt-1 text-stone-700">
                    Scan to Track Oven-to-Plate Progress
                  </span>
                </div>
              )}

              <div className="text-center pt-1 text-[9px] text-stone-600 font-semibold uppercase">
                *** FRESH OVEN HOT DELIVERED GUARANTEE • {shop.name.toUpperCase()} ***
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 3: FRESH DELI SANDWICH (Artisan Crew & Rewards)  */}
          {/* Always displays actual shop.name, never third-party brand  */}
          {/* ========================================================= */}
          {receiptStyle === 'subway_style' && (
            <div className="font-receipt space-y-2 text-stone-900">
              {/* Actual Restaurant Header */}
              <div className="text-center space-y-0.5">
                <div className="text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-1.5">
                  <span>🥪</span>
                  <span>{shop.name}</span>
                </div>
                <div className="text-[10px] text-stone-600 leading-tight px-2">{shop.address}</div>
                <div className="text-[10px] font-bold text-stone-800">TEL: {shop.phone}</div>
                {taxSettings.taxIdValue && (
                  <div className="text-[9px] font-mono font-bold text-stone-700">
                    {taxSettings.taxIdLabel}: {taxSettings.taxIdValue}
                  </div>
                )}
              </div>

              {/* Artisan Crew Identification Banner */}
              <div className="border-t border-b border-stone-900 py-1 text-[11px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <span>SANDWICH ARTIST / CREW: {orderDetails.serverName || 'STAFF'}</span>
                  <span>TERM: 01</span>
                </div>
                <div className="flex justify-between">
                  <span>RECEIPT: {orderDetails.orderId}</span>
                  <span>DATE: {orderDetails.timestamp}</span>
                </div>
              </div>

              <div className="text-[11px] font-black uppercase grid grid-cols-12 py-0.5 border-b border-stone-900">
                <div className="col-span-7">ITEM & FRESH INGREDIENTS</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-3 text-right">TOTAL</div>
              </div>

              <div className="divide-y divide-dashed divide-stone-300 py-1 text-[11px] font-bold">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="py-1">
                      <div className="grid grid-cols-12">
                        <span className="col-span-7 truncate uppercase">{cartItem.item.name}</span>
                        <span className="col-span-2 text-center">{cartItem.quantity}</span>
                        <span className="col-span-3 text-right font-black">{(price * cartItem.quantity).toFixed(2)}</span>
                      </div>
                      <div className="pl-3 text-[9px] font-normal text-stone-600 space-y-0.5 mt-0.5">
                        <div>+ TOASTED MULTIGRAIN BREAD</div>
                        <div>+ CHEDDAR SLICE & CRISPY GREENS</div>
                        <div>+ SIGNATURE HOUSE SAUCE & DRESSING</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {orderDetails.showPromotionalBoxes && (
                <div className="border border-stone-300 rounded-lg p-3 my-1.5 bg-stone-100 text-center space-y-1.5">
                  <div className="text-xs font-black uppercase tracking-wide">{orderDetails.promotionalTitle || 'Promotion'}</div>
                  <div className="text-[10px] text-stone-700">{orderDetails.promotionalMessage}</div>
                </div>
              )}

              <div className="text-[11px] space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between">
                    <span>TAXES ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-1 my-1">
                <div className="flex justify-between items-baseline text-base sm:text-lg font-black">
                  <span>TOTAL:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[10px] font-bold flex justify-between">
                <span>PAYMENT METHOD: {orderDetails.paymentMethod.toUpperCase()}</span>
                <span>CHANGE: 0.00</span>
              </div>

              <div className="text-center text-[10px] font-bold border-t border-dashed border-stone-400 pt-1 space-y-0.5">
                <div>TELL US HOW WE DID! VISIT WWW.MYFEEDBACK.PAGE</div>
                <div className="text-[9px] text-stone-600 font-mono">DEMO TRANSACTION ID: NOT ISSUED</div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Deli QR" className="w-20 h-20 object-contain" />
                  <span className="text-[9px] font-bold uppercase mt-0.5 text-stone-600">Scan for Feedback & Free Treat</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 4: ARTISAN CAFE & ROASTERY (Barista & Stars)     */}
          {/* Always displays actual shop.name, never third-party brand  */}
          {/* ========================================================= */}
          {receiptStyle === 'starbucks_cafe' && (
            <div className="space-y-2.5 text-stone-900 font-sans">
              <div className="text-center space-y-0.5">
                <div className="text-lg font-black uppercase tracking-wider text-stone-950 flex items-center justify-center gap-1.5">
                  <span>☕</span>
                  <span>{shop.name}</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-600">ARTISANAL COFFEE & BAKEHOUSE</div>
                <div className="text-[10px] text-stone-500 px-2 leading-tight">{shop.address}</div>
                <div className="text-[10px] text-stone-600">Tel: {shop.phone}</div>
              </div>

              <div className="bg-stone-100 p-2 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Check</span>
                  <span className="font-extrabold text-stone-900">{orderDetails.orderId}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Barista</span>
                  <span className="font-semibold text-stone-800">{orderDetails.serverName || 'Priya'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Register</span>
                  <span className="font-semibold text-stone-800">POS-01</span>
                </div>
              </div>

              {/* Coffee Customization Items */}
              <div className="space-y-1.5 py-1">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="text-xs">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{cartItem.quantity}x {cartItem.item.name}</span>
                        <span>{taxSettings.currencySymbol}{(price * cartItem.quantity).toFixed(2)}</span>
                      </div>
                      {cartItem.notes && (
                        <div className="pl-3 text-[10px] text-stone-500 italic">{cartItem.notes}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-200 pt-2 space-y-1 text-xs font-semibold">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tax ({taxSettings.taxRate}%)</span>
                    <span>+{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-stone-300 pt-1 flex justify-between text-base font-extrabold text-stone-900">
                  <span>Total Amount Paid</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Cafe QR" className="w-18 h-18 object-contain" />
                  <span className="text-[9px] font-bold text-stone-500 uppercase mt-0.5">Scan to Collect Rewards</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 5: FINE DINING ELEGANCE (Serif, Tip Guide, Sign) */}
          {/* ========================================================= */}
          {receiptStyle === 'fine_dining' && (
            <div className="space-y-3 text-stone-900 font-serif leading-relaxed">
              <div className="text-center space-y-1 pb-2 border-b border-stone-300">
                <div className="text-[11px] tracking-widest uppercase text-stone-500 font-sans">✦ GUEST CHECK ✦</div>
                <h1 className="text-2xl font-bold tracking-tight text-black capitalize">
                  {shop.name}
                </h1>
                <p className="text-xs text-stone-700 italic px-2">{shop.address}</p>
                <p className="text-xs font-sans text-stone-600">Reservations & Enquiries: {shop.phone}</p>
                {taxSettings.taxIdValue && (
                  <p className="text-[10px] font-mono text-stone-500">
                    {taxSettings.taxIdLabel}: {taxSettings.taxIdValue}
                  </p>
                )}
              </div>

              <div className="font-sans text-xs flex justify-between border-b border-dashed border-stone-300 pb-2">
                <div>
                  <span className="font-bold text-stone-900 block">Table: {orderDetails.tableNo || 'Main Salon'}</span>
                  <span className="text-stone-500">Server: {orderDetails.serverName || 'Captain'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-stone-900 block">Bill #{orderDetails.orderId}</span>
                  <span className="text-stone-500">{orderDetails.timestamp}</span>
                </div>
              </div>

              <div className="space-y-2 py-1 font-sans text-xs">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="flex justify-between items-baseline">
                      <span className="font-semibold text-stone-900">
                        {cartItem.quantity} × {cartItem.item.name}
                      </span>
                      <span className="font-bold text-stone-900 font-serif">
                        {taxSettings.currencySymbol}{(price * cartItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-300 pt-2 space-y-1 font-sans text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tax ({taxSettings.taxRate}%)</span>
                    <span>+{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculation.serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Service Gratuity</span>
                    <span>+{taxSettings.currencySymbol}{calculation.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-stone-900 pt-1.5 flex justify-between text-base font-bold font-serif text-black">
                  <span>TOTAL BILLED:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Tip Suggestion Guide */}
              <div className="bg-stone-50 p-2 rounded border border-stone-200 text-center font-sans text-[10px] space-y-0.5">
                <span className="font-bold uppercase text-stone-600 block">Suggested Gratuity Guide:</span>
                <div className="flex justify-around font-semibold text-stone-800 pt-0.5">
                  <span>10%: {taxSettings.currencySymbol}{(calculation.grandTotal * 0.10).toFixed(2)}</span>
                  <span>15%: {taxSettings.currencySymbol}{(calculation.grandTotal * 0.15).toFixed(2)}</span>
                  <span>18%: {taxSettings.currencySymbol}{(calculation.grandTotal * 0.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 font-sans text-xs space-y-3">
                <div className="border-b border-stone-400 pb-1 flex justify-between text-stone-600">
                  <span>Guest Signature:</span>
                  <span className="text-stone-300">________________________</span>
                </div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1 font-sans">
                  <img src={qrCodeDataUrl} alt="Elegance QR" className="w-18 h-18 object-contain" />
                  <span className="text-[9px] text-stone-500 uppercase mt-0.5">Digital Check Verification</span>
                </div>
              )}

              <div className="text-center pt-1 text-xs italic text-stone-600">
                It was our pleasure hosting you at {shop.name}.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 6: ASIAN IZAKAYA / MINIMALIST (Clean Geometric)  */}
          {/* ========================================================= */}
          {receiptStyle === 'asian_minimal' && (
            <div className="space-y-2.5 text-stone-900 font-sans">
              <div className="border-2 border-stone-900 p-2 text-center space-y-0.5">
                <div className="text-xs uppercase tracking-widest text-stone-600">ORDER TICKET</div>
                <div className="text-xl font-black uppercase tracking-tight text-black">{shop.name}</div>
                <div className="text-[10px] text-stone-600">{shop.address}</div>
                <div className="text-[10px] font-mono">TEL: {shop.phone}</div>
              </div>

              <div className="grid grid-cols-2 text-[10px] font-mono border-b border-stone-900 pb-1">
                <div>CHECK: {orderDetails.orderId}</div>
                <div className="text-right">SEAT: {orderDetails.tableNo || 'COUNTER'}</div>
                <div>STAFF: {orderDetails.serverName || '01'}</div>
                <div className="text-right">{orderDetails.timestamp}</div>
              </div>

              {/* Minimal items list */}
              <div className="space-y-1 text-xs py-1">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="flex justify-between border-b border-stone-100 pb-1">
                      <span className="font-bold">
                        {cartItem.quantity} × {cartItem.item.name}
                      </span>
                      <span className="font-mono font-bold">
                        {(price * cartItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-stone-900 pt-1.5 space-y-0.5 font-mono text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>SUBTOTAL</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between text-stone-600">
                    <span>TAX ({taxSettings.taxRate}%)</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-black pt-1 border-t border-stone-900">
                  <span>TOTAL DUE</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Japanese/Asian Hanko/Stamp Box */}
              <div className="flex items-center justify-between border border-stone-900 p-2 my-2 bg-stone-50">
                <div className="text-[10px] font-mono space-y-0.5">
                  <span className="font-bold block">PAID VIA: {orderDetails.paymentMethod.toUpperCase()}</span>
                  <span className="text-stone-500">DEMO RECEIPT / NOT A PAYMENT RECORD</span>
                </div>
                <div className="w-10 h-10 border-2 border-amber-600 rounded text-amber-700 flex flex-col items-center justify-center font-black text-[8px] uppercase leading-none">
                  <span>DEMO</span>
                  <span>ONLY</span>
                </div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Asian QR" className="w-16 h-16 object-contain" />
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 7: SUPERMARKET RETAIL (Units Tally & Savings)    */}
          {/* ========================================================= */}
          {receiptStyle === 'supermarket_retail' && (
            <div className="font-receipt space-y-2 text-stone-900 text-[11px]">
              <div className="text-center space-y-0.5">
                <div className="text-xl font-black uppercase text-black">{shop.name}</div>
                <div className="text-[10px] font-bold">SUPERMARKET & RETAIL MART</div>
                <div className="text-[9px] text-stone-600">{shop.address}</div>
                <div className="text-[9px] font-mono">GSTIN/TIN: {taxSettings.taxIdValue || '07AAAAA0000A1Z5'}</div>
              </div>

              <div className="border-t border-b border-stone-800 py-1 font-bold space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>TAX INVOICE: {orderDetails.orderId}</span>
                  <span>POS: REG 04</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: {orderDetails.serverName || 'STAFF'}</span>
                  <span>DATE: {orderDetails.timestamp}</span>
                </div>
              </div>

              {/* Items grid */}
              <div className="border-b border-stone-900 py-0.5 font-black uppercase grid grid-cols-12">
                <span className="col-span-6">ITEM DESCRIPTION</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-right">RATE</span>
                <span className="col-span-2 text-right">TOTAL</span>
              </div>

              <div className="divide-y divide-dotted divide-stone-300 py-1 font-bold">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="grid grid-cols-12 py-0.5">
                      <span className="col-span-6 truncate uppercase">{cartItem.item.name}</span>
                      <span className="col-span-2 text-center">{cartItem.quantity} EA</span>
                      <span className="col-span-2 text-right">{price.toFixed(2)}</span>
                      <span className="col-span-2 text-right font-black">{(price * cartItem.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total Units Badge */}
              <div className="flex justify-between font-bold text-[10px] bg-stone-100 p-1 rounded">
                <span>TOTAL ITEM COUNT: {cart.length}</span>
                <span>TOTAL UNITS: {cart.reduce((s, c) => s + c.quantity, 0)} PCS</span>
              </div>

              <div className="space-y-0.5 font-bold pt-1">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between">
                    <span>TAXES APPLIED ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800">
                    <span>SAVINGS / STORE DISCOUNT:</span>
                    <span>-{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-1 flex justify-between items-baseline text-base font-black">
                <span>TOTAL AMOUNT:</span>
                <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
              </div>

              <div className="text-[10px] font-bold flex justify-between">
                <span>PAID: {orderDetails.paymentMethod.toUpperCase()}</span>
                <span>STATUS: {orderDetails.paymentStatus}</span>
              </div>

              {/* Barcode */}
              <div className="flex flex-col items-center pt-2">
                <div className="flex items-center justify-center gap-[2px] h-8 w-4/5 overflow-hidden">
                  {[2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3, 1, 2, 4].map((w, i) => (
                    <div key={i} className="h-full bg-black" style={{ width: `${w * 1.5}px` }} />
                  ))}
                </div>
                <span className="text-[8px] font-bold font-mono tracking-widest mt-0.5">*{orderDetails.orderId}*</span>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-1">
                  <img src={qrCodeDataUrl} alt="Retail QR" className="w-18 h-18 object-contain" />
                </div>
              )}

              <div className="text-center pt-1 text-[9px] font-bold uppercase">
                *** THANK YOU FOR SHOPPING AT {shop.name.toUpperCase()} ***
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 8: CLASSIC THERMAL (Standard Physical Thermal)   */}
          {/* ========================================================= */}
          {receiptStyle === 'classic_thermal' && (
            <div className="font-receipt space-y-2 text-stone-900">
              <div className="text-center space-y-1 pb-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight text-black">
                  {shop.name}
                </h1>
                <p className="text-[11px] sm:text-xs leading-snug px-1 text-stone-800 font-medium">{shop.address}</p>
                <p className="text-[11px] sm:text-xs font-bold text-stone-900">Tel: {shop.phone}</p>
                {orderDetails.showTagline && shop.tagline && <p className="text-[10px] italic text-stone-600">"{shop.tagline}"</p>}
                <div className="text-[10px] font-bold text-stone-800 pt-0.5 space-y-0.5">
                  {taxSettings.taxIdValue && <div>{taxSettings.taxIdLabel}: {taxSettings.taxIdValue}</div>}
                  {shop.fssaiNumber && <div>FSSAI Lic No: {shop.fssaiNumber}</div>}
                </div>
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                ===========================================
              </div>

              <div className="text-[11px] leading-tight space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>ORDER: {orderDetails.orderId}</span>
                  <span>TABLE: {orderDetails.tableNo || 'WALK-IN'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE: {orderDetails.timestamp}</span>
                  <span>TYPE: DINE-IN</span>
                </div>
                <div className="flex justify-between">
                  <span>SERVER: {orderDetails.serverName || 'Staff'}</span>
                  <span>POS: TERM-01</span>
                </div>
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                -------------------------------------------
              </div>

              <div className="text-[11px] font-black uppercase py-0.5 grid grid-cols-12 gap-1 border-b border-stone-900">
                <div className="col-span-6">ITEM</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-right">RATE</div>
                <div className="col-span-2 text-right">AMT</div>
              </div>

              <div className="divide-y divide-dashed divide-stone-300 py-1 text-[11px]">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  const total = price * cartItem.quantity;
                  return (
                    <div key={cartItem.id} className="py-1 grid grid-cols-12 gap-1 font-bold">
                      <div className="col-span-6 leading-tight break-words">
                        <span>{cartItem.item.name}</span>
                        {cartItem.notes && <span className="block text-[9px] font-normal italic text-stone-600">* {cartItem.notes}</span>}
                      </div>
                      <div className="col-span-2 text-center">{cartItem.quantity}</div>
                      <div className="col-span-2 text-right">{price.toFixed(2)}</div>
                      <div className="col-span-2 text-right font-black">{total.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center font-bold text-stone-800 select-none text-xs">
                -------------------------------------------
              </div>

              <div className="text-[11px] space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>DISCOUNT ({discount.type === 'percentage' ? `${discount.value}%` : 'FLAT'}):</span>
                    <span>-{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings.enabled && taxSettings.splitCgstSgst && (
                  <>
                    <div className="flex justify-between">
                      <span>CGST @ {(taxSettings.taxRate / 2).toFixed(1)}%:</span>
                      <span>+{calculation.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST @ {(taxSettings.taxRate / 2).toFixed(1)}%:</span>
                      <span>+{calculation.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {taxSettings.enabled && !taxSettings.splitCgstSgst && (
                  <div className="flex justify-between">
                    <span>{taxSettings.taxLabel.toUpperCase()} ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                {calculation.serviceChargeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>SERVICE CHARGE:</span>
                    <span>+{calculation.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                )}
                {orderDetails.roundOff && calculation.roundOffDelta !== 0 && (
                  <div className="flex justify-between">
                    <span>ROUND OFF:</span>
                    <span>{calculation.roundOffDelta >= 0 ? '+' : ''}{calculation.roundOffDelta.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-1.5 my-1.5">
                <div className="flex justify-between items-baseline text-base sm:text-lg font-black tracking-tight">
                  <span>TOTAL DUE:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] font-bold py-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>PAID VIA:</span>
                  <span className="uppercase">{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT STATUS:</span>
                  <span>{orderDetails.paymentStatus}</span>
                </div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center justify-center my-2 text-center pt-1">
                  <div className="p-1 border border-stone-900 bg-white inline-block">
                    <img src={qrCodeDataUrl} alt="Receipt QR Code" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
                  </div>
                  <span className="text-[9px] font-bold uppercase mt-1 text-stone-700">
                    {qrCodeType === 'upi' ? 'Scan to Pay via UPI' : qrCodeType === 'feedback' ? 'Scan to Leave Review' : 'Scan to Verify E-Invoice'}
                  </span>
                </div>
              )}

              <div className="text-center pt-2 pb-1 space-y-1 text-[10px] leading-tight">
                <div className="font-black text-xs uppercase tracking-wide">*** THANK YOU! VISIT AGAIN ***</div>
                <p className="text-stone-700 font-medium">Goods once sold will not be returned or exchanged.</p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 9: MODERN BISTRO — refined editorial receipt */}
          {receiptStyle === 'modern_bistro' && (
            <div className="space-y-3.5 text-stone-900 font-sans leading-snug">
              <div className="border-b-2 border-stone-900 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight break-words text-stone-950">
                      {shop.name}
                    </h1>
                    {orderDetails.showTagline && shop.tagline && (
                      <p className="mt-1 text-[11px] italic text-stone-500">{shop.tagline}</p>
                    )}
                  </div>
                  {orderDetails.tableNo && (
                    <span className="shrink-0 whitespace-nowrap rounded-md bg-stone-100 border border-stone-300 px-2.5 py-1 text-[10px] font-bold tracking-wide text-stone-700">
                      {orderDetails.tableNo}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-2 leading-relaxed break-words">{shop.address}</p>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-[10px] text-stone-600 mt-1.5">
                  {shop.phone && <span>Ph: {shop.phone}</span>}
                  {taxSettings.taxIdValue && <span className="break-all">{taxSettings.taxIdLabel}: {taxSettings.taxIdValue}</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-stone-100 border border-stone-200 px-3 py-2.5">
                <div className="min-w-0">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-500">Check no.</span>
                  <span className="block text-[11px] font-bold text-stone-900 break-words">{orderDetails.orderId}</span>
                </div>
                <div className="min-w-0 text-center">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-500">Server</span>
                  <span className="block text-[11px] font-semibold text-stone-800 break-words">{orderDetails.serverName || '—'}</span>
                </div>
                <div className="min-w-0 text-right">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-500">Date / time</span>
                  <span className="block text-[10px] font-semibold text-stone-800 break-words">{orderDetails.timestamp}</span>
                </div>
              </div>

              <div className="space-y-0">
                {cart.map((cartItem, index) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  const total = price * cartItem.quantity;
                  return (
                    <div key={cartItem.id} className={`flex items-start justify-between gap-3 py-2.5 ${index < cart.length - 1 ? 'border-b border-stone-200' : ''}`}>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-stone-900 leading-snug">
                          <span className="text-stone-500 font-medium mr-1">{cartItem.quantity} ×</span>{cartItem.item.name}
                        </div>
                        {cartItem.notes && <div className="mt-1 text-[10px] text-stone-500 italic break-words">{cartItem.notes}</div>}
                        <div className="mt-0.5 text-[10px] text-stone-500">{taxSettings.currencySymbol}{price.toFixed(2)} each</div>
                      </div>
                      <div className="shrink-0 whitespace-nowrap text-xs font-bold tabular-nums text-stone-900">
                        {taxSettings.currencySymbol}{total.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-300 pt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3 text-stone-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{taxSettings.currencySymbol}{calculation.subtotal.toFixed(2)}</span>
                </div>
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between gap-3 text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums">−{taxSettings.currencySymbol}{calculation.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings.enabled && taxSettings.splitCgstSgst ? (
                  <>
                    <div className="flex justify-between gap-3 text-stone-600"><span>CGST ({(taxSettings.taxRate / 2).toFixed(1)}%)</span><span className="tabular-nums">+{taxSettings.currencySymbol}{calculation.cgstAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between gap-3 text-stone-600"><span>SGST ({(taxSettings.taxRate / 2).toFixed(1)}%)</span><span className="tabular-nums">+{taxSettings.currencySymbol}{calculation.sgstAmount.toFixed(2)}</span></div>
                  </>
                ) : taxSettings.enabled ? (
                  <div className="flex justify-between gap-3 text-stone-600"><span>{taxSettings.taxLabel} ({taxSettings.taxRate}%)</span><span className="tabular-nums">+{taxSettings.currencySymbol}{calculation.totalTaxAmount.toFixed(2)}</span></div>
                ) : null}

                <div className="bg-stone-100 text-stone-900 border border-stone-200 rounded-lg px-3 py-2.5 mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase font-bold tracking-widest text-stone-500">Total payable</span>
                    <span className="block text-[10px] text-stone-600 mt-1">{orderDetails.paymentMethod} · {orderDetails.paymentStatus === 'PAID' ? 'Marked paid' : 'Payment pending'}</span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xl sm:text-2xl font-extrabold tracking-tight tabular-nums text-stone-900">
                    {taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {orderDetails.showPromotionalBoxes && (
                <div className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-800">{orderDetails.promotionalTitle || 'A note from us'}</div>
                  <div className="mt-1 text-[10px] text-stone-600">{orderDetails.promotionalMessage}</div>
                </div>
              )}

              {showQrCode && qrCodeDataUrl && (
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-3">
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-stone-800">Digital receipt</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Sample QR · scan to view configured demo destination</span>
                  </div>
                  <img src={qrCodeDataUrl} alt="Sample receipt QR code" className="w-14 h-14 object-contain shrink-0" />
                </div>
              )}
              <div className="border-t border-stone-200 pt-2 text-center text-[9px] text-stone-500">
                {orderDetails.footerNote || 'Thank you for visiting'}
                <div className="mt-1 uppercase tracking-wider">Sample receipt · not proof of payment</div>
              </div>
            </div>
          )}

          {/* TEMPLATE 10: RETRO DOT-MATRIX (90s Impact Pin Printer)    */}
          {/* ========================================================= */}
          {receiptStyle === 'retro_dotmatrix' && (
            <div className="font-dotmatrix text-black space-y-1.5 text-base leading-snug">
              <div className="text-center select-none text-sm">****************************************</div>
              <div className="text-center uppercase space-y-0.5">
                <div className="text-2xl font-bold tracking-widest">{shop.name}</div>
                <div className="text-sm">{shop.address}</div>
                <div className="text-sm">PHONE: {shop.phone}</div>
                {taxSettings.taxIdValue && <div className="text-sm">{taxSettings.taxIdLabel}: {taxSettings.taxIdValue}</div>}
              </div>
              <div className="text-center select-none text-sm">****************************************</div>

              <div className="text-sm space-y-0.5">
                <div className="flex justify-between">
                  <span>BILL NO: {orderDetails.orderId}</span>
                  <span>TBL: {orderDetails.tableNo || '00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE: {orderDetails.timestamp}</span>
                  <span>STAFF: {orderDetails.serverName || '01'}</span>
                </div>
              </div>

              <div className="text-center select-none text-sm">----------------------------------------</div>

              <div className="text-sm uppercase font-bold grid grid-cols-12 gap-1">
                <div className="col-span-6">DESCRIPTION</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-right">PRICE</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              <div className="text-sm uppercase space-y-0.5">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  const total = price * cartItem.quantity;
                  return (
                    <div key={cartItem.id} className="grid grid-cols-12 gap-1">
                      <div className="col-span-6 truncate">{cartItem.item.name}</div>
                      <div className="col-span-2 text-center">{cartItem.quantity}</div>
                      <div className="col-span-2 text-right">{price.toFixed(2)}</div>
                      <div className="col-span-2 text-right">{total.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center select-none text-sm">----------------------------------------</div>

              <div className="text-sm space-y-0.5 uppercase">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{calculation.subtotal.toFixed(2)}</span>
                </div>
                {taxSettings.enabled && (
                  <div className="flex justify-between">
                    <span>TAX ({taxSettings.taxRate}%):</span>
                    <span>+{calculation.totalTaxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="text-center select-none text-sm">========================================</div>

              <div className="flex justify-between text-2xl font-bold uppercase">
                <span>NET PAYABLE:</span>
                <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
              </div>

              <div className="text-center uppercase text-sm pt-1">
                <div>PAID BY: {orderDetails.paymentMethod}</div>
                <div>*** PLEASE VISIT AGAIN ***</div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center justify-center pt-2">
                  <img src={qrCodeDataUrl} alt="Dot Matrix QR" className="w-24 h-24 object-contain filter contrast-200" />
                  <span className="text-xs uppercase mt-1">SCAN FOR E-RECEIPT</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 11: COMPACT EXPRESS (Fast Food Counter Ticket)   */}
          {/* ========================================================= */}
          {receiptStyle === 'compact_express' && (
            <div className="font-receipt space-y-2 text-stone-900">
              <div className="bg-stone-100 text-stone-900 border border-stone-200 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">
                  ORDER TOKEN
                </span>
                <span className="text-3xl font-black tracking-tight text-stone-900 block">
                  #{orderDetails.orderId.replace('#ORD-', '') || '42'}
                </span>
                <span className="text-[10px] text-stone-600 font-medium">
                  {orderDetails.tableNo || 'TAKEAWAY EXPRESS'} • {orderDetails.timestamp}
                </span>
              </div>

              <div className="text-center py-1">
                <h3 className="font-black text-sm uppercase text-black">{shop.name}</h3>
                <p className="text-[10px] text-stone-600">{shop.address}</p>
              </div>

              <div className="border-t border-b border-stone-800 py-1 space-y-1 text-xs">
                {cart.map((cartItem) => {
                  const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                  return (
                    <div key={cartItem.id} className="flex justify-between font-bold">
                      <span>{cartItem.quantity}x {cartItem.item.name}</span>
                      <span>{(price * cartItem.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-baseline font-black text-base pt-1">
                <span>PAID:</span>
                <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex flex-col items-center pt-2">
                  <img src={qrCodeDataUrl} alt="Express QR" className="w-20 h-20 object-contain" />
                  <span className="text-[9px] font-bold text-stone-600 uppercase mt-0.5">Scan to Track Order</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TEMPLATE 12: GST TAX INVOICE (Formal Commercial Bill)     */}
          {/* ========================================================= */}
          {receiptStyle === 'gst_tax_invoice' && (
            <div className="text-[11px] font-sans text-stone-900 border-2 border-stone-900 p-2 space-y-2">
              <div className="text-center border-b border-stone-900 pb-1.5">
                <div className="text-xs font-black uppercase tracking-wider text-stone-900">TAX INVOICE</div>
                <div className="text-base font-black uppercase text-stone-950 mt-0.5">{shop.name}</div>
                <div className="text-[10px] leading-tight text-stone-700">{shop.address}</div>
                <div className="text-[10px] font-bold text-stone-900 mt-0.5">
                  GSTIN: {taxSettings.taxIdValue || '07AAAAA0000A1Z5'} | TEL: {shop.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-stone-900 pb-1.5">
                <div>
                  <span className="font-bold block">INVOICE NO: {orderDetails.orderId}</span>
                  <span>DATE: {orderDetails.timestamp}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold block">TABLE / PLACE: {orderDetails.tableNo || 'DINE-IN'}</span>
                  <span>STATE: 07 - DELHI / UT</span>
                </div>
              </div>

              <div className="border border-stone-900">
                <div className="grid grid-cols-12 text-[10px] font-black uppercase bg-stone-100 p-1 border-b border-stone-900">
                  <div className="col-span-6">ITEM & HSN</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-2 text-right">RATE</div>
                  <div className="col-span-2 text-right">TOTAL</div>
                </div>
                <div className="divide-y divide-stone-200">
                  {cart.map((cartItem) => {
                    const price = cartItem.customPrice !== undefined ? cartItem.customPrice : cartItem.item.price;
                    return (
                      <div key={cartItem.id} className="grid grid-cols-12 p-1 text-[10px] font-medium">
                        <div className="col-span-6 font-semibold">
                          {cartItem.item.name}
                          <span className="block text-[8px] text-stone-500">HSN: 996331</span>
                        </div>
                        <div className="col-span-2 text-center">{cartItem.quantity}</div>
                        <div className="col-span-2 text-right">{price.toFixed(2)}</div>
                        <div className="col-span-2 text-right font-bold">{(price * cartItem.quantity).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-stone-900 p-1.5 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>TAXABLE VALUE:</span>
                  <span className="font-bold">{calculation.taxableAmount.toFixed(2)}</span>
                </div>
                {taxSettings.splitCgstSgst && (
                  <>
                    <div className="flex justify-between">
                      <span>CENTRAL TAX (CGST @ {(taxSettings.taxRate / 2).toFixed(1)}%):</span>
                      <span className="font-bold">{calculation.cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>STATE TAX (SGST @ {(taxSettings.taxRate / 2).toFixed(1)}%):</span>
                      <span className="font-bold">{calculation.sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-stone-900 pt-1 flex justify-between font-black text-xs">
                  <span>TOTAL INVOICE VALUE:</span>
                  <span>{taxSettings.currencySymbol}{calculation.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {showQrCode && qrCodeDataUrl && (
                <div className="flex items-center justify-between border-t border-stone-900 pt-1.5">
                  <div className="text-[9px]">
                    <span className="font-bold block">IRN / DIGITAL SIGNATURE</span>
                    <span>Valid under Section 31 of CGST Act</span>
                  </div>
                  <img src={qrCodeDataUrl} alt="GST QR" className="w-14 h-14 object-contain" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

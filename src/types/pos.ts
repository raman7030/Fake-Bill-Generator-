export type TaxCountry = 'IN' | 'US' | 'AE' | 'GB' | 'AU' | 'OTHER';

export type ReceiptStyle =
  | 'classic_thermal'    // Standard 80mm/58mm thermal paper with dashed lines
  | 'kfc_style'          // Fastfood Franchise Layout (Bold order banner, meal breakdown, feedback survey code)
  | 'dominos_style'      // Pizzeria Tracker Layout (Tracker ID, box count, quality guarantee)
  | 'subway_style'       // Fresh Deli Sandwich Layout (Artisan line, customization options, loyalty tokens)
  | 'starbucks_cafe'     // Cafe & Roastery Layout (Barista callout, beverage modifiers, loyalty stars)
  | 'fine_dining'        // Fine Dining / Courtyard Elegance (Classic serif, ornaments, gratuity guide)
  | 'asian_minimal'      // Asian Izakaya / Minimalist (Clean geometric lines, stamp box, compact spacing)
  | 'supermarket_retail' // Retail / Supermarket Mart (Item counts, savings banner, double barcode)
  | 'modern_bistro'      // Clean contemporary sans-serif bistro receipt
  | 'retro_dotmatrix'    // 90s vintage dot matrix pin printer style with VT323 font
  | 'compact_express'    // High-speed takeaway counter ticket with large token badge
  | 'gst_tax_invoice'    // Formal boxed GST Tax Invoice with seller/buyer details
  | 'delivery_card'      // Premium delivery-app-inspired order summary
  | 'delivery_minimal'   // Minimal delivery receipt
  | 'delivery_dark';     // Dark-header delivery receipt

export type QrCodeType = 'upi' | 'verify' | 'feedback';

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  taxId: string; // GSTIN / TRN / EIN / VAT
  tagline: string;
  fssaiNumber?: string;
  logoUrl?: string;
  source: 'google_places' | 'custom' | 'preset';
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  city?: 'Chandigarh' | 'Ludhiana' | 'Delhi' | 'Amritsar' | string;
  cuisine?: string;
  restaurantKey?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  isVeg: boolean;
  image?: string;
  popular?: boolean;
  restaurantOrigin?: string; // e.g. "Pal Dhaba (Chandigarh)"
  areaBadge?: string;        // e.g. "Chandigarh Iconic" or "Ludhiana Legend"
}

export interface CartItem {
  id: string; // unique cart line id
  item: MenuItem;
  quantity: number;
  customPrice?: number;
  notes?: string;
}

export interface TaxSettings {
  country: TaxCountry;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number; // percentage
  taxLabel: string;
  splitCgstSgst: boolean;
  enabled: boolean;
  taxIdLabel: string;
  taxIdValue: string;
}

export interface DiscountSettings {
  enabled: boolean;
  type: 'percentage' | 'flat';
  value: number;
}

export interface ServiceChargeSettings {
  enabled: boolean;
  type: 'percentage' | 'flat';
  value: number;
}

export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Net Banking' | 'Wallet';

export interface OrderDetails {
  orderId: string;
  timestamp: string;
  tableNo: string;
  serverName: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING';
  roundOff: boolean;
  paperWidth: '58mm' | '80mm';
  receiptStyle: ReceiptStyle;
  showQrCode: boolean;
  qrCodeType: QrCodeType;
  footerNote: string;
  showTagline: boolean;
  showPromotionalBoxes: boolean;
  promotionalTitle: string;
  promotionalMessage: string;
}

export interface BillCalculation {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
  serviceChargeAmount: number;
  rawTotal: number;
  roundOffDelta: number;
  grandTotal: number;
}

export interface SavedBill {
  id: string;
  orderId: string;
  timestamp: string;
  shop: ShopInfo;
  cart: CartItem[];
  taxSettings: TaxSettings;
  discount: DiscountSettings;
  serviceCharge: ServiceChargeSettings;
  orderDetails: OrderDetails;
  calculation: BillCalculation;
  createdAt: number;
}

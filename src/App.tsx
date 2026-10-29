/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  CartItem,
  DiscountSettings,
  MenuItem,
  OrderDetails,
  SavedBill,
  ServiceChargeSettings,
  ShopInfo,
  TaxSettings,
} from './types/pos';
import {
  COUNTRY_TAX_PRESETS,
  INITIAL_MENU_ITEMS,
  INITIAL_SAVED_BILLS,
  PRESET_SHOPS,
} from './data/presetData';
import { calculateBill } from './utils/taxCalculator';
import { ShopHeaderBar } from './components/ShopHeaderBar';
import { MenuCatalog } from './components/MenuCatalog';
import { FloatingCartBanner } from './components/FloatingCartBanner';
import { ReviewBill } from './components/ReviewBill';
import { ThermalReceipt } from './components/ThermalReceipt';
import { PastBillsView } from './components/PastBillsView';
import { PlaceSearchModal } from './components/PlaceSearchModal';
import { AddCustomItemModal } from './components/AddCustomItemModal';
import { EditShopModal } from './components/EditShopModal';
import { MenuSelectorModal } from './components/MenuSelectorModal';
import {
  getPublicMenuForRestaurant,
  MASTER_ALL_MENU_ITEMS,
  FamousRestaurantProfile,
} from './data/famousRestaurantsData';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const STORAGE_KEY_BILLS = 'zestypos_saved_bills_v2';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'menu' | 'review' | 'receipt' | 'history'>('menu');

  // Google Maps Quota Warning State (Mandatory Tier 2 Quota Defense)
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Shop / Restaurant Details
  const [shop, setShop] = useState<ShopInfo>(PRESET_SHOPS[0]);
  const [isPlaceSearchOpen, setIsPlaceSearchOpen] = useState(false);
  const [isEditShopOpen, setIsEditShopOpen] = useState(false);

  // Menu items list and public menu source tracking
  const initialResolvedMenu = getPublicMenuForRestaurant(PRESET_SHOPS[0]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialResolvedMenu.menu);
  const [activeMenuSourceLabel, setActiveMenuSourceLabel] = useState<string>(initialResolvedMenu.sourceLabel);
  const [isMasterMenuLoaded, setIsMasterMenuLoaded] = useState<boolean>(false);
  const [isMenuSelectorOpen, setIsMenuSelectorOpen] = useState(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

  // Saved Bills History state (persisted in localStorage)
  const [savedBills, setSavedBills] = useState<SavedBill[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BILLS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading bills from localStorage:', e);
    }
    return [];
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(savedBills));
    } catch (e) {
      console.error('Error saving bills to localStorage:', e);
    }
  }, [savedBills]);

  // Start with an empty cart so a newly opened session doesn't imply a real order.
  const [cart, setCart] = useState<CartItem[]>([]);

  // Tax Engine Settings (Default: India with GST 5% CGST/SGST split)
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(COUNTRY_TAX_PRESETS.IN);

  // Discount Settings
  const [discount, setDiscount] = useState<DiscountSettings>({
    enabled: false,
    type: 'percentage',
    value: 10,
  });

  // Service Charge Settings
  const [serviceCharge, setServiceCharge] = useState<ServiceChargeSettings>({
    enabled: false,
    type: 'percentage',
    value: 5,
  });

  // Format initial current time
  const formatCurrentTimestamp = () => {
    const d = new Date();
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Order Details
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    orderId: `#ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: formatCurrentTimestamp(),
    tableNo: 'T-04',
    serverName: 'Vikram S.',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    roundOff: true,
    paperWidth: '80mm',
    receiptStyle: 'classic_thermal',
    showQrCode: true,
    qrCodeType: 'upi',
    footerNote: 'Thank you! Visit Again',
  });

  const handleUpdateOrderDetails = useCallback((updates: Partial<OrderDetails>) => {
    setOrderDetails((prev) => ({ ...prev, ...updates }));
  }, []);

  // Listen to 'gmp-quota-exceeded' event
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Update Cart Quantity
  const handleUpdateQuantity = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (!existing) {
        if (delta > 0) {
          return [...prev, { id: `cart-${Date.now()}`, item, quantity: delta }];
        }
        return prev;
      }

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => c.item.id !== item.id);
      }

      return prev.map((c) => (c.item.id === item.id ? { ...c, quantity: newQty } : c));
    });
  };

  // Update inline cart line in Review screen
  const handleUpdateCartItem = (
    id: string,
    updates: Partial<{ name: string; price: number; quantity: number }>
  ) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedItem = { ...c.item };
        let updatedPrice = c.customPrice !== undefined ? c.customPrice : c.item.price;

        if (updates.name !== undefined) {
          updatedItem.name = updates.name;
        }
        if (updates.price !== undefined) {
          updatedPrice = updates.price;
        }

        return {
          ...c,
          item: updatedItem,
          customPrice: updatedPrice,
          quantity: updates.quantity !== undefined ? updates.quantity : c.quantity,
        };
      })
    );
  };

  // Remove cart line
  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // Add new empty line item in Review screen
  const handleAddNewLineItem = () => {
    const customDish: MenuItem = {
      id: `line-${Date.now()}`,
      name: 'Special Item',
      category: 'Custom',
      price: 100,
      isVeg: true,
      popular: false,
    };
    setCart((prev) => [
      ...prev,
      {
        id: `cart-${Date.now()}`,
        item: customDish,
        quantity: 1,
      },
    ]);
  };

  // Add custom dish from Modal to menu and optionally to cart
  const handleAddCustomItem = (newItem: MenuItem, qty: number) => {
    setMenuItems((prev) => {
      if (prev.some((d) => d.id === newItem.id)) return prev;
      return [newItem, ...prev];
    });
    if (qty > 0) {
      setCart((prev) => [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          item: newItem,
          quantity: qty,
        },
      ]);
    }
  };

  // Remove dish directly from active menu
  const handleRemoveDish = (dishId: string) => {
    setMenuItems((prev) => prev.filter((d) => d.id !== dishId));
  };

  // Reset menu back to complete master catalog
  const handleResetMenu = () => {
    setMenuItems(MASTER_ALL_MENU_ITEMS);
    setActiveMenuSourceLabel(`All Punjab & Famous Indian Dishes (${MASTER_ALL_MENU_ITEMS.length})`);
    setIsMasterMenuLoaded(true);
  };

  // Update shop details and automatically load its public menu / area delicacies
  const handleSelectShop = (newShop: ShopInfo) => {
    setShop(newShop);
    if (newShop.taxId) {
      setTaxSettings((prev) => ({ ...prev, taxIdValue: newShop.taxId }));
    }

    // Auto-load public menu of selected restaurant or area delicacies!
    const resolved = getPublicMenuForRestaurant(newShop);
    setMenuItems(resolved.menu);
    setActiveMenuSourceLabel(resolved.sourceLabel);
    setIsMasterMenuLoaded(false);
  };

  // Select a specific famous restaurant profile
  const handleSelectRestaurantProfile = (
    profile: FamousRestaurantProfile,
    updateShopInfo: boolean
  ) => {
    if (updateShopInfo) {
      setShop(profile.shop);
      if (profile.shop.taxId) {
        setTaxSettings((prev) => ({ ...prev, taxIdValue: profile.shop.taxId }));
      }
    }
    setMenuItems(profile.dishes);
    setActiveMenuSourceLabel(`Public Verified Menu: ${profile.shop.name}`);
    setIsMasterMenuLoaded(false);
  };

  // Toggle between active restaurant-specific menu and full master menu
  const handleToggleMasterMenu = () => {
    if (isMasterMenuLoaded) {
      const resolved = getPublicMenuForRestaurant(shop);
      setMenuItems(resolved.menu);
      setActiveMenuSourceLabel(resolved.sourceLabel);
      setIsMasterMenuLoaded(false);
    } else {
      setMenuItems(MASTER_ALL_MENU_ITEMS);
      setActiveMenuSourceLabel(`All Punjab & Famous Indian Dishes (${MASTER_ALL_MENU_ITEMS.length})`);
      setIsMasterMenuLoaded(true);
    }
  };

  // Save current order into history
  const handleSaveCurrentBill = () => {
    const calc = calculateBill(cart, taxSettings, discount, serviceCharge, orderDetails.roundOff);
    const newBill: SavedBill = {
      id: `bill-${Date.now()}`,
      orderId: orderDetails.orderId,
      timestamp: orderDetails.timestamp,
      shop: { ...shop },
      cart: JSON.parse(JSON.stringify(cart)),
      taxSettings: { ...taxSettings },
      discount: { ...discount },
      serviceCharge: { ...serviceCharge },
      orderDetails: { ...orderDetails },
      calculation: calc,
      createdAt: Date.now(),
    };

    setSavedBills((prev) => {
      // If order with same ID exists, update it, else prepend
      const existingIdx = prev.findIndex((b) => b.orderId === orderDetails.orderId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newBill;
        return copy;
      }
      return [newBill, ...prev];
    });
  };

  // Edit a previous bill (loads into Review Bill Editor)
  const handleEditPreviousBill = (bill: SavedBill) => {
    setShop(bill.shop);
    setCart(JSON.parse(JSON.stringify(bill.cart)));
    setTaxSettings(bill.taxSettings);
    setDiscount(bill.discount);
    setServiceCharge(bill.serviceCharge);
    setOrderDetails({
      ...bill.orderDetails,
    });
    setCurrentView('review');
  };

  // View a previous receipt directly
  const handleViewPreviousReceipt = (bill: SavedBill) => {
    setShop(bill.shop);
    setCart(JSON.parse(JSON.stringify(bill.cart)));
    setTaxSettings(bill.taxSettings);
    setDiscount(bill.discount);
    setServiceCharge(bill.serviceCharge);
    setOrderDetails({
      ...bill.orderDetails,
    });
    setCurrentView('receipt');
  };

  // Delete bill from history
  const handleDeleteBill = (billId: string) => {
    setSavedBills((prev) => prev.filter((b) => b.id !== billId));
  };

  // Start fresh order
  const handleCreateNewOrder = () => {
    setCart([]);
    setOrderDetails((prev) => ({
      ...prev,
      orderId: `#ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: formatCurrentTimestamp(),
      tableNo: 'T-01',
      customerName: '',
      customerPhone: '',
    }));
    setCurrentView('menu');
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
        {/* Tier 2 Client-Side Quota Defense Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Global Shop Header Bar */}
        <ShopHeaderBar
          shop={shop}
          onOpenSearch={() => setIsPlaceSearchOpen(true)}
          onOpenEdit={() => setIsEditShopOpen(true)}
          currencySymbol={taxSettings.currencySymbol}
        />

        {/* Navigation View Switcher (Tabs) */}
        <div className="bg-white border-b border-stone-200/70 sticky top-14 sm:top-16 z-30 shadow-2xs">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
            <div className="flex gap-1 py-1.5 whitespace-nowrap">
              <button
                onClick={() => setCurrentView('menu')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'menu'
                    ? 'bg-rose-50 text-rose-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                1. Food Menu & Cart
              </button>
              <button
                onClick={() => setCurrentView('review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'review'
                    ? 'bg-rose-50 text-rose-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                2. Live Bill Editor ({cart.reduce((s, c) => s + c.quantity, 0)})
              </button>
              <button
                onClick={() => {
                  handleSaveCurrentBill();
                  setCurrentView('receipt');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'receipt'
                    ? 'bg-rose-50 text-rose-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                3. Thermal Receipt
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'history'
                    ? 'bg-rose-50 text-rose-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                4. Order History ({savedBills.length})
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'menu' && (
            <>
              <MenuCatalog
                items={menuItems}
                cart={cart}
                currencySymbol={taxSettings.currencySymbol}
                currentShop={shop}
                activeMenuSourceLabel={activeMenuSourceLabel}
                isMasterMenuLoaded={isMasterMenuLoaded}
                onUpdateQuantity={handleUpdateQuantity}
                onOpenAddCustom={() => setIsAddCustomOpen(true)}
                onOpenMenuSelector={() => setIsMenuSelectorOpen(true)}
                onToggleMasterMenu={handleToggleMasterMenu}
                onRemoveDish={handleRemoveDish}
                onResetMenu={handleResetMenu}
              />
              <FloatingCartBanner
                cart={cart}
                currencySymbol={taxSettings.currencySymbol}
                onReviewBill={() => setCurrentView('review')}
              />
            </>
          )}

          {currentView === 'review' && (
            <ReviewBill
              shop={shop}
              cart={cart}
              taxSettings={taxSettings}
              discount={discount}
              serviceCharge={serviceCharge}
              orderDetails={orderDetails}
              onUpdateCartItem={handleUpdateCartItem}
              onRemoveCartItem={handleRemoveCartItem}
              onAddNewLineItem={handleAddNewLineItem}
              onUpdateTaxSettings={setTaxSettings}
              onUpdateDiscount={setDiscount}
              onUpdateServiceCharge={setServiceCharge}
              onUpdateOrderDetails={handleUpdateOrderDetails}
              onBackToMenu={() => setCurrentView('menu')}
              onGenerateReceipt={() => {
                handleSaveCurrentBill();
                setCurrentView('receipt');
              }}
              onOpenEditShop={() => setIsEditShopOpen(true)}
            />
          )}

          {currentView === 'receipt' && (
            <ThermalReceipt
              shop={shop}
              cart={cart}
              taxSettings={taxSettings}
              discount={discount}
              serviceCharge={serviceCharge}
              orderDetails={orderDetails}
              onUpdateOrderDetails={handleUpdateOrderDetails}
              onBackToReview={() => setCurrentView('review')}
              onSaveToHistory={handleSaveCurrentBill}
            />
          )}

          {currentView === 'history' && (
            <PastBillsView
              bills={savedBills}
              onEditBill={handleEditPreviousBill}
              onViewReceipt={handleViewPreviousReceipt}
              onDeleteBill={handleDeleteBill}
              onCreateNewBill={handleCreateNewOrder}
            />
          )}
        </main>

        {/* Edit Selected Restaurant Details Modal */}
        <EditShopModal
          isOpen={isEditShopOpen}
          onClose={() => setIsEditShopOpen(false)}
          shop={shop}
          onSaveShop={handleSelectShop}
        />

        {/* Google Places Venue Search Modal */}
        <PlaceSearchModal
          isOpen={isPlaceSearchOpen}
          onClose={() => setIsPlaceSearchOpen(false)}
          currentShop={shop}
          onSelectShop={handleSelectShop}
        />

        {/* Add Custom Dish / Item Modal */}
        <AddCustomItemModal
          isOpen={isAddCustomOpen}
          onClose={() => setIsAddCustomOpen(false)}
          currencySymbol={taxSettings.currencySymbol}
          onAddItem={handleAddCustomItem}
        />

        {/* Restaurant Public Menu Selector Modal */}
        <MenuSelectorModal
          isOpen={isMenuSelectorOpen}
          onClose={() => setIsMenuSelectorOpen(false)}
          currentShop={shop}
          activeMenuSourceLabel={activeMenuSourceLabel}
          onSelectRestaurantProfile={handleSelectRestaurantProfile}
          onLoadMasterCatalog={() => {
            setMenuItems(MASTER_ALL_MENU_ITEMS);
            setActiveMenuSourceLabel(`Full Master Catalog (${MASTER_ALL_MENU_ITEMS.length} Dishes)`);
            setIsMasterMenuLoaded(true);
          }}
        />
      </div>
    </APIProvider>
  );
}

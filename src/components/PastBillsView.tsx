import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Edit,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Store,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { SavedBill } from '../types/pos';

interface PastBillsViewProps {
  bills: SavedBill[];
  onEditBill: (bill: SavedBill) => void;
  onViewReceipt: (bill: SavedBill) => void;
  onDeleteBill: (billId: string) => void;
  onCreateNewBill: () => void;
}

export const PastBillsView: React.FC<PastBillsViewProps> = ({
  bills,
  onEditBill,
  onViewReceipt,
  onDeleteBill,
  onCreateNewBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (selectedMethod !== 'All' && b.orderDetails.paymentMethod !== selectedMethod) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = b.orderId.toLowerCase().includes(query);
        const matchesCustomer = b.orderDetails.customerName.toLowerCase().includes(query);
        const matchesTable = b.orderDetails.tableNo.toLowerCase().includes(query);
        const matchesShop = b.shop.name.toLowerCase().includes(query);
        const matchesItems = b.cart.some((c) => c.item.name.toLowerCase().includes(query));
        return matchesId || matchesCustomer || matchesTable || matchesShop || matchesItems;
      }
      return true;
    });
  }, [bills, searchTerm, selectedMethod]);

  // Analytics summary
  const totalRevenue = useMemo(() => {
    return bills.reduce((acc, b) => acc + b.calculation.grandTotal, 0);
  }, [bills]);

  const avgOrderValue = bills.length > 0 ? totalRevenue / bills.length : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 leading-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>Order History & Past Bills</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            View, re-print, duplicate, or edit previously generated receipts
          </p>
        </div>

        <button
          onClick={onCreateNewBill}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Bill / POS</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-5">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="text-xl sm:text-2xl font-black text-stone-900 mt-1 block">
            {bills.length}
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Revenue
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
            ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Avg Order
          </span>
          <span className="text-xl sm:text-2xl font-black text-stone-800 mt-1 block">
            ₹{avgOrderValue.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs mb-4 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID (#ORD-...), customer name, dish, or table..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:border-rose-500 outline-hidden"
          />
        </div>

        {/* Payment Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-stone-400 px-1">Payment:</span>
          {['All', 'UPI', 'Cash', 'Card', 'Net Banking', 'Wallet'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMethod(mode)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                selectedMethod === mode
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-700">No previous bills found</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-4">
            Orders generated from the POS or Review screen will appear here automatically for fast re-printing and editing.
          </p>
          <button
            onClick={onCreateNewBill}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Create Your First Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBills.map((bill) => {
            const itemCount = bill.cart.reduce((sum, c) => sum + c.quantity, 0);

            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Info & Shop */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-stone-900 font-mono">
                      {bill.orderId}
                    </span>
                    <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                      {bill.orderDetails.tableNo || 'Walk-in'}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CreditCard className="w-2.5 h-2.5" />
                      {bill.orderDetails.paymentMethod}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 font-medium flex items-center gap-1.5 truncate">
                    <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{bill.shop.name}</span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-stone-500 mt-1 line-clamp-1">
                    <span className="font-semibold text-stone-700">{itemCount} items: </span>
                    {bill.cart.map((c) => `${c.quantity}x ${c.item.name}`).join(', ')}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {bill.timestamp}
                    </span>
                    {bill.orderDetails.customerName && (
                      <span>• Cust: {bill.orderDetails.customerName}</span>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 gap-2 shrink-0">
                  <div className="text-base sm:text-lg font-black text-stone-900">
                    {bill.taxSettings.currencySymbol}
                    {bill.calculation.grandTotal.toFixed(2)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Bill Button */}
                    <button
                      onClick={() => onEditBill(bill)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Load and edit items in Live Bill Editor"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Bill</span>
                    </button>

                    {/* View Receipt Button */}
                    <button
                      onClick={() => onViewReceipt(bill)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Preview and print receipt"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

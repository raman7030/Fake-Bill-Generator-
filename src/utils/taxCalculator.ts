import { BillCalculation, CartItem, DiscountSettings, ServiceChargeSettings, TaxSettings } from '../types/pos';

export function calculateBill(
  cart: CartItem[],
  taxSettings: TaxSettings,
  discount: DiscountSettings,
  serviceCharge: ServiceChargeSettings,
  roundOffEnabled: boolean
): BillCalculation {
  // 1. Calculate subtotal
  const subtotal = cart.reduce((acc, item) => {
    const unitPrice = item.customPrice !== undefined ? item.customPrice : item.item.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  // 2. Calculate discount
  let discountAmount = 0;
  if (discount.enabled && discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }
  }

  // 3. Taxable amount
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // 4. Taxes
  let cgstAmount = 0;
  let sgstAmount = 0;
  let totalTaxAmount = 0;

  if (taxSettings.enabled && taxSettings.taxRate > 0) {
    if (taxSettings.splitCgstSgst) {
      // India GST: equal split into CGST and SGST
      const halfRate = taxSettings.taxRate / 2;
      cgstAmount = (taxableAmount * halfRate) / 100;
      sgstAmount = (taxableAmount * halfRate) / 100;
      totalTaxAmount = cgstAmount + sgstAmount;
    } else {
      totalTaxAmount = (taxableAmount * taxSettings.taxRate) / 100;
    }
  }

  // 5. Service Charge
  let serviceChargeAmount = 0;
  if (serviceCharge.enabled && serviceCharge.value > 0) {
    if (serviceCharge.type === 'percentage') {
      serviceChargeAmount = (taxableAmount * serviceCharge.value) / 100;
    } else {
      serviceChargeAmount = serviceCharge.value;
    }
  }

  // 6. Raw Total
  const rawTotal = taxableAmount + totalTaxAmount + serviceChargeAmount;

  // 7. Round Off (Classic math: >= 0.5 rounds up, < 0.5 rounds down)
  let grandTotal = rawTotal;
  let roundOffDelta = 0;

  if (roundOffEnabled) {
    grandTotal = Math.round(rawTotal);
    roundOffDelta = grandTotal - rawTotal;
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    serviceChargeAmount: Number(serviceChargeAmount.toFixed(2)),
    rawTotal: Number(rawTotal.toFixed(2)),
    roundOffDelta: Number(roundOffDelta.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

import { CartItem, CartCalculation, DiscountPromotion, Product, TaxRule } from '../types';
import { TaxModel } from '../models/TaxModel';
import { DiscountModel } from '../models/DiscountModel';

const CART_STORAGE_KEY = 'd2_supermarket_cart_items';
const PROMO_STORAGE_KEY = 'd2_supermarket_applied_promo';

export class CartController {
  static getCartItems(): { product: Product; quantity: number }[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveCartItems(items: { product: Product; quantity: number }[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart items:', e);
    }
  }

  static getAppliedPromo(): DiscountPromotion | null {
    try {
      const data = localStorage.getItem(PROMO_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveAppliedPromo(promo: DiscountPromotion | null): void {
    try {
      if (promo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist promo:', e);
    }
  }

  static addToCart(product: Product, quantity: number = 1): { product: Product; quantity: number }[] {
    const current = this.getCartItems();
    const existingIndex = current.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const newQty = current[existingIndex].quantity + quantity;
      current[existingIndex].quantity = Math.min(newQty, product.stock);
      current[existingIndex].product = product; // Update with latest product details
    } else {
      current.push({
        product,
        quantity: Math.min(quantity, product.stock),
      });
    }

    this.saveCartItems(current);
    return current;
  }

  static updateQuantity(productId: string, quantity: number): { product: Product; quantity: number }[] {
    let current = this.getCartItems();
    if (quantity <= 0) {
      current = current.filter(i => i.product.id !== productId);
    } else {
      const item = current.find(i => i.product.id === productId);
      if (item) {
        item.quantity = Math.min(quantity, item.product.stock);
      }
    }
    this.saveCartItems(current);
    return current;
  }

  static removeFromCart(productId: string): { product: Product; quantity: number }[] {
    const current = this.getCartItems().filter(i => i.product.id !== productId);
    this.saveCartItems(current);
    return current;
  }

  static clearCart(): { product: Product; quantity: number }[] {
    this.saveCartItems([]);
    this.saveAppliedPromo(null);
    return [];
  }

  static applyCoupon(
    code: string, 
    availablePromos: DiscountPromotion[], 
    cartItems: { product: Product; quantity: number }[]
  ): { success: boolean; promo?: DiscountPromotion; message?: string } {
    const match = availablePromos.find(
      p => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );

    if (!match) {
      return { success: false, message: 'Código de cupón inválido o inactivo.' };
    }

    // Check expiry date
    if (match.validUntil && new Date(match.validUntil) < new Date()) {
      return { success: false, message: 'Este cupón ha expirado.' };
    }

    // Check min spend
    const subtotal = cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
    if (subtotal < match.minSpend) {
      return { 
        success: false, 
        message: `Este cupón requiere una compra mínima de $${match.minSpend.toLocaleString('es-CO')}.` 
      };
    }

    this.saveAppliedPromo(match);
    return { 
      success: true, 
      promo: match, 
      message: `¡Cupón "${match.code}" aplicado con éxito!` 
    };
  }

  static removeCoupon(): void {
    this.saveAppliedPromo(null);
  }

  static calculateCart(
    items: { product: Product; quantity: number }[],
    taxes: TaxRule[],
    appliedPromo: DiscountPromotion | null | undefined,
    freeShippingThreshold: number = 70000,
    standardShippingFee: number = 5000
  ): CartCalculation {
    let subtotal = 0;
    const computedItems: CartItem[] = [];

    // 1. Calculate raw subtotal and per-item base
    for (const item of items) {
      const itemSubtotal = item.product.price * item.quantity;
      subtotal += itemSubtotal;

      const { rate } = TaxModel.getTaxRateForProduct(item.product.taxRateId, taxes);

      computedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: itemSubtotal,
        discountAmount: 0,
        taxAmount: 0,
        taxRate: rate,
        total: itemSubtotal,
      });
    }

    // 2. Calculate promo discount
    const { discountTotal } = DiscountModel.calculateDiscountAmount(appliedPromo, computedItems, subtotal);

    // Distribute discount proportionally across eligible items
    if (discountTotal > 0 && subtotal > 0) {
      for (let i = 0; i < computedItems.length; i++) {
        const it = computedItems[i];
        let isEligible = true;
        if (appliedPromo?.categoryId && it.product.categoryId !== appliedPromo.categoryId) {
          isEligible = false;
        }

        if (isEligible) {
          const proportion = it.subtotal / subtotal;
          const itemDiscount = Math.min(Math.round(discountTotal * proportion), it.subtotal);
          it.discountAmount = itemDiscount;
        }
      }
    }

    // 3. Calculate taxes grouped by tax rule
    const taxMap = new Map<string, { taxId: string; name: string; rate: number; taxableAmount: number; amount: number }>();

    for (const it of computedItems) {
      const discountedItemBase = Math.max(0, it.subtotal - it.discountAmount);
      const taxAmount = Math.round(discountedItemBase * it.taxRate);
      it.taxAmount = taxAmount;
      it.total = discountedItemBase + taxAmount;

      const taxRule = taxes.find(t => t.id === it.product.taxRateId) || taxes.find(t => t.isDefault) || taxes[0];
      const taxKey = taxRule ? taxRule.id : 'default_tax';
      const taxName = taxRule ? taxRule.name : `IVA (${(it.taxRate * 100).toFixed(0)}%)`;

      if (!taxMap.has(taxKey)) {
        taxMap.set(taxKey, {
          taxId: taxKey,
          name: taxName,
          rate: it.taxRate,
          taxableAmount: 0,
          amount: 0,
        });
      }

      const entry = taxMap.get(taxKey)!;
      entry.taxableAmount += discountedItemBase;
      entry.amount += taxAmount;
    }

    const taxDetails = Array.from(taxMap.values()).filter(t => t.amount > 0 || t.rate === 0);
    const taxTotal = Array.from(taxMap.values()).reduce((sum, t) => sum + t.amount, 0);

    // 4. Shipping Calculation: Free above threshold if items exist
    const shippingFee = (items.length === 0 || subtotal >= freeShippingThreshold) ? 0 : standardShippingFee;

    // 5. Total Savings (original price differences + promo discounts)
    const productSavings = items.reduce((sum, it) => {
      if (it.product.originalPrice && it.product.originalPrice > it.product.price) {
        return sum + ((it.product.originalPrice - it.product.price) * it.quantity);
      }
      return sum;
    }, 0);

    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + shippingFee);

    return {
      items: computedItems,
      subtotal,
      discountTotal,
      appliedPromo,
      taxDetails,
      taxTotal,
      shippingFee,
      grandTotal,
      savingsTotal: productSavings + discountTotal,
    };
  }
}

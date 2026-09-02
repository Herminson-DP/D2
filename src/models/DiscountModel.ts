import { DiscountPromotion, CartItem } from '../types';
import { INITIAL_DISCOUNTS } from './initialSeedData';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const DISCOUNT_STORAGE_KEY = 'd2_supermarket_discounts';

export class DiscountModel {
  private static localDiscounts: DiscountPromotion[] = [];

  static async getDiscounts(): Promise<DiscountPromotion[]> {
    try {
      const discountsRef = collection(db, 'discounts');
      const snapshot = await getDocs(discountsRef);
      if (!snapshot.empty) {
        const firestoreDiscounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountPromotion));
        this.localDiscounts = firestoreDiscounts;
        localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(firestoreDiscounts));
        return firestoreDiscounts;
      }
    } catch (e) {
      console.warn('Firestore discounts load fallback', e);
    }

    const saved = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (saved) {
      try {
        this.localDiscounts = JSON.parse(saved);
        return this.localDiscounts;
      } catch (e) {
        // ignore
      }
    }

    this.localDiscounts = [...INITIAL_DISCOUNTS];
    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(this.localDiscounts));
    this.syncSeedToFirestore();
    return this.localDiscounts;
  }

  private static async syncSeedToFirestore() {
    try {
      for (const disc of INITIAL_DISCOUNTS) {
        await setDoc(doc(db, 'discounts', disc.id), disc, { merge: true });
      }
    } catch (e) {
      console.warn('Silent sync discounts', e);
    }
  }

  static async saveDiscount(discount: DiscountPromotion): Promise<DiscountPromotion> {
    const discounts = await this.getDiscounts();
    const index = discounts.findIndex(d => d.id === discount.id);
    if (index >= 0) {
      discounts[index] = discount;
    } else {
      discounts.push(discount);
    }

    this.localDiscounts = discounts;
    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discounts));

    try {
      await setDoc(doc(db, 'discounts', discount.id), discount);
    } catch (e) {
      console.warn('Firestore save discount error', e);
    }
    return discount;
  }

  static async deleteDiscount(discountId: string): Promise<boolean> {
    const discounts = await this.getDiscounts();
    const filtered = discounts.filter(d => d.id !== discountId);
    this.localDiscounts = filtered;
    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'discounts', discountId));
    } catch (e) {
      console.warn('Firestore delete discount error', e);
    }
    return true;
  }

  static calculateDiscountAmount(
    promo: DiscountPromotion | null | undefined,
    items: CartItem[],
    subtotal: number
  ): { discountTotal: number; error?: string } {
    if (!promo || !promo.isActive) {
      return { discountTotal: 0 };
    }

    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    if (promo.validUntil && promo.validUntil < today) {
      return { discountTotal: 0, error: 'El cupón ha expirado.' };
    }

    // Calculate eligible base amount
    let eligibleSubtotal = 0;
    if (promo.categoryId) {
      eligibleSubtotal = items
        .filter(item => item.product.categoryId === promo.categoryId)
        .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    } else {
      eligibleSubtotal = subtotal;
    }

    if (eligibleSubtotal < promo.minSpend) {
      return {
        discountTotal: 0,
        error: `Monto mínimo de compra para este cupón: $${promo.minSpend.toLocaleString('es-CO')}. (Faltan $${(promo.minSpend - eligibleSubtotal).toLocaleString('es-CO')})`
      };
    }

    let calculatedDiscount = 0;
    if (promo.discountType === 'percentage') {
      calculatedDiscount = (eligibleSubtotal * promo.value) / 100;
    } else {
      calculatedDiscount = promo.value;
    }

    if (promo.maxDiscount && calculatedDiscount > promo.maxDiscount) {
      calculatedDiscount = promo.maxDiscount;
    }

    return { discountTotal: Math.min(calculatedDiscount, subtotal) };
  }
}

import { TaxRule } from '../types';
import { INITIAL_TAX_RULES } from './initialSeedData';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const TAX_STORAGE_KEY = 'd2_supermarket_tax_rules';

export class TaxModel {
  private static localTaxes: TaxRule[] = [];

  static async getTaxRules(): Promise<TaxRule[]> {
    try {
      const taxesRef = collection(db, 'taxes');
      const snapshot = await getDocs(taxesRef);
      if (!snapshot.empty) {
        const firestoreTaxes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaxRule));
        this.localTaxes = firestoreTaxes;
        localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(firestoreTaxes));
        return firestoreTaxes;
      }
    } catch (e) {
      console.warn('Firestore tax load fallback to local/seed', e);
    }

    // Check localStorage
    const saved = localStorage.getItem(TAX_STORAGE_KEY);
    if (saved) {
      try {
        this.localTaxes = JSON.parse(saved);
        return this.localTaxes;
      } catch (e) {
        // ignore
      }
    }

    // Seed defaults
    this.localTaxes = [...INITIAL_TAX_RULES];
    localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(this.localTaxes));
    
    // Asynchronously sync seed to firestore
    this.syncSeedToFirestore();
    return this.localTaxes;
  }

  private static async syncSeedToFirestore() {
    try {
      for (const tax of INITIAL_TAX_RULES) {
        await setDoc(doc(db, 'taxes', tax.id), tax, { merge: true });
      }
    } catch (e) {
      console.warn('Silent sync taxes to firestore', e);
    }
  }

  static async saveTaxRule(tax: TaxRule): Promise<TaxRule> {
    const taxes = await this.getTaxRules();
    const index = taxes.findIndex(t => t.id === tax.id);
    
    // If setting as default, unset others
    if (tax.isDefault) {
      taxes.forEach(t => {
        if (t.id !== tax.id) t.isDefault = false;
      });
    }

    if (index >= 0) {
      taxes[index] = tax;
    } else {
      taxes.push(tax);
    }

    this.localTaxes = taxes;
    localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(taxes));

    try {
      await setDoc(doc(db, 'taxes', tax.id), tax);
      // Also update default flags in firestore if needed
      if (tax.isDefault) {
        for (const t of taxes) {
          if (t.id !== tax.id) {
            await setDoc(doc(db, 'taxes', t.id), { isDefault: false }, { merge: true });
          }
        }
      }
    } catch (e) {
      console.warn('Firestore save tax error', e);
    }

    return tax;
  }

  static async deleteTaxRule(taxId: string): Promise<boolean> {
    const taxes = await this.getTaxRules();
    const filtered = taxes.filter(t => t.id !== taxId);
    this.localTaxes = filtered;
    localStorage.setItem(TAX_STORAGE_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'taxes', taxId));
    } catch (e) {
      console.warn('Firestore delete tax error', e);
    }
    return true;
  }

  static getTaxRateForProduct(taxRateId: string | undefined, taxes: TaxRule[]): { rate: number; ruleName: string } {
    if (!taxRateId) {
      const defaultRule = taxes.find(t => t.isDefault && t.isActive) || taxes[0];
      return { rate: defaultRule ? defaultRule.rate : 0.19, ruleName: defaultRule ? defaultRule.name : 'IVA' };
    }
    const match = taxes.find(t => t.id === taxRateId && t.isActive);
    if (match) {
      return { rate: match.rate, ruleName: match.name };
    }
    const defaultRule = taxes.find(t => t.isDefault && t.isActive);
    return { rate: defaultRule ? defaultRule.rate : 0.19, ruleName: defaultRule ? defaultRule.name : 'IVA' };
  }
}

import { TaxRule, DiscountPromotion } from '../types';
import { TaxModel } from '../models/TaxModel';
import { DiscountModel } from '../models/DiscountModel';

export class DiscountTaxController {
  // Taxes
  static async getTaxes(): Promise<TaxRule[]> {
    return await TaxModel.getTaxRules();
  }

  static async saveTax(tax: TaxRule): Promise<{ success: boolean; tax?: TaxRule; error?: string }> {
    try {
      if (!tax.name || tax.rate < 0) {
        return { success: false, error: 'Nombre de impuesto y tasa válida requeridos.' };
      }
      const saved = await TaxModel.saveTaxRule(tax);
      return { success: true, tax: saved };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al guardar el impuesto' };
    }
  }

  static async deleteTax(taxId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await TaxModel.deleteTaxRule(taxId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al eliminar el impuesto' };
    }
  }

  // Discounts
  static async getDiscounts(): Promise<DiscountPromotion[]> {
    return await DiscountModel.getDiscounts();
  }

  static async saveDiscount(discount: DiscountPromotion): Promise<{ success: boolean; discount?: DiscountPromotion; error?: string }> {
    try {
      if (!discount.code || !discount.title || discount.value <= 0) {
        return { success: false, error: 'Código, título y valor del descuento son requeridos.' };
      }
      discount.code = discount.code.toUpperCase().trim();
      const saved = await DiscountModel.saveDiscount(discount);
      return { success: true, discount: saved };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al guardar el descuento' };
    }
  }

  static async deleteDiscount(discountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await DiscountModel.deleteDiscount(discountId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al eliminar el descuento' };
    }
  }
}

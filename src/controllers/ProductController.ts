import { Product } from '../types';
import { ProductModel } from '../models/ProductModel';

export class ProductController {
  static async getAllProducts(): Promise<Product[]> {
    return await ProductModel.getProducts();
  }

  static async saveProduct(product: Product): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      if (!product.name || product.price <= 0) {
        return { success: false, error: 'El nombre y un precio válido son requeridos.' };
      }
      const saved = await ProductModel.saveProduct(product);
      return { success: true, product: saved };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al guardar el producto' };
    }
  }

  static async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await ProductModel.deleteProduct(productId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al eliminar el producto' };
    }
  }
}

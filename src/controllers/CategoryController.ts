import { Category } from '../types';
import { CategoryModel } from '../models/CategoryModel';

export class CategoryController {
  static async getAllCategories(): Promise<Category[]> {
    return await CategoryModel.getCategories();
  }

  static async saveCategory(cat: Category): Promise<{ success: boolean; category?: Category; error?: string }> {
    try {
      if (!cat.name.trim()) {
        return { success: false, error: 'El nombre de la categoría es requerido.' };
      }
      if (!cat.slug) {
        cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      const saved = await CategoryModel.saveCategory(cat);
      return { success: true, category: saved };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al guardar la categoría' };
    }
  }

  static async deleteCategory(catId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await CategoryModel.deleteCategory(catId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al eliminar la categoría' };
    }
  }
}

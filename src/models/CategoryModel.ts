import { Category } from '../types';
import { INITIAL_CATEGORIES } from './initialSeedData';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const CATEGORY_STORAGE_KEY = 'd2_supermarket_categories';

export class CategoryModel {
  private static localCategories: Category[] = [];

  static async getCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      if (!snapshot.empty) {
        const firestoreCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        this.localCategories = firestoreCats;
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(firestoreCats));
        return firestoreCats;
      }
    } catch (e) {
      console.warn('Firestore categories load fallback', e);
    }

    const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (saved) {
      try {
        this.localCategories = JSON.parse(saved);
        return this.localCategories;
      } catch (e) {
        // ignore
      }
    }

    this.localCategories = [...INITIAL_CATEGORIES];
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(this.localCategories));
    this.syncSeedToFirestore();
    return this.localCategories;
  }

  private static async syncSeedToFirestore() {
    try {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    } catch (e) {
      console.warn('Silent sync categories', e);
    }
  }

  static async saveCategory(category: Category): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }

    this.localCategories = categories;
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));

    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (e) {
      console.warn('Firestore save category error', e);
    }
    return category;
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== categoryId);
    this.localCategories = filtered;
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (e) {
      console.warn('Firestore delete category error', e);
    }
    return true;
  }
}

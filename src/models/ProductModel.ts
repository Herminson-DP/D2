import { Product } from '../types';
import { INITIAL_PRODUCTS } from './initialSeedData';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const PRODUCT_STORAGE_KEY = 'd2_supermarket_products';

export class ProductModel {
  private static localProducts: Product[] = [];

  static async getProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      if (!snapshot.empty) {
        const firestoreProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        this.localProducts = firestoreProducts;
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(firestoreProducts));
        return firestoreProducts;
      }
    } catch (e) {
      console.warn('Firestore products load fallback', e);
    }

    const saved = localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (saved) {
      try {
        this.localProducts = JSON.parse(saved);
        return this.localProducts;
      } catch (e) {
        // ignore
      }
    }

    this.localProducts = [...INITIAL_PRODUCTS];
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(this.localProducts));
    this.syncSeedToFirestore();
    return this.localProducts;
  }

  private static async syncSeedToFirestore() {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
      }
    } catch (e) {
      console.warn('Silent sync products', e);
    }
  }

  static async saveProduct(product: Product): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    this.localProducts = products;
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));

    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (e) {
      console.warn('Firestore save product error', e);
    }
    return product;
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== productId);
    this.localProducts = filtered;
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(filtered));

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.warn('Firestore delete product error', e);
    }
    return true;
  }

  static async updateStockAfterPurchase(items: { productId: string; quantity: number }[]): Promise<void> {
    const products = await this.getProducts();
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        try {
          await updateDoc(doc(db, 'products', prod.id), { stock: prod.stock });
        } catch (e) {
          // ignore
        }
      }
    }
    this.localProducts = products;
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  }
}

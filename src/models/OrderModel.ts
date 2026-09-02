import { OrderReceipt, OrderItem } from '../types';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, query, where, orderBy } from 'firebase/firestore';

const ORDERS_STORAGE_KEY = 'd2_supermarket_orders';

export class OrderModel {
  private static localOrders: OrderReceipt[] = [];

  static async getOrders(): Promise<OrderReceipt[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      if (!snapshot.empty) {
        const firestoreOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OrderReceipt));
        // Sort newest first
        firestoreOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.localOrders = firestoreOrders;
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(firestoreOrders));
        return firestoreOrders;
      }
    } catch (e) {
      console.warn('Firestore orders load fallback', e);
    }

    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: OrderReceipt[] = JSON.parse(saved);
        parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.localOrders = parsed;
        return parsed;
      } catch (e) {
        // ignore
      }
    }

    // Seed some initial purchase records for rich demo experience
    this.localOrders = this.getInitialSampleOrders();
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.localOrders));
    return this.localOrders;
  }

  static async getUserOrders(userId: string): Promise<OrderReceipt[]> {
    const all = await this.getOrders();
    return all.filter(o => o.userId === userId);
  }

  static async getOrderById(orderId: string): Promise<OrderReceipt | null> {
    const all = await this.getOrders();
    return all.find(o => o.id === orderId || o.invoiceNumber === orderId) || null;
  }

  static async createOrder(order: OrderReceipt): Promise<OrderReceipt> {
    const orders = await this.getOrders();
    orders.unshift(order);
    this.localOrders = orders;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {
      console.warn('Firestore save order error', e);
    }

    return order;
  }

  static generateInvoiceNumber(existingOrdersCount: number): string {
    const prefix = 'D2';
    const year = new Date().getFullYear();
    const sequential = (existingOrdersCount + 1042).toString().padStart(6, '0');
    return `${prefix}-${year}-${sequential}`;
  }

  private static getInitialSampleOrders(): OrderReceipt[] {
    return [
      {
        id: 'ord_sample_01',
        invoiceNumber: 'D2-2026-001041',
        userId: 'usr_cliente_d2',
        userEmail: 'cliente@d2supermercado.com',
        userName: 'Mariana Gómez',
        userPhone: '+57 320 456 7890',
        deliveryAddress: 'Carrera 7 # 120-45, Apto 502, Bogotá',
        paymentMethod: 'credit_card',
        items: [
          {
            productId: 'prod_leche_entera',
            productName: 'Leche Entera Larga Vida Pack x6',
            categoryName: 'Lácteos y Huevos',
            unit: 'Pack 6 x 1L',
            quantity: 1,
            unitPrice: 24500,
            discountAmount: 0,
            taxRate: 0.0,
            taxAmount: 0,
            total: 24500,
            imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
          },
          {
            productId: 'prod_manzana_royal',
            productName: 'Manzana Royal Gala Importada',
            categoryName: 'Frutas y Verduras',
            unit: 'Bolsa 1kg',
            quantity: 2,
            unitPrice: 6500,
            discountAmount: 0,
            taxRate: 0.0,
            taxAmount: 0,
            total: 13000,
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
          },
          {
            productId: 'prod_cafe_especial',
            productName: 'Café Colombiano Excelso Molido',
            categoryName: 'Panadería y Café',
            unit: 'Bolsa 500g',
            quantity: 1,
            unitPrice: 22800,
            discountAmount: 0,
            taxRate: 0.05,
            taxAmount: 1140,
            total: 23940,
            imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
          }
        ],
        subtotal: 60300,
        discountTotal: 6030,
        appliedPromoCode: 'D2BIENVENIDA',
        taxTotal: 1026,
        taxDetails: [
          {
            name: 'IVA Reducido (5%)',
            rate: 0.05,
            amount: 1026
          }
        ],
        shippingFee: 0,
        total: 55296,
        status: 'completado',
        createdAt: '2026-02-28T16:20:00.000Z',
        notes: 'Timbre 502 por favor'
      }
    ];
  }
}

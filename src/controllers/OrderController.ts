import { OrderReceipt, OrderItem, CartCalculation, User } from '../types';
import { OrderModel } from '../models/OrderModel';
import { ProductModel } from '../models/ProductModel';

export class OrderController {
  static async checkout(
    user: User,
    cartCalc: CartCalculation,
    deliveryAddress: string,
    paymentMethod: 'credit_card' | 'cash_on_delivery' | 'pse_transfer' | 'digital_wallet',
    userPhone?: string,
    notes?: string
  ): Promise<{ success: boolean; receipt?: OrderReceipt; error?: string }> {
    try {
      if (cartCalc.items.length === 0) {
        return { success: false, error: 'El carrito de compras está vacío.' };
      }

      // Check stock availability
      const allProducts = await ProductModel.getProducts();
      for (const item of cartCalc.items) {
        const prod = allProducts.find(p => p.id === item.product.id);
        if (prod && prod.stock < item.quantity) {
          return {
            success: false,
            error: `Stock insuficiente para "${prod.name}". Disponibles: ${prod.stock} unidades.`
          };
        }
      }

      // Generate invoice number
      const existingOrders = await OrderModel.getOrders();
      const invoiceNumber = OrderModel.generateInvoiceNumber(existingOrders.length);
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Map cart items to order items with snapshot data
      const orderItems: OrderItem[] = cartCalc.items.map(it => ({
        productId: it.product.id,
        productName: it.product.name,
        categoryName: it.product.categoryId,
        unit: it.product.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountAmount: it.discountAmount,
        taxRate: it.taxRate,
        taxAmount: it.taxAmount,
        total: it.total,
        imageUrl: it.product.imageUrl,
      }));

      const newReceipt: OrderReceipt = {
        id: orderId,
        invoiceNumber,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userPhone: userPhone || user.phone || '',
        deliveryAddress: deliveryAddress || user.address || 'Entrega en tienda D2',
        paymentMethod,
        items: orderItems,
        subtotal: cartCalc.subtotal,
        discountTotal: cartCalc.discountTotal,
        appliedPromoCode: cartCalc.appliedPromo?.code,
        taxTotal: cartCalc.taxTotal,
        taxDetails: cartCalc.taxDetails.map(t => ({
          name: t.name,
          rate: t.rate,
          amount: t.amount,
        })),
        shippingFee: cartCalc.shippingFee,
        total: cartCalc.grandTotal,
        status: 'completado',
        createdAt: new Date().toISOString(),
        notes: notes || '',
      };

      // 1. Save receipt
      await OrderModel.createOrder(newReceipt);

      // 2. Reduce stock in products
      await ProductModel.updateStockAfterPurchase(
        cartCalc.items.map(it => ({ productId: it.product.id, quantity: it.quantity }))
      );

      return { success: true, receipt: newReceipt };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al procesar la compra' };
    }
  }

  static async getOrderHistory(userId?: string, isAdmin: boolean = false): Promise<OrderReceipt[]> {
    if (isAdmin) {
      return await OrderModel.getOrders();
    }
    if (userId) {
      return await OrderModel.getUserOrders(userId);
    }
    return [];
  }

  static async getReceipt(orderId: string): Promise<OrderReceipt | null> {
    return await OrderModel.getOrderById(orderId);
  }
}

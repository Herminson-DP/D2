export type UserRole = 'cliente' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  color: string;
  bannerUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  stock: number;
  unit: string; // e.g. 'kg', 'unidad', 'litro', 'paquete'
  imageUrl: string;
  isFeatured?: boolean;
  barcode?: string;
  brand?: string;
  taxRateId?: string; // connects with TaxRule
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number; // e.g. 0.19 for 19%, 0.05 for 5%, 0 for 0%
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface DiscountPromotion {
  id: string;
  code: string; // e.g. 'BIENVENIDO10', 'SUPERD2'
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 5000 for $5000 COP/USD
  minSpend: number;
  maxDiscount?: number;
  categoryId?: string; // Optional: applies only to specific category
  isActive: boolean;
  validUntil: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  total: number;
}

export interface CartCalculation {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  appliedPromo?: DiscountPromotion | null;
  taxDetails: {
    taxId: string;
    name: string;
    rate: number;
    taxableAmount: number;
    amount: number;
  }[];
  taxTotal: number;
  shippingFee: number;
  grandTotal: number;
  savingsTotal: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  categoryName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  imageUrl?: string;
}

export interface OrderReceipt {
  id: string;
  invoiceNumber: string; // e.g., "D2-2026-0048"
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  deliveryAddress: string;
  paymentMethod: 'credit_card' | 'cash_on_delivery' | 'pse_transfer' | 'digital_wallet';
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  appliedPromoCode?: string;
  taxTotal: number;
  taxDetails: {
    name: string;
    rate: number;
    amount: number;
  }[];
  shippingFee: number;
  total: number;
  status: 'completado' | 'en_camino' | 'cancelado';
  createdAt: string;
  notes?: string;
}

export type ActiveView = 
  | 'catalog'
  | 'product-detail'
  | 'cart'
  | 'orders'
  | 'receipt-detail'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-categories'
  | 'admin-discounts'
  | 'admin-taxes'
  | 'admin-users'
  | 'admin-reports';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, 
  Product, 
  Category, 
  TaxRule, 
  DiscountPromotion, 
  OrderReceipt, 
  CartItem, 
  ActiveView,
  CartCalculation
} from './types';

// Controllers (MVC)
import { AuthController } from './controllers/AuthController';
import { ProductController } from './controllers/ProductController';
import { CategoryController } from './controllers/CategoryController';
import { DiscountTaxController } from './controllers/DiscountTaxController';
import { CartController } from './controllers/CartController';
import { OrderController } from './controllers/OrderController';
import { UserManagementController } from './controllers/UserManagementController';

// UI Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Catalog & Product Components
import { ProductCatalog } from './components/catalog/ProductCatalog';
import { ProductQuickViewModal } from './components/catalog/ProductQuickViewModal';

// Cart, Checkout & Receipt Components
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { ReceiptModal } from './components/receipts/ReceiptModal';
import { OrderHistoryView } from './components/orders/OrderHistoryView';

// Auth Component
import { AuthModal } from './components/auth/AuthModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductManagement } from './components/admin/ProductManagement';
import { CategoryManagement } from './components/admin/CategoryManagement';
import { DiscountManagement } from './components/admin/DiscountManagement';
import { TaxManagement } from './components/admin/TaxManagement';
import { UserManagement } from './components/admin/UserManagement';
import { ReportsView } from './components/admin/ReportsView';

// Toast Icons
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // -------------------------------------------------------------
  // Application State
  // -------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthController.getCurrentUser());
  const [activeView, setActiveView] = useState<ActiveView>('catalog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Collections (Data Models synced via Controllers)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [discounts, setDiscounts] = useState<DiscountPromotion[]>([]);
  const [orders, setOrders] = useState<OrderReceipt[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Filters & Catalog State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Cart & Order State
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>(() => CartController.getCartItems());
  const [appliedPromo, setAppliedPromo] = useState<DiscountPromotion | null>(() => CartController.getAppliedPromo());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<OrderReceipt | null>(null);

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // -------------------------------------------------------------
  // Data Loading & Initialization
  // -------------------------------------------------------------
  const refreshAllData = useCallback(async () => {
    try {
      const [prods, cats, txs, discs, ords, usrs] = await Promise.all([
        ProductController.getAllProducts(),
        CategoryController.getAllCategories(),
        DiscountTaxController.getTaxes(),
        DiscountTaxController.getDiscounts(),
        OrderController.getOrderHistory(undefined, true),
        UserManagementController.getAllUsers(),
      ]);

      setProducts(prods);
      setCategories(cats);
      setTaxes(txs);
      setDiscounts(discs);
      setOrders(ords);
      setAllUsers(usrs);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  useEffect(() => {
    refreshAllData();

    // Subscribe to auth state updates
    const unsubscribe = AuthController.subscribeToAuth((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [refreshAllData]);

  // Load user-specific orders
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return orders;
    return orders.filter(o => o.userId === currentUser.id);
  }, [orders, currentUser]);

  // -------------------------------------------------------------
  // Cart Calculations (MVC Architecture Engine)
  // -------------------------------------------------------------
  const cartCalculation: CartCalculation = useMemo(() => {
    return CartController.calculateCart(cartItems, taxes, appliedPromo);
  }, [cartItems, taxes, appliedPromo]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // -------------------------------------------------------------
  // Cart Handlers
  // -------------------------------------------------------------
  const handleAddToCart = (product: Product, quantity = 1) => {
    const updated = CartController.addToCart(product, quantity);
    setCartItems(updated);
    showToast(`¡"${product.name}" agregado al carrito!`, 'success');
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updated = CartController.updateQuantity(productId, quantity);
    setCartItems(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const updated = CartController.removeFromCart(productId);
    setCartItems(updated);
    showToast('Producto eliminado del carrito', 'info');
  };

  const handleClearCart = () => {
    const updated = CartController.clearCart();
    setCartItems(updated);
    showToast('Carrito vaciado', 'info');
  };

  const handleApplyCoupon = (code: string) => {
    const res = CartController.applyCoupon(code, discounts, cartItems);
    if (res.success && res.promo) {
      setAppliedPromo(res.promo);
      showToast(res.message || 'Cupón aplicado con éxito', 'success');
      return { success: true, message: res.message };
    } else {
      return { success: false, message: res.message };
    }
  };

  const handleRemoveCoupon = () => {
    CartController.removeCoupon();
    setAppliedPromo(null);
    showToast('Cupón removido', 'info');
  };

  // -------------------------------------------------------------
  // Checkout & Order Creation
  // -------------------------------------------------------------
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (
    deliveryAddress: string,
    paymentMethod: 'credit_card' | 'cash_on_delivery' | 'pse_transfer' | 'digital_wallet',
    userPhone?: string,
    notes?: string
  ) => {
    if (!currentUser) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const res = await OrderController.checkout(
      currentUser,
      cartCalculation,
      deliveryAddress,
      paymentMethod,
      userPhone,
      notes
    );

    if (res.success && res.receipt) {
      // Clear cart
      CartController.clearCart();
      setCartItems([]);
      setAppliedPromo(null);

      // Refresh orders and inventory
      await refreshAllData();

      // Open official receipt modal immediately
      setSelectedReceipt(res.receipt);
      showToast('¡Compra realizada con éxito! Recibo oficial generado.', 'success');
      return { success: true, receipt: res.receipt };
    } else {
      return { success: false, error: res.error };
    }
  };

  // -------------------------------------------------------------
  // Auth Handlers
  // -------------------------------------------------------------
  const handleLogout = async () => {
    await AuthController.logout();
    setCurrentUser(null);
    setActiveView('catalog');
    showToast('Has cerrado sesión correctamente', 'info');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`¡Bienvenido/a de nuevo, ${user.name}!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col antialiased text-gray-200 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-20 right-5 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`p-3.5 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700/80 shadow-emerald-950/50'
              : toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-700/80 shadow-red-950/50'
              : 'bg-[#1c212b] text-gray-100 border-gray-700 shadow-black/60'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={currentUser}
        cartCalculation={cartCalculation}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuickSwitchRole={() => {
          if (currentUser) {
            const newRole = currentUser.role === 'admin' ? 'cliente' : 'admin';
            UserManagementController.updateUserRole(currentUser.id, newRole).then(() => {
              setCurrentUser({ ...currentUser, role: newRole });
              showToast(`Rol cambiado a: ${newRole.toUpperCase()}`, 'info');
            });
          }
        }}
      />

      {/* Body Layout: Sidebar + Main View Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false);
          }}
          user={currentUser}
          onOpenAuth={() => {
            setIsAuthModalOpen(true);
            setIsSidebarOpen(false);
          }}
          onLogout={handleLogout}
          onSwitchRole={() => {
            if (currentUser) {
              const newRole = currentUser.role === 'admin' ? 'cliente' : 'admin';
              UserManagementController.updateUserRole(currentUser.id, newRole).then(() => {
                setCurrentUser({ ...currentUser, role: newRole });
                showToast(`Rol cambiado a: ${newRole.toUpperCase()}`, 'info');
              });
            }
          }}
        />

        {/* View Router */}
        <main className="flex-1 min-w-0">
          
          {/* CLIENT / PUBLIC VIEWS */}
          {activeView === 'catalog' && (
            <ProductCatalog
              products={products}
              categories={categories}
              taxes={taxes}
              discounts={discounts}
              cartCalculation={cartCalculation}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategoryId={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onApplyCouponCode={handleApplyCoupon}
            />
          )}

          {activeView === 'orders' && (
            <OrderHistoryView
              orders={userOrders}
              currentUser={currentUser}
              onViewReceipt={setSelectedReceipt}
              onNavigateToCatalog={() => setActiveView('catalog')}
            />
          )}

          {/* ADMIN VIEWS (Protected for role === 'admin') */}
          {activeView === 'admin-dashboard' && (
            <AdminDashboard
              orders={orders}
              products={products}
              categories={categories}
              users={allUsers}
              taxes={taxes}
              discounts={discounts}
              onNavigate={setActiveView}
              onViewReceipt={setSelectedReceipt}
            />
          )}

          {activeView === 'admin-products' && (
            <ProductManagement
              products={products}
              categories={categories}
              taxes={taxes}
              onRefreshProducts={refreshAllData}
            />
          )}

          {activeView === 'admin-categories' && (
            <CategoryManagement
              categories={categories}
              products={products}
              onRefreshCategories={refreshAllData}
            />
          )}

          {activeView === 'admin-discounts' && (
            <DiscountManagement
              discounts={discounts}
              categories={categories}
              onRefreshDiscounts={refreshAllData}
            />
          )}

          {activeView === 'admin-taxes' && (
            <TaxManagement
              taxes={taxes}
              onRefreshTaxes={refreshAllData}
            />
          )}

          {activeView === 'admin-users' && (
            <UserManagement
              users={allUsers}
              currentUser={currentUser}
              onRefreshUsers={refreshAllData}
            />
          )}

          {activeView === 'admin-reports' && (
            <ReportsView
              orders={orders}
              products={products}
              categories={categories}
              onViewReceipt={setSelectedReceipt}
            />
          )}

        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartCalculation={cartCalculation}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={handleProceedToCheckout}
        availablePromos={discounts.filter(d => d.isActive)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        user={currentUser}
        cartCalculation={cartCalculation}
        onConfirmOrder={handleConfirmOrder}
        onOpenAuth={() => {
          setIsCheckoutOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Receipt / Invoice Modal (Printable & Inspectable) */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        category={categories.find(c => c.id === quickViewProduct?.categoryId)}
        taxes={taxes}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        currentQuantityInCart={cartCalculation.items.find(it => it.product.id === quickViewProduct?.id)?.quantity || 0}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="bg-[#11141b] text-gray-400 py-8 border-t border-gray-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm">
              D2
            </div>
            <div>
              <p className="text-gray-100 font-extrabold text-sm font-display">Supermercado D2</p>
              <p className="text-[11px] text-emerald-400">"Tu tienda, tu confianza"</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Supermercado D2 S.A.S. • Arquitectura MVC Full-Stack • Facturación Electrónica DIAN
          </p>
        </div>
      </footer>

    </div>
  );
}

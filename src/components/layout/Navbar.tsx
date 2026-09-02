import React from 'react';
import { 
  Menu, 
  ShoppingCart, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Search, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { User, CartCalculation, ActiveView } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface NavbarProps {
  user: User | null;
  cartCalculation: CartCalculation;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: ActiveView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickSwitchRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  cartCalculation,
  isSidebarOpen,
  onToggleSidebar,
  onOpenCart,
  onOpenAuth,
  onLogout,
  onNavigate,
  searchQuery,
  onSearchChange,
  onQuickSwitchRole,
}) => {
  const totalCartCount = cartCalculation.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-[#11141b]/95 backdrop-blur-md border-b border-gray-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-[#1c212b] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-label="Alternar menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                D2
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-gray-100 group-hover:text-emerald-400 transition-colors font-display">
                    SUPERMERCADO D2
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    Oficial
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium -mt-0.5">Tu tienda, tu confianza</p>
              </div>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar frutas, lácteos, carnes, aseo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#1c212b] hover:bg-[#232936] focus:bg-[#11141b] border border-gray-800 focus:border-emerald-500 rounded-xl outline-none transition-all placeholder:text-gray-500 text-gray-100"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Promo banner badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cupón: <strong>SUPERD2</strong></span>
            </div>

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-sm transition-all border border-emerald-800/60 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Ver carrito de compras"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-in zoom-in-50">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-gray-200">
                {cartCalculation.grandTotal > 0 ? formatCurrency(cartCalculation.grandTotal) : 'Carrito'}
              </span>
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'orders')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#1c212b] hover:bg-[#232936] cursor-pointer transition-colors border border-gray-800"
                  title="Ver perfil y pedidos"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-gray-200 truncate max-w-[120px] leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                      user.role === 'admin' ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60' : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher for Demo testing */}
                <button
                  id="btn-switch-role"
                  onClick={onQuickSwitchRole}
                  className="hidden xl:flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-100 bg-[#1c212b] hover:bg-[#232936] px-2 py-1.5 rounded-lg border border-gray-800 transition-colors"
                  title="Cambiar rápidamente entre Cliente y Admin para probar"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Probar {user.role === 'admin' ? 'Cliente' : 'Admin'}</span>
                </button>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-xs transition-all hover:shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search input bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en D2 Supermercado..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#1c212b] text-gray-100 rounded-xl border border-gray-800 focus:border-emerald-500 focus:bg-[#11141b] outline-none"
            />
          </div>
        </div>

      </div>
    </header>
  );
};

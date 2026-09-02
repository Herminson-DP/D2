import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  Receipt, 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Percent, 
  ReceiptText, 
  Users, 
  BarChart3, 
  X, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck,
  User as UserIcon,
  LogIn,
  LogOut,
  HelpCircle,
  Clock
} from 'lucide-react';
import { User, ActiveView } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  onSwitchRole,
}) => {
  const isAdmin = user?.role === 'admin';

  const handleNav = (view: ActiveView) => {
    onNavigate(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const clientNavItems = [
    {
      id: 'nav-catalog',
      view: 'catalog' as ActiveView,
      label: 'Catálogo de Productos',
      icon: Store,
      badge: 'Principal',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'nav-orders',
      view: 'orders' as ActiveView,
      label: 'Historial y Recibos',
      icon: Receipt,
      badge: user ? 'Mis compras' : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
      requiresAuth: true,
    }
  ];

  const adminNavItems = [
    {
      id: 'nav-admin-dashboard',
      view: 'admin-dashboard' as ActiveView,
      label: 'Panel General',
      icon: LayoutDashboard,
    },
    {
      id: 'nav-admin-products',
      view: 'admin-products' as ActiveView,
      label: 'Gestión de Productos',
      icon: Package,
    },
    {
      id: 'nav-admin-categories',
      view: 'admin-categories' as ActiveView,
      label: 'Gestión de Categorías',
      icon: FolderTree,
    },
    {
      id: 'nav-admin-discounts',
      view: 'admin-discounts' as ActiveView,
      label: 'Descuentos y Promociones',
      icon: Percent,
    },
    {
      id: 'nav-admin-taxes',
      view: 'admin-taxes' as ActiveView,
      label: 'Gestión de Impuestos (IVA)',
      icon: ReceiptText,
    },
    {
      id: 'nav-admin-users',
      view: 'admin-users' as ActiveView,
      label: 'Gestión de Usuarios',
      icon: Users,
    },
    {
      id: 'nav-admin-reports',
      view: 'admin-reports' as ActiveView,
      label: 'Reportes de Ventas',
      icon: BarChart3,
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#11141b] border-r border-gray-800 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div 
            onClick={() => handleNav('catalog')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-600/20">
              D2
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-100 tracking-tight font-display leading-tight group-hover:text-emerald-400 transition-colors">
                SUPERMERCADO D2
              </h2>
              <p className="text-xs text-gray-400 font-medium">Tu tienda, tu confianza</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#1c212b] lg:hidden"
            aria-label="Cerrar barra lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card / Auth State */}
        <div className="p-3 m-3 rounded-2xl bg-[#1c212b] border border-gray-800">
          {user ? (
            <div>
              <div className="flex items-center gap-2.5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-emerald-400/50" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-200 truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Role badge and test toggle */}
              <div className="mt-2.5 pt-2 border-t border-gray-800 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isAdmin ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60' : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                }`}>
                  {isAdmin ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </span>

                <button
                  onClick={onSwitchRole}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  title="Cambiar rol para probar interfaz"
                >
                  Cambiar a {isAdmin ? 'Cliente' : 'Admin'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Inicia sesión para ver tu historial y comprar</p>
              <button
                id="sidebar-btn-login"
                onClick={onOpenAuth}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar a D2</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          
          {/* Customer section */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Tienda y Clientes
              </span>
            </div>
            <nav className="space-y-1">
              {clientNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.id}
                    id={item.id}
                    onClick={() => {
                      if (item.requiresAuth && !user) {
                        onOpenAuth();
                      } else {
                        handleNav(item.view);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 shadow-2xs' 
                        : 'text-gray-300 hover:bg-[#1c212b] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-[#1c212b] text-gray-300 border border-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Management Section - ONLY shown if user is admin */}
          {isAdmin ? (
            <div>
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Módulos de Administrador
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
                  Admin
                </span>
              </div>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      onClick={() => handleNav(item.view)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/80 shadow-2xs' 
                          : 'text-gray-300 hover:bg-[#1c212b] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-gray-500 ${isActive ? 'text-purple-400' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#1c212b] border border-gray-800 text-gray-400 text-xs">
              <p className="font-semibold text-gray-200 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Modo Cliente Activo
              </p>
              <p className="text-[11px] text-gray-400 mb-2">
                Opciones administrativas restringidas. Puedes cambiar de rol para explorar el panel de administración.
              </p>
              <button
                onClick={onSwitchRole}
                className="w-full py-1.5 px-2 bg-[#11141b] border border-gray-700 hover:bg-[#232936] text-gray-200 rounded-lg text-[11px] font-bold transition-colors"
              >
                Activar Modo Administrador
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#0a0c10]/40 flex items-center justify-between text-xs text-gray-400">
          <div>
            <p className="font-bold text-gray-300">D2 Supermercado v2.0</p>
            <p className="text-[10px] text-gray-500">Arquitectura MVC Full-Stack</p>
          </div>
          {user && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </aside>
    </>
  );
};

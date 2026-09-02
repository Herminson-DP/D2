import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Calendar,
  Receipt,
  Eye,
  ShieldAlert,
  Percent,
  ReceiptText
} from 'lucide-react';
import { Product, OrderReceipt, User, Category, ActiveView } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AdminDashboardProps {
  products: Product[];
  orders: OrderReceipt[];
  users: User[];
  categories: Category[];
  onNavigate: (view: ActiveView) => void;
  onViewReceipt: (receipt: OrderReceipt) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  users,
  categories,
  onNavigate,
  onViewReceipt,
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalTaxes = orders.reduce((sum, o) => sum + o.taxTotal, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.discountTotal, 0);
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-3 border border-purple-400/30">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Panel de Control Administrativo • Supermercado D2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-2 text-white">
            Gestión Central y Métricas de Negocio
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Supervisa en tiempo real las ventas, inventarios, configuración tributaria (IVA), promociones activas y usuarios de la plataforma.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-[#11141b] p-5 rounded-2xl border border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Ingresos Totales
            </span>
            <span className="text-xl font-black text-gray-100 font-display font-mono">
              {formatCurrency(totalRevenue)}
            </span>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {orders.length} pedidos procesados
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div 
          onClick={() => onNavigate('admin-products')}
          className="bg-[#11141b] p-5 rounded-2xl border border-gray-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-colors"
        >
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Catálogo Activo
            </span>
            <span className="text-xl font-black text-gray-100 font-display">
              {products.length} productos
            </span>
            <p className="text-[11px] text-purple-400 font-semibold mt-1">
              En {categories.length} categorías
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => onNavigate('admin-users')}
          className="bg-[#11141b] p-5 rounded-2xl border border-gray-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
        >
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Usuarios Registrados
            </span>
            <span className="text-xl font-black text-gray-100 font-display">
              {users.length} usuarios
            </span>
            <p className="text-[11px] text-blue-400 font-semibold mt-1">
              {users.filter(u => u.role === 'cliente').length} clientes activos
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-950/60 text-blue-400 border border-blue-800/60">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Taxes / IVA collected */}
        <div 
          onClick={() => onNavigate('admin-taxes')}
          className="bg-[#11141b] p-5 rounded-2xl border border-gray-800 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              IVA Recaudado
            </span>
            <span className="text-xl font-black text-gray-100 font-display font-mono">
              {formatCurrency(totalTaxes)}
            </span>
            <p className="text-[11px] text-amber-400 font-semibold mt-1">
              Desc: {formatCurrency(totalDiscounts)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <ReceiptText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('admin-products')}
          className="p-3.5 rounded-2xl bg-[#11141b] border border-gray-800 hover:border-purple-500/50 hover:bg-[#1c212b] text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <p className="text-xs font-bold text-gray-200">Gestionar Productos</p>
          <span className="text-[10px] text-gray-400">Crear, editar, stock y precios</span>
        </button>

        <button
          onClick={() => onNavigate('admin-discounts')}
          className="p-3.5 rounded-2xl bg-[#11141b] border border-gray-800 hover:border-emerald-500/50 hover:bg-[#1c212b] text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <Percent className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <p className="text-xs font-bold text-gray-200">Descuentos y Promos</p>
          <span className="text-[10px] text-gray-400">Crear cupones y ofertas</span>
        </button>

        <button
          onClick={() => onNavigate('admin-taxes')}
          className="p-3.5 rounded-2xl bg-[#11141b] border border-gray-800 hover:border-amber-500/50 hover:bg-[#1c212b] text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <ReceiptText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <p className="text-xs font-bold text-gray-200">Configuración IVA</p>
          <span className="text-[10px] text-gray-400">Tarifas e impuestos de ley</span>
        </button>

        <button
          onClick={() => onNavigate('admin-reports')}
          className="p-3.5 rounded-2xl bg-[#11141b] border border-gray-800 hover:border-blue-500/50 hover:bg-[#1c212b] text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <p className="text-xs font-bold text-gray-200">Reportes de Ventas</p>
          <span className="text-[10px] text-gray-400">Análisis y exportación</span>
        </button>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[#11141b] rounded-3xl border border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-gray-100 font-display">
                Últimos Pedidos Recibidos
              </h2>
              <p className="text-xs text-gray-400">Ventas en vivo en Supermercado D2</p>
            </div>
            <button
              onClick={() => onNavigate('admin-reports')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Ver todos los reportes
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Factura</th>
                  <th className="pb-2.5">Cliente</th>
                  <th className="pb-2.5">Fecha</th>
                  <th className="pb-2.5 text-right">Total</th>
                  <th className="pb-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1c212b]/60">
                    <td className="py-3 font-mono font-bold text-gray-100">
                      {ord.invoiceNumber}
                    </td>
                    <td className="py-3 font-medium text-gray-300">
                      {ord.userName}
                    </td>
                    <td className="py-3 text-gray-400 text-[11px]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onViewReceipt(ord)}
                        className="px-2.5 py-1 rounded-lg bg-[#1c212b] hover:bg-[#232936] text-gray-200 font-bold text-[11px] inline-flex items-center gap-1 border border-gray-700"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Recibo</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box (1 Col) */}
        <div className="bg-[#11141b] rounded-3xl border border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-100 font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Control de Stock</span>
            </h2>
            <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
              {lowStockProducts.length} críticos
            </span>
          </div>

          <p className="text-xs text-gray-400">
            Productos con 5 o menos unidades disponibles en bodega.
          </p>

          <div className="space-y-2.5 overflow-y-auto max-h-[300px]">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/60 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-gray-200 truncate">{p.name}</p>
                    <span className="text-[10px] text-gray-400">{p.unit}</span>
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-950/80 border border-red-800/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {p.stock} unids
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400 font-medium py-4 text-center">
                ¡Inventario al día! No hay productos en nivel crítico.
              </p>
            )}
          </div>

          <button
            onClick={() => onNavigate('admin-products')}
            className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-bold transition-colors border border-gray-700"
          >
            Actualizar Inventario
          </button>
        </div>

      </div>

    </div>
  );
};

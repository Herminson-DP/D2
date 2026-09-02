import React, { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  DollarSign, 
  ShoppingBag, 
  Receipt, 
  Package, 
  Calendar, 
  Eye, 
  PieChart as PieChartIcon, 
  BarChart3 
} from 'lucide-react';
import { OrderReceipt, Product, Category } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReportsViewProps {
  orders: OrderReceipt[];
  products: Product[];
  categories: Category[];
  onViewReceipt: (receipt: OrderReceipt) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  products,
  categories,
  onViewReceipt,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.taxTotal, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.discountTotal, 0);
  const averageTicket = orders.length > 0 ? totalSales / orders.length : 0;

  // Calculate top selling products
  const productSalesMap: { [prodName: string]: { qty: number; revenue: number } } = {};
  orders.forEach(ord => {
    ord.items.forEach(it => {
      if (!productSalesMap[it.productName]) {
        productSalesMap[it.productName] = { qty: 0, revenue: 0 };
      }
      productSalesMap[it.productName].qty += it.quantity;
      productSalesMap[it.productName].revenue += it.total;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Factura', 'Fecha', 'Cliente', 'Subtotal', 'Descuento', 'IVA', 'Total', 'MetodoPago'];
    const rows = orders.map(o => [
      o.invoiceNumber,
      formatDate(o.createdAt),
      `"${o.userName}"`,
      o.subtotal,
      o.discountTotal,
      o.taxTotal,
      o.total,
      o.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_D2_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Reportes Financieros y Análisis de Ventas
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Métricas de facturación, desglose de impuestos IVA, descuentos aplicados y productos más vendidos en D2.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Facturación Total Bruta
          </span>
          <p className="text-xl font-black font-display font-mono text-slate-900">
            {formatCurrency(totalSales)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Subtotal: {formatCurrency(totalSubtotal)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total IVA Recaudado (DIAN)
          </span>
          <p className="text-xl font-black font-display font-mono text-purple-700">
            {formatCurrency(totalTax)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Discriminado en facturas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Descuentos Otorgados
          </span>
          <p className="text-xl font-black font-display font-mono text-emerald-700">
            {formatCurrency(totalDiscounts)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            En cupones y promociones
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Ticket Promedio
          </span>
          <p className="text-xl font-black font-display font-mono text-blue-700">
            {formatCurrency(averageTicket)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Por cada orden de compra
          </span>
        </div>

      </div>

      {/* Two columns: Top Selling Products & All Orders Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Productos Más Vendidos</span>
            </h2>
          </div>

          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block">#{idx + 1} en ventas</span>
                    <h4 className="text-xs font-bold text-slate-800 truncate">{p.name}</h4>
                    <span className="text-[11px] text-slate-500">{p.qty} unidades vendidas</span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-800">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No hay registros suficientes aún.</p>
            )}
          </div>
        </div>

        {/* Full Sales Audit Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-display">
                Auditoría de Facturación Completa
              </h2>
              <p className="text-xs text-slate-500">Listado histórico de todas las compras y facturas emitidas</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {orders.length} pedidos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Factura</th>
                  <th className="pb-2.5">Cliente</th>
                  <th className="pb-2.5">Fecha</th>
                  <th className="pb-2.5 text-right">IVA</th>
                  <th className="pb-2.5 text-right">Total</th>
                  <th className="pb-2.5 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 font-mono font-bold text-slate-900">
                      {ord.invoiceNumber}
                    </td>
                    <td className="py-2.5 text-slate-700">
                      {ord.userName}
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600">
                      {formatCurrency(ord.taxTotal)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-800">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onViewReceipt(ord)}
                        className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                        title="Ver Recibo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

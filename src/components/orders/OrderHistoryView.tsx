import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Calendar, 
  Package, 
  ChevronRight, 
  Eye, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react';
import { OrderReceipt, User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OrderHistoryViewProps {
  orders: OrderReceipt[];
  user: User | null;
  onViewReceipt: (receipt: OrderReceipt) => void;
  onNavigateToCatalog: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  user,
  onViewReceipt,
  onNavigateToCatalog,
}) => {
  const [searchInvoice, setSearchInvoice] = useState('');

  const filteredOrders = orders.filter(ord => {
    if (!searchInvoice.trim()) return true;
    const q = searchInvoice.toLowerCase();
    return (
      ord.invoiceNumber.toLowerCase().includes(q) ||
      ord.userName.toLowerCase().includes(q) ||
      ord.items.some(it => it.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#11141b] p-6 rounded-3xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100 font-display">
              Historial de Compras y Recibos
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Consulta todas tus transacciones realizadas en Supermercado D2, visualiza tus facturas y descarga recibos oficiales.
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Comprar más</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#11141b] p-4 rounded-2xl border border-gray-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            placeholder="Buscar por número de factura o producto..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#1c212b] border border-gray-800 rounded-xl focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
          />
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Total pedidos: <strong className="text-gray-200">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const itemCount = ord.items.reduce((sum, it) => sum + it.quantity, 0);

            return (
              <div 
                key={ord.id}
                className="bg-[#11141b] rounded-2xl border border-gray-800 hover:border-emerald-500/50 hover:shadow-md transition-all p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Order Information */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-gray-100">
                      {ord.invoiceNumber}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(ord.createdAt)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {ord.status}
                    </span>
                  </div>

                  {/* Products snippet */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {ord.items.slice(0, 4).map((it, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-[#1c212b] px-2 py-1 rounded-lg border border-gray-800 text-xs">
                        {it.imageUrl && (
                          <img src={it.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
                        )}
                        <span className="font-medium text-gray-300 truncate max-w-[120px]">
                          {it.productName}
                        </span>
                        <span className="text-gray-500 font-bold text-[10px]">x{it.quantity}</span>
                      </div>
                    ))}
                    {ord.items.length > 4 && (
                      <span className="text-xs text-gray-500 font-semibold">
                        +{ord.items.length - 4} más
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Dirección: {ord.deliveryAddress} • {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>

                {/* Price and Action Button */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-400 block">Total Pagado:</span>
                    <span className="text-lg font-black text-emerald-400 font-display font-mono">
                      {formatCurrency(ord.total)}
                    </span>
                    {ord.discountTotal > 0 && (
                      <p className="text-[10px] text-emerald-400 font-bold">
                        Ahorro: {formatCurrency(ord.discountTotal)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onViewReceipt(ord)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 border border-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Recibo</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#11141b] rounded-3xl border border-gray-800 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#1c212b] text-gray-500 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-100 mb-1">No hay compras registradas</h3>
          <p className="text-xs text-gray-400 mb-4">
            Cuando completes tu primer pedido en Supermercado D2, podrás visualizar aquí tus facturas y recibos detallados.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
          >
            Ir al Catálogo de Productos
          </button>
        </div>
      )}

    </div>
  );
};

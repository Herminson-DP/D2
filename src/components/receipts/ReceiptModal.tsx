import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Store, 
  Calendar, 
  User as UserIcon, 
  MapPin, 
  CreditCard,
  QrCode,
  Sparkles,
  Barcode,
  Share2
} from 'lucide-react';
import { OrderReceipt } from '../../types';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';

interface ReceiptModalProps {
  receipt: OrderReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Tarjeta Débito/Crédito';
      case 'cash_on_delivery': return 'Efectivo contra entrega';
      case 'pse_transfer': return 'Transferencia PSE / Nequi';
      case 'digital_wallet': return 'Billetera Digital D2';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#11141b] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-800 flex flex-col relative"
      >
        {/* Top Control Bar (Non printable) */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#11141b]/95 backdrop-blur-md z-10 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Recibo Oficial D2
            </span>
            <span className="text-xs text-gray-400 font-mono">#{receipt.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-print-receipt"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c212b] hover:bg-[#232936] text-gray-200 text-xs font-bold transition-colors shadow-2xs border border-gray-700"
            >
              <Printer className="w-4 h-4 text-gray-300" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-[#1c212b]"
              aria-label="Cerrar recibo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-gray-200 bg-[#11141b]">
          
          {/* Header of Supermercado D2 */}
          <div className="text-center border-b border-dashed border-gray-800 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-2xl mb-2 shadow-md">
              D2
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-100 font-display">
              SUPERMERCADO D2 S.A.S.
            </h1>
            <p className="text-xs font-semibold text-emerald-400">"Tu tienda, tu confianza"</p>
            <p className="text-[11px] text-gray-400 mt-1">
              NIT: 900.824.195-2 • Régimen Común • Sede Principal Calle 85 # 15-20, Bogotá
            </p>
            <p className="text-[11px] text-gray-400">
              Tel: (601) 320-9870 • Línea de Atención: 01 8000 920 222
            </p>
          </div>

          {/* Invoice Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#1c212b] border border-gray-800 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Factura / Recibo:</span>
              <span className="font-mono font-bold text-gray-100">{receipt.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Fecha y Hora:</span>
              <span className="font-semibold text-gray-200">{formatDate(receipt.createdAt)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Cliente:</span>
              <span className="font-semibold text-gray-200 truncate block">{receipt.userName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Método de Pago:</span>
              <span className="font-semibold text-gray-200 truncate block">{getPaymentMethodLabel(receipt.paymentMethod)}</span>
            </div>
          </div>

          {/* Customer & Delivery Data */}
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong className="text-gray-300">Dirección de Entrega:</strong> {receipt.deliveryAddress}</p>
            {receipt.userPhone && <p><strong className="text-gray-300">Contacto:</strong> {receipt.userPhone}</p>}
            {receipt.notes && <p><strong className="text-gray-300">Instrucciones:</strong> {receipt.notes}</p>}
          </div>

          {/* Itemized Table */}
          <div className="border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1c212b] border-b border-gray-800 text-gray-300 font-extrabold">
                  <th className="p-2.5">Cant.</th>
                  <th className="p-2.5">Producto</th>
                  <th className="p-2.5 text-right">P. Unit.</th>
                  <th className="p-2.5 text-center">IVA</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-medium">
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1c212b]/40">
                    <td className="p-2.5 font-bold text-gray-200 text-center w-12">
                      {item.quantity}
                    </td>
                    <td className="p-2.5">
                      <p className="font-bold text-gray-100 leading-tight">{item.productName}</p>
                      <span className="text-[10px] text-gray-400">{item.unit}</span>
                      {item.discountAmount > 0 && (
                        <span className="ml-1 text-[10px] text-emerald-400 font-semibold">
                          (Desc: -{formatCurrency(item.discountAmount)})
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono text-gray-300">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-2.5 text-center text-[11px] text-gray-400">
                      {item.taxRate === 0 ? '0%' : formatPercent(item.taxRate)}
                    </td>
                    <td className="p-2.5 text-right font-bold font-mono text-gray-100">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            
            {/* Tax breakdown summary box */}
            <div className="w-full sm:w-1/2 p-3 rounded-2xl bg-[#1c212b] border border-gray-800 text-xs space-y-1.5">
              <span className="text-[11px] font-bold text-gray-300 block uppercase tracking-wider">
                Desglose Tributario (IVA):
              </span>
              {receipt.taxDetails && receipt.taxDetails.length > 0 ? (
                receipt.taxDetails.map((td, i) => (
                  <div key={i} className="flex justify-between text-gray-400 text-[11px]">
                    <span>{td.name}:</span>
                    <span className="font-mono font-medium text-gray-300">{formatCurrency(td.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Total IVA discriminado:</span>
                  <span className="font-mono text-gray-300">{formatCurrency(receipt.taxTotal)}</span>
                </div>
              )}
              {receipt.appliedPromoCode && (
                <div className="flex justify-between text-emerald-400 text-[11px] font-bold pt-1 border-t border-gray-800">
                  <span>Cupón aplicado ({receipt.appliedPromoCode}):</span>
                  <span>-{formatCurrency(receipt.discountTotal)}</span>
                </div>
              )}
            </div>

            {/* Financial Totals */}
            <div className="w-full sm:w-1/2 space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal Bruto:</span>
                <span className="font-mono font-medium text-gray-200">{formatCurrency(receipt.subtotal)}</span>
              </div>
              {receipt.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Descuento Promocional:</span>
                  <span className="font-mono">-{formatCurrency(receipt.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Impuesto IVA Total:</span>
                <span className="font-mono font-medium text-gray-200">{formatCurrency(receipt.taxTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Flete / Envío:</span>
                <span className="font-mono font-medium text-gray-200">
                  {receipt.shippingFee === 0 ? 'Gratis' : formatCurrency(receipt.shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-gray-700 flex justify-between items-baseline text-gray-100">
                <span className="text-sm font-extrabold font-display">TOTAL PAGADO:</span>
                <span className="text-xl font-black font-display text-emerald-400 font-mono">
                  {formatCurrency(receipt.total)}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Receipt Certification */}
          <div className="border-t border-dashed border-gray-800 pt-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-gray-500">
              <div className="flex items-center gap-1 text-[11px]">
                <QrCode className="w-4 h-4 text-gray-400" />
                <span>Facturación Electrónica DIAN Validada</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1 text-[11px]">
                <Barcode className="w-4 h-4 text-gray-400" />
                <span>CUFE: 88f2a...c04f</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-gray-300">
              ¡Gracias por preferir Supermercado D2! Tu tienda, tu confianza.
            </p>
            <p className="text-[10px] text-gray-500">
              Para peticiones, quejas o reclamos conserve este recibo o comuníquese a soporte@d2supermercado.com
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

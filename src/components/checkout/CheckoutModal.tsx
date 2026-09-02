import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  MapPin, 
  Phone, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';
import { CartCalculation, User, OrderReceipt } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  cartCalculation: CartCalculation;
  onConfirmOrder: (
    deliveryAddress: string,
    paymentMethod: 'credit_card' | 'cash_on_delivery' | 'pse_transfer' | 'digital_wallet',
    userPhone?: string,
    notes?: string
  ) => Promise<{ success: boolean; receipt?: OrderReceipt; error?: string }>;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  cartCalculation,
  onConfirmOrder,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const [address, setAddress] = useState(user?.address || 'Calle 85 # 15-20, Apto 301, Bogotá');
  const [phone, setPhone] = useState(user?.phone || '+57 310 876 5432');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash_on_delivery' | 'pse_transfer' | 'digital_wallet'>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Por favor ingresa la dirección de entrega.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await onConfirmOrder(address, paymentMethod, phone, notes);
      if (res.success && res.receipt) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onClose();
      } else {
        setErrorMessage(res.error || 'No se pudo procesar la compra.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al procesar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#11141b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800 flex flex-col relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#11141b]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-100 font-display">
                Finalizar Compra Segura
              </h2>
              <p className="text-xs text-gray-400">Supermercado D2 • Tu tienda, tu confianza</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-[#1c212b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* User auth check banner */}
          {!user && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Debes iniciar sesión para completar la compra</p>
                <p className="text-[11px] text-amber-400">Podrás guardar tu historial de compras y consultar tus recibos.</p>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Ingresar / Crear cuenta
              </button>
            </div>
          )}

          {/* Delivery Details */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-100 font-display mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              1. Datos de Entrega
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Dirección de Entrega Completa *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Calle 85 # 15-20, Apto 301, Bogotá"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#1c212b] text-xs text-gray-100 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#1c212b] text-xs text-gray-100 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Instrucciones o Notas de Entrega
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Timbre 301 o dejar en portería"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#1c212b] text-xs text-gray-100 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-100 font-display mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              2. Método de Pago
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'credit_card',
                  title: 'Tarjeta Débito / Crédito',
                  desc: 'Visa, Mastercard, American Express',
                  icon: CreditCard,
                },
                {
                  id: 'pse_transfer',
                  title: 'PSE / Transferencia Bancaria',
                  desc: 'Bancolombia, Davivienda, Nequi',
                  icon: Smartphone,
                },
                {
                  id: 'cash_on_delivery',
                  title: 'Efectivo contra entrega',
                  desc: 'Paga al momento de recibir tus víveres',
                  icon: Banknote,
                },
                {
                  id: 'digital_wallet',
                  title: 'Billetera Digital D2',
                  desc: 'Saldo prepago y bonos de regalo',
                  icon: Sparkles,
                }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 shadow-xs ring-2 ring-emerald-500/30'
                        : 'border-gray-800 hover:border-gray-700 bg-[#1c212b]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-[#11141b] text-gray-400 border border-gray-800'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-100">{method.title}</h4>
                      <p className="text-[11px] text-gray-400">{method.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-4 rounded-2xl bg-[#1c212b] border border-gray-800 space-y-2 text-xs">
            <h4 className="font-bold text-gray-200 flex items-center justify-between">
              <span>Resumen del Pedido ({cartCalculation.items.length} artículos)</span>
              <span className="text-emerald-400 font-extrabold">{formatCurrency(cartCalculation.grandTotal)}</span>
            </h4>

            <div className="space-y-1 text-gray-400 pt-1 border-t border-gray-800">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span className="font-medium text-gray-200">{formatCurrency(cartCalculation.subtotal)}</span>
              </div>
              {cartCalculation.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Descuento aplicado ({cartCalculation.appliedPromo?.code}):</span>
                  <span>-{formatCurrency(cartCalculation.discountTotal)}</span>
                </div>
              )}
              {cartCalculation.taxDetails.map((t) => (
                <div key={t.taxId} className="flex justify-between">
                  <span>{t.name}:</span>
                  <span className="text-gray-300">{formatCurrency(t.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="text-gray-200">{cartCalculation.shippingFee === 0 ? 'Gratis' : formatCurrency(cartCalculation.shippingFee)}</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting || !user}
            className={`w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/40 transition-all ${
              isSubmitting || !user ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Recibo y Confirmando Pedido...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Generar Recibo ({formatCurrency(cartCalculation.grandTotal)})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-500">
            Al confirmar tu pedido, se emitirá tu factura/recibo oficial de Supermercado D2 y se guardará en tu historial.
          </p>

        </form>

      </div>
    </div>
  );
};

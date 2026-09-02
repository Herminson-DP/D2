import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Percent, 
  Info,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { CartCalculation, DiscountPromotion, Product } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCalculation: CartCalculation;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onApplyCoupon: (code: string) => { success: boolean; message?: string };
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
  availablePromos: DiscountPromotion[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartCalculation,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
  availablePromos,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);

    const res = onApplyCoupon(couponInput.trim().toUpperCase());
    if (res.success) {
      setCouponSuccess(res.message || '¡Cupón aplicado correctamente!');
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Cupón inválido');
    }
  };

  const handleQuickPromoSelect = (code: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    const res = onApplyCoupon(code);
    if (res.success) {
      setCouponSuccess(`¡Cupón ${code} aplicado!`);
    } else {
      setCouponError(res.message || 'Cupón no aplicable a este carrito');
    }
  };

  const freeShippingThreshold = 70000;
  const progressToFreeShipping = Math.min(100, Math.round((cartCalculation.subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartCalculation.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#11141b] border-l border-gray-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#1c212b]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-100 font-display">
                  Carrito de Compras
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  {cartCalculation.items.length} {cartCalculation.items.length === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cartCalculation.items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-gray-400 hover:text-red-400 font-semibold px-2 py-1 rounded transition-colors"
                  title="Vaciar carrito"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-[#1c212b] transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartCalculation.items.length > 0 && (
            <div className="px-5 py-3 bg-emerald-950/40 border-b border-emerald-900/60">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  {remainingForFreeShipping === 0 
                    ? '¡Felicidades! Tienes Envío Gratis' 
                    : `Agrega ${formatCurrency(remainingForFreeShipping)} más para Envío Gratis`}
                </span>
                <span className="font-bold">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-gray-800">
            {cartCalculation.items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1c212b] text-gray-500 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-100 mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4">
                  Añade productos frescos y de calidad de nuestro catálogo para comenzar tu pedido.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs"
                >
                  Explorar Catálogo D2
                </button>
              </div>
            ) : (
              cartCalculation.items.map((it) => (
                <div key={it.product.id} className="pt-4 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={it.product.imageUrl}
                    alt={it.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-800 bg-[#1c212b] flex-shrink-0 opacity-90"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-100 leading-snug line-clamp-1">
                          {it.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(it.product.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {it.product.unit} • {formatCurrency(it.unitPrice)}
                        <span className="ml-1 text-[10px] text-gray-500">
                          ({it.taxRate === 0 ? 'Exento' : `IVA ${(it.taxRate * 100).toFixed(0)}%`})
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-[#1c212b] rounded-lg p-0.5 border border-gray-800">
                        <button
                          onClick={() => onUpdateQuantity(it.product.id, it.quantity - 1)}
                          className="w-6 h-6 rounded bg-[#11141b] text-gray-300 flex items-center justify-center hover:bg-[#232936] text-xs font-bold shadow-2xs border border-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-100">
                          {it.quantity}
                        </span>
                        <button
                          disabled={it.quantity >= it.product.stock}
                          onClick={() => onUpdateQuantity(it.product.id, it.quantity + 1)}
                          className={`w-6 h-6 rounded bg-[#11141b] text-gray-300 flex items-center justify-center hover:bg-[#232936] text-xs font-bold shadow-2xs border border-gray-700 ${
                            it.quantity >= it.product.stock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-gray-100">
                          {formatCurrency(it.total)}
                        </span>
                        {it.discountAmount > 0 && (
                          <p className="text-[10px] text-emerald-400 font-semibold">
                            -{formatCurrency(it.discountAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {cartCalculation.items.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#1c212b]/60 border-t border-gray-800 space-y-3.5">
              
              {/* Coupon Code Section */}
              <div className="space-y-1.5">
                {cartCalculation.appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-emerald-200">{cartCalculation.appliedPromo.code}</span>
                        <p className="text-[11px] text-emerald-400">
                          {cartCalculation.appliedPromo.title} (-{formatCurrency(cartCalculation.discountTotal)})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Cupón (ej: SUPERD2)"
                          className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#11141b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none uppercase font-bold text-gray-100 placeholder:text-gray-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-bold transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>

                    {/* Quick suggested promos */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">Sugeridos:</span>
                      {availablePromos.slice(0, 2).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleQuickPromoSelect(p.code)}
                          className="text-[10px] bg-[#11141b] hover:bg-[#232936] text-emerald-400 font-bold px-2 py-0.5 rounded border border-gray-800 transition-colors whitespace-nowrap"
                        >
                          {p.code} ({p.discountType === 'percentage' ? `${p.value}%` : formatCurrency(p.value)})
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-400 font-medium">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-400 font-medium">{couponSuccess}</p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-200">{formatCurrency(cartCalculation.subtotal)}</span>
                </div>

                {cartCalculation.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Descuento aplicado:</span>
                    <span>-{formatCurrency(cartCalculation.discountTotal)}</span>
                  </div>
                )}

                {/* Tax Breakdown Details */}
                {cartCalculation.taxDetails.map((tax) => (
                  <div key={tax.taxId} className="flex justify-between text-gray-400">
                    <span>{tax.name}:</span>
                    <span className="font-medium text-gray-300">{formatCurrency(tax.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between">
                  <span>Envío a domicilio:</span>
                  <span className={cartCalculation.shippingFee === 0 ? 'text-emerald-400 font-bold' : 'font-medium text-gray-200'}>
                    {cartCalculation.shippingFee === 0 ? '¡GRATIS!' : formatCurrency(cartCalculation.shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-gray-100 font-display">TOTAL A PAGAR:</span>
                    <p className="text-[10px] text-gray-500">Impuestos y descuentos incluidos</p>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-400 font-display">
                    {formatCurrency(cartCalculation.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                id="btn-proceed-checkout"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/40 transition-all active:scale-[0.98]"
              >
                <span>Continuar y Pagar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

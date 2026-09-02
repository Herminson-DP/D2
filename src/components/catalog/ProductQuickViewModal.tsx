import React, { useState } from 'react';
import { X, Plus, Minus, Check, Tag, ShieldCheck, Truck, Sparkles, Barcode } from 'lucide-react';
import { Product, Category, TaxRule } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface ProductQuickViewModalProps {
  product: Product | null;
  category?: Category;
  taxes: TaxRule[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  currentQuantityInCart: number;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  category,
  taxes,
  onClose,
  onAddToCart,
  currentQuantityInCart,
}) => {
  if (!product) return null;

  const [qty, setQty] = useState<number>(1);
  const isOutOfStock = product.stock <= 0;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const taxRule = taxes.find(t => t.id === product.taxRateId) || taxes.find(t => t.isDefault);
  const taxRate = taxRule ? taxRule.rate : 0.19;

  const handleAdd = () => {
    onAddToCart(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#11141b] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1c212b]/80 hover:bg-[#232936] text-gray-400 hover:text-gray-100 transition-colors shadow-xs border border-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-[#1c212b] relative min-h-[260px] md:min-h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          {hasDiscount && (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-red-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                {category?.name || 'Supermercado D2'}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {product.unit}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-gray-100 leading-tight mb-2 font-display">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-2.5 mb-3">
              <span className="text-2xl font-extrabold text-emerald-400 font-display">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Tax Info */}
            <div className="p-2.5 rounded-xl bg-[#1c212b] border border-gray-800 mb-4 text-xs text-gray-300 flex items-center justify-between">
              <span>Régimen Tributario:</span>
              <span className="font-bold text-gray-100">
                {taxRate === 0 ? 'Exento de IVA (0%)' : `Gravado IVA ${(taxRate * 100).toFixed(0)}%`}
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Barcode & Brand specs */}
            <div className="space-y-1.5 text-xs text-gray-400 mb-6">
              {product.brand && (
                <p><strong>Marca:</strong> <span className="text-gray-200">{product.brand}</span></p>
              )}
              {product.barcode && (
                <p className="flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-gray-500" />
                  <strong>Código de barras:</strong> <span className="text-gray-200">{product.barcode}</span>
                </p>
              )}
              <p>
                <strong>Disponibilidad:</strong>{' '}
                <span className={product.stock > 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {product.stock > 0 ? `${product.stock} unidades en inventario` : 'Agotado'}
                </span>
              </p>
            </div>
          </div>

          {/* Add to cart section */}
          <div>
            {!isOutOfStock ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300">Cantidad:</span>
                  <div className="flex items-center bg-[#1c212b] rounded-xl p-1 border border-gray-800">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-7 h-7 rounded-lg bg-[#11141b] flex items-center justify-center text-gray-200 hover:bg-[#232936] shadow-2xs border border-gray-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-gray-100">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={qty >= product.stock}
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="w-7 h-7 rounded-lg bg-[#11141b] flex items-center justify-center text-gray-200 hover:bg-[#232936] shadow-2xs border border-gray-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar {qty} por {formatCurrency(product.price * qty)}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-bold text-center">
                Producto temporalmente agotado
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

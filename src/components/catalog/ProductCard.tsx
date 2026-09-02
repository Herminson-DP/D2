import React from 'react';
import { Plus, Minus, Check, Eye, Tag, Sparkles, AlertCircle } from 'lucide-react';
import { Product, TaxRule } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  taxes: TaxRule[];
  currentQuantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  taxes,
  currentQuantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onQuickView,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Find tax rule for badge
  const taxRule = taxes.find(t => t.id === product.taxRateId) || taxes.find(t => t.isDefault);
  const taxRate = taxRule ? taxRule.rate : 0.19;

  return (
    <div className="group bg-[#11141b] rounded-2xl border border-gray-800 hover:border-emerald-600/70 hover:shadow-xl hover:shadow-black/50 transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Badges Container */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
        {hasDiscount && (
          <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1">
            <Tag className="w-3 h-3" />
            -{discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px] shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Destacado
          </span>
        )}
      </div>

      {/* Tax Badge (top-right) */}
      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs border ${
          taxRate === 0 
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60' 
            : 'bg-[#1c212b] text-gray-300 border-gray-700'
        }`}>
          {taxRate === 0 ? 'Exento IVA' : `IVA ${(taxRate * 100).toFixed(0)}%`}
        </span>
      </div>

      {/* Product Image Area */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative aspect-4/3 overflow-hidden bg-[#1c212b] cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        
        {/* Quick View overlay button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-2xs"
        >
          <Eye className="w-4 h-4" />
          <span>Vista rápida</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Unit */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold text-emerald-400 truncate">{product.brand || 'D2 Selección'}</span>
            <span className="bg-[#1c212b] px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-300 border border-gray-800">
              {product.unit}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-gray-100 text-sm hover:text-emerald-400 cursor-pointer transition-colors line-clamp-2 leading-snug mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-2 border-t border-gray-800">
          
          {/* Prices */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base sm:text-lg font-extrabold text-gray-100 font-display">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center justify-between text-[11px] mb-3">
            {isOutOfStock ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Agotado temporalmente
              </span>
            ) : isLowStock ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                ¡Últimas {product.stock} unidades!
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                Disponible ({product.stock} unids)
              </span>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2 px-3 rounded-xl bg-[#1c212b] text-gray-500 text-xs font-bold cursor-not-allowed text-center border border-gray-800"
              >
                No disponible
              </button>
            ) : currentQuantityInCart > 0 ? (
              <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-800/80 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(product.id, currentQuantityInCart - 1)}
                  className="w-8 h-8 rounded-lg bg-[#1c212b] text-emerald-300 font-extrabold flex items-center justify-center hover:bg-[#232936] border border-emerald-800/50 shadow-2xs transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-emerald-300 px-2">
                  {currentQuantityInCart} en carrito
                </span>
                <button
                  type="button"
                  disabled={currentQuantityInCart >= product.stock}
                  onClick={() => onUpdateQuantity(product.id, currentQuantityInCart + 1)}
                  className={`w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center hover:bg-emerald-500 shadow-2xs transition-colors ${
                    currentQuantityInCart >= product.stock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

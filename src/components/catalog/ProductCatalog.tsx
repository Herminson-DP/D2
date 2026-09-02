import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Percent, 
  Truck, 
  ShieldCheck, 
  Grid, 
  ListFilter,
  CheckCircle2,
  Apple,
  Milk,
  Beef,
  Croissant,
  Package,
  CupSoda,
  Sparkles as SparklesIcon,
  Cookie,
  ArrowUpDown
} from 'lucide-react';
import { Product, Category, TaxRule, CartCalculation, DiscountPromotion } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  taxes: TaxRule[];
  discounts: DiscountPromotion[];
  cartCalculation: CartCalculation;
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (catId: string | null) => void;
  onApplyCouponCode?: (code: string) => void;
}

// Icon mapping helper
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Apple,
  Milk,
  Beef,
  Croissant,
  Package,
  CupSoda,
  Sparkles: SparklesIcon,
  Cookie,
};

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  taxes,
  discounts,
  cartCalculation,
  onAddToCart,
  onUpdateQuantity,
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onSelectCategory,
  onApplyCouponCode,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategoryId && prod.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchDesc = prod.description.toLowerCase().includes(query);
        const matchBrand = prod.brand?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchBrand) {
          return false;
        }
      }
      // Only offers
      if (onlyOffers && (!prod.originalPrice || prod.originalPrice <= prod.price)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default: featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [products, selectedCategoryId, searchQuery, onlyOffers, sortBy]);

  const activeCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="space-y-6">
      
      {/* Hero Banner with D2 Branding & Slogan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-xl p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold mb-3 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Supermercado D2 • Calidad y Frescura Garantizada</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display mb-2">
            Tu tienda, tu confianza
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-4">
            Explora más de 8 categorías con los mejores precios del mercado. Cálculo automático de impuestos transparentes y descuentos exclusivos.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Envíos gratis desde $70.000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Garantía de frescura 100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-300" />
              <span>Cupones aplicables al instante</span>
            </div>
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
            alt="Supermarket groceries" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Category Filter Chips / Carousel */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-gray-100 font-display">
            Categorías Principales
          </h2>
          {selectedCategoryId && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Ver todas las categorías
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
              selectedCategoryId === null
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-[#11141b] text-gray-300 border border-gray-800 hover:border-emerald-600/60 hover:bg-[#1c212b]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Todos ({products.length})</span>
          </button>

          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || Package;
            const count = products.filter(p => p.categoryId === cat.id).length;
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-[#11141b] text-gray-300 border border-gray-800 hover:border-emerald-600/60 hover:bg-[#1c212b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-[#1c212b] text-gray-400 border border-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Active filter indicators, Sort by, Offers Toggle */}
      <div className="bg-[#11141b] p-4 rounded-2xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Left: Summary and Category info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-200">
            {activeCategory ? activeCategory.name : 'Catálogo Completo'}
          </span>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-400">
            Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
          </span>
          {searchQuery && (
            <span className="text-xs bg-emerald-950/60 text-emerald-300 font-medium px-2 py-0.5 rounded-md border border-emerald-800/60">
              Búsqueda: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Only Offers Filter */}
          <button
            onClick={() => setOnlyOffers(!onlyOffers)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              onlyOffers
                ? 'bg-red-950/60 text-red-300 border border-red-800/80'
                : 'bg-[#1c212b] text-gray-300 hover:bg-[#232936] border border-gray-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-red-400" />
            <span>Solo Ofertas</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#1c212b] rounded-xl px-2.5 py-1.5 border border-gray-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-gray-200 outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#11141b] text-gray-200">Destacados</option>
              <option value="price-asc" className="bg-[#11141b] text-gray-200">Precio: Menor a Mayor</option>
              <option value="price-desc" className="bg-[#11141b] text-gray-200">Precio: Mayor a Menor</option>
              <option value="name" className="bg-[#11141b] text-gray-200">Nombre: A - Z</option>
            </select>
          </div>

        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => {
            const inCart = cartCalculation.items.find(it => it.product.id === prod.id)?.quantity || 0;
            return (
              <ProductCard
                key={prod.id}
                product={prod}
                taxes={taxes}
                currentQuantityInCart={inCart}
                onAddToCart={(p) => onAddToCart(p, 1)}
                onUpdateQuantity={onUpdateQuantity}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-[#11141b] rounded-3xl border border-gray-800 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#1c212b] text-gray-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-1">No se encontraron productos</h3>
          <p className="text-xs text-gray-400 mb-4">
            Intenta cambiar los términos de búsqueda o limpiar los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onSelectCategory(null);
              setOnlyOffers(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          category={categories.find(c => c.id === quickViewProduct.categoryId)}
          taxes={taxes}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(p, q) => onAddToCart(p, q)}
          currentQuantityInCart={cartCalculation.items.find(it => it.product.id === quickViewProduct.id)?.quantity || 0}
        />
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Tag, 
  AlertCircle, 
  DollarSign, 
  Barcode, 
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Product, Category, TaxRule } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ProductController } from '../../controllers/ProductController';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  taxes: TaxRule[];
  onRefreshProducts: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  taxes,
  onRefreshProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [unit, setUnit] = useState('Bolsa 1kg');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('D2 Selección');
  const [taxRateId, setTaxRateId] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(10000);
    setOriginalPrice(undefined);
    setCategoryId(categories[0]?.id || '');
    setStock(25);
    setUnit('Unidad');
    setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setIsFeatured(false);
    setBarcode(`770${Math.floor(100000000 + Math.random() * 900000000)}`);
    setBrand('D2 Frescos');
    const defaultTax = taxes.find(t => t.isDefault) || taxes[0];
    setTaxRateId(defaultTax?.id || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice);
    setCategoryId(prod.categoryId);
    setStock(prod.stock);
    setUnit(prod.unit);
    setImageUrl(prod.imageUrl);
    setIsFeatured(!!prod.isFeatured);
    setBarcode(prod.barcode || '');
    setBrand(prod.brand || '');
    setTaxRateId(prod.taxRateId || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0 || !categoryId) {
      setErrorMessage('Nombre, precio y categoría son obligatorios.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      categoryId,
      stock: Number(stock),
      unit: unit.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      isFeatured,
      barcode: barcode.trim(),
      brand: brand.trim(),
      taxRateId: taxRateId || undefined,
    };

    const res = await ProductController.saveProduct(productPayload);
    setIsSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      onRefreshProducts();
    } else {
      setErrorMessage(res.error || 'Error al guardar el producto.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}" del catálogo de Supermercado D2?`)) {
      const res = await ProductController.deleteProduct(id);
      if (res.success) {
        onRefreshProducts();
      } else {
        alert(res.error || 'Error al eliminar');
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#11141b] p-6 rounded-3xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100 font-display">
              Gestión de Productos
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Administra precios, existencias en inventario, categorías e impuestos asociados a cada ítem.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#11141b] p-4 rounded-2xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código de barras o marca..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#1c212b] border border-gray-800 rounded-xl focus:border-purple-500 outline-none text-gray-100 placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#1c212b] border border-gray-800 rounded-xl outline-none font-bold text-gray-200 cursor-pointer"
          >
            <option value="all">Todas las categorías ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#11141b] rounded-3xl border border-gray-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1c212b] border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-3.5">Producto</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5 text-right">Precio Actual</th>
                <th className="p-3.5 text-center">Stock</th>
                <th className="p-3.5 text-center">Régimen IVA</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-medium">
              {filteredProducts.map((p) => {
                const category = categories.find(c => c.id === p.categoryId);
                const taxRule = taxes.find(t => t.id === p.taxRateId) || taxes.find(t => t.isDefault);
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= 5;

                return (
                  <tr key={p.id} className="hover:bg-[#1c212b]/50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-xl object-cover border border-gray-800 bg-[#1c212b] flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-100 leading-snug">{p.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <span>{p.brand || 'D2'}</span>
                            <span>•</span>
                            <span>{p.unit}</span>
                            {p.barcode && <span>• Cod: {p.barcode}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-xs bg-[#1c212b] text-gray-300 border border-gray-800 px-2 py-0.5 rounded-md font-semibold">
                        {category?.name || 'General'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono">
                      <span className="font-bold text-gray-100">{formatCurrency(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="block text-[10px] text-red-400 line-through">
                          {formatCurrency(p.originalPrice)}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isOutOfStock 
                          ? 'bg-red-950/80 text-red-400 border border-red-800/60' 
                          : isLowStock 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' 
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      }`}>
                        {p.stock} unids
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {taxRule ? taxRule.name : 'IVA Estándar'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-[#1c212b] transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1c212b] transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#11141b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#11141b]/95 backdrop-blur-md z-10">
              <h3 className="text-base font-extrabold text-gray-100 font-display">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-[#1c212b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Manzana Royal Gala"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Categoría *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Unidad / Presentación</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ej: Bolsa 1kg, Pack x6, Unidad"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Precio de Venta ($ COP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Precio Original (Opcional para descuento)</label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice || ''}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Mayor al precio de venta para mostrar oferta"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Stock Disponible *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Impuesto IVA Aplicable *</label>
                  <select
                    value={taxRateId}
                    onChange={(e) => setTaxRateId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none font-medium"
                  >
                    {taxes.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({(t.rate * 100).toFixed(0)}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej: D2 Selección, Alquería"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="770123456789"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1">URL de Imagen del Producto</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre el producto, beneficios, origen..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="chk-featured" className="text-xs font-bold text-gray-300 cursor-pointer">
                    Marcar como Producto Destacado en la portada
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-100 hover:bg-[#1c212b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Tag, 
  Calendar, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { DiscountPromotion, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DiscountTaxController } from '../../controllers/DiscountTaxController';

interface DiscountManagementProps {
  discounts: DiscountPromotion[];
  categories: Category[];
  onRefreshDiscounts: () => void;
}

export const DiscountManagement: React.FC<DiscountManagementProps> = ({
  discounts,
  categories,
  onRefreshDiscounts,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountPromotion | null>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(30000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setCode('PROMOD2');
    setTitle('Promoción Especial D2');
    setDescription('Descuento aplicable en caja');
    setDiscountType('percentage');
    setValue(10);
    setMinSpend(30000);
    setMaxDiscount(20000);
    setCategoryId('');
    setIsActive(true);
    setValidUntil('2026-12-31');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (d: DiscountPromotion) => {
    setEditingDiscount(d);
    setCode(d.code);
    setTitle(d.title);
    setDescription(d.description);
    setDiscountType(d.discountType);
    setValue(d.value);
    setMinSpend(d.minSpend);
    setMaxDiscount(d.maxDiscount);
    setCategoryId(d.categoryId || '');
    setIsActive(d.isActive);
    setValidUntil(d.validUntil);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || value <= 0) {
      setError('Código, título y valor válido son obligatorios.');
      return;
    }

    const payload: DiscountPromotion = {
      id: editingDiscount ? editingDiscount.id : `promo_${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      discountType,
      value: Number(value),
      minSpend: Number(minSpend),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      categoryId: categoryId || undefined,
      isActive,
      validUntil,
    };

    const res = await DiscountTaxController.saveDiscount(payload);
    if (res.success) {
      setIsModalOpen(false);
      onRefreshDiscounts();
    } else {
      setError(res.error || 'Error al guardar descuento');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`¿Eliminar la promoción con código "${code}"?`)) {
      const res = await DiscountTaxController.deleteDiscount(id);
      if (res.success) {
        onRefreshDiscounts();
      }
    }
  };

  const handleToggleActive = async (d: DiscountPromotion) => {
    const updated = { ...d, isActive: !d.isActive };
    await DiscountTaxController.saveDiscount(updated);
    onRefreshDiscounts();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#11141b] p-6 rounded-3xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <Percent className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100 font-display">
              Gestión de Descuentos y Promociones
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Crea cupones de descuento porcentuales o de monto fijo que se aplican automáticamente al total del carrito.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((disc) => {
          const targetCat = categories.find(c => c.id === disc.categoryId);
          return (
            <div 
              key={disc.id}
              className={`bg-[#11141b] rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                disc.isActive ? 'border-gray-800 hover:border-purple-500/50' : 'border-gray-800/50 opacity-60 bg-[#11141b]/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-sm text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/60">
                    {disc.code}
                  </span>
                  <button
                    onClick={() => handleToggleActive(disc)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      disc.isActive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-[#1c212b] text-gray-500 border border-gray-800'
                    }`}
                  >
                    {disc.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <h3 className="text-xs font-bold text-gray-100 mb-1">{disc.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{disc.description}</p>

                <div className="p-3 rounded-xl bg-[#1c212b] border border-gray-800 space-y-1 text-xs text-gray-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Beneficio:</span>
                    <span className="font-bold text-gray-100">
                      {disc.discountType === 'percentage' ? `${disc.value}% OFF` : `${formatCurrency(disc.value)} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compra mínima:</span>
                    <span className="font-medium text-gray-200">{formatCurrency(disc.minSpend)}</span>
                  </div>
                  {disc.categoryId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Categoría:</span>
                      <span className="font-semibold text-purple-400">{targetCat?.name || 'Específica'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800">
                    <span>Vence:</span>
                    <span>{disc.validUntil}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-800">
                <button
                  onClick={() => openEditModal(disc)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-[#1c212b] transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(disc.id, disc.code)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1c212b] transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#11141b] rounded-3xl max-w-lg w-full shadow-2xl border border-gray-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-gray-100">
                {editingDiscount ? 'Editar Promoción' : 'Nueva Promoción'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-400 font-bold bg-red-950/50 p-2.5 rounded-xl border border-red-800/60">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Código de Cupón *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUPERD2"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 uppercase font-mono font-bold focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Tipo de Descuento</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 font-medium focus:border-purple-500 outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ COP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Título de la Promoción *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: 15% en Frutas y Verduras"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    {discountType === 'percentage' ? 'Porcentaje (%) *' : 'Valor ($ COP) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 font-bold focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Monto Mínimo de Compra ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Categoría Objetivo (Opcional)</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                >
                  <option value="">Aplica a todo el catálogo D2</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Válido Hasta</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Promoción Activa</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

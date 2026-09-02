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
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Percent className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Gestión de Descuentos y Promociones
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Crea cupones de descuento porcentuales o de monto fijo que se aplican automáticamente al total del carrito.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
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
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                disc.isActive ? 'border-slate-200/80 hover:border-purple-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    {disc.code}
                  </span>
                  <button
                    onClick={() => handleToggleActive(disc)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      disc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {disc.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-1">{disc.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{disc.description}</p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs text-slate-600 mb-3">
                  <div className="flex justify-between">
                    <span>Beneficio:</span>
                    <span className="font-bold text-slate-900">
                      {disc.discountType === 'percentage' ? `${disc.value}% OFF` : `${formatCurrency(disc.value)} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compra mínima:</span>
                    <span className="font-medium text-slate-700">{formatCurrency(disc.minSpend)}</span>
                  </div>
                  {disc.categoryId && (
                    <div className="flex justify-between">
                      <span>Categoría:</span>
                      <span className="font-semibold text-purple-700">{targetCat?.name || 'Específica'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>Vence:</span>
                    <span>{disc.validUntil}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(disc)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(disc.id, disc.code)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingDiscount ? 'Editar Promoción' : 'Nueva Promoción'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código de Cupón *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUPERD2"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Descuento</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ COP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Promoción *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: 15% en Frutas y Verduras"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {discountType === 'percentage' ? 'Porcentaje (%) *' : 'Valor ($ COP) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto Mínimo de Compra ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría Objetivo (Opcional)</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="">Aplica a todo el catálogo D2</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Válido Hasta</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>Promoción Activa</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
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

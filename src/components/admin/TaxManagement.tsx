import React, { useState } from 'react';
import { 
  ReceiptText, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ShieldCheck, 
  Info,
  Percent
} from 'lucide-react';
import { TaxRule } from '../../types';
import { formatPercent } from '../../utils/formatters';
import { DiscountTaxController } from '../../controllers/DiscountTaxController';

interface TaxManagementProps {
  taxes: TaxRule[];
  onRefreshTaxes: () => void;
}

export const TaxManagement: React.FC<TaxManagementProps> = ({
  taxes,
  onRefreshTaxes,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);

  const [name, setName] = useState('');
  const [rate, setRate] = useState<number>(19); // as percentage e.g. 19 for 0.19
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTax(null);
    setName('IVA Reducido 5%');
    setRate(5);
    setDescription('Tarifa diferencial para productos seleccionados de la canasta básica');
    setIsDefault(false);
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: TaxRule) => {
    setEditingTax(t);
    setName(t.name);
    setRate(t.rate * 100);
    setDescription(t.description || '');
    setIsDefault(!!t.isDefault);
    setIsActive(t.isActive);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rate < 0) {
      setError('Nombre y tasa de impuesto válidos son obligatorios.');
      return;
    }

    const payload: TaxRule = {
      id: editingTax ? editingTax.id : `tax_${Date.now()}`,
      name: name.trim(),
      rate: Number(rate) / 100,
      description: description.trim(),
      isDefault,
      isActive,
    };

    const res = await DiscountTaxController.saveTax(payload);
    if (res.success) {
      setIsModalOpen(false);
      onRefreshTaxes();
    } else {
      setError(res.error || 'Error al guardar impuesto');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar la regla tributaria "${name}"?`)) {
      const res = await DiscountTaxController.deleteTax(id);
      if (res.success) {
        onRefreshTaxes();
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#11141b] p-6 rounded-3xl border border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100 font-display">
              Configuración de Impuestos (IVA)
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Administra las tasas impositivas oficiales aplicables a los productos en el cálculo del carrito y recibos de Supermercado D2.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tasa de Impuesto</span>
        </button>
      </div>

      {/* Tax Rules List */}
      <div className="bg-[#11141b] rounded-3xl border border-gray-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1c212b] border-b border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                <th className="p-3.5">Nombre / Concepto</th>
                <th className="p-3.5 text-center">Porcentaje (%)</th>
                <th className="p-3.5">Descripción Legal</th>
                <th className="p-3.5 text-center">Tipo</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-medium">
              {taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-[#1c212b]/50">
                  <td className="p-3.5">
                    <p className="font-bold text-gray-100">{tax.name}</p>
                    <span className="text-[10px] text-gray-500 font-mono">ID: {tax.id}</span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="font-mono font-bold text-sm text-purple-400 bg-purple-950/80 border border-purple-800/60 px-2.5 py-1 rounded-lg">
                      {(tax.rate * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="p-3.5 text-gray-400 max-w-xs truncate">
                    {tax.description || 'Sin descripción'}
                  </td>

                  <td className="p-3.5 text-center">
                    {tax.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-400 border border-purple-800/60">
                        Por defecto
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Específico</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tax.isActive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-[#1c212b] text-gray-500 border border-gray-800'
                    }`}>
                      {tax.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(tax)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-[#1c212b] transition-colors"
                        title="Editar impuesto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tax.id, tax.name)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1c212b] transition-colors"
                        title="Eliminar impuesto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#11141b] rounded-3xl max-w-md w-full shadow-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-gray-100">
                {editingTax ? 'Editar Tasa Impositiva' : 'Nueva Tasa Impositiva'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-400 font-bold bg-red-950/50 p-2.5 rounded-xl border border-red-800/60">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nombre del Impuesto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: IVA General 19%"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Porcentaje de Tasa (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  placeholder="19"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 font-bold font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Justificación o aplicación legal..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-800 bg-[#1c212b] text-gray-100 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Marcar como tasa por defecto para productos sin IVA específico</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Tasa Activa</span>
                </label>
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
                  Guardar Impuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

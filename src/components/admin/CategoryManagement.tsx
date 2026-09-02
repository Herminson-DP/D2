import React, { useState } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Apple, 
  Milk, 
  Beef, 
  Croissant, 
  Package, 
  CupSoda, 
  Sparkles, 
  Cookie 
} from 'lucide-react';
import { Category, Product } from '../../types';
import { CategoryController } from '../../controllers/CategoryController';

interface CategoryManagementProps {
  categories: Category[];
  products: Product[];
  onRefreshCategories: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Apple', label: 'Frutas / Manzana' },
  { name: 'Milk', label: 'Lácteos' },
  { name: 'Beef', label: 'Carnes' },
  { name: 'Croissant', label: 'Panadería' },
  { name: 'Package', label: 'Despensa' },
  { name: 'CupSoda', label: 'Bebidas' },
  { name: 'Sparkles', label: 'Aseo' },
  { name: 'Cookie', label: 'Snacks' },
];

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  products,
  onRefreshCategories,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Package');
  const [color, setColor] = useState('emerald');
  const [bannerUrl, setBannerUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIconName('Package');
    setColor('emerald');
    setBannerUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIconName(cat.iconName);
    setColor(cat.color);
    setBannerUrl(cat.bannerUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    const payload: Category = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      iconName,
      color,
      bannerUrl: bannerUrl.trim() || undefined,
    };

    const res = await CategoryController.saveCategory(payload);
    if (res.success) {
      setIsModalOpen(false);
      onRefreshCategories();
    } else {
      setError(res.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const productCount = products.filter(p => p.categoryId === id).length;
    if (productCount > 0) {
      alert(`No puedes eliminar esta categoría porque contiene ${productCount} productos asociados.`);
      return;
    }

    if (confirm(`¿Eliminar la categoría "${name}"?`)) {
      const res = await CategoryController.deleteCategory(id);
      if (res.success) {
        onRefreshCategories();
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Gestión de Categorías
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Organiza las secciones del supermercado para facilitar la búsqueda a los clientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <div 
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">/{cat.slug}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                    title="Editar categoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Categoría *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lácteos y Quesos"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción para clientes..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ícono Representativo</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
                >
                  {AVAILABLE_ICONS.map(i => (
                    <option key={i.name} value={i.name}>{i.label}</option>
                  ))}
                </select>
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
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

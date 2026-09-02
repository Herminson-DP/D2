import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { formatDate } from '../../utils/formatters';
import { UserManagementController } from '../../controllers/UserManagementController';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onRefreshUsers: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onRefreshUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'cliente' | 'admin'>('all');
  
  // Modal for creating/editing user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('cliente');
    setPhone('');
    setAddress('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPhone(u.phone || '');
    setAddress(u.address || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Nombre y correo son requeridos.');
      return;
    }

    const payload: User = {
      id: editingUser ? editingUser.id : `usr_${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
      isActive: editingUser ? editingUser.isActive : true,
    };

    const res = await UserManagementController.saveUser(payload);
    if (res.success) {
      setIsModalOpen(false);
      onRefreshUsers();
    } else {
      setError(res.error || 'Error al guardar usuario');
    }
  };

  const handleRoleToggle = async (u: User) => {
    const newRole: UserRole = u.role === 'admin' ? 'cliente' : 'admin';
    if (u.id === currentUser?.id && newRole === 'cliente') {
      if (!confirm('¿Estás seguro de quitarte a ti mismo los permisos de administrador?')) {
        return;
      }
    }
    await UserManagementController.updateUserRole(u.id, newRole);
    onRefreshUsers();
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Gestión de Usuarios y Roles
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Administra los roles de acceso (Administrador y Cliente), datos de contacto y cuentas de Supermercado D2.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Usuario</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Todos los roles ({users.length})</option>
            <option value="cliente">Clientes ({users.filter(u => u.role === 'cliente').length})</option>
            <option value="admin">Administradores ({users.filter(u => u.role === 'admin').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="p-3.5">Usuario</th>
                <th className="p-3.5">Contacto / Dirección</th>
                <th className="p-3.5 text-center">Rol Asignado</th>
                <th className="p-3.5">Fecha de Registro</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs ${
                          isAdmin ? 'bg-purple-600' : 'bg-emerald-600'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ml-1.5 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                                (Tú)
                              </span>
                            )}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <p className="text-xs">{u.phone || 'Sin teléfono'}</p>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                        {u.address || 'Sin dirección registrada'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        title="Click para cambiar de rol"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {isAdmin ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        <span>{isAdmin ? 'Administrador' : 'Cliente'}</span>
                      </button>
                    </td>

                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Andrés Morales"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andres@ejemplo.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rol de Usuario</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                >
                  <option value="cliente">Cliente (Catálogo, compras, historial)</option>
                  <option value="admin">Administrador (CRUD completo, reportes, gestión)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle 100 # 15-20"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
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
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

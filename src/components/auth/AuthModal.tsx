import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { AuthController } from '../../controllers/AuthController';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnauthorizedDomain(false);
    setIsLoading(true);

    const res = await AuthController.loginWithEmail(loginEmail, loginPassword);
    setIsLoading(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Error al iniciar sesión');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnauthorizedDomain(false);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Por favor llena los campos requeridos (*)');
      return;
    }
    setIsLoading(true);

    const res = await AuthController.registerUser(regName, regEmail, regPassword, regPhone, regAddress);
    setIsLoading(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Error al registrar usuario');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsUnauthorizedDomain(false);
    setIsLoading(true);
    const res = await AuthController.loginWithGoogle();
    setIsLoading(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      if (res.isUnauthorizedDomain) {
        setIsUnauthorizedDomain(true);
      }
      setError(res.error || 'Error en inicio con Google');
    }
  };

  const handleDirectUserLogin = async (email: string, name?: string, role: UserRole = 'cliente') => {
    setIsLoading(true);
    setError(null);
    setIsUnauthorizedDomain(false);
    const res = await AuthController.loginWithDirectEmail(email, name, role);
    setIsLoading(false);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Error al iniciar sesión');
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      const demo = await AuthController.loginAsDemo(role);
      onAuthSuccess(demo);
      onClose();
    } catch (e: any) {
      setError('Error al cargar cuenta demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#11141b] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-800 flex flex-col relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#1c212b]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              D2
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-100 font-display">
                Supermercado D2
              </h2>
              <p className="text-xs text-gray-400">Tu tienda, tu confianza</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-[#1c212b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 bg-[#1c212b]">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'login'
                ? 'border-emerald-500 text-emerald-400 bg-[#11141b]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'register'
                ? 'border-emerald-500 text-emerald-400 bg-[#11141b]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta (Cliente)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-medium space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              
              {isUnauthorizedDomain && (
                <div className="pt-2 border-t border-red-900/60 mt-2 space-y-2">
                  <p className="text-[11px] text-gray-300 leading-normal">
                    Para habilitar el popup de Google en tu proyecto Firebase, agrega este dominio en <strong className="text-white">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>:
                  </p>
                  <code className="block p-1.5 rounded-lg bg-black/40 text-[10px] text-amber-300 font-mono select-all overflow-x-auto">
                    {window.location.hostname}
                  </code>
                  <p className="text-[11px] text-gray-300 font-semibold">
                    Alternativamente, puedes ingresar de inmediato con tu cuenta:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDirectUserLogin('herminsondelgado6@gmail.com', 'Herminson Delgado', 'admin')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ingresar como herminsondelgado6@gmail.com (Admin)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Ingresar a mi cuenta</span>
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej: Laura Gómez"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="laura@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full px-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Calle 10 # 20-30"
                    className="w-full px-3 py-2 text-xs bg-[#1c212b] rounded-xl border border-gray-800 focus:border-emerald-500 outline-none text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#1c212b] border border-gray-800 text-[11px] text-gray-400">
                <span>Rol asignado por defecto: <strong className="text-gray-200">Cliente</strong></span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Crear Cuenta de Cliente</span>
              </button>
            </form>
          )}

          {/* Social / Google Login */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-800 hover:bg-[#1c212b] text-gray-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors bg-[#11141b]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Accounts */}
          <div className="p-3.5 rounded-2xl bg-[#1c212b] border border-gray-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-2">
              Acceso Rápido para Pruebas (1-Click)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('cliente')}
                disabled={isLoading}
                className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/80 text-xs font-bold text-left transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <div>
                  <p className="leading-tight">Rol Cliente</p>
                  <span className="text-[9px] font-normal text-blue-400">Mariana Gómez</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 text-xs font-bold text-left transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <div>
                  <p className="leading-tight">Rol Admin</p>
                  <span className="text-[9px] font-normal text-purple-400">Carlos Mendoza</span>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

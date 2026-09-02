import { User, UserRole } from '../types';
import { UserModel } from '../models/UserModel';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

export class AuthController {
  static getCurrentUser(): User | null {
    return UserModel.getCurrentUser();
  }

  static subscribeToAuth(callback: (user: User | null) => void): () => void {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const users = await UserModel.getUsers();
        let matched = users.find(u => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        if (matched) {
          UserModel.setCurrentUser(matched);
          callback(matched);
        } else {
          const newUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || 'Usuario D2',
            role: 'cliente',
            createdAt: new Date().toISOString(),
            isActive: true,
          };
          await UserModel.saveUser(newUser);
          UserModel.setCurrentUser(newUser);
          callback(newUser);
        }
      } else {
        const local = UserModel.getCurrentUser();
        callback(local);
      }
    });

    return unsub;
  }

  static async loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await UserModel.getUsers();
      let matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (fbErr: any) {
        if (!matchedUser) {
          return { success: false, error: 'Credenciales inválidas o usuario no registrado.' };
        }
      }

      if (!matchedUser) {
        matchedUser = {
          id: `usr_${Date.now()}`,
          email: email,
          name: email.split('@')[0],
          role: 'cliente',
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        await UserModel.saveUser(matchedUser);
      }

      if (!matchedUser.isActive) {
        return { success: false, error: 'Esta cuenta ha sido desactivada por un administrador.' };
      }

      UserModel.setCurrentUser(matchedUser);
      return { success: true, user: matchedUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  }

  static async registerUser(name: string, email: string, pass: string, phone?: string, address?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await UserModel.getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
      }

      let authUserId = `usr_${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        authUserId = cred.user.uid;
      } catch (fbErr: any) {
        console.warn('Firebase registration fallback to local model:', fbErr.message);
      }

      // Default role is strictly 'cliente' as requested
      const newUser: User = {
        id: authUserId,
        email: email,
        name: name,
        role: 'cliente',
        phone: phone || '',
        address: address || '',
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      await UserModel.saveUser(newUser);
      UserModel.setCurrentUser(newUser);
      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al crear la cuenta' };
    }
  }

  static async loginWithGoogle(): Promise<{ success: boolean; user?: User; error?: string; isUnauthorizedDomain?: boolean }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const users = await UserModel.getUsers();
      let matched = users.find(u => u.email.toLowerCase() === (googleUser.email || '').toLowerCase());

      if (!matched) {
        const isAdminEmail = (googleUser.email || '').toLowerCase() === 'herminsondelgado6@gmail.com';
        matched = {
          id: googleUser.uid,
          email: googleUser.email || '',
          name: googleUser.displayName || 'Usuario Google',
          role: isAdminEmail ? 'admin' : 'cliente',
          avatarUrl: googleUser.photoURL || undefined,
          phone: googleUser.phoneNumber || undefined,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        await UserModel.saveUser(matched);
      }

      if (!matched.isActive) {
        return { success: false, error: 'Esta cuenta ha sido desactivada por un administrador.' };
      }

      UserModel.setCurrentUser(matched);
      return { success: true, user: matched };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const isUnauthorized = err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'));
      return { 
        success: false, 
        isUnauthorizedDomain: isUnauthorized,
        error: isUnauthorized 
          ? 'El dominio de esta vista previa no está en la lista de dominios autorizados de Firebase Console (Authentication > Configuración > Dominios autorizados).' 
          : (err.message || 'Error en autenticación con Google') 
      };
    }
  }

  static async loginWithDirectEmail(email: string, name?: string, role: UserRole = 'cliente'): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const users = await UserModel.getUsers();
      let matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matched) {
        matched = {
          id: `usr_${Date.now()}`,
          email: email,
          name: name || email.split('@')[0],
          role: role,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        await UserModel.saveUser(matched);
      }

      if (!matched.isActive) {
        return { success: false, error: 'Esta cuenta ha sido desactivada por un administrador.' };
      }

      UserModel.setCurrentUser(matched);
      return { success: true, user: matched };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  }

  static async loginAsDemo(role: UserRole): Promise<User> {
    const users = await UserModel.getUsers();
    let demoUser = users.find(u => u.role === role);
    if (!demoUser) {
      demoUser = {
        id: `usr_demo_${role}`,
        email: `${role}@d2supermercado.com`,
        name: role === 'admin' ? 'Carlos Mendoza (Admin D2)' : 'Mariana Gómez (Cliente)',
        role: role,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      await UserModel.saveUser(demoUser);
    }
    UserModel.setCurrentUser(demoUser);
    return demoUser;
  }

  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    UserModel.setCurrentUser(null);
  }

  static async switchRoleForTesting(currentUserId: string, newRole: UserRole): Promise<User | null> {
    const user = await UserModel.getUserById(currentUserId);
    if (user) {
      user.role = newRole;
      await UserModel.saveUser(user);
      UserModel.setCurrentUser(user);
      return user;
    }
    return null;
  }
}

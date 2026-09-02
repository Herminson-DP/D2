import { User, UserRole } from '../types';
import { UserModel } from '../models/UserModel';

export class UserManagementController {
  static async getAllUsers(): Promise<User[]> {
    return await UserModel.getUsers();
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const ok = await UserModel.updateUserRole(userId, newRole);
      return { success: ok };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al actualizar rol de usuario' };
    }
  }

  static async toggleUserStatus(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const ok = await UserModel.toggleUserStatus(userId);
      return { success: ok };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al cambiar estado de usuario' };
    }
  }

  static async saveUser(user: User): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!user.email || !user.name) {
        return { success: false, error: 'Nombre y correo son requeridos.' };
      }
      const saved = await UserModel.saveUser(user);
      return { success: true, user: saved };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al guardar usuario' };
    }
  }
}

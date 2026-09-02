import { User, UserRole } from '../types';
import { DEMO_USERS } from './initialSeedData';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const USERS_STORAGE_KEY = 'd2_supermarket_users';
const CURRENT_USER_KEY = 'd2_current_logged_user';

export class UserModel {
  private static localUsers: User[] = [];

  static async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      if (!snapshot.empty) {
        const firestoreUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
        this.localUsers = firestoreUsers;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(firestoreUsers));
        return firestoreUsers;
      }
    } catch (e) {
      console.warn('Firestore users load fallback', e);
    }

    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        this.localUsers = JSON.parse(saved);
        return this.localUsers;
      } catch (e) {
        // ignore
      }
    }

    this.localUsers = [...DEMO_USERS];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.localUsers));
    this.syncSeedToFirestore();
    return this.localUsers;
  }

  private static async syncSeedToFirestore() {
    try {
      for (const u of DEMO_USERS) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }
    } catch (e) {
      console.warn('Silent sync users', e);
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
    } catch (e) {
      // ignore
    }
    const users = await this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  static async saveUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.localUsers = users;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (e) {
      console.warn('Firestore save user error', e);
    }
    return user;
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.role = newRole;
    this.localUsers = users;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (e) {
      console.warn('Firestore update user role error', e);
    }
    return true;
  }

  static async toggleUserStatus(userId: string): Promise<boolean> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.isActive = !user.isActive;
    this.localUsers = users;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    try {
      await updateDoc(doc(db, 'users', userId), { isActive: user.isActive });
    } catch (e) {
      console.warn('Firestore toggle user status error', e);
    }
    return true;
  }

  static getCurrentUser(): User | null {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  }
}

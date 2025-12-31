
import { User } from '../types';

const USERS_KEY = 'askdata_users_db';
const CURRENT_USER_KEY = 'askdata_session';

export class AuthService {
  static async signup(email: string, name: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: User) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      plan: 'free'
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    await this.login(email);
    return newUser;
  }

  static async login(email: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email);
    if (!user) throw new Error('User not found');
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  }

  static logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
  }

  static getCurrentUser(): User | null {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  }

  /**
   * Upgrades a user to pro status in the local storage database and current session.
   */
  static upgradeToPro(userId: string) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index !== -1) {
      users[index].plan = 'pro';
      users[index].isSubscriptionActive = true;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.plan = 'pro';
        currentUser.isSubscriptionActive = true;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        window.dispatchEvent(new Event('auth-change'));
      }
    }
  }
}
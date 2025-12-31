
import { User } from '../types';

/**
 * PaymentService handles the subscription flow.
 * Personal payment details have been removed per user request.
 * In a production environment, this would integrate with Stripe or another provider.
 */
export class PaymentService {
  public static readonly PLAN_PRICE_INR = 99;

  /**
   * Simulates a secure checkout process.
   * This is a placeholder for a real payment gateway integration.
   */
  static async processSimulation(user: User): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        console.log('[Payment] Initiating secure checkout simulation for:', user.email);
        
        // Simulate network latency for payment processing
        await new Promise(r => setTimeout(r, 2000)); 

        // Corrected keys to match services/auth.ts for consistent local database access
        const USERS_KEY = 'askdata_users_db';
        const SESSION_KEY = 'askdata_session';
        
        const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const index = users.findIndex(u => u.email === user.email);
        
        if (index !== -1) {
          // Object literal error fixed by updating User interface in types.ts
          const updatedUser: User = {
            ...users[index],
            plan: 'pro',
            isSubscriptionActive: true,
            stripeSubscriptionId: `SIM_${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 
          };
          
          users[index] = updatedUser;
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
          
          // Notify the app of the auth/plan change
          window.dispatchEvent(new Event('auth-change'));
          console.log('[Payment] Checkout successful. Plan upgraded to Pro.');
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.error("[Payment] Critical error during simulation:", err);
        resolve(false);
      }
    });
  }
}
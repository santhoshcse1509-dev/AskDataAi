
import { User } from '../types';
import { AuthService } from './auth';

declare var Razorpay: any;

export class RazorpayService {
  private static readonly KEY_ID = 'rzp_test_placeholder'; // Replace with process.env.RAZORPAY_KEY_ID

  static openCheckout(user: User, onOrderSuccess: () => void) {
    const options = {
      key: this.KEY_ID,
      amount: 9900, // 99 INR in paise
      currency: "INR",
      name: "AskData AI",
      description: "Pro Monthly Subscription",
      image: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
      handler: async (response: any) => {
        // In production, verify signature on backend:
        // response.razorpay_payment_id
        // response.razorpay_order_id
        // response.razorpay_signature
        
        console.log("Payment Successful:", response.razorpay_payment_id);
        AuthService.upgradeToPro(user.id);
        onOrderSuccess();
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      notes: {
        address: "AskData AI Corporate Office"
      },
      theme: {
        color: "#4f46e5"
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      alert("Payment failed: " + response.error.description);
    });
    rzp.open();
  }
}

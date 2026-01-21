
import React, { useState } from 'react';
import { RazorpayService } from '../services/razorpay';
import { User } from '../types';

interface Props {
  user: User | null;
  onClose: () => void;
  onUpgrade: () => void;
  onLoginRequired: () => void;
}

const PricingPage: React.FC<Props> = ({ user, onClose, onUpgrade, onLoginRequired }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    
    setIsProcessing(true);
    RazorpayService.openCheckout(user, () => {
      setIsProcessing(false);
      onUpgrade();
      onClose();
    });
    
    // Safety timeout in case checkout takes too long to appear
    setTimeout(() => {
      if (isProcessing) setIsProcessing(false);
    }, 10000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Free Plan */}
        <div className="flex-1 p-12 border-r border-slate-50">
          <div className="mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Starter</span>
            <h3 className="text-xl font-black text-slate-900">Free Explorer</h3>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-8">Test the AI on your data for 7 days.</p>
          <div className="mb-8 flex items-baseline">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">₹0</span>
            <span className="text-slate-400 font-bold text-xs ml-2">/7 Days</span>
          </div>
          <ul className="space-y-4 mb-12">
            {['Unlimited AI Queries', 'CSV & Excel Uploads', 'Auto Schema Detection', 'Browser-Native SQL'].map(f => (
              <li key={f} className="flex items-center text-sm text-slate-600 font-medium">
                <svg className="w-5 h-5 text-indigo-200 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-4 text-center bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100">
            {user?.plan === 'pro' ? 'Legacy Plan' : 'Current Active Trial'}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="flex-1 p-12 bg-slate-900 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest">Best Value</div>
          
          <div className="relative z-10">
            <div className="mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Power User</span>
              <h3 className="text-xl font-black text-white">AskData Pro</h3>
            </div>
            <p className="text-white/50 text-sm font-medium mb-8">Unlock unlimited exports and priority AI.</p>
            <div className="mb-8 flex items-baseline">
              <span className="text-5xl font-black text-white tracking-tighter">₹99</span>
              <span className="text-white/40 font-bold text-xs ml-2">/Monthly</span>
            </div>
            <ul className="space-y-4 mb-12">
              {['Everything in Free', 'Unlimited Downloads', 'Priority Gemini 3 Pro', 'Commercial Usage License'].map(f => (
                <li key={f} className="flex items-center text-sm text-white font-bold">
                  <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={handleUpgrade}
            disabled={user?.plan === 'pro' || isProcessing}
            className={`mt-auto w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center space-x-2
              ${user?.plan === 'pro' 
                ? 'bg-slate-800 text-slate-500 cursor-default' 
                : isProcessing
                  ? 'bg-indigo-500 text-white cursor-wait opacity-80'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.97] shadow-indigo-500/20'
              }
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initializing...
              </>
            ) : user?.plan === 'pro' ? 'Subscription Active' : 'Upgrade to Pro'}
          </button>
          <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4">
            Secured by Razorpay • UPI • Cards • Netbanking
          </p>
        </div>
      </div>

      <button 
        onClick={onClose} 
        disabled={isProcessing}
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 z-[110] disabled:opacity-30"
        aria-label="Close pricing"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default PricingPage;

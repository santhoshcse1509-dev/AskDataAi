
import React from 'react';

interface Props {
  type: 'privacy' | 'terms' | 'refund' | 'contact';
  onClose: () => void;
}

const LegalPages: React.FC<Props> = ({ type, onClose }) => {
  const content = {
    privacy: {
      title: "Privacy Policy",
      text: "At AskData AI, we take your privacy seriously. Your uploaded CSV/Excel files are processed entirely in your browser. We do not store your data on our servers. Your personal information is never sold to third parties. We use browser local storage purely to maintain your query history and session."
    },
    terms: {
      title: "Terms & Conditions",
      text: "By using AskData AI, you agree to our terms. This is a free utility tool provided as-is. We are not responsible for data loss or incorrect SQL generation. You are responsible for the data you upload."
    },
    refund: {
      title: "Refund Policy",
      text: "AskData AI is a completely free service. There are no payments or subscriptions required, therefore no refunds are applicable."
    },
    contact: {
      title: "Contact Us",
      text: "Need help? Email us at hello@askdata.ai. Our community team typically responds within 24-48 hours."
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{content.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium">
          {content.text}
        </p>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Close</button>
      </div>
    </div>
  );
};

export default LegalPages;

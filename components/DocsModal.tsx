
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DocsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "1. Uploading Data",
      content: "Simply drag and drop your .csv or .xlsx file into the uploader. We support files up to 10MB. Your data is processed locally in your browser session for maximum privacy."
    },
    {
      title: "2. Querying with AI",
      content: "Ask questions in natural language. For example:\n• 'What are the top 5 highest values in the Price column?'\n• 'Count how many rows have a status of Pending.'\n• 'Group sales by Region and sum the Revenue.'"
    },
    {
      title: "3. Exporting Results",
      content: "Once you have your filtered results, use the Export menu to download your data as CSV, Excel, or PDF. All exports are free and unlimited."
    },
    {
      title: "4. Security & Privacy",
      content: "AskData AI uses a read-only SQL engine (AlaSQL). The AI generates only SELECT queries, meaning it is impossible for the AI to delete or modify your source data. Your uploaded files are never used to train our models."
    },
    {
      title: "5. Unlimited Free Access",
      content: "AskData AI is free for everyone. Enjoy unlimited file uploads, priority AI processing, and unlimited downloads at no cost."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Documentation</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Learn how to master your data</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-lg font-bold text-indigo-600">{section.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          ))}
          
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="text-indigo-900 font-bold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Pro Tip
            </h4>
            <p className="text-sm text-indigo-700">
              You can reference specific columns by name in your queries. Use backticks if your column names have spaces, e.g., "Tell me total `Monthly Revenue`".
            </p>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocsModal;

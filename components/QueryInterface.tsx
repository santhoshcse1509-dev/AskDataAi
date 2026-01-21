
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/gemini.ts';
import { DataService } from '../services/db.ts';
import { TableData, QueryResult } from '../types.ts';

interface Props {
  tableData: TableData;
  onQueryResult: (result: QueryResult, question: string) => void;
  externalQuery?: string;
}

const QueryInterface: React.FC<Props> = ({ tableData, onQueryResult, externalQuery }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'ai' | 'sql' | 'idle'>('idle');

  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingStatus('ai');
    setError(null);

    try {
      // 1. Get SQL from AI
      const aiResponse = await GeminiService.generateSQL(
        query,
        tableData.columns,
        tableData.rows.slice(0, 5)
      );

      if (aiResponse.isAmbiguous) {
        setError(`I'm not sure what you meant: ${aiResponse.clarificationMessage || "Could you rephrase that?"}`);
        setIsProcessing(false);
        setProcessingStatus('idle');
        return;
      }

      setProcessingStatus('sql');
      // 2. Execute SQL via DataService
      const results = await DataService.executeQuery(aiResponse.sql);

      // 3. Update Parent
      onQueryResult({
        sql: aiResponse.sql,
        explanation: aiResponse.explanation,
        data: results
      }, query);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while processing your question.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('idle');
    }
  };

  const suggestions = [
    "Summarize the data",
    "List top 5 records",
    "How many entries in total?",
    "Filter by specific value"
  ];

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6 relative">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
             </svg>
             <h3 className="font-bold uppercase tracking-widest text-xs">AI Data Assistant</h3>
          </div>
          {isProcessing && (
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
               <span>{processingStatus === 'ai' ? 'Gemini is thinking...' : 'Executing SQL engine...'}</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleAsk} className="relative group">
          <input
            type="text"
            className={`w-full pl-6 pr-32 py-5 border-2 rounded-2xl text-lg font-medium outline-none transition-all
              ${error 
                ? 'border-red-200 focus:border-red-500 bg-red-50/30 text-red-900' 
                : 'border-gray-100 focus:border-indigo-500 bg-gray-50/50 focus:bg-white shadow-inner focus:shadow-md text-indigo-950'
              } disabled:opacity-75 disabled:cursor-not-allowed`}
            placeholder="Ask anything about your file..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[100px]"
          >
            {isProcessing ? (
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Ask'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start space-x-3 shadow-sm">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Oops!</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => { setQuery(s); }}
            disabled={isProcessing}
            className="text-xs font-semibold px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-full hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QueryInterface;

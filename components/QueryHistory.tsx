
import React from 'react';
import { QueryHistoryItem } from '../types';

interface Props {
  history: QueryHistoryItem[];
  onSelect: (item: QueryHistoryItem) => void;
  onClear: () => void;
}

const QueryHistory: React.FC<Props> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest flex items-center">
          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0116 0z" />
          </svg>
          Recent Queries
        </h3>
        <button 
          onClick={onClear}
          className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full px-6 py-4 text-left hover:bg-indigo-50/50 transition-colors group flex justify-between items-center"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-700 truncate group-hover:text-indigo-700">
                {item.question}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QueryHistory;

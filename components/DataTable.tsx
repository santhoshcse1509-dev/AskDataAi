
import React from 'react';

interface Props {
  data: any[];
  columns: string[];
  title?: string;
  maxRows?: number;
}

const DataTable: React.FC<Props> = ({ data, columns, title, maxRows = 100 }) => {
  const displayData = data.slice(0, maxRows);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-dashed border-gray-200 rounded-2xl shadow-sm">
        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
        <p className="text-gray-500 font-medium">No results found for your query.</p>
        <p className="text-sm text-gray-400 mt-1">Try phrasing your question differently.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</h4>
        </div>
      )}
      <div className="relative overflow-hidden border border-gray-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-indigo-50/30 transition-colors group">
                  {columns.map((col, colIdx) => {
                    const value = row[col];
                    const isNumeric = typeof value === 'number';
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:text-indigo-900 transition-colors ${isNumeric ? 'font-mono text-right' : ''}`}
                      >
                        {value?.toString() ?? <span className="text-gray-300 italic">null</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > maxRows && (
          <div className="px-6 py-3 bg-gray-50/80 backdrop-blur-sm text-xs text-gray-500 border-t border-gray-200 flex justify-between items-center">
            <span>Showing first <b>{maxRows}</b> records</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200 font-semibold text-gray-600">Total: {data.length} records</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;

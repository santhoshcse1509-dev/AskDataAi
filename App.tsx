
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import DataTable from './components/DataTable';
import QueryInterface from './components/QueryInterface';
import QueryHistory from './components/QueryHistory';
import AuthModal from './components/AuthModal';
import DocsModal from './components/DocsModal';
import LegalPages from './components/LegalPages';
import { TableData, QueryResult, QueryHistoryItem, User } from './types';
import { DataService } from './services/db';
import { AuthService } from './services/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedHistoryQuery, setSelectedHistoryQuery] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | 'refund' | 'contact' | null>(null);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuth = () => setUser(AuthService.getCurrentUser());
    window.addEventListener('auth-change', syncAuth);
    return () => window.removeEventListener('auth-change', syncAuth);
  }, []);

  useEffect(() => {
    if (tableData) {
      const savedHistory = localStorage.getItem(`askdata_history_${tableData.fileName}`);
      if (savedHistory) setQueryHistory(JSON.parse(savedHistory));
      else setQueryHistory([]);
    }
  }, [tableData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadSuccess = async (data: TableData) => {
    setTableData(data);
    setQueryResult(null);
    try {
      await DataService.initTable(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueryResult = (result: QueryResult, question: string) => {
    setQueryResult(result);
    const newItem: QueryHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      question,
      sql: result.sql,
      explanation: result.explanation,
      timestamp: Date.now(),
    };
    setQueryHistory(prev => [newItem, ...prev].slice(0, 20));
    localStorage.setItem(`askdata_history_${tableData?.fileName}`, JSON.stringify([newItem, ...queryHistory].slice(0, 20)));
  };

  const loadSampleData = () => {
    const sampleRows = [
      { ID: 1, Product: 'Coffee Maker', Category: 'Kitchen', Sales: 1200, Region: 'North' },
      { ID: 2, Product: 'Smartphone', Category: 'Electronics', Sales: 4500, Region: 'West' },
      { ID: 3, Product: 'Headphones', Category: 'Electronics', Sales: 800, Region: 'North' },
      { ID: 4, Product: 'Desk Lamp', Category: 'Home', Sales: 300, Region: 'South' },
      { ID: 5, Product: 'Air Fryer', Category: 'Kitchen', Sales: 2100, Region: 'East' },
      { ID: 6, Product: 'Smart Watch', Category: 'Electronics', Sales: 1500, Region: 'West' },
      { ID: 7, Product: 'Toaster', Category: 'Kitchen', Sales: 450, Region: 'South' },
    ];
    const data: TableData = {
      fileName: 'Sales_Sample.csv',
      rows: sampleRows,
      columns: [
        { name: 'ID', type: 'number' },
        { name: 'Product', type: 'string' },
        { name: 'Category', type: 'string' },
        { name: 'Sales', type: 'number' },
        { name: 'Region', type: 'string' },
      ]
    };
    handleUploadSuccess(data);
  };

  const handleDownload = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!queryResult) return;
    const baseName = `AskData_${tableData?.fileName.split('.')[0]}_Result`;
    switch (format) {
      case 'csv': DataService.downloadResultAsCSV(queryResult.data, baseName); break;
      case 'xlsx': DataService.downloadResultAsExcel(queryResult.data, baseName); break;
      case 'pdf': DataService.downloadResultAsPDF(queryResult.data, baseName); break;
    }
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen pb-32 bg-slate-50/50">
      <Header 
        user={user} 
        onLoginClick={() => setIsAuthModalOpen(true)} 
        onDocsClick={() => setIsDocsOpen(true)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => {}} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      {legalType && <LegalPages type={legalType} onClose={() => setLegalType(null)} />}
      
      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {!tableData ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Deployment Ready • Free Forever
              </div>
              <h2 className="text-7xl font-extrabold text-slate-900 tracking-tighter leading-[1]">
                Chat with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Spreadsheets</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Upload CSV or Excel files. Ask anything. Get instant insights. 
                Private, browser-native processing powered by Gemini AI.
              </p>
            </div>
            
            <div className="w-full max-w-xl space-y-4">
              <FileUploader 
                onUploadSuccess={handleUploadSuccess} 
                isLoading={isUploading} 
                setIsLoading={setIsUploading} 
              />
              <button 
                onClick={loadSampleData}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center justify-center w-full space-x-2"
              >
                <span>No file? Try our sample Sales dataset</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            </div>

            <div className="flex items-center space-x-12 pt-8">
               {[
                 { label: 'Private', value: '100%' },
                 { label: 'Access', value: 'Free' },
                 { label: 'Intelligence', value: 'Gemini' }
               ].map((item, i) => (
                 <React.Fragment key={i}>
                   <div className="text-center">
                     <p className="text-2xl font-black text-slate-900">{item.value}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                   </div>
                   {i < 2 && <div className="w-px h-8 bg-slate-200"></div>}
                 </React.Fragment>
               ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col space-y-4 ring-1 ring-slate-100">
                <div className="flex items-center space-x-3">
                   <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   </div>
                   <div className="truncate">
                     <p className="text-sm font-bold text-slate-900 truncate">{tableData.fileName}</p>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{tableData.rows.length} rows loaded</p>
                   </div>
                </div>
                <button 
                  onClick={() => setTableData(null)}
                  className="w-full py-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold text-[10px] rounded-xl transition-all uppercase tracking-widest border border-slate-100"
                >
                  Clear Dataset
                </button>
              </div>
              <QueryHistory history={queryHistory} onSelect={(item) => setSelectedHistoryQuery(item.question)} onClear={() => setQueryHistory([])} />
            </aside>

            <section className="lg:col-span-3 space-y-8">
              <QueryInterface tableData={tableData} onQueryResult={handleQueryResult} externalQuery={selectedHistoryQuery} />

              {queryResult ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                       <div className="space-y-1">
                         <h3 className="font-black text-slate-900 flex items-center uppercase text-xs tracking-widest">
                           <span className="w-1.5 h-4 bg-indigo-600 rounded-full mr-2"></span> Result Preview
                         </h3>
                         <p className="text-xs text-slate-400 font-medium">{queryResult.explanation}</p>
                       </div>
                       <div className="relative" ref={exportMenuRef}>
                          <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-800 shadow-xl shadow-slate-200"
                          >
                            <span>Download Results</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                          </button>
                          {showExportMenu && (
                            <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">
                               {['csv', 'xlsx', 'pdf'].map(fmt => (
                                 <button 
                                   key={fmt} 
                                   onClick={() => handleDownload(fmt as any)}
                                   className="w-full text-left px-5 py-4 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center space-x-3 transition-colors border-b border-slate-50 last:border-0"
                                 >
                                   <span className="bg-slate-100 px-2 py-0.5 rounded text-[8px] font-black uppercase text-slate-500">{fmt}</span>
                                   <span>As {fmt.toUpperCase()}</span>
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                    <DataTable data={queryResult.data} columns={Object.keys(queryResult.data[0] || {})} />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm ring-1 ring-slate-100">
                  <DataTable data={tableData.rows.slice(0, 10)} columns={tableData.columns.map(c => c.name)} title="Dataset Preview" />
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-4 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 flex items-center justify-center space-x-8 z-40">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">© 2024 ASKDATA AI</span>
        <button onClick={() => setLegalType('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Privacy</button>
        <button onClick={() => setLegalType('terms')} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Terms</button>
        <button onClick={() => setLegalType('contact')} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Contact</button>
      </footer>
    </div>
  );
};

export default App;

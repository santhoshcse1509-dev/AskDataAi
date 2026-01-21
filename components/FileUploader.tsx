
import React, { useRef, useState } from 'react';
import { TableData, ColumnMetadata } from '../types';

interface Props {
  onUploadSuccess: (data: TableData) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

declare var XLSX: any;
declare var Papa: any;

const FileUploader: React.FC<Props> = ({ onUploadSuccess, isLoading, setIsLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Detecting columns...');

  const detectType = (value: any): ColumnMetadata['type'] => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string') {
      const date = Date.parse(value);
      if (!isNaN(date) && value.length > 8 && (value.includes('-') || value.includes('/') || value.includes(':'))) {
        return 'date';
      }
    }
    return 'string';
  };

  const validateAndProcessFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 10MB.");
      return;
    }

    setIsLoading(true);
    setStatusMessage('Reading file structure...');
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Small timeout to allow UI to update
    setTimeout(() => {
      if (extension === 'csv') {
        setStatusMessage('Parsing CSV rows...');
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results: any) => {
            processParsedData(results.data, file.name);
          },
          error: (err: any) => {
            console.error(err);
            alert("Error parsing CSV: " + err.message);
            setIsLoading(false);
          }
        });
      } else if (['xlsx', 'xls', 'ods'].includes(extension || '')) {
        setStatusMessage('Reading Excel sheets...');
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            processParsedData(jsonData, file.name);
          } catch (err: any) {
            alert("Error reading Excel file: " + err.message);
            setIsLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported file format. Please upload CSV or Excel.');
        setIsLoading(false);
      }
    }, 300);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Fix: React has no exported member named 'DragOverEvent', use DragEvent
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isLoading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const processParsedData = (rows: any[], fileName: string) => {
    setStatusMessage('Finalizing data model...');
    if (!rows || rows.length === 0) {
      alert('The file appears to be empty or could not be read properly.');
      setIsLoading(false);
      return;
    }

    const cleanedRows = rows.map(row => {
        const newRow: any = {};
        for (const key in row) {
            const val = row[key];
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                newRow[key] = JSON.stringify(val);
            } else {
                newRow[key] = val;
            }
        }
        return newRow;
    });

    const firstRow = cleanedRows[0];
    const columns: ColumnMetadata[] = Object.keys(firstRow).map(key => ({
      name: key,
      type: detectType(firstRow[key])
    }));

    onUploadSuccess({ columns, rows: cleanedRows, fileName });
    setIsLoading(false);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white p-10 rounded-2xl border-2 transition-all duration-200 shadow-xl relative overflow-hidden
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
          : 'border-gray-200 hover:border-indigo-300'
        }`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
           <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                 </svg>
              </div>
           </div>
           <div className="text-center">
             <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{statusMessage}</p>
             <p className="text-xs text-slate-400 font-bold mt-1">Please keep this tab open</p>
           </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className={`p-5 rounded-2xl transition-colors duration-200 ${isDragging ? 'bg-indigo-600' : 'bg-indigo-50'}`}>
          <svg 
            className={`w-14 h-14 transition-colors duration-200 ${isDragging ? 'text-white' : 'text-indigo-600'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {isDragging ? 'Drop it here!' : 'Upload Data'}
          </h3>
          <p className="text-gray-500 max-w-sm">
            Drag and drop your CSV or Excel file here, or click to browse.
          </p>
        </div>
        
        <div className="w-full">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept=".csv,.xlsx,.xls,.ods" 
            onChange={handleFileChange} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border-2 border-dashed transition-all 
              ${isLoading 
                ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50' 
                : isDragging
                  ? 'bg-white border-indigo-400 text-indigo-700'
                  : 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Select or Drop File</span>
          </button>
        </div>
        <p className="text-xs text-gray-400">Supported formats: .csv, .xlsx, .xls</p>
      </div>
    </div>
  );
};

export default FileUploader;

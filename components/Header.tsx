
import React from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onDocsClick: () => void;
}

const Header: React.FC<Props> = ({ user, onLoginClick, onDocsClick }) => {
  return (
    <header className="sticky top-0 z-[60] py-4 glass-panel mb-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900">AskData<span className="text-indigo-600">AI</span></h1>
        </div>

        <nav className="flex items-center space-x-8">
          <button onClick={onDocsClick} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Docs</button>
          
          {user ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900">{user.name}</span>
                <button 
                  onClick={() => AuthService.logout()}
                  className="text-[8px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-slate-200">
                {user.name[0]}
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

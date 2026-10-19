import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Toast({ toastMessage }) {
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md px-4 sm:px-0 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-3 pointer-events-none">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium ${
          toastMessage.type === 'error'
            ? 'bg-red-950 text-red-100 border-red-800'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        {toastMessage.type === 'error' ? (
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="leading-snug">{toastMessage.msg}</span>
      </div>
    </div>
  );
}

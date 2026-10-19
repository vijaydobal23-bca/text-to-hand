import React from 'react';
import { X, RefreshCw, Download } from 'lucide-react';

export default function InspectModal({
  inspectPage,
  setInspectPage,
  regenerateSinglePage,
  downloadSingleJpg
}) {
  if (!inspectPage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={() => setInspectPage(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shrink-0">
              Page {inspectPage.pageNumber}
            </span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {inspectPage.fileName}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {inspectPage.styleName} • {inspectPage.width} × {inspectPage.height} px (300 DPI)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => regenerateSinglePage(inspectPage.pageNumber)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-roll</span>
            </button>
            <button
              type="button"
              onClick={() => downloadSingleJpg(inspectPage)}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectPage(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-900/95 flex-1 flex justify-center items-start">
          <img
            src={inspectPage.url}
            alt={`Full Preview Page ${inspectPage.pageNumber}`}
            className="max-w-full h-auto rounded shadow-2xl border border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

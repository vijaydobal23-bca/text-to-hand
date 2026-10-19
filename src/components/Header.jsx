import React from 'react';
import { PenTool, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

export default function Header({
  applyReferenceLookPreset,
  textStats,
  setShowReadmeModal,
  generateAllPages,
  isGenerating,
  generationProgress,
  content
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Studio Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-sm shrink-0">
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 truncate">
                Handwriting Studio
              </h1>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                Biomechanical Pen Engine • 300 DPI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block truncate">
              Organic Letter Variation • Notebook Line Locking • Print-Ready A4
            </p>
          </div>
        </div>

        {/* Action Controls & Generation Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={applyReferenceLookPreset}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold transition-colors cursor-pointer"
            title="Reset to the exact Reference Image student look"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Match Reference</span>
            <span className="md:hidden">Reference</span>
          </button>

          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/70 text-xs text-slate-600">
            <span>
              <strong className="text-slate-900">{textStats.words}</strong> w
            </span>
            <span className="text-slate-300">|</span>
            <span>
              <strong className="text-slate-900">{textStats.pages}</strong> A4{' '}
              {textStats.pages === 1 ? 'page' : 'pages'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowReadmeModal(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Studio Specifications & Guide"
            aria-label="Studio Specifications & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={generateAllPages}
            disabled={isGenerating || !content.trim()}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="hidden sm:inline">
                  Rendering {generationProgress.current}/{generationProgress.total}...
                </span>
                <span className="sm:hidden">
                  {generationProgress.current}/{generationProgress.total}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>
                  Generate <span className="hidden sm:inline">Image</span> ({textStats.pages}p)
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

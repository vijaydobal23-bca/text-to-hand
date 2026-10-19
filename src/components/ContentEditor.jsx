import React from 'react';
import {
  FileText,
  Trash2,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { SAMPLE_CONTENTS } from '../constants/sampleContents.js';

export default function ContentEditor({
  content,
  setContent,
  applyReferenceLookPreset,
  nonLatinWarning,
  textStats,
  layoutInfo,
  generateAllPages,
  isGenerating,
  generationProgress
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">1. Content Editor</h2>
        </div>

        {/* Preset Sample Loaders */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={applyReferenceLookPreset}
            className="text-[11px] font-semibold px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Reference
          </button>
          <button
            type="button"
            onClick={() => setContent(SAMPLE_CONTENTS.shortNote)}
            className="text-[11px] font-medium px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Short Note
          </button>
          <button
            type="button"
            onClick={() => setContent(SAMPLE_CONTENTS.assignment)}
            className="text-[11px] font-medium px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Assignment
          </button>
          <button
            type="button"
            onClick={() => setContent(SAMPLE_CONTENTS.multiPageEssay)}
            className="text-[11px] font-medium px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Essay
          </button>
        </div>
      </div>

      {/* Formatting Tips Bar */}
      <div className="px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
        <span className="truncate">
          Use <code className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700"># Heading</code>,{' '}
          <code className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700">•</code> lists, or{' '}
          <code className="px-1 py-0.5 rounded bg-slate-200/70 text-slate-700">~~mistake~~</code> scratch-out
        </span>
        {content.length > 0 && (
          <button
            type="button"
            onClick={() => setContent('')}
            className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {nonLatinWarning && (
        <div className="mx-3.5 sm:mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{nonLatinWarning}</span>
        </div>
      )}

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type or paste your assignment, lecture notes, lab report, or essay here..."
          rows={14}
          className="w-full flex-1 min-h-[260px] sm:min-h-[320px] p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 outline-none text-sm text-slate-800 leading-relaxed resize-y font-sans"
        />

        {/* Live Word / Character / Estimated A4 Page Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Words
            </div>
            <div className="text-sm font-bold text-slate-800">{textStats.words}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Characters
            </div>
            <div className="text-sm font-bold text-slate-800">{textStats.chars}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Lines
            </div>
            <div className="text-sm font-bold text-slate-800">
              {layoutInfo.pages.reduce((acc, p) => acc + p.lines.length, 0)}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-indigo-50/80 border border-indigo-100">
            <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold">
              A4 Pages
            </div>
            <div className="text-sm font-bold text-indigo-700">{textStats.pages}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={generateAllPages}
            disabled={isGenerating || !content.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  Generating Page {generationProgress.current} of {generationProgress.total}...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Image ({textStats.pages} A4 Pages)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

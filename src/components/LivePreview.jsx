import React from 'react';
import { Eye, Edit3, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function LivePreview({
  previewMode,
  setPreviewMode,
  livePreviewPageIdx,
  setLivePreviewPageIdx,
  layoutInfo,
  settings,
  selectedStyle,
  content,
  setContent,
  liveCanvasRef,
  downloadCurrentPreviewPage
}) {
  const totalPages = Math.max(1, layoutInfo.pages.length);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
      <div className="p-3 sm:p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
        {/* Toggle between 300-DPI Canvas Preview and Direct On-Page Typing Sheet */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 text-xs">
          <button
            type="button"
            onClick={() => setPreviewMode('canvas')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewMode === 'canvas'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Realistic Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('live-sheet')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewMode === 'live-sheet'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Type directly on the lined notebook paper with a live cursor"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Type on Page</span>
          </button>
        </div>

        {/* Page Switcher for Multi-page Live Inspection */}
        {previewMode === 'canvas' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={livePreviewPageIdx <= 0}
              onClick={() => setLivePreviewPageIdx((p) => Math.max(0, p - 1))}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-1.5">
              Page {livePreviewPageIdx + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={livePreviewPageIdx >= totalPages - 1}
              onClick={() => setLivePreviewPageIdx((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Viewport */}
      <div className="p-3 sm:p-5 bg-slate-100/80 flex-1 flex flex-col items-center justify-center min-h-[350px]">
        {previewMode === 'canvas' ? (
          <div
            className={`w-full flex items-center justify-center ${
              settings.orientation === 'landscape' ? 'max-w-[480px]' : 'max-w-[400px]'
            }`}
          >
            <div className="w-full rounded-lg overflow-hidden shadow-md border border-slate-300/90 bg-white transition-all">
              <canvas
                ref={liveCanvasRef}
                className="w-full h-auto block cursor-pointer"
                onClick={() => setPreviewMode('live-sheet')}
                title="Click to type directly on the notebook sheet, or use Content Editor"
                style={{
                  aspectRatio:
                    settings.orientation === 'landscape' ? '3508 / 2480' : '2480 / 3508'
                }}
              />
            </div>
          </div>
        ) : (
          /* Direct On-Page Notebook Editor (Matching reference image) */
          <div className="w-full max-w-[420px] rounded-lg overflow-hidden shadow-md border-2 border-slate-800 bg-white relative">
            {/* Vertical Pink/Red Margin Line */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: '42px',
                width: '2px',
                backgroundColor: '#f87171'
              }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={true}
              className="w-full min-h-[440px] bg-transparent outline-none resize-none border-0"
              style={{
                paddingTop: '28px',
                paddingLeft: '52px',
                paddingRight: '16px',
                paddingBottom: '28px',
                fontFamily: `"${
                  settings.customFontFamily || selectedStyle.fontFamily
                }", cursive, sans-serif`,
                fontSize: `${Math.round(settings.fontSize * 1.18)}px`,
                lineHeight: '34px',
                color: settings.inkColor,
                wordSpacing: `${Math.round(12 * settings.wordSpacingMultiplier)}px`,
                letterSpacing: `${selectedStyle.letterSpacing * 0.5}px`,
                backgroundImage:
                  'linear-gradient(to bottom, transparent 33px, #94a3b8 33px, #94a3b8 34px)',
                backgroundSize: '100% 34px',
                backgroundAttachment: 'local'
              }}
            />
          </div>
        )}

        {/* Live Preview Metadata & Quick Single-Page 300 DPI Download */}
        <div className="mt-4 w-full flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/70 text-[11px] text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">300 DPI:</span>{' '}
            {layoutInfo.dims.width} × {layoutInfo.dims.height} px JPG
          </div>
          <button
            type="button"
            onClick={downloadCurrentPreviewPage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-all cursor-pointer ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Page {livePreviewPageIdx + 1} JPG</span>
          </button>
        </div>
      </div>
    </section>
  );
}

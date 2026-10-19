import React from 'react';
import {
  Layers,
  Image as ImageIcon,
  Download,
  FolderArchive,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  BookOpen,
  ZoomIn,
  Sparkles
} from 'lucide-react';

export default function OutputGallery({
  galleryRef,
  generatedPages,
  layoutInfo,
  downloadCurrentPreviewPage,
  downloadAllIndividualJpgs,
  downloadAllAsZip,
  isZipping,
  generateAllPages,
  isGenerating,
  clearGeneratedPages,
  isOutdated,
  generationProgress,
  content,
  textStats,
  deleteConfirmPageNum,
  setDeleteConfirmPageNum,
  confirmDeletePage,
  setInspectPage,
  downloadSingleJpg,
  regenerateSinglePage
}) {
  return (
    <section
      ref={galleryRef}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
    >
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Generated A4 Pages Gallery
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/70 text-slate-700">
                {generatedPages.length} {generatedPages.length === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Rendered at 300 DPI ({layoutInfo.dims.width} × {layoutInfo.dims.height} px) print-ready JPEG.
            </p>
          </div>
        </div>

        {generatedPages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadCurrentPreviewPage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Current Page</span>
            </button>

            <button
              type="button"
              onClick={downloadAllIndividualJpgs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>All JPGs</span>
            </button>

            <button
              type="button"
              onClick={downloadAllAsZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
            >
              {isZipping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderArchive className="w-3.5 h-3.5" />
              )}
              <span>Download ZIP ({generatedPages.length})</span>
            </button>

            <button
              type="button"
              onClick={generateAllPages}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate All</span>
            </button>

            <button
              type="button"
              onClick={clearGeneratedPages}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {isOutdated && generatedPages.length > 0 && (
        <div className="mx-4 sm:mx-5 mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Outdated Output:</strong> Content or settings changed since pages were generated.
            </span>
          </div>
          <button
            type="button"
            onClick={generateAllPages}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Now</span>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-2">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              Rendering 300 DPI A4 Page {generationProgress.current} of{' '}
              {generationProgress.total}...
            </span>
            <span>
              {Math.round(
                (generationProgress.current / Math.max(1, generationProgress.total)) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-200"
              style={{
                width: `${
                  (generationProgress.current / Math.max(1, generationProgress.total)) * 100
                }%`
              }}
            />
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {generatedPages.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 max-w-xl mx-auto my-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Ready to Convert into Human Handwriting
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Click <strong>Generate Image</strong> to render all {textStats.pages} print-ready 300
              DPI A4 JPG pages with authentic human variation.
            </p>
            <button
              type="button"
              onClick={generateAllPages}
              disabled={isGenerating || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {textStats.pages} A4 Pages Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {generatedPages.map((page) => (
              <div
                key={page.pageNumber}
                className="group rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className="px-3.5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
                      Page {page.pageNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {page.width}×{page.height}
                    </span>
                  </div>

                  {deleteConfirmPageNum === page.pageNumber ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => confirmDeletePage(page.pageNumber)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPageNum(null)}
                        className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPageNum(page.pageNumber)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div
                  onClick={() => setInspectPage(page)}
                  className="relative p-3 flex-1 flex items-center justify-center bg-slate-100/70 cursor-pointer overflow-hidden"
                >
                  <img
                    src={page.url}
                    alt={`Handwritten Page ${page.pageNumber}`}
                    className="w-full h-auto rounded shadow-xs border border-slate-200 group-hover:scale-[1.015] transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-xs font-medium inline-flex items-center gap-1.5 shadow">
                      <ZoomIn className="w-3.5 h-3.5" /> Inspect 300 DPI
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate font-medium text-slate-700">{page.styleName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">300 DPI JPG</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => downloadSingleJpg(page)}
                      className="py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JPG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => regenerateSinglePage(page.pageNumber)}
                      className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white text-slate-700 hover:text-indigo-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Re-roll organic variation seed for this page"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-roll</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

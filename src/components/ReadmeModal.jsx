import React from 'react';
import { X, FileCheck } from 'lucide-react';

export default function ReadmeModal({ showReadmeModal, setShowReadmeModal }) {
  if (!showReadmeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={() => setShowReadmeModal(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Handwriting Studio — Specifications & Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowReadmeModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">
              1. Biomechanical Human Pen Engine
            </h4>
            <p>
              Standard fonts repeat identical glyphs on rigid mathematical baselines. Our engine
              renders every character independently on an HTML5 Canvas with seeded variations in
              X/Y scale (5–8%), micro-rotation, wrist-arc bounce locked to the notebook ruled lines,
              multi-pass ballpoint ink pooling, and organic student word spacing.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">
              2. 40 Tuned Styles + Custom Font Upload (.TTF / .OTF)
            </h4>
            <p>
              Choose from 40 authentic handwriting styles or click <strong>Upload .TTF Font</strong>{' '}
              to load your own personal handwriting font file (e.g. from Calligraphr) and apply our
              biomechanical humanizer on top of it.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">
              3. True 300 DPI A4 Print Resolution (2480 × 3508 px)
            </h4>
            <p>
              Export individual pages as <code>handwriting-page-001.jpg</code> or download your
              entire assignment as a high-speed ZIP archive containing separate 300 DPI RGB JPEG
              images ready for printing or submission.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setShowReadmeModal(false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

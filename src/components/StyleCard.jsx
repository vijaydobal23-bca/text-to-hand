import React from 'react';
import { Check } from 'lucide-react';

export default function StyleCard({ style, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(style)}
      className={`group relative text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between cursor-pointer w-full ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1.5 w-full">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
            }`}
          >
            #{style.id}
          </span>
          <span className="text-xs font-semibold text-slate-800 truncate">{style.name}</span>
        </div>
        {isSelected && (
          <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center ml-1">
            <Check className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Mini Ruled Notebook Preview inside Style Card */}
      <div
        className="mt-1 py-2 px-2.5 rounded-lg bg-white border border-slate-200/80 text-[#091d5c] truncate leading-snug relative overflow-hidden w-full"
        style={{
          fontFamily: `"${style.fontFamily}", cursive, sans-serif`,
          fontSize: `${Math.round(16 * Math.min(1.22, Math.max(0.88, style.scale)))}px`,
          transform: style.slant ? `skewX(${style.slant}deg)` : 'none',
          letterSpacing: `${style.letterSpacing * 0.5}px`,
          wordSpacing: `${Math.round((style.wordSpacing || 1.4) * 4)}px`,
          backgroundImage: 'linear-gradient(to bottom, transparent 92%, #cbd5e1 92%)',
          backgroundSize: '100% 26px'
        }}
      >
        {style.sample}
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 w-full">
        <span className="truncate max-w-[120px]">{style.fontFamily}</span>
        <span className="capitalize shrink-0">{style.category}</span>
      </div>
    </button>
  );
}

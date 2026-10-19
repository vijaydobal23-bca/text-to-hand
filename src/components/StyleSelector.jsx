import React, { useRef } from 'react';
import { PenTool, Upload, Search, X } from 'lucide-react';
import StyleCard from './StyleCard.jsx';

export default function StyleSelector({
  styles,
  selectedStyleId,
  onSelectStyle,
  styleCategoryTab,
  setStyleCategoryTab,
  styleSearch,
  setStyleSearch,
  settings,
  setSettings,
  handleCustomFontUpload
}) {
  const fontInputRef = useRef(null);

  const filteredStyles = styles.filter((s) => {
    const matchesTab = styleCategoryTab === 'all' || s.category === styleCategoryTab;
    const matchesQuery =
      !styleSearch.trim() ||
      s.name.toLowerCase().includes(styleSearch.toLowerCase()) ||
      s.fontFamily.toLowerCase().includes(styleSearch.toLowerCase()) ||
      String(s.id).includes(styleSearch.trim());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">
            Handwriting Styles ({styles.length})
          </h2>
        </div>

        {/* Upload Custom .TTF/.OTF Font Button */}
        <div>
          <input
            ref={fontInputRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleCustomFontUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fontInputRef.current?.click()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] font-semibold text-indigo-700 shadow-2xs transition-all cursor-pointer"
            title="Upload your own .ttf or .otf handwriting font file"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Upload .TTF</span>
            <span className="sm:hidden">Font</span>
          </button>
        </div>
      </div>

      {settings.customFontFileName && (
        <div className="px-3.5 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <span className="truncate font-medium">
            Using Custom Font: <strong>{settings.customFontFileName}</strong>
          </span>
          <button
            type="button"
            onClick={() =>
              setSettings((p) => ({
                ...p,
                customFontFamily: '',
                customFontFileName: ''
              }))
            }
            className="text-indigo-600 hover:text-indigo-800 font-semibold ml-2 cursor-pointer shrink-0"
          >
            Reset
          </button>
        </div>
      )}

      {/* Category Tabs & Search Filter */}
      <div className="p-3 border-b border-slate-100 space-y-2.5 bg-white">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStyleCategoryTab('all')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              styleCategoryTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (40)
          </button>
          <button
            type="button"
            onClick={() => setStyleCategoryTab('common')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              styleCategoryTab === 'common'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Common (20)
          </button>
          <button
            type="button"
            onClick={() => setStyleCategoryTab('additional')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              styleCategoryTab === 'additional'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Additional (20)
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={styleSearch}
            onChange={(e) => setStyleSearch(e.target.value)}
            placeholder="Search 40 styles by name, #number, or font..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
          />
          {styleSearch && (
            <button
              type="button"
              onClick={() => setStyleSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Grid of 40 Handwriting Cards */}
      <div className="p-3 max-h-[300px] sm:max-h-[320px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredStyles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={style.id === selectedStyleId && !settings.customFontFamily}
            onSelect={onSelectStyle}
          />
        ))}
        {filteredStyles.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No handwriting styles match "{styleSearch}".
          </div>
        )}
      </div>
    </div>
  );
}

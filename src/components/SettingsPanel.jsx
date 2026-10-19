import React from 'react';
import {
  Sliders,
  Shuffle,
  AlignLeft,
  AlignCenter,
  AlignJustify
} from 'lucide-react';
import { INK_PRESETS } from '../constants/inkPresets.js';

export default function SettingsPanel({ settings, updateSetting, setSettings }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">
            Page & Pen Realism Controls
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">A4 • 300 DPI</span>
      </div>

      <div className="p-3.5 sm:p-4 space-y-4 text-xs max-h-[500px] overflow-y-auto">
        {/* Natural Human Realism Variation + Word Gap Slider */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-semibold text-slate-800">
                  Human Imperfection & Variation
                </span>
                <p className="text-[10px] text-slate-500">
                  Varies letter scale, slant, bounce & ink pressure
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700">
                {settings.handwritingVariation}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={2}
                value={settings.handwritingVariation}
                onChange={(e) => updateSetting('handwritingVariation', Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <button
                type="button"
                onClick={() =>
                  updateSetting('seed', Math.floor(100000 + Math.random() * 900000))
                }
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-[11px] font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
                title="Re-roll organic variation seed"
              >
                <Shuffle className="w-3 h-3" /> Re-Roll
              </button>
            </div>
          </div>

          {/* Word Spacing Slider (Key to Reference Image's Student Look) */}
          <div className="pt-2 border-t border-indigo-100/80">
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-800">Student Word Spacing Gap</label>
              <span className="text-indigo-700 font-bold">
                {settings.wordSpacingMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.65}
              max={2.0}
              step={0.05}
              value={settings.wordSpacingMultiplier}
              onChange={(e) => updateSetting('wordSpacingMultiplier', Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Paper Orientation & Page Background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">A4 Orientation</label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              {['portrait', 'landscape'].map((ori) => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => updateSetting('orientation', ori)}
                  className={`py-1.5 rounded-md capitalize font-medium transition-all cursor-pointer ${
                    settings.orientation === ori
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ori}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Paper Background</label>
            <select
              value={settings.pageBackground}
              onChange={(e) => updateSetting('pageBackground', e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:border-indigo-500"
            >
              <option value="ruled">Ruled School Notebook</option>
              <option value="white">Plain White A4</option>
              <option value="grid">5mm Grid Paper</option>
              <option value="cream">Blank Cream Paper</option>
            </select>
          </div>
        </div>

        {/* Ink Color Presets & Custom Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">Ballpoint / Gel Ink Color</label>
            <span className="text-[11px] text-slate-400 font-mono">{settings.inkColor}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {INK_PRESETS.map((ink) => (
              <button
                key={ink.id}
                type="button"
                onClick={() => updateSetting('inkColor', ink.color)}
                className={`px-2 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.inkColor.toLowerCase() === ink.color.toLowerCase()
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-slate-900 ring-2 ring-indigo-500/15'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black/15"
                  style={{ backgroundColor: ink.color }}
                />
                <span className="text-[11px]">{ink.name.split(' ')[0]}</span>
              </button>
            ))}
            <label
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 flex items-center gap-1.5 cursor-pointer"
              title="Pick Custom Ink Color"
            >
              <input
                type="color"
                value={settings.inkColor}
                onChange={(e) => updateSetting('inkColor', e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-[11px] text-slate-600">Custom</span>
            </label>
          </div>
        </div>

        {/* Pen Thickness & Writing Alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Pen Pressure / Nib</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {['thin', 'medium', 'thick'].map((thick) => (
                <button
                  key={thick}
                  type="button"
                  onClick={() => updateSetting('penThickness', thick)}
                  className={`py-1 rounded-md capitalize font-medium transition-all cursor-pointer ${
                    settings.penThickness === thick
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {thick}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Writing Alignment</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { id: 'left', icon: AlignLeft, label: 'Left' },
                { id: 'center', icon: AlignCenter, label: 'Center' },
                { id: 'justify', icon: AlignJustify, label: 'Justify' }
              ].map((al) => {
                const Icon = al.icon;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => updateSetting('textAlign', al.id)}
                    className={`py-1 rounded-md flex items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
                      settings.textAlign === al.id
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-600'
                    }`}
                    title={al.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] hidden sm:inline">{al.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Font Size & Writing Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Handwriting Size</label>
              <span className="text-indigo-600 font-semibold">{settings.fontSize} pt</span>
            </div>
            <input
              type="range"
              min={13}
              max={26}
              step={1}
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Writing Density</label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {['compact', 'normal', 'spacious'].map((den) => (
                <button
                  key={den}
                  type="button"
                  onClick={() => updateSetting('writingDensity', den)}
                  className={`py-1 rounded-md capitalize font-medium transition-all text-[11px] cursor-pointer ${
                    settings.writingDensity === den
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {den}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Line Spacing & Paragraph Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Ruled Line Spacing</label>
              <span className="text-indigo-600 font-semibold">
                {settings.lineSpacing.toFixed(2)}x
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg mb-1.5">
              {['compact', 'normal', 'spacious'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateSetting('lineSpacingPreset', preset)}
                  className={`py-0.5 rounded capitalize text-[10px] font-medium cursor-pointer ${
                    settings.lineSpacingPreset === preset
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={1.2}
              max={2.2}
              step={0.04}
              value={settings.lineSpacing}
              onChange={(e) => {
                updateSetting('lineSpacingPreset', 'custom');
                updateSetting('lineSpacing', Number(e.target.value));
              }}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-slate-700">Paragraph Spacing</label>
              <span className="text-indigo-600 font-semibold">{settings.paragraphSpacing} mm</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">Extra vertical gap after paragraphs</p>
            <input
              type="range"
              min={0}
              max={14}
              step={1}
              value={settings.paragraphSpacing}
              onChange={(e) => updateSetting('paragraphSpacing', Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Adjustable Margins (Top, Bottom, Left, Right in mm) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Page Margins (mm)</span>
            <button
              type="button"
              onClick={() =>
                setSettings((p) => ({
                  ...p,
                  marginTop: 22,
                  marginBottom: 20,
                  marginLeft: 26,
                  marginRight: 16
                }))
              }
              className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
            >
              Reset Default
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'marginTop', label: 'Top' },
              { key: 'marginBottom', label: 'Bottom' },
              { key: 'marginLeft', label: 'Left' },
              { key: 'marginRight', label: 'Right' }
            ].map((m) => (
              <div key={m.key}>
                <label className="block text-[10px] text-slate-500 mb-0.5">{m.label}</label>
                <input
                  type="number"
                  min={8}
                  max={50}
                  value={settings[m.key]}
                  onChange={(e) =>
                    updateSetting(
                      m.key,
                      Math.max(8, Math.min(50, Number(e.target.value) || 8))
                    )
                  }
                  className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 font-semibold text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Optional Header, Footer & Page Numbering */}
        <div className="space-y-2.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => updateSetting('showPageNumbers', e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Include Page Numbers</span>
            </label>

            {settings.showPageNumbers && (
              <select
                value={settings.pageNumberPosition}
                onChange={(e) => updateSetting('pageNumberPosition', e.target.value)}
                className="py-1 px-2 rounded border border-slate-200 bg-white text-[11px] text-slate-700"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="top-right">Top Right</option>
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                Header Text (Optional)
              </label>
              <input
                type="text"
                value={settings.headerText}
                onChange={(e) => updateSetting('headerText', e.target.value)}
                placeholder="Student Name / Date"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                Footer Text (Optional)
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => updateSetting('footerText', e.target.value)}
                placeholder="Course Code / Signature"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

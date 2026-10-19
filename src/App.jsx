import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import {
  FileText,
  Sliders,
  Eye,
  PenTool
} from 'lucide-react';

// Data & Constants
import { HANDWRITING_STYLES } from './data/handwritingStyles.js';
import { SAMPLE_CONTENTS } from './constants/sampleContents.js';

// Utilities
import { paginateDocument } from './utils/paginationEngine.js';
import { renderHandwritingPageToCanvas, canvasToJpegBlob } from './utils/canvasRenderer.js';

// Components
import Header from './components/Header.jsx';
import Toast from './components/Toast.jsx';
import ContentEditor from './components/ContentEditor.jsx';
import StyleSelector from './components/StyleSelector.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import LivePreview from './components/LivePreview.jsx';
import OutputGallery from './components/OutputGallery.jsx';
import InspectModal from './components/InspectModal.jsx';
import ReadmeModal from './components/ReadmeModal.jsx';

export default function App() {
  // --- A. Content State ---
  const [content, setContent] = useState(SAMPLE_CONTENTS.referenceSample);

  // --- B. Handwriting Styles & Filtering ---
  const [selectedStyleId, setSelectedStyleId] = useState(1);
  const [styleCategoryTab, setStyleCategoryTab] = useState('all');
  const [styleSearch, setStyleSearch] = useState('');

  // --- C. Page & Biomechanical Settings ---
  const [settings, setSettings] = useState({
    orientation: 'portrait',
    pageBackground: 'ruled',
    marginTop: 22,
    marginBottom: 20,
    marginLeft: 26,
    marginRight: 16,
    fontSize: 19,
    lineSpacingPreset: 'normal',
    lineSpacing: 1.52,
    wordSpacingMultiplier: 1.15,
    inkColor: '#091d5c',
    penThickness: 'medium',
    textAlign: 'left',
    paragraphSpacing: 0,
    showPageNumbers: false,
    pageNumberPosition: 'bottom-right',
    headerText: '',
    footerText: '',
    writingDensity: 'normal',
    handwritingVariation: 64,
    showSpellcheckWaves: false,
    customFontFamily: '',
    customFontFileName: '',
    seed: 204918
  });

  // --- D. Responsive Mobile View State ---
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'styles' | 'preview'

  // --- E. Preview State ---
  const [previewMode, setPreviewMode] = useState('canvas');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeFontReady, setActiveFontReady] = useState(false);
  const [livePreviewPageIdx, setLivePreviewPageIdx] = useState(0);
  const liveCanvasRef = useRef(null);

  // --- F. Output Gallery State ---
  const [generatedPages, setGeneratedPages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [isOutdated, setIsOutdated] = useState(false);
  const [lastGeneratedSignature, setLastGeneratedSignature] = useState('');
  const [isZipping, setIsZipping] = useState(false);

  // --- G. Modals & Notifications ---
  const [inspectPage, setInspectPage] = useState(null);
  const [deleteConfirmPageNum, setDeleteConfirmPageNum] = useState(null);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const galleryRef = useRef(null);

  const selectedStyle = useMemo(
    () => HANDWRITING_STYLES.find((s) => s.id === selectedStyleId) || HANDWRITING_STYLES[0],
    [selectedStyleId]
  );

  const showToast = useCallback((msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.msg === msg ? null : prev));
    }, 3800);
  }, []);

  // --- Inject Google Fonts Stylesheets on Mount ---
  useEffect(() => {
    const batch1 = HANDWRITING_STYLES.slice(0, 20)
      .map((s) => `family=${s.googleFont}`)
      .join('&');
    const batch2 = HANDWRITING_STYLES.slice(20, 40)
      .map((s) => `family=${s.googleFont}`)
      .join('&');

    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = `https://fonts.googleapis.com/css2?${batch1}&display=swap`;
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = `https://fonts.googleapis.com/css2?${batch2}&display=swap`;
    document.head.appendChild(link2);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setTimeout(() => setFontsLoaded(true), 1000);
    }
  }, []);

  // Verify selected font is loaded
  useEffect(() => {
    let active = true;
    setActiveFontReady(false);
    const fontToLoad = settings.customFontFamily || selectedStyle.fontFamily;
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load(`28px "${fontToLoad}"`)
        .then(() => {
          if (active) setActiveFontReady(true);
        })
        .catch(() => {
          if (active) setActiveFontReady(true);
        });
    } else {
      setActiveFontReady(true);
    }
    return () => {
      active = false;
    };
  }, [selectedStyle, settings.customFontFamily]);

  // --- Handle Custom .TTF / .OTF Font Upload ---
  const handleCustomFontUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const customFamilyName = `UserHandwriting_${Date.now()}`;
      const fontFace = new FontFace(customFamilyName, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);
      setSettings((prev) => ({
        ...prev,
        customFontFamily: customFamilyName,
        customFontFileName: file.name
      }));
      showToast(`Loaded custom handwriting font: ${file.name}`);
    } catch (err) {
      showToast('Could not load font file. Please upload a valid .ttf, .otf, or .woff file.', 'error');
    }
  };

  // --- Reset to Reference Preset Look ---
  const applyReferenceLookPreset = () => {
    setContent(SAMPLE_CONTENTS.referenceSample);
    setSelectedStyleId(1);
    setSettings((prev) => ({
      ...prev,
      orientation: 'portrait',
      pageBackground: 'ruled',
      marginTop: 22,
      marginBottom: 20,
      marginLeft: 26,
      marginRight: 16,
      fontSize: 19,
      lineSpacingPreset: 'normal',
      lineSpacing: 1.52,
      wordSpacingMultiplier: 1.15,
      inkColor: '#091d5c',
      penThickness: 'medium',
      textAlign: 'left',
      paragraphSpacing: 0,
      showPageNumbers: false,
      headerText: '',
      footerText: '',
      writingDensity: 'normal',
      handwritingVariation: 64,
      customFontFamily: '',
      customFontFileName: '',
      seed: Math.floor(100000 + Math.random() * 900000)
    }));
    showToast('Applied Reference Image Student Handwriting Style!');
  };

  // --- Non-Latin Warning ---
  const nonLatinWarning = useMemo(() => {
    const unsupportedMatch = content.match(/[^\u0000-\u024F\u2000-\u206F\u2190-\u22FF\s]/g);
    if (!unsupportedMatch) return null;
    const uniqueChars = Array.from(new Set(unsupportedMatch)).slice(0, 6).join(' ');
    return `Detected special or non-Latin characters (${uniqueChars}) which some handwriting fonts may render with a fallback glyph.`;
  }, [content]);

  // --- Calculate Deterministic Pagination ---
  const layoutInfo = useMemo(() => {
    return paginateDocument(content, selectedStyle, settings);
  }, [content, selectedStyle, settings, activeFontReady, fontsLoaded]);

  useEffect(() => {
    if (livePreviewPageIdx >= layoutInfo.pages.length) {
      setLivePreviewPageIdx(Math.max(0, layoutInfo.pages.length - 1));
    }
  }, [layoutInfo.pages.length, livePreviewPageIdx]);

  // --- Track Outdated State ---
  const currentSignature = useMemo(() => {
    return JSON.stringify({ content, selectedStyleId, settings });
  }, [content, selectedStyleId, settings]);

  useEffect(() => {
    if (
      lastGeneratedSignature &&
      lastGeneratedSignature !== currentSignature &&
      generatedPages.length > 0
    ) {
      setIsOutdated(true);
    } else {
      setIsOutdated(false);
    }
  }, [currentSignature, lastGeneratedSignature, generatedPages.length]);

  // --- Render Live Preview Canvas ---
  useEffect(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas || !layoutInfo.pages.length) return;
    const pageToPreview = layoutInfo.pages[livePreviewPageIdx] || layoutInfo.pages[0];

    renderHandwritingPageToCanvas({
      canvas,
      pageData: pageToPreview,
      totalPages: layoutInfo.pages.length,
      layoutInfo,
      style: selectedStyle,
      settings,
      targetWidth: settings.orientation === 'landscape' ? 1150 : 920,
      pageSeedOffset: 0
    });
  }, [
    layoutInfo,
    livePreviewPageIdx,
    selectedStyle,
    settings,
    activeFontReady,
    fontsLoaded,
    previewMode
  ]);

  // --- Text Statistics ---
  const textStats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const lines = content ? content.split(/\r\n|\r|\n/).length : 0;
    return {
      words,
      chars,
      lines,
      pages: layoutInfo.pages.length
    };
  }, [content, layoutInfo.pages.length]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'lineSpacingPreset') {
        if (value === 'compact') next.lineSpacing = 1.32;
        if (value === 'normal') next.lineSpacing = 1.52;
        if (value === 'spacious') next.lineSpacing = 1.82;
      }
      return next;
    });
  };

  // --- Batch High-Res 300 DPI Page Generation ---
  const generateAllPages = async () => {
    if (!content.trim()) {
      showToast('Please enter or paste some text before generating pages.', 'error');
      return;
    }

    setIsGenerating(true);
    const total = layoutInfo.pages.length;
    setGenerationProgress({ current: 0, total });

    const fontToLoad = settings.customFontFamily || selectedStyle.fontFamily;
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(`32px "${fontToLoad}"`);
      } catch (e) {
        // Fallback gracefully
      }
    }

    const newGeneratedPages = [];
    const targetExportWidth = layoutInfo.dims.width;
    const targetExportHeight = layoutInfo.dims.height;

    for (let i = 0; i < total; i++) {
      setGenerationProgress({ current: i + 1, total });
      await new Promise((r) => setTimeout(r, 35));

      const pageData = layoutInfo.pages[i];
      const offCanvas = document.createElement('canvas');

      renderHandwritingPageToCanvas({
        canvas: offCanvas,
        pageData,
        totalPages: total,
        layoutInfo,
        style: selectedStyle,
        settings,
        targetWidth: targetExportWidth,
        pageSeedOffset: 0
      });

      const blob = await canvasToJpegBlob(offCanvas, 0.94);
      const url = URL.createObjectURL(blob);

      offCanvas.width = 1;
      offCanvas.height = 1;

      newGeneratedPages.push({
        pageNumber: pageData.pageNumber,
        pageData,
        blob,
        url,
        width: targetExportWidth,
        height: targetExportHeight,
        styleName: settings.customFontFileName
          ? `Custom (${settings.customFontFileName})`
          : selectedStyle.name,
        styleId: selectedStyle.id,
        seedOffset: 0,
        fileName: `handwriting-page-${String(pageData.pageNumber).padStart(3, '0')}.jpg`
      });
    }

    generatedPages.forEach((p) => {
      if (p.url) URL.revokeObjectURL(p.url);
    });

    setGeneratedPages(newGeneratedPages);
    setLastGeneratedSignature(currentSignature);
    setIsOutdated(false);
    setIsGenerating(false);
    showToast(`Generated ${total} handwritten A4 page${total > 1 ? 's' : ''} (300 DPI JPG)!`);

    setTimeout(() => {
      galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const regenerateSinglePage = async (pageNumber) => {
    const idx = generatedPages.findIndex((p) => p.pageNumber === pageNumber);
    if (idx === -1) return;

    const existing = generatedPages[idx];
    const nextSeedOffset = (existing.seedOffset || 0) + 17;
    const offCanvas = document.createElement('canvas');

    renderHandwritingPageToCanvas({
      canvas: offCanvas,
      pageData: existing.pageData,
      totalPages: generatedPages.length,
      layoutInfo,
      style: selectedStyle,
      settings,
      targetWidth: layoutInfo.dims.width,
      pageSeedOffset: nextSeedOffset
    });

    const blob = await canvasToJpegBlob(offCanvas, 0.94);
    const url = URL.createObjectURL(blob);
    offCanvas.width = 1;
    offCanvas.height = 1;

    if (existing.url) URL.revokeObjectURL(existing.url);

    const updated = [...generatedPages];
    updated[idx] = {
      ...existing,
      blob,
      url,
      styleName: settings.customFontFileName
        ? `Custom (${settings.customFontFileName})`
        : selectedStyle.name,
      seedOffset: nextSeedOffset
    };

    setGeneratedPages(updated);
    if (inspectPage?.pageNumber === pageNumber) {
      setInspectPage(updated[idx]);
    }
    showToast(`Regenerated Page ${pageNumber} with fresh human variation.`);
  };

  const confirmDeletePage = (pageNumber) => {
    const target = generatedPages.find((p) => p.pageNumber === pageNumber);
    if (target?.url) URL.revokeObjectURL(target.url);
    const remaining = generatedPages.filter((p) => p.pageNumber !== pageNumber);
    setGeneratedPages(remaining);
    setDeleteConfirmPageNum(null);
    if (inspectPage?.pageNumber === pageNumber) setInspectPage(null);
    showToast(`Deleted Page ${pageNumber}.`);
  };

  const downloadSingleJpg = (pageItem) => {
    if (!pageItem?.url) return;
    const link = document.createElement('a');
    link.href = pageItem.url;
    link.download =
      pageItem.fileName || `handwriting-page-${String(pageItem.pageNumber).padStart(3, '0')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCurrentPreviewPage = async () => {
    const pageData = layoutInfo.pages[livePreviewPageIdx] || layoutInfo.pages[0];
    if (!pageData) return;

    const offCanvas = document.createElement('canvas');
    renderHandwritingPageToCanvas({
      canvas: offCanvas,
      pageData,
      totalPages: layoutInfo.pages.length,
      layoutInfo,
      style: selectedStyle,
      settings,
      targetWidth: layoutInfo.dims.width,
      pageSeedOffset: 0
    });

    const blob = await canvasToJpegBlob(offCanvas, 0.94);
    const url = URL.createObjectURL(blob);
    offCanvas.width = 1;
    offCanvas.height = 1;

    const link = document.createElement('a');
    link.href = url;
    link.download = `handwriting-page-${String(pageData.pageNumber).padStart(3, '0')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showToast(
      `Downloaded Page ${pageData.pageNumber} at 300 DPI (${layoutInfo.dims.width}×${layoutInfo.dims.height} px)!`
    );
  };

  const downloadAllIndividualJpgs = async () => {
    if (!generatedPages.length) return;
    showToast(`Starting download of ${generatedPages.length} individual JPG files...`);
    for (let i = 0; i < generatedPages.length; i++) {
      downloadSingleJpg(generatedPages[i]);
      await new Promise((r) => setTimeout(r, 240));
    }
  };

  const downloadAllAsZip = async () => {
    if (!generatedPages.length) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      generatedPages.forEach((p) => {
        const fileName = `handwriting-page-${String(p.pageNumber).padStart(3, '0')}.jpg`;
        zip.file(fileName, p.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `handwriting-a4-pages-${generatedPages.length}p-300dpi.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
      showToast(`Downloaded ZIP archive with ${generatedPages.length} high-res A4 JPG pages!`);
    } catch (err) {
      showToast('Failed to build ZIP archive. Try individual JPG downloads.', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const clearGeneratedPages = () => {
    generatedPages.forEach((p) => {
      if (p.url) URL.revokeObjectURL(p.url);
    });
    setGeneratedPages([]);
    setLastGeneratedSignature('');
    setIsOutdated(false);
    showToast('Cleared generated pages gallery.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. TOP NAVIGATION HEADER */}
      <Header
        applyReferenceLookPreset={applyReferenceLookPreset}
        textStats={textStats}
        setShowReadmeModal={setShowReadmeModal}
        generateAllPages={generateAllPages}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        content={content}
      />

      {/* 2. TOAST NOTIFICATIONS */}
      <Toast toastMessage={toastMessage} />

      {/* 3. RESPONSIVE MOBILE/TABLET TAB SELECTOR (Hidden on Desktop) */}
      <div className="lg:hidden sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('styles')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'styles'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Styles</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN STUDIO WORKSPACE */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* SECTION A: CONTENT EDITOR */}
          <div
            className={`lg:col-span-4 ${
              mobileTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ContentEditor
              content={content}
              setContent={setContent}
              applyReferenceLookPreset={applyReferenceLookPreset}
              nonLatinWarning={nonLatinWarning}
              textStats={textStats}
              layoutInfo={layoutInfo}
              generateAllPages={generateAllPages}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
            />
          </div>

          {/* SECTION B: 40 STYLES & CONTROLS */}
          <div
            className={`lg:col-span-4 space-y-5 sm:space-y-6 ${
              mobileTab === 'styles' ? 'block' : 'hidden lg:block'
            }`}
          >
            <StyleSelector
              styles={HANDWRITING_STYLES}
              selectedStyleId={selectedStyleId}
              onSelectStyle={(style) => {
                setSelectedStyleId(style.id);
                setSettings((p) => ({
                  ...p,
                  customFontFamily: '',
                  customFontFileName: ''
                }));
              }}
              styleCategoryTab={styleCategoryTab}
              setStyleCategoryTab={setStyleCategoryTab}
              styleSearch={styleSearch}
              setStyleSearch={setStyleSearch}
              settings={settings}
              setSettings={setSettings}
              handleCustomFontUpload={handleCustomFontUpload}
            />

            <SettingsPanel
              settings={settings}
              updateSetting={updateSetting}
              setSettings={setSettings}
            />
          </div>

          {/* SECTION C: LIVE A4 NOTEBOOK PREVIEW */}
          <div
            className={`lg:col-span-4 lg:sticky lg:top-20 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <LivePreview
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              livePreviewPageIdx={livePreviewPageIdx}
              setLivePreviewPageIdx={setLivePreviewPageIdx}
              layoutInfo={layoutInfo}
              settings={settings}
              selectedStyle={selectedStyle}
              content={content}
              setContent={setContent}
              liveCanvasRef={liveCanvasRef}
              downloadCurrentPreviewPage={downloadCurrentPreviewPage}
            />
          </div>
        </div>

        {/* SECTION D: OUTPUT GALLERY */}
        <OutputGallery
          galleryRef={galleryRef}
          generatedPages={generatedPages}
          layoutInfo={layoutInfo}
          downloadCurrentPreviewPage={downloadCurrentPreviewPage}
          downloadAllIndividualJpgs={downloadAllIndividualJpgs}
          downloadAllAsZip={downloadAllAsZip}
          isZipping={isZipping}
          generateAllPages={generateAllPages}
          isGenerating={isGenerating}
          clearGeneratedPages={clearGeneratedPages}
          isOutdated={isOutdated}
          generationProgress={generationProgress}
          content={content}
          textStats={textStats}
          deleteConfirmPageNum={deleteConfirmPageNum}
          setDeleteConfirmPageNum={setDeleteConfirmPageNum}
          confirmDeletePage={confirmDeletePage}
          setInspectPage={setInspectPage}
          downloadSingleJpg={downloadSingleJpg}
          regenerateSinglePage={regenerateSinglePage}
        />
      </main>

      {/* 5. MODALS */}
      <InspectModal
        inspectPage={inspectPage}
        setInspectPage={setInspectPage}
        regenerateSinglePage={regenerateSinglePage}
        downloadSingleJpg={downloadSingleJpg}
      />

      <ReadmeModal
        showReadmeModal={showReadmeModal}
        setShowReadmeModal={setShowReadmeModal}
      />
    </div>
  );
}
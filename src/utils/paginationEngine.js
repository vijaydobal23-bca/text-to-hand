import { A4_PORTRAIT, A4_LANDSCAPE } from '../constants/dimensions.js';

let measureCanvas = null;

export function getMeasureContext() {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCanvas.width = 200;
    measureCanvas.height = 100;
  }
  return measureCanvas.getContext('2d');
}

/**
 * Calculates deterministic pagination where every line of handwriting is locked
 * to the notebook ruled grid (like a real human writing on lined notebook paper).
 */
export function paginateDocument(text, style, settings) {
  const ctx = getMeasureContext();
  const dims = settings.orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
  const pxPerMm = dims.width / dims.mmWidth; // ~11.811 px/mm at 300 DPI

  const marginTopPx = settings.marginTop * pxPerMm;
  const marginBottomPx = settings.marginBottom * pxPerMm;
  const marginLeftPx = settings.marginLeft * pxPerMm;
  const marginRightPx = settings.marginRight * pxPerMm;

  const usableWidth = Math.max(400, dims.width - marginLeftPx - marginRightPx);
  const usableTop = marginTopPx;
  const usableBottom = dims.height - marginBottomPx;

  // Base font size at 300 DPI
  const baseFontPx = Math.round(settings.fontSize * 3.55 * (style.scale || 1.0));

  // Density multipliers
  const densityMap = {
    compact: { word: 0.82, letter: -0.4 },
    normal: { word: 1.0, letter: 0 },
    spacious: { word: 1.28, letter: 1.1 }
  };
  const density = densityMap[settings.writingDensity] || densityMap.normal;

  // Distance between horizontal ruled lines on the page
  const baseLineHeightPx = Math.round(settings.fontSize * 3.55 * settings.lineSpacing);
  const paragraphGapLines = settings.paragraphSpacing > 6 ? 1 : 0;
  const paragraphGapPx =
    settings.pageBackground === 'ruled'
      ? paragraphGapLines * baseLineHeightPx
      : Math.round(settings.paragraphSpacing * pxPerMm);

  const wordSpacingMult =
    (settings.wordSpacingMultiplier || 1.0) * (style.wordSpacing || 1.4) * density.word;

  const rawParagraphs = (text || '').replace(/\r\n/g, '\n').split('\n');
  const allLines = [];

  for (let pIdx = 0; pIdx < rawParagraphs.length; pIdx++) {
    const rawLine = rawParagraphs[pIdx];
    const trimmed = rawLine.trim();

    if (trimmed === '') {
      allLines.push({
        type: 'blank',
        words: [],
        height: baseLineHeightPx,
        isHeading: false,
        isBullet: false,
        indentPx: 0,
        fontPx: baseFontPx
      });
      continue;
    }

    // Detect Heading (# Heading)
    let isHeading = false;
    let cleanText = rawLine;
    if (/^#{1,3}\s+/.test(trimmed)) {
      isHeading = true;
      cleanText = trimmed.replace(/^#{1,3}\s+/, '');
    }

    // Detect Bullet or Numbered list item
    let isBullet = false;
    let bulletPrefix = '';
    const bulletMatch = cleanText.match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/);
    if (bulletMatch && !isHeading) {
      isBullet = true;
      bulletPrefix = bulletMatch[2] === '-' || bulletMatch[2] === '*' ? '•' : bulletMatch[2];
      cleanText = bulletMatch[3];
    }

    const lineFontPx = isHeading ? Math.round(baseFontPx * 1.12) : baseFontPx;
    const fontWeight = isHeading || settings.penThickness === 'thick' ? '600' : '400';
    const activeFontName = settings.customFontFamily || style.fontFamily;
    ctx.font = `${fontWeight} ${lineFontPx}px "${activeFontName}", cursive, sans-serif`;

    const extraLetterPx = (style.letterSpacing + density.letter) * 2.4;
    const baseSpaceW = ctx.measureText(' ').width;
    const spaceWidth = Math.max(baseSpaceW * 1.2, baseSpaceW * wordSpacingMult + extraLetterPx * 2);

    const measureWordWidth = (w) => {
      // Strip ~~ mistake syntax when measuring or keep slightly wider
      const displayW = w.replace(/^~~|~~$/g, '');
      return ctx.measureText(displayW).width + displayW.length * extraLetterPx * 1.12;
    };

    const indentPx = isBullet ? Math.round(9 * pxPerMm) : 0;
    const maxLineWidth = usableWidth - indentPx;

    const rawWords = cleanText.split(/\s+/).filter(Boolean);
    let currentLineWords = [];
    let currentWidth = 0;
    let isFirstLineOfPara = true;

    for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
      let word = rawWords[wIdx];
      let wordW = measureWordWidth(word);

      if (wordW > maxLineWidth * 0.95 && word.length > 10) {
        const chunks = word.match(/.{1,12}/g) || [word];
        rawWords.splice(wIdx, 1, ...chunks);
        word = rawWords[wIdx];
        wordW = measureWordWidth(word);
      }

      const neededWidth = currentLineWords.length === 0 ? wordW : currentWidth + spaceWidth + wordW;

      if (neededWidth > maxLineWidth && currentLineWords.length > 0) {
        allLines.push({
          type: 'text',
          words: currentLineWords,
          totalWordsWidth: currentWidth,
          spaceWidth,
          height: baseLineHeightPx,
          isHeading,
          isBullet: isBullet && isFirstLineOfPara,
          bulletPrefix: isBullet && isFirstLineOfPara ? bulletPrefix : '',
          indentPx,
          fontPx: lineFontPx,
          extraLetterPx,
          isLastLineOfPara: false,
          paraIndex: pIdx
        });
        currentLineWords = [{ text: word, width: wordW }];
        currentWidth = wordW;
        isFirstLineOfPara = false;
      } else {
        currentLineWords.push({ text: word, width: wordW });
        currentWidth = neededWidth;
      }
    }

    if (currentLineWords.length > 0) {
      allLines.push({
        type: 'text',
        words: currentLineWords,
        totalWordsWidth: currentWidth,
        spaceWidth,
        height: baseLineHeightPx,
        isHeading,
        isBullet: isBullet && isFirstLineOfPara,
        bulletPrefix: isBullet && isFirstLineOfPara ? bulletPrefix : '',
        indentPx,
        fontPx: lineFontPx,
        extraLetterPx,
        isLastLineOfPara: true,
        paraIndex: pIdx,
        afterGapPx: paragraphGapPx
      });
    }
  }

  // First ruled line Y position on each page
  const firstRuleY = Math.round(usableTop + baseLineHeightPx);
  const pages = [];
  let currentPageLines = [];
  let cursorY = firstRuleY;

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const lineH = line.height;

    if (line.type === 'blank' && currentPageLines.length === 0) {
      continue;
    }

    if (cursorY + lineH * 0.25 > usableBottom && currentPageLines.length > 0) {
      pages.push({
        pageNumber: pages.length + 1,
        lines: currentPageLines
      });
      currentPageLines = [];
      cursorY = firstRuleY;

      if (line.type === 'blank') continue;
    }

    currentPageLines.push({
      ...line,
      yPx: cursorY
    });

    cursorY += lineH;
    if (line.isLastLineOfPara && line.afterGapPx) {
      cursorY += line.afterGapPx;
    }
  }

  if (currentPageLines.length > 0 || pages.length === 0) {
    pages.push({
      pageNumber: pages.length + 1,
      lines: currentPageLines
    });
  }

  return {
    pages,
    dims,
    pxPerMm,
    firstRuleY,
    marginsPx: {
      top: marginTopPx,
      bottom: marginBottomPx,
      left: marginLeftPx,
      right: marginRightPx
    },
    usableWidth,
    baseLineHeightPx,
    baseFontPx
  };
}

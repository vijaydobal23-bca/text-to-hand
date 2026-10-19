import { createSeededRandom, hashString } from './random.js';

export function renderHandwritingPageToCanvas({
  canvas,
  pageData,
  totalPages,
  layoutInfo,
  style,
  settings,
  targetWidth,
  pageSeedOffset = 0
}) {
  if (!canvas || !pageData || !layoutInfo) return;

  const { dims, marginsPx, usableWidth, baseLineHeightPx, firstRuleY } = layoutInfo;
  const scaleFactor = targetWidth / dims.width;
  const targetHeight = Math.round(dims.height * scaleFactor);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(scaleFactor, scaleFactor);

  // 1. Paper Surface Background
  const bgColors = {
    white: '#ffffff',
    ruled: '#ffffff',
    grid: '#fbfcfa',
    cream: '#f9f5eb'
  };
  ctx.fillStyle = bgColors[settings.pageBackground] || '#ffffff';
  ctx.fillRect(0, 0, dims.width, dims.height);

  // 2. Classic Indian / School Ruled Notebook Lines (Matching Reference Image)
  if (settings.pageBackground === 'ruled') {
    // Top first horizontal rule starts above first text line like the reference image
    const topExtraRuleY = firstRuleY - baseLineHeightPx;
    ctx.strokeStyle = '#94a3b8'; // Crisp slate-grey/blue rule line like reference image
    ctx.lineWidth = 2.4;

    if (topExtraRuleY > 40) {
      ctx.beginPath();
      ctx.moveTo(0, topExtraRuleY);
      ctx.lineTo(dims.width, topExtraRuleY);
      ctx.stroke();
    }

    for (let y = firstRuleY; y < dims.height - marginsPx.bottom * 0.45; y += baseLineHeightPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dims.width, y);
      ctx.stroke();
    }

    // Vertical pink/red left margin line (exact match to reference image)
    const redMarginX = Math.max(130, marginsPx.left - 28);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(redMarginX, 0);
    ctx.lineTo(redMarginX, dims.height);
    ctx.stroke();
  } else if (settings.pageBackground === 'grid') {
    const gridStep = Math.round(5 * layoutInfo.pxPerMm);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
    ctx.lineWidth = 1.6;
    for (let x = gridStep; x < dims.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dims.height);
      ctx.stroke();
    }
    for (let y = gridStep; y < dims.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dims.width, y);
      ctx.stroke();
    }
  }

  // 3. Configure Ballpoint / Gel Pen Ink & Seeded Biomechanical Jitter
  const inkColor = settings.inkColor || '#091d5c';
  const variationAmount = (settings.handwritingVariation / 100) * (style.baseJitter || 1.0);
  const baseSeed =
    hashString(`${pageData.pageNumber}-${settings.seed}-${pageSeedOffset}-${style.id}`) >>> 0;
  const rand = createSeededRandom(baseSeed);

  const penMap = {
    thin: {
      weight: '400',
      strokeWidth: 0.55,
      strokeAlpha: 0.16,
      multiPass: true,
      alpha: 0.92
    },
    medium: {
      weight: '400',
      strokeWidth: 1.35 + (style.strokeBoost || 0) * 1.4,
      strokeAlpha: 0.42 + (style.strokeBoost || 0),
      multiPass: true,
      alpha: 0.97
    },
    thick: {
      weight: '600',
      strokeWidth: 2.35 + (style.strokeBoost || 0) * 1.8,
      strokeAlpha: 0.65 + (style.strokeBoost || 0),
      multiPass: true,
      alpha: 1.0
    }
  };
  const pen = penMap[settings.penThickness] || penMap.medium;
  const activeFontName = settings.customFontFamily || style.fontFamily;

  // 4. Optional Header, Footer & Page Numbers
  ctx.fillStyle = inkColor;
  ctx.strokeStyle = inkColor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const metaFontPx = Math.round(layoutInfo.baseFontPx * 0.78);
  ctx.font = `${pen.weight} ${metaFontPx}px "${activeFontName}", cursive, sans-serif`;

  if (settings.headerText && settings.headerText.trim()) {
    ctx.save();
    ctx.globalAlpha = 0.86;
    const headerY = Math.max(metaFontPx + 20, firstRuleY - baseLineHeightPx - 10);
    ctx.fillText(settings.headerText.trim(), marginsPx.left, headerY);
    ctx.restore();
  }

  if (settings.footerText && settings.footerText.trim()) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    const footerY = dims.height - marginsPx.bottom * 0.38;
    ctx.fillText(settings.footerText.trim(), marginsPx.left, footerY);
    ctx.restore();
  }

  if (settings.showPageNumbers) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    const pageStr = `Page ${pageData.pageNumber} of ${totalPages}`;
    const pWidth = ctx.measureText(pageStr).width;
    let numX = dims.width - marginsPx.right - pWidth;
    let numY = dims.height - marginsPx.bottom * 0.38;

    if (settings.pageNumberPosition === 'bottom-center') {
      numX = (dims.width - pWidth) / 2;
    } else if (settings.pageNumberPosition === 'top-right') {
      numY = Math.max(metaFontPx + 20, firstRuleY - baseLineHeightPx - 10);
    }
    ctx.fillText(pageStr, numX, numY);
    ctx.restore();
  }

  // 5. Render Each Line & Glyph with True Human Biomechanical Imperfection
  const baseSlantRad = ((style.slant || 0) * Math.PI) / 180;
  const charScaleMax = (style.charScaleVar || 0.055) * variationAmount;

  for (let lIdx = 0; lIdx < pageData.lines.length; lIdx++) {
    const line = pageData.lines[lIdx];
    if (line.type === 'blank' || !line.words || line.words.length === 0) continue;

    const lineFontWeight = line.isHeading ? '600' : pen.weight;
    ctx.font = `${lineFontWeight} ${line.fontPx}px "${activeFontName}", cursive, sans-serif`;

    // Slight left-margin human hand placement drift (always stays to the right of the pink margin line)
    const lineMarginDrift = (rand() - 0.35) * 14 * variationAmount;
    // Slight baseline drift across the line (locked closely to the ruled line)
    const lineBaselineSlope = (rand() - 0.5) * 0.0022 * variationAmount;

    let startX = marginsPx.left + line.indentPx + lineMarginDrift;
    let effectiveSpaceWidth = line.spaceWidth;

    const availLineWidth = usableWidth - line.indentPx;
    const rawWordsWidthSum = line.words.reduce((acc, w) => acc + w.width, 0);
    const totalLineNaturalWidth =
      rawWordsWidthSum + Math.max(0, line.words.length - 1) * line.spaceWidth;

    if (settings.textAlign === 'center') {
      startX =
        marginsPx.left +
        line.indentPx +
        Math.max(0, (availLineWidth - totalLineNaturalWidth) / 2);
    } else if (
      settings.textAlign === 'justify' &&
      !line.isLastLineOfPara &&
      line.words.length > 1 &&
      totalLineNaturalWidth > availLineWidth * 0.65
    ) {
      effectiveSpaceWidth = (availLineWidth - rawWordsWidthSum) / (line.words.length - 1);
    }

    // Baseline sits just 3px above the ruled line so descenders (g, y, p, j) cross the rule naturally
    const ruleLockedBaselineY = line.yPx - 3;

    // Draw bullet prefix if present
    if (line.isBullet && line.bulletPrefix) {
      const bulletX = marginsPx.left + lineMarginDrift * 0.5;
      const bulletY = ruleLockedBaselineY + (rand() - 0.5) * 4 * variationAmount;
      ctx.save();
      ctx.globalAlpha = pen.alpha;
      ctx.fillText(line.bulletPrefix, bulletX, bulletY);
      if (pen.multiPass) {
        ctx.lineWidth = pen.strokeWidth;
        ctx.globalAlpha = pen.strokeAlpha;
        ctx.strokeText(line.bulletPrefix, bulletX, bulletY);
      }
      ctx.restore();
    }

    let cursorX = startX;

    for (let wIdx = 0; wIdx < line.words.length; wIdx++) {
      const wordObj = line.words[wIdx];
      let rawWordText = wordObj.text;

      // Support ~~scratched~~ human mistake syntax
      const isStruckOut =
        rawWordText.length > 4 && rawWordText.startsWith('~~') && rawWordText.endsWith('~~');
      const wordText = isStruckOut ? rawWordText.slice(2, -2) : rawWordText;

      // Human wrist arc per word: starts near the rule line, arcs slightly, settles back
      const wordStartBounce = (rand() - 0.5) * 5.2 * variationAmount;
      const wordSlantJitter = (rand() - 0.5) * 0.065 * variationAmount;
      const wordSpaceJitter = (rand() - 0.35) * 18 * variationAmount;

      const wordStartX = cursorX;
      let charCursorX = 0;

      // Render glyph-by-glyph so repeated letters ('ll', 'oo', 'ee') never look identical!
      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const ch = wordText[cIdx];

        // Individual character human variation
        const charBounceY = (rand() - 0.5) * 4.2 * variationAmount;
        const wristArcY =
          Math.sin((cIdx / Math.max(1, wordText.length)) * Math.PI) *
          -2.4 *
          variationAmount;
        const charRot = (rand() - 0.5) * 0.055 * variationAmount;
        const charScaleX = 1 + (rand() - 0.5) * 2 * charScaleMax;
        const charScaleY = 1 + (rand() - 0.5) * 2.2 * charScaleMax;
        const charSlant = baseSlantRad + wordSlantJitter + (rand() - 0.5) * 0.05 * variationAmount;

        // Ballpoint ink pressure variation per character
        const charPressure = Math.max(
          0.78,
          Math.min(1.0, pen.alpha + (rand() - 0.45) * 0.16 * variationAmount)
        );

        const absX = wordStartX + charCursorX;
        const slopeOffset = (absX - marginsPx.left) * lineBaselineSlope;
        const absY = ruleLockedBaselineY + wordStartBounce + charBounceY + wristArcY + slopeOffset;

        ctx.save();
        ctx.translate(absX, absY);
        ctx.transform(charScaleX, charRot, Math.tan(charSlant), charScaleY, 0, 0);

        // Primary ink fill
        ctx.globalAlpha = charPressure;
        ctx.fillText(ch, 0, 0);

        // Secondary ballpoint/gel pen ink-edge stroke & micro-offset pass for authentic pen weight
        if (pen.multiPass) {
          ctx.lineWidth = pen.strokeWidth * (0.85 + rand() * 0.3);
          ctx.globalAlpha = Math.min(0.85, pen.strokeAlpha * charPressure);
          ctx.strokeText(ch, (rand() - 0.5) * 0.45, (rand() - 0.5) * 0.45);
        }

        ctx.restore();

        const rawCharW = ctx.measureText(ch).width;
        const kerningJitter = (rand() - 0.48) * 2.4 * variationAmount;
        charCursorX += rawCharW * charScaleX + line.extraLetterPx + kerningJitter;
      }

      // Optional realistic pen scratch-out if word wrapped in ~~word~~
      if (isStruckOut) {
        ctx.save();
        ctx.strokeStyle = inkColor;
        ctx.globalAlpha = 0.88;
        ctx.lineWidth = 3.2;
        const midY = ruleLockedBaselineY - line.fontPx * 0.28;
        ctx.beginPath();
        ctx.moveTo(wordStartX - 4, midY + (rand() - 0.5) * 6);
        ctx.lineTo(wordStartX + charCursorX + 4, midY + (rand() - 0.5) * 6);
        ctx.moveTo(wordStartX + charCursorX + 2, midY - 5);
        ctx.lineTo(wordStartX - 2, midY + 5);
        ctx.stroke();
        ctx.restore();
      }

      // Optional red wavy spellcheck underline (if user enables Reference Screenshot Spellcheck Effect)
      if (
        settings.showSpellcheckWaves &&
        (wordText.toLowerCase().includes('chourasiya') ||
          wordText.toLowerCase().includes('pagex'))
      ) {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.6;
        const waveY = ruleLockedBaselineY + 8;
        ctx.beginPath();
        const waveStep = 7;
        for (let wx = wordStartX; wx < wordStartX + charCursorX; wx += waveStep) {
          const wy = ((wx - wordStartX) / waveStep) % 2 === 0 ? waveY - 3 : waveY + 3;
          if (wx === wordStartX) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Optional subtle underline on headings
      if (line.isHeading && wIdx === line.words.length - 1) {
        ctx.save();
        ctx.strokeStyle = inkColor;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(startX, ruleLockedBaselineY + 10);
        ctx.lineTo(wordStartX + charCursorX, ruleLockedBaselineY + 10 + (rand() - 0.5) * 4);
        ctx.stroke();
        ctx.restore();
      }

      cursorX = wordStartX + charCursorX + effectiveSpaceWidth + wordSpaceJitter;
    }
  }

  ctx.restore();
}

// Convert canvas to high-res JPEG Blob
export function canvasToJpegBlob(canvas, quality = 0.94) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas JPEG conversion failed'));
        },
        'image/jpeg',
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}

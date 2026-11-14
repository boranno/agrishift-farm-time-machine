/**
 * Soil report utilities and browser-side OCR for soil health cards.
 */

export const SAMPLE_SOIL_CARD = {
  id: 'video-demo-soil-card',
  isMock: true,
  cardName: 'Provided soil card example',
  extractedValues: {
    pH: 6.8,
    ec: 3.8,
    nitrogenMgKg: 145,
    phosphorusMgKg: 24,
    potassiumMgKg: 195
  },
  ecBasis: 'unspecified',
  missingFields: []
};

export const validateSoilCardFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (!file) {
    return { valid: false, error: 'fileRequired' };
  }
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'fileTypeError' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: 'fileTooLarge' };
  }
  return { valid: true };
};

const SOIL_FIELDS = [
  { key: 'pH', pattern: '(?:soil\\s*)?p\\s*h\\b|পিএইচ|পি\\s*এইচ', min: 3, max: 10 },
  { key: 'ec', pattern: '\\bECe\\b|saturated\\s+paste(?:\\s+extract)?|স্যাচুরেটেড\\s*পেস্ট|\\bsoil\\s+EC\\b', unit: 'dS\\s*\\/\\s*m|mS\\s*\\/\\s*cm', min: 0, max: 30 },
  { key: 'nitrogenMgKg', pattern: '\\btotal\\s+nitrogen\\b|\\bnitrogen\\b|\\bN\\b|নাইট্রোজেন|এন', unit: 'ppm|mg\\s*\\/\\s*kg', min: 0, max: 100000 },
  { key: 'phosphorusMgKg', pattern: '\\bavailable\\s+phosphorus\\b|\\bphosphorus\\b|\\bP\\b(?!\\s*H)|ফসফরাস|পি(?!\\s*এইচ)', unit: 'ppm|mg\\s*\\/\\s*kg', min: 0, max: 100000 },
  { key: 'potassiumMgKg', pattern: '\\bexchangeable\\s+potassium\\b|\\bpotassium\\b|\\bK\\b|পটাশিয়াম|পটাসিয়াম|কে', unit: 'ppm|mg\\s*\\/\\s*kg', min: 0, max: 100000 }
];

const normalizeOcrText = (text) => String(text)
  .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
  .replace(/(\d),(\d{1,2})(?!\d)/g, '$1.$2')
  .replace(/\(?\s*\d+\s*:\s*\d+(?:\.\d+)?\s*\)?/g, ' ')
  .replace(/[ \t]+/g, ' ');

const getFieldRegions = (text) => {
  const normalizedText = normalizeOcrText(text);
  const fieldMatches = SOIL_FIELDS.flatMap(field => {
    const matcher = new RegExp(field.pattern, 'gi');
    return [...normalizedText.matchAll(matcher)].map(match => ({
      field,
      index: match.index,
      end: match.index + match[0].length,
      label: match[0]
    }));
  }).sort((left, right) => left.index - right.index || right.end - left.end);

  return fieldMatches.map((match, index) => {
    const nextField = fieldMatches.slice(index + 1).find(candidate => (
      candidate.field.key !== match.field.key
    ));
    return {
      ...match,
      text: normalizedText.slice(match.end, nextField ? nextField.index : match.end + 180)
    };
  });
};

export const parseSoilReportText = (text) => {
  const values = {};
  const numberPattern = '(\\d+(?:\\.\\d+)?|\\.\\d+)';

  SOIL_FIELDS.forEach(({ key, pattern, unit, min, max }) => {
    for (const region of getFieldRegions(text)) {
      if (region.field.key !== key || (unit && !new RegExp(unit, 'i').test(region.text))) continue;

      const valueText = region.text.replace(/\b\d+\s*-\s*\d+\b/g, ' ');
      const match = valueText.match(new RegExp(numberPattern));
      if (!match) continue;

      const value = Number(match[0]);
      if (Number.isFinite(value) && value >= min && value <= max) {
        values[key] = value;
        break;
      }
    }
  });

  return values;
};

export const getSoilEcBasis = (text) => {
  const ecRegion = getFieldRegions(text).find(region => region.field.key === 'ec');
  if (!ecRegion) return null;
  return /\bECe\b|saturated\s+paste|স্যাচুরেটেড\s*পেস্ট/i.test(ecRegion.label)
    ? 'saturated-paste'
    : 'unspecified';
};

const loadExternalScript = (url, globalName) => {
  if (window[globalName]) return Promise.resolve(window[globalName]);

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window[globalName]) resolve(window[globalName]);
      else reject(new Error(`${globalName} did not initialize`));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`Unable to load ${globalName}`));
    };
    document.head.appendChild(script);
  });
};

const MAX_PDF_PAGES = 10;

const extractPdfText = async (file) => {
  const pdfjsLib = await loadExternalScript(
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    'pdfjsLib'
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const textPages = [];

  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, MAX_PDF_PAGES); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items
      .filter(item => item.str.trim())
      .map(item => ({ text: item.str, x: item.transform[4], y: item.transform[5], width: item.width || 0 }))
      .sort((left, right) => right.y - left.y || left.x - right.x);
    const lines = [];

    items.forEach(item => {
      const line = lines[lines.length - 1];
      if (line && Math.abs(line.y - item.y) <= 3) line.items.push(item);
      else lines.push({ y: item.y, items: [item] });
    });

    textPages.push(lines.map(line => line.items
      .sort((left, right) => left.x - right.x)
      .map(item => item.text.trim())
      .join(' ')).join('\n'));
  }

  return { pdf, pdfjsLib, text: textPages.join('\n') };
};

const renderPdfPage = async (pdf, pageNumber) => {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(3000 / Math.max(baseViewport.width, baseViewport.height), 2.5);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Unable to prepare PDF page for OCR');
  document.body.appendChild(canvas);
  try {
    await page.render({ canvasContext: context, viewport, intent: 'print' }).promise;
  } finally {
    canvas.remove();
  }
  return canvas;
};

const recognizeImage = async (image, onProgress) => {
  const Tesseract = await loadExternalScript(
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    'Tesseract'
  );
  if (onProgress) {
    onProgress({
      progress: 25,
      stageEn: 'Starting the browser OCR engine...',
      stageBn: 'ব্রাউজার OCR চালু হচ্ছে...'
    });
  }
  const worker = await Tesseract.createWorker('eng+ben', 1, {
    logger: message => {
      if (message.status === 'recognizing text' && onProgress) {
        onProgress({
          progress: Math.round(message.progress * 100),
          stageEn: 'Reading report text in this browser...',
          stageBn: 'এই ব্রাউজারেই রিপোর্টের লেখা পড়া হচ্ছে...'
        });
      }
    }
  });

  try {
    let bestText = '';
    let bestValues = {};

    const enhancedImage = await createEnhancedOcrImage(image);
    for (const candidateImage of [image, enhancedImage]) {
      for (const pageSegmentationMode of ['6', '4', '11']) {
        await worker.setParameters({ tessedit_pageseg_mode: pageSegmentationMode });
        const { data } = await worker.recognize(candidateImage);
        const values = parseSoilReportText(data.text);
        if (Object.keys(values).length > Object.keys(bestValues).length) {
          bestText = data.text;
          bestValues = values;
        }
        if (Object.keys(bestValues).length === SOIL_FIELDS.length) break;
      }
      if (Object.keys(bestValues).length === SOIL_FIELDS.length) break;
    }

    return { text: bestText, values: bestValues };
  } finally {
    await worker.terminate();
  }
};

const createEnhancedOcrImage = async (image) => {
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(3000 / Math.max(bitmap.width, bitmap.height), 2.5);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    bitmap.close();
    throw new Error('Unable to prepare image enhancement for OCR');
  }

  context.filter = 'grayscale(1) contrast(1.45)';
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  context.filter = 'none';
  bitmap.close();
  return canvas;
};

export const extractSoilReport = async (file, onProgress) => {
  const progress = (value, stageEn, stageBn) => {
    if (onProgress) onProgress({ progress: value, stageEn, stageBn });
  };
  let text = '';
  let values = {};
  let ecBasis = null;

  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    progress(10, 'Reading PDF in this browser...', 'এই ব্রাউজারেই PDF পড়া হচ্ছে...');
    const extractedPdf = await extractPdfText(file);
    text = extractedPdf.text;
    values = parseSoilReportText(text);
    ecBasis = getSoilEcBasis(text);
    if (Object.keys(values).length < SOIL_FIELDS.length) {
      const pagesToScan = Math.min(extractedPdf.pdf.numPages, MAX_PDF_PAGES);
      for (let pageNumber = 1; pageNumber <= pagesToScan; pageNumber += 1) {
        progress(
          20 + Math.round((pageNumber - 1) / pagesToScan * 10),
          `Preparing PDF page ${pageNumber} for OCR...`,
          `PDF-এর ${pageNumber} নম্বর পৃষ্ঠা OCR-এর জন্য প্রস্তুত হচ্ছে...`
        );
        const image = await renderPdfPage(extractedPdf.pdf, pageNumber);
        const recognized = await recognizeImage(image, onProgress);
        const mergedText = `${text}\n${recognized.text}`;
        const mergedValues = { ...recognized.values, ...values };
        if (Object.keys(mergedValues).length >= Object.keys(values).length) {
          text = mergedText;
          values = mergedValues;
          ecBasis = getSoilEcBasis(text);
        }
        if (Object.keys(values).length === SOIL_FIELDS.length) break;
      }
    }
  } else {
    progress(10, 'Preparing report image...', 'রিপোর্টের ছবি প্রস্তুত হচ্ছে...');
    const recognized = await recognizeImage(file, onProgress);
    text = recognized.text;
    values = recognized.values;
    ecBasis = getSoilEcBasis(text);
  }

  progress(100, 'Review extracted values before saving.', 'সংরক্ষণের আগে শনাক্ত করা মানগুলো যাচাই করুন।');
  return {
    cardName: file.name,
    extractedValues: values,
    ecBasis,
    missingFields: SOIL_FIELDS.map(field => field.key).filter(key => values[key] === undefined),
    isMock: false
  };
};


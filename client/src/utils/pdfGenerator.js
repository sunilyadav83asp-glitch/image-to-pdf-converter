/**
 * ============================================================================
 * Client-Side PDF Generation Utility using jsPDF
 * Technology: jsPDF
 * College Project viva tip:
 * All image processing happens purely in the client's browser using jsPDF,
 * preserving user privacy and eliminating server bandwidth load.
 * ============================================================================
 */

import { jsPDF } from 'jspdf';

/**
 * Loads an image from a URL/DataURL and returns image element and natural dimensions
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        element: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    };
    img.onerror = (err) => {
      reject(new Error(`Failed to load image: ${err?.message || 'Invalid image source'}`));
    };
    img.src = src;
  });
};

/**
 * Converts a list of uploaded images into a single PDF document.
 * 
 * @param {Array} images - Array of image objects { id, file, previewUrl, name }
 * @param {Object} options - PDF settings:
 *   - pageSize: 'a4' | 'letter'
 *   - orientation: 'portrait' | 'landscape'
 *   - margin: 'none' | 'small' | 'normal'
 *   - fitMode: 'contain' | 'fill'
 *   - filename: output filename string
 * @param {Function} onProgress - Optional callback for conversion progress (e.g., page 1 of 5)
 * @returns {Promise<jsPDF>} - Resolved jsPDF instance
 */
export async function generatePdf(images, options, onProgress = () => {}) {
  if (!images || images.length === 0) {
    throw new Error('Please select at least one image to convert.');
  }

  const {
    pageSize = 'a4',
    orientation = 'portrait',
    margin = 'small',
    fitMode = 'contain'
  } = options;

  // Margin values in millimeters
  const marginValues = {
    none: 0,
    small: 8,
    normal: 16
  };
  const pageMargin = marginValues[margin] ?? 8;

  // Initialize jsPDF instance
  // orientation: 'p' (portrait) or 'l' (landscape)
  // format: 'a4' or 'letter'
  // unit: 'mm'
  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: pageSize.toLowerCase()
  });

  const total = images.length;

  for (let i = 0; i < total; i++) {
    const current = images[i];
    onProgress({ current: i + 1, total, percent: Math.round(((i + 1) / total) * 100) });

    // For every page after the first, add a new page to the document
    if (i > 0) {
      pdf.addPage(pageSize.toLowerCase(), isLandscape ? 'l' : 'p');
    }

    // Load image natural dimensions
    const imgData = await loadImage(current.previewUrl);

    // Get current PDF page dimensions in mm
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate maximum printable dimensions inside margins
    const printableWidth = Math.max(pageWidth - pageMargin * 2, 10);
    const printableHeight = Math.max(pageHeight - pageMargin * 2, 10);

    let drawWidth = printableWidth;
    let drawHeight = printableHeight;
    let xPos = pageMargin;
    let yPos = pageMargin;

    if (fitMode === 'contain') {
      // Maintain natural aspect ratio so images never distort
      const imgRatio = imgData.width / imgData.height;
      const printableRatio = printableWidth / printableHeight;

      if (imgRatio > printableRatio) {
        // Image is wider than printable area
        drawWidth = printableWidth;
        drawHeight = printableWidth / imgRatio;
      } else {
        // Image is taller than printable area
        drawHeight = printableHeight;
        drawWidth = printableHeight * imgRatio;
      }

      // Center the image on the page
      xPos = pageMargin + (printableWidth - drawWidth) / 2;
      yPos = pageMargin + (printableHeight - drawHeight) / 2;
    }

    // Determine image format (JPEG or PNG)
    const fileType = current.file?.type || '';
    const imageFormat = fileType.includes('png') ? 'PNG' : 'JPEG';

    // Add image onto the PDF page
    pdf.addImage(
      imgData.element,
      imageFormat,
      xPos,
      yPos,
      drawWidth,
      drawHeight,
      undefined,
      'FAST'
    );
  }

  return pdf;
}


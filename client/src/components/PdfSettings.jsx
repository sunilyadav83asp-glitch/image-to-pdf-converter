import React from 'react';
import { 
  Settings2, 
  FileDown, 
  FileCheck, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Monitor, 
  CheckCircle,
  Loader2,
  FileCode
} from 'lucide-react';

export default function PdfSettings({
  settings,
  onSettingChange,
  onConvertAndDownload,
  isConverting,
  progress,
  imageCount,
  lastGeneratedBlobUrl,
  onDownloadAgain
}) {
  const {
    pageSize,
    orientation,
    margin,
    fitMode,
    filename
  } = settings;

  return (
    <section className="settings-section">
      <div className="settings-card">
        {/* Card Header */}
        <div className="settings-header">
          <div className="settings-title-wrap">
            <Settings2 className="settings-icon" size={20} />
            <h2 className="settings-title">PDF Document Settings</h2>
          </div>
          <span className="settings-hint">Configure output styling</span>
        </div>

        <div className="settings-grid">
          {/* 1. PDF File Name */}
          <div className="setting-group full-width">
            <label htmlFor="pdf-filename" className="setting-label">
              <FileCode size={15} />
              <span>Output File Name</span>
            </label>
            <div className="input-with-extension">
              <input
                id="pdf-filename"
                type="text"
                className="text-input"
                value={filename}
                onChange={(e) => onSettingChange('filename', e.target.value)}
                placeholder="college-project-document"
                disabled={isConverting}
              />
              <span className="extension-badge">.pdf</span>
            </div>
          </div>

          {/* 2. Page Size: A4 vs Letter */}
          <div className="setting-group">
            <label className="setting-label">
              <span>Page Size</span>
            </label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${pageSize === 'a4' ? 'active' : ''}`}
                onClick={() => onSettingChange('pageSize', 'a4')}
                disabled={isConverting}
              >
                <strong>A4</strong>
                <span className="segment-subtext">210 x 297 mm</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${pageSize === 'letter' ? 'active' : ''}`}
                onClick={() => onSettingChange('pageSize', 'letter')}
                disabled={isConverting}
              >
                <strong>Letter</strong>
                <span className="segment-subtext">8.5 x 11 in</span>
              </button>
            </div>
          </div>

          {/* 3. Orientation: Portrait vs Landscape */}
          <div className="setting-group">
            <label className="setting-label">
              <span>Page Orientation</span>
            </label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${orientation === 'portrait' ? 'active' : ''}`}
                onClick={() => onSettingChange('orientation', 'portrait')}
                disabled={isConverting}
              >
                <Smartphone size={16} />
                <span>Portrait</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${orientation === 'landscape' ? 'active' : ''}`}
                onClick={() => onSettingChange('orientation', 'landscape')}
                disabled={isConverting}
              >
                <Monitor size={16} />
                <span>Landscape</span>
              </button>
            </div>
          </div>

          {/* 4. Page Margins */}
          <div className="setting-group">
            <label className="setting-label">
              <span>Page Margins</span>
            </label>
            <div className="segmented-control three-items">
              <button
                type="button"
                className={`segment-btn ${margin === 'none' ? 'active' : ''}`}
                onClick={() => onSettingChange('margin', 'none')}
                disabled={isConverting}
              >
                <span>None (0mm)</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${margin === 'small' ? 'active' : ''}`}
                onClick={() => onSettingChange('margin', 'small')}
                disabled={isConverting}
              >
                <span>Small (8mm)</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${margin === 'normal' ? 'active' : ''}`}
                onClick={() => onSettingChange('margin', 'normal')}
                disabled={isConverting}
              >
                <span>Normal (16mm)</span>
              </button>
            </div>
          </div>

          {/* 5. Image Fit Mode */}
          <div className="setting-group">
            <label className="setting-label">
              <span>Image Scaling</span>
            </label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${fitMode === 'contain' ? 'active' : ''}`}
                onClick={() => onSettingChange('fitMode', 'contain')}
                disabled={isConverting}
                title="Preserves original image proportions without distortion"
              >
                <Minimize2 size={15} />
                <span>Fit (Aspect Ratio)</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${fitMode === 'fill' ? 'active' : ''}`}
                onClick={() => onSettingChange('fitMode', 'fill')}
                disabled={isConverting}
                title="Stretches image to completely fill printable boundaries"
              >
                <Maximize2 size={15} />
                <span>Stretch to Page</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar Display while converting */}
        {isConverting && (
          <div className="conversion-progress-box">
            <div className="progress-info">
              <span className="progress-label">
                <Loader2 className="spinner-icon" size={16} />
                Generating PDF (Page {progress.current} of {progress.total})...
              </span>
              <span className="progress-percent">{progress.percent}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Conversion Action Buttons */}
        <div className="settings-cta-bar">
          <button
            type="button"
            className="convert-btn"
            onClick={onConvertAndDownload}
            disabled={isConverting || imageCount === 0}
          >
            {isConverting ? (
              <>
                <Loader2 className="spinner-icon" size={18} />
                <span>Converting Images ({progress.percent}%)...</span>
              </>
            ) : (
              <>
                <FileDown size={18} />
                <span>Convert to PDF & Download</span>
              </>
            )}
          </button>

          {/* Quick Re-download button if already converted */}
          {lastGeneratedBlobUrl && !isConverting && (
            <button
              type="button"
              className="redownload-btn"
              onClick={onDownloadAgain}
              title="Download the previously converted PDF again"
            >
              <FileCheck size={16} />
              <span>Download Again</span>
            </button>
          )}
        </div>

        <div className="settings-footnote">
          <CheckCircle size={14} className="footnote-icon" />
          <span>
            {imageCount} {imageCount === 1 ? 'image' : 'images'} will be compiled into 1 PDF file ({pageSize.toUpperCase()} &bull; {orientation})
          </span>
        </div>
      </div>
    </section>
  );
}


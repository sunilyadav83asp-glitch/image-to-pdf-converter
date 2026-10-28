import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, FolderOpen, AlertCircle } from 'lucide-react';

export default function UploadArea({ onFilesSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Drag Over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  // Handle Drag Leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  // Handle Manual File Selection via Browse Button
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  const triggerFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <section className="upload-section">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileBrowser}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            triggerFileBrowser();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        <div className="drop-zone-icon-wrap">
          <UploadCloud className="drop-icon" size={44} />
        </div>

        <div className="drop-zone-text">
          <h2 className="drop-title">
            Drag & Drop your images here
          </h2>
          <p className="drop-subtitle">
            or <span className="highlight-browse">browse files</span> from your computer
          </p>
        </div>

        <div className="file-format-badges">
          <span className="badge-format">
            <ImageIcon size={13} /> JPG
          </span>
          <span className="badge-format">
            <ImageIcon size={13} /> JPEG
          </span>
          <span className="badge-format">
            <ImageIcon size={13} /> PNG
          </span>
        </div>

        <button
          type="button"
          className="browse-btn"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileBrowser();
          }}
          disabled={disabled}
        >
          <FolderOpen size={16} />
          Choose Images
        </button>
      </div>
    </section>
  );
}


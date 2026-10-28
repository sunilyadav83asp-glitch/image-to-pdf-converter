import React, { useRef, useState } from 'react';
import { 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  RotateCcw, 
  GripVertical,
  Layers
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function ImagePreviewList({
  images,
  onRemoveImage,
  onClearAll,
  onMoveImage,
  onReorderImages,
  onAddMoreFiles,
  disabled
}) {
  const addMoreInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Total calculated size of all images
  const totalSizeBytes = images.reduce((acc, curr) => acc + (curr.file?.size || 0), 0);

  // HTML5 Drag and Drop handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...images];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onReorderImages(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <section className="preview-section">
      {/* List Header / Toolbar */}
      <div className="preview-toolbar">
        <div className="toolbar-info">
          <div className="toolbar-title-wrap">
            <Layers className="toolbar-icon" size={20} />
            <h2 className="toolbar-title">Selected Images</h2>
          </div>
          <span className="toolbar-count-badge">
            {images.length} {images.length === 1 ? 'Page' : 'Pages'} ({formatBytes(totalSizeBytes)})
          </span>
        </div>

        <div className="toolbar-actions">
          {/* Add More Images Button */}
          <input
            ref={addMoreInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            style={{ display: 'none' }}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddMoreFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={() => addMoreInputRef.current?.click()}
            disabled={disabled}
          >
            <PlusCircle size={15} />
            <span>Add More</span>
          </button>

          {/* Clear All Button */}
          <button
            type="button"
            className="action-btn danger-btn"
            onClick={onClearAll}
            disabled={disabled}
            title="Remove all uploaded images"
          >
            <RotateCcw size={15} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <p className="reorder-tip">
        Tip: Use the arrow buttons or drag cards to arrange the PDF page sequence.
      </p>

      {/* Grid of Image Cards */}
      <div className="image-cards-grid">
        {images.map((img, index) => {
          const isFirst = index === 0;
          const isLast = index === images.length - 1;
          const isBeingDragged = draggedIndex === index;

          return (
            <div
              key={img.id}
              className={`image-card ${isBeingDragged ? 'is-dragging' : ''}`}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Card Header: Page Number Badge & Drag Handle */}
              <div className="card-top-bar">
                <div className="card-page-badge">
                  <span className="page-number">Page {index + 1}</span>
                </div>
                <div className="drag-handle" title="Drag to reorder">
                  <GripVertical size={16} />
                </div>
              </div>

              {/* Image Thumbnail Preview */}
              <div className="thumbnail-container">
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="preview-img"
                  loading="lazy"
                />
              </div>

              {/* Image Info: Name and File Size */}
              <div className="image-meta">
                <span className="image-name" title={img.name}>
                  {img.name}
                </span>
                <span className="image-size">
                  {formatBytes(img.file?.size)}
                </span>
              </div>

              {/* Card Controls: Move Left, Move Right, Remove */}
              <div className="card-controls">
                <div className="reorder-btns">
                  <button
                    type="button"
                    className="order-btn"
                    onClick={() => onMoveImage(index, index - 1)}
                    disabled={isFirst || disabled}
                    title="Move previous (Page up)"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="order-btn"
                    onClick={() => onMoveImage(index, index + 1)}
                    disabled={isLast || disabled}
                    title="Move next (Page down)"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="delete-card-btn"
                  onClick={() => onRemoveImage(img.id)}
                  disabled={disabled}
                  title="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


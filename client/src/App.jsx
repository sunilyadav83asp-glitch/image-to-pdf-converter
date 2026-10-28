import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImagePreviewList from './components/ImagePreviewList';
import PdfSettings from './components/PdfSettings';
import HistoryModal from './components/HistoryModal';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { generatePdf } from './utils/pdfGenerator';
import './styles.css';

// Base API URL: In development with Vite proxy, '/api' forwards to http://localhost:5000/api
const API_BASE_URL = '/api';

export default function App() {
  // --- States ---
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'small',
    fitMode: 'contain',
    filename: 'Image-to-PDF-Document'
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [lastBlobUrl, setLastBlobUrl] = useState(null);
  const [lastFileName, setLastFileName] = useState('');

  // Notifications
  const [toast, setToast] = useState(null);

  // Backend & History State
  const [serverStatus, setServerStatus] = useState({ isOnline: false, message: '' });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historySource, setHistorySource] = useState('memory');
  const [historyWarning, setHistoryWarning] = useState('');

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clean up object URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
    };
  }, []);

  // Show Toast Helper
  const showToast = (type, message, details = '') => {
    setToast({ type, message, details });
  };

  // --- Backend API Integration ---

  // Check Backend Server Health
  const checkServerHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setServerStatus({
          isOnline: true,
          message: data.message || 'Connected to backend server'
        });
      } else {
        setServerStatus({ isOnline: false, message: 'Server responded with error' });
      }
    } catch {
      setServerStatus({ isOnline: false, message: 'Server is not running on port 5000' });
    }
  }, []);

  // Fetch Conversion History
  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryWarning('');
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistoryRecords(result.data || []);
          setHistorySource(result.source || 'memory');
          if (result.warning) setHistoryWarning(result.warning);
        }
      }
    } catch (err) {
      console.warn('Could not load history from backend:', err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Initial Check on Load
  useEffect(() => {
    checkServerHealth();
    fetchHistory();
  }, [checkServerHealth, fetchHistory]);

  // --- File Upload & Validation ---

  const handleFilesSelected = (fileList) => {
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const newFiles = Array.from(fileList);
    const validImages = [];
    const rejectedNames = [];

    newFiles.forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const isValid = validTypes.includes(file.type) || validExtensions.includes(ext);

      if (isValid) {
        validImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name
        });
      } else {
        rejectedNames.push(file.name);
      }
    });

    if (rejectedNames.length > 0) {
      showToast(
        'error',
        `Unsupported file type for ${rejectedNames.length} file(s).`,
        `Only JPG, JPEG, and PNG images are supported. Skipped: ${rejectedNames.join(', ')}`
      );
    }

    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages]);
      showToast(
        'success',
        `Added ${validImages.length} image${validImages.length > 1 ? 's' : ''} to preview list.`
      );
    }
  };

  // --- Image Reordering & Removal ---

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    showToast('info', 'Image removed from list.');
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    if (window.confirm('Are you sure you want to remove all selected images?')) {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      setImages([]);
      setLastBlobUrl(null);
      showToast('info', 'Cleared all images.');
    }
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
  };

  const handleReorderImages = (reorderedList) => {
    setImages(reorderedList);
  };

  // --- PDF Settings Handler ---

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // --- PDF Conversion & Download Execution ---

  const handleConvertAndDownload = async () => {
    if (images.length === 0) {
      showToast('error', 'Please upload at least one image before converting.');
      return;
    }

    // Determine target PDF filename
    let cleanName = settings.filename?.trim() || 'Image-to-PDF-Document';
    if (!cleanName.toLowerCase().endsWith('.pdf')) {
      cleanName += '.pdf';
    }

    setIsConverting(true);
    setProgress({ current: 0, total: images.length, percent: 0 });

    try {
      // 1. Generate PDF in browser with jsPDF
      const pdf = await generatePdf(images, settings, (prog) => {
        setProgress(prog);
      });

      // 2. Direct browser download trigger
      pdf.save(cleanName);

      // Create blob for "Download Again" convenience
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      setLastBlobUrl(blobUrl);
      setLastFileName(cleanName);

      // 3. Save Conversion History Record in Backend (Supabase PostgreSQL)
      try {
        const response = await fetch(`${API_BASE_URL}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: cleanName,
            image_count: images.length
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            // Refresh history list and state
            fetchHistory();
            showToast(
              'success',
              `🎉 PDF "${cleanName}" generated & downloaded successfully!`,
              `Recorded in ${resData.source === 'supabase' ? 'Supabase PostgreSQL' : 'server conversion history'}.`
            );
          }
        } else {
          // Non-blocking warning if backend recording had an issue
          console.warn('Backend history recording returned status:', response.status);
          showToast(
            'success',
            `🎉 PDF "${cleanName}" downloaded successfully!`,
            'Note: Server history recording was not reachable.'
          );
        }
      } catch (apiErr) {
        console.warn('Could not reach backend history API:', apiErr.message);
        showToast(
          'success',
          `🎉 PDF "${cleanName}" downloaded successfully!`,
          'Client-side conversion complete (Backend offline).'
        );
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('error', 'Failed to generate PDF.', err.message || 'An error occurred during conversion.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAgain = () => {
    if (lastBlobUrl && lastFileName) {
      const a = document.createElement('a');
      a.href = lastBlobUrl;
      a.download = lastFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('info', `Downloaded "${lastFileName}" again.`);
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <Header
        serverStatus={serverStatus}
        onOpenHistory={() => {
          fetchHistory();
          setIsHistoryOpen(true);
        }}
        historyCount={historyRecords.length}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* 1. Upload Drag & Drop Area */}
          <UploadArea
            onFilesSelected={handleFilesSelected}
            disabled={isConverting}
          />

          {/* 2. Image Previews & Ordering (Displayed once files are added) */}
          {images.length > 0 && (
            <>
              <ImagePreviewList
                images={images}
                onRemoveImage={handleRemoveImage}
                onClearAll={handleClearAll}
                onMoveImage={handleMoveImage}
                onReorderImages={handleReorderImages}
                onAddMoreFiles={handleFilesSelected}
                disabled={isConverting}
              />

              {/* 3. PDF Settings & Convert Action */}
              <PdfSettings
                settings={settings}
                onSettingChange={handleSettingChange}
                onConvertAndDownload={handleConvertAndDownload}
                isConverting={isConverting}
                progress={progress}
                imageCount={images.length}
                lastGeneratedBlobUrl={lastBlobUrl}
                onDownloadAgain={handleDownloadAgain}
              />
            </>
          )}
        </div>
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyRecords}
        isLoading={isHistoryLoading}
        onRefresh={fetchHistory}
        dataSource={historySource}
        warning={historyWarning}
      />

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}


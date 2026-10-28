import React from 'react';
import { FileText, Clock, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ serverStatus, onOpenHistory, historyCount }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-icon">
            <FileText className="icon-main" size={28} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">Image to PDF Converter</h1>
              <span className="college-badge">College Project</span>
            </div>
            <p className="brand-subtitle">
              Convert multiple JPG, JPEG & PNG images into a single high-quality PDF in seconds
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Server Connection Status Indicator */}
          <div 
            className={`server-status-pill ${serverStatus.isOnline ? 'online' : 'offline'}`}
            title={serverStatus.message || (serverStatus.isOnline ? 'Backend API Connected' : 'Backend API Disconnected')}
          >
            <Server size={14} />
            <span>Server:</span>
            {serverStatus.isOnline ? (
              <span className="status-text online">
                <CheckCircle2 size={13} />
                Online
              </span>
            ) : (
              <span className="status-text offline">
                <AlertCircle size={13} />
                Offline
              </span>
            )}
          </div>

          {/* History Button */}
          <button 
            type="button" 
            className="history-trigger-btn"
            onClick={onOpenHistory}
            aria-label="View Conversion History"
          >
            <Clock size={16} />
            <span>History</span>
            {historyCount > 0 && (
              <span className="history-badge">{historyCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}


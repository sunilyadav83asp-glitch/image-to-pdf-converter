import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'info', message, details } = toast;

  const icons = {
    success: <CheckCircle2 className="toast-icon success" size={20} />,
    error: <AlertCircle className="toast-icon error" size={20} />,
    info: <Info className="toast-icon info" size={20} />
  };

  return (
    <div className={`toast-container toast-${type}`} role="alert">
      <div className="toast-content">
        {icons[type] || icons.info}
        <div className="toast-text-group">
          <p className="toast-message">{message}</p>
          {details && <p className="toast-details">{details}</p>}
        </div>
      </div>
      <button 
        type="button" 
        className="toast-dismiss-btn" 
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}


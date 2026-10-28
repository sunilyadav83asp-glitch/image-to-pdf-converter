import React from 'react';
import { 
  X, 
  Clock, 
  Database, 
  RefreshCw, 
  FileText, 
  Layers, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export default function HistoryModal({
  isOpen,
  onClose,
  history,
  isLoading,
  onRefresh,
  dataSource,
  warning
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="modal-title">Conversion History</h3>
              <p className="modal-subtitle">Recent PDF generation logs</p>
            </div>
          </div>

          <div className="modal-header-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh History from Database"
            >
              <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="close-modal-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Database Status Banner */}
        <div className="database-status-strip">
          <div className="db-badge-wrap">
            <Database size={15} />
            <span>Database:</span>
            {dataSource === 'supabase' ? (
              <span className="db-pill supabase">
                <CheckCircle2 size={12} /> Supabase PostgreSQL
              </span>
            ) : (
              <span className="db-pill memory">
                Local Memory Cache
              </span>
            )}
          </div>
          <span className="db-tip">
            {dataSource === 'supabase'
              ? 'Connected to live Supabase cloud database'
              : 'Add SUPABASE_URL & SUPABASE_KEY in server/.env for cloud sync'}
          </span>
        </div>

        {/* Optional Warning if table was missing in Supabase */}
        {warning && (
          <div className="db-warning-banner">
            <AlertTriangle size={15} />
            <span>{warning}</span>
          </div>
        )}

        {/* Modal Body: History Table / List */}
        <div className="modal-body">
          {isLoading ? (
            <div className="history-empty-state">
              <RefreshCw size={28} className="spinning text-primary" />
              <p>Fetching records from server...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty-state">
              <FileText size={36} className="empty-icon" />
              <h4>No conversions logged yet</h4>
              <p>Upload some images and click "Convert to PDF" to start recording history!</p>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document Name</th>
                    <th>Pages</th>
                    <th>Converted At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="col-index">{index + 1}</td>
                      <td className="col-filename">
                        <div className="file-name-cell">
                          <FileText size={15} className="file-cell-icon" />
                          <span title={item.filename}>{item.filename}</span>
                        </div>
                      </td>
                      <td className="col-pages">
                        <span className="page-count-badge">
                          <Layers size={12} />
                          {item.image_count} {item.image_count === 1 ? 'img' : 'imgs'}
                        </span>
                      </td>
                      <td className="col-date">
                        <span className="date-cell">
                          <Calendar size={12} />
                          {formatDateTime(item.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="record-count-text">
            Showing {history.length} {history.length === 1 ? 'record' : 'records'}
          </span>
          <button
            type="button"
            className="modal-close-action-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


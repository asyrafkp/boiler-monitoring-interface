import React, { useState, useEffect } from 'react';
import { syncOneDriveExcelToSupabase, getSyncHistory } from '../services/oneDriveSyncService';
import { syncFromGitHub } from '../services/githubSyncService';
import './AdminPanel.css';

interface SyncLog {
  id: number;
  file_name: string;
  upload_date: string;
  rows_processed: number;
  status: string;
}

export const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadSyncHistory();
  }, []);

  const loadSyncHistory = async () => {
    try {
      const history = await getSyncHistory();
      setSyncLogs(history);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage('Syncing data...');
    setUploadStatus(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await syncOneDriveExcelToSupabase(arrayBuffer, file.name);

      setStatusMessage(`✅ ${result.message}`);
      setUploadStatus('success');
      
      // Refresh sync history
      await loadSyncHistory();
      
      // Clear file input
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`❌ Sync failed: ${errorMsg}`);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSync = async () => {
    setIsLoading(true);
    setStatusMessage('Syncing from GitHub...');
    setUploadStatus(null);

    try {
      const result = await syncFromGitHub();
      setStatusMessage(result.message);
      setUploadStatus('success');
      
      // Refresh sync history
      await loadSyncHistory();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage(`❌ GitHub sync failed: ${errorMsg}`);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  return (
    <div className="admin-panel">
      <button 
        className="admin-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Admin Panel"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-header">
              <h2>Admin Panel</h2>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-section">
              <h3>📁 Sync Excel Data</h3>
              <div className="upload-area">
                <label htmlFor="excel-upload" className="upload-label">
                  {isLoading ? 'Syncing...' : 'Select Excel File to Sync'}
                </label>
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="file-input"
                />
                
                {statusMessage && (
                  <div className={`status-message ${uploadStatus}`}>
                    {statusMessage}
                  </div>
                )}
              </div>

              <div className="instructions">
                <p><strong>Instructions:</strong></p>
                <ul>
                  <li>File must contain NGSTEAM RATIO sheet</li>
                  <li>File must contain WATER_STEAM RATIO sheet</li>
                  <li>Data will be stored in Supabase database</li>
                </ul>
              </div>
            </div>

            <div className="admin-section">
              <h3>� Sync from GitHub</h3>
              <div className="github-sync">
                <p className="sync-description">
                  Automatically fetch and sync Excel data from your GitHub repository.
                </p>
                <button 
                  className="github-sync-btn"
                  onClick={handleGitHubSync}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Syncing...' : '📥 Sync from GitHub'}
                </button>
                <div className="github-info">
                  <p><strong>Setup required first:</strong></p>
                  <ol>
                    <li>Create a folder <code>data/</code> in your GitHub repo</li>
                    <li>Upload <code>boiler_data.xlsx</code> to the <code>data/</code> folder</li>
                    <li>Click the button to sync automatically</li>
                  </ol>
                  <p>
                    <a 
                      href="https://github.com/asyrafkp/boiler-monitoring-interface" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      📂 Go to GitHub Repo →
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <h3>�📊 Sync History</h3>
              <div className="sync-history">
                {syncLogs.length === 0 ? (
                  <p className="no-logs">No sync history yet</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Date</th>
                        <th>Rows</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.file_name}</td>
                          <td>{formatDate(log.upload_date)}</td>
                          <td>{log.rows_processed}</td>
                          <td>
                            <span className={`status-badge ${log.status}`}>
                              {log.status === 'success' ? '✓' : '✗'} {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

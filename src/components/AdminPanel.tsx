import React, { useState, useEffect } from 'react';
import { syncOneDriveExcelToSupabase, getSyncHistory } from '../services/oneDriveSyncService';
import './AdminPanel.css';

interface SyncLog {
  id: number;
  file_name: string;
  upload_date: string;
  rows_processed: number;
  status: string;
}

interface SystemHealth {
  lastSyncTime: string;
  dataAge: string;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  syncErrors: string[];
  dataFreshness: 'fresh' | 'stale' | 'very-stale';
}

export const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    lastSyncTime: 'Unknown',
    dataAge: 'Unknown',
    connectionStatus: 'unknown',
    syncErrors: [],
    dataFreshness: 'fresh'
  });

  useEffect(() => {
    loadSyncHistory();
    checkSystemHealth();
    // Check system health every 30 seconds
    const healthInterval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  const loadSyncHistory = async () => {
    try {
      const history = await getSyncHistory();
      setSyncLogs(history);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      // Fetch the main boiler data to check last update time
      const cacheBuster = `?v=${Date.now()}`;
      const response = await fetch(`/boiler-monitoring-interface/boiler_data.json${cacheBuster}`);
      
      if (response.ok) {
        const data = await response.json();
        const lastUpdate = data.lastUpdate || data.timestamp;
        const lastSyncDate = new Date(lastUpdate);
        const now = new Date();
        const ageMinutes = Math.floor((now.getTime() - lastSyncDate.getTime()) / 60000);
        
        // Determine data freshness
        let freshness: 'fresh' | 'stale' | 'very-stale' = 'fresh';
        if (ageMinutes > 120) freshness = 'very-stale'; // > 2 hours
        else if (ageMinutes > 60) freshness = 'stale'; // > 1 hour
        
        setSystemHealth({
          lastSyncTime: lastSyncDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          dataAge: ageMinutes < 1 ? 'Just now' : 
                   ageMinutes === 1 ? '1 minute ago' :
                   ageMinutes < 60 ? `${ageMinutes} minutes ago` :
                   ageMinutes < 120 ? '1 hour ago' :
                   `${Math.floor(ageMinutes / 60)} hours ago`,
          connectionStatus: 'connected',
          syncErrors: [],
          dataFreshness: freshness
        });
      } else {
        setSystemHealth(prev => ({
          ...prev,
          connectionStatus: 'disconnected',
          syncErrors: [`HTTP ${response.status}: ${response.statusText}`]
        }));
      }
    } catch (error) {
      setSystemHealth(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        syncErrors: [error instanceof Error ? error.message : 'Unknown error']
      }));
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage('⏳ Syncing data...');
    setUploadStatus(null);

    try {
      console.log(`📁 Selected file: ${file.name} (${file.size} bytes)`);
      const arrayBuffer = await file.arrayBuffer();
      console.log('✓ File read as ArrayBuffer');
      
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
      console.error('❌ Upload error:', errorMsg);
      console.error('Full error:', error);
      
      setStatusMessage(`❌ ${errorMsg}`);
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

            {/* System Health Section */}
            <div className="admin-section system-health">
              <h3>🏥 System Health</h3>
              <div className="health-grid">
                <div className={`health-card ${systemHealth.connectionStatus}`}>
                  <div className="health-icon">
                    {systemHealth.connectionStatus === 'connected' ? '🟢' : 
                     systemHealth.connectionStatus === 'disconnected' ? '🔴' : '🟡'}
                  </div>
                  <div className="health-info">
                    <span className="health-label">Connection Status</span>
                    <span className="health-value">
                      {systemHealth.connectionStatus === 'connected' ? 'Connected' :
                       systemHealth.connectionStatus === 'disconnected' ? 'Disconnected' : 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className={`health-card ${systemHealth.dataFreshness}`}>
                  <div className="health-icon">
                    {systemHealth.dataFreshness === 'fresh' ? '✅' :
                     systemHealth.dataFreshness === 'stale' ? '⚠️' : '❌'}
                  </div>
                  <div className="health-info">
                    <span className="health-label">Data Freshness</span>
                    <span className="health-value">{systemHealth.dataAge}</span>
                  </div>
                </div>

                <div className="health-card">
                  <div className="health-icon">🕐</div>
                  <div className="health-info">
                    <span className="health-label">Last Sync</span>
                    <span className="health-value">{systemHealth.lastSyncTime}</span>
                  </div>
                </div>

                <div className="health-card">
                  <div className="health-icon">
                    {systemHealth.syncErrors.length === 0 ? '✓' : '⚠'}
                  </div>
                  <div className="health-info">
                    <span className="health-label">Sync Errors</span>
                    <span className="health-value">
                      {systemHealth.syncErrors.length === 0 ? 'None' : systemHealth.syncErrors.length}
                    </span>
                  </div>
                </div>
              </div>

              {systemHealth.syncErrors.length > 0 && (
                <div className="error-details">
                  <strong>Error Details:</strong>
                  <ul>
                    {systemHealth.syncErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <h3>🔗 Quick Start: Data Sync Options</h3>
              <div className="sync-options">
                <div className="option">
                  <h4>✅ Option 1: OneDrive Link (Recommended)</h4>
                  <ol>
                    <li>Click the <strong>🔧 Settings</strong> button (bottom right)</li>
                    <li>Paste your OneDrive Excel link</li>
                    <li>Click <strong>Save Link</strong></li>
                    <li>Data syncs automatically from your OneDrive file</li>
                  </ol>
                </div>
                <div className="option">
                  <h4>✅ Option 2: Manual Upload</h4>
                  <ol>
                    <li>Select Excel file above</li>
                    <li>File uploads and data is stored in database</li>
                    <li>Perfect for one-time uploads</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <h3>⏱️ Automatic Hourly Sync</h3>
              <div className="github-sync">
                <p className="sync-description">
                  To enable automatic hourly sync from OneDrive via GitHub Actions:
                </p>
                <div className="github-info">
                  <p><strong>Setup steps:</strong></p>
                  <ol>
                    <li>Go to GitHub repo Settings → Secrets and variables → Actions</li>
                    <li>Add secret: <code>ONEDRIVE_LINK</code> = your OneDrive Excel share link</li>
                    <li>Add secret: <code>SUPABASE_URL</code> = your Supabase URL</li>
                    <li>Add secret: <code>SUPABASE_ANON_KEY</code> = your Supabase anon key</li>
                    <li>GitHub Actions will then sync hourly automatically</li>
                  </ol>
                  <p className="setup-note">
                    📌 <strong>For now:</strong> Use Settings (🔧) to update your OneDrive link - 
                    it will sync data immediately!
                  </p>
                  <p>
                    <a 
                      href="https://github.com/asyrafkp/boiler-monitoring-interface/settings/secrets/actions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      🔐 Go to GitHub Secrets →
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

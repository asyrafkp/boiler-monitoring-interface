import React, { useState, useEffect } from 'react';
import { syncOneDriveExcelToSupabase, getSyncHistory } from '../services/oneDriveSyncService';
import { AdminSettings } from './AdminSettings';
import { DataValidation } from './DataValidation';
import { DashboardCustomization } from './DashboardCustomization';
import { MaintenanceFeatures } from './MaintenanceFeatures';
import './AdminPanel.css';

interface SyncLog {
  id: number;
  file_name: string;
  upload_date: string;
  rows_processed: number;
  status: string;
  sync_type?: string;
}

interface SystemHealth {
  lastSyncTime: string;
  dataAge: string;
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  syncErrors: string[];
  dataFreshness: 'fresh' | 'stale' | 'very-stale';
}

interface AdminPanelProps {
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'data' | 'validation' | 'customization' | 'maintenance' | 'settings'>('health');
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
      const cacheBuster = `?v=${Date.now()}`;
      const response = await fetch(`/boiler-monitoring-interface/boiler_data.json${cacheBuster}`);
      
      if (response.ok) {
        const data = await response.json();
        const lastUpdate = data.lastUpdate || data.timestamp;
        const lastSyncDate = new Date(lastUpdate);
        const now = new Date();
        const ageMinutes = Math.floor((now.getTime() - lastSyncDate.getTime()) / 60000);
        
        let freshness: 'fresh' | 'stale' | 'very-stale' = 'fresh';
        if (ageMinutes > 120) freshness = 'very-stale';
        else if (ageMinutes > 60) freshness = 'stale';
        
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
      const result = await syncOneDriveExcelToSupabase(arrayBuffer, file.name);
      setStatusMessage(`✅ ${result.message}`);
      setUploadStatus('success');
      await loadSyncHistory();
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Upload error:', errorMsg);
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
      <div className="admin-modal">
        <div className="admin-modal-content">
          <div className="admin-header">
            <h2>Admin Panel</h2>
            <button 
              className="close-btn"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
              <button 
                className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
                onClick={() => setActiveTab('health')}
              >
                🏥 System Health
              </button>
              <button 
                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                📁 Data Management
              </button>
              <button 
                className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
                onClick={() => setActiveTab('validation')}
              >
                📋 Data Validation
              </button>
              <button 
                className={`tab-btn ${activeTab === 'customization' ? 'active' : ''}`}
                onClick={() => setActiveTab('customization')}
              >
                🎨 Customization
              </button>
              <button 
                className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
              >
                🔧 Maintenance
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div className="tab-content">
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
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="tab-content">
                <div className="admin-section">
                  <h3>� Sync Excel Data</h3>
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
                      <li>Data is logged locally for your reference</li>
                    </ul>
                  </div>
                </div>

                <div className="admin-section">
                  <h3>🔗 Quick Start: Data Sync Options</h3>
                  <div className="sync-options">
                    <div className="option">
                      <h4>✅ Option 1: OneDrive Link (Recommended)</h4>
                      <ol>
                        <li>Click the <strong>🔧 Settings</strong> tab above</li>
                        <li>Paste your OneDrive Excel link</li>
                        <li>Click <strong>Save Link</strong></li>
                        <li>GitHub Actions syncs automatically every hour</li>
                      </ol>
                    </div>
                    <div className="option">
                      <h4>✅ Option 2: Manual Upload</h4>
                      <ol>
                        <li>Select Excel file above</li>
                        <li>File is parsed and logged locally</li>
                        <li>Perfect for testing or manual updates</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="admin-section">
                  <h3>⏱️ Automatic Hourly Sync</h3>
                  <div className="github-sync">
                    <p className="sync-description">
                      GitHub Actions automatically syncs from OneDrive every hour:
                    </p>
                    <div className="github-info">
                      <p><strong>Setup is simple - OneDrive link only:</strong></p>
                      <ol>
                        <li>Go to GitHub repo Settings → Secrets and variables → Actions</li>
                        <li>Add secret: <code>ONEDRIVE_LINK</code> = your OneDrive Excel share link</li>
                        <li>GitHub Actions will sync automatically every hour</li>
                        <li>New data appears in your dashboard instantly</li>
                      </ol>
                      <p className="setup-note">
                        📌 <strong>Already configured?</strong> Use the Settings tab to verify or update your OneDrive link
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
                  <h3>📊 Sync History</h3>
                  <div className="sync-history">
                    {syncLogs.length === 0 ? (
                      <p className="no-logs">No sync history yet</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Sync Type</th>
                            <th>Date & Time</th>
                            <th>Rows</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {syncLogs.map((log) => (
                            <tr key={log.id}>
                              <td>{log.file_name}</td>
                              <td>
                                <span className="sync-type-badge">
                                  {log.sync_type === 'onedrive' ? '☁️ OneDrive' : '📤 Manual'}
                                </span>
                              </td>
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
            )}

            {/* Data Validation Tab */}
            {activeTab === 'validation' && (
              <div className="tab-content">
                <DataValidation />
              </div>
            )}

            {/* Customization Tab */}
            {activeTab === 'customization' && (
              <div className="tab-content">
                <DashboardCustomization />
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="tab-content">
                <MaintenanceFeatures />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="tab-content">
                <AdminSettings onSyncComplete={loadSyncHistory} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

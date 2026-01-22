import React, { useState } from 'react';
import { refreshOneDriveConnection } from '../services/oneDriveConnectionService';

export const OneDriveConnection: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
    type: null,
    message: ''
  });
  const [config, setConfig] = useState({
    // Azure App Configuration
    clientId: localStorage.getItem('azure_client_id') || '',
    tenantId: localStorage.getItem('azure_tenant_id') || '',
    
    // GitHub Configuration
    githubOwner: localStorage.getItem('github_owner') || '',
    githubRepo: localStorage.getItem('github_repo') || '',
    githubToken: localStorage.getItem('github_token') || '',
    
    // OneDrive File
    fileName: localStorage.getItem('onedrive_filename') || 'REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx'
  });

  const saveConfig = () => {
    localStorage.setItem('azure_client_id', config.clientId);
    localStorage.setItem('azure_tenant_id', config.tenantId);
    localStorage.setItem('github_owner', config.githubOwner);
    localStorage.setItem('github_repo', config.githubRepo);
    localStorage.setItem('github_token', config.githubToken);
    localStorage.setItem('onedrive_filename', config.fileName);
    setStatus({ type: 'success', message: 'Configuration saved!' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleRefresh = async () => {
    // Validate GUIDs format
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!config.clientId || !guidPattern.test(config.clientId)) {
      setStatus({
        type: 'error',
        message: '❌ Invalid Client ID format. Must be a GUID like: 48b047d9-d5d9-492d-9bb3-bb1fa3b05efd\n\nFind it in Azure Portal → Your App → Overview → Application (client) ID'
      });
      return;
    }
    
    if (!config.tenantId || !guidPattern.test(config.tenantId)) {
      setStatus({
        type: 'error',
        message: '❌ Invalid Tenant ID format. Must be a GUID like: eee3095b-dd9b-4e16-90b7-8b3baca8da81\n\nFind it in Azure Portal → Your App → Overview → Directory (tenant) ID'
      });
      return;
    }
    
    if (!config.githubOwner || !config.githubRepo || !config.githubToken) {
      setStatus({
        type: 'error',
        message: 'Please fill in all configuration fields first'
      });
      return;
    }

    setIsRefreshing(true);
    setStatus({ type: 'info', message: '🔄 Authenticating with Microsoft...' });

    try {
      const result = await refreshOneDriveConnection(
        {
          clientId: config.clientId,
          tenantId: config.tenantId,
          redirectUri: window.location.origin + '/auth-callback'
        },
        {
          owner: config.githubOwner,
          repo: config.githubRepo,
          token: config.githubToken
        },
        config.fileName
      );

      setStatus({
        type: 'success',
        message: `✅ ${result.message}\n\nNew share link: ${result.shareLink.substring(0, 50)}...`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="onedrive-connection">
      <h3>🔗 OneDrive Connection</h3>
      <p className="section-description">
        Automatically refresh your OneDrive share link and update GitHub secrets with one click.
      </p>

      <div className="config-sections">
        {/* Azure Configuration */}
        <div className="config-section">
          <h4>☁️ Azure Configuration</h4>
          <div className="form-group">
            <label>Client ID</label>
            <input
              type="text"
              placeholder="e.g., 48b047d9-d5d9-492d-9bb3-bb1fa3b05efd"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            />
            <small>From Azure Portal → Your App → Overview → Application (client) ID</small>
          </div>
          <div className="form-group">
            <label>Tenant ID</label>
            <input
              type="text"
              placeholder="e.g., eee3095b-dd9b-4e16-90b7-8b3baca8da81"
              value={config.tenantId}
              onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
            />
            <small>From Azure Portal → Your App → Overview → Directory (tenant) ID</small>
          </div>
        </div>

        {/* GitHub Configuration */}
        <div className="config-section">
          <h4>🐙 GitHub Configuration</h4>
          <div className="form-group">
            <label>Repository Owner</label>
            <input
              type="text"
              placeholder="e.g., username"
              value={config.githubOwner}
              onChange={(e) => setConfig({ ...config, githubOwner: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Repository Name</label>
            <input
              type="text"
              placeholder="e.g., boiler-monitoring-interface"
              value={config.githubRepo}
              onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Personal Access Token</label>
            <input
              type="password"
              placeholder="GitHub PAT with repo and secrets scope"
              value={config.githubToken}
              onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
            />
            <small>
              Create at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                GitHub Settings → Tokens
              </a> (Requires: repo, admin:repo_hook scopes)
            </small>
          </div>
        </div>

        {/* OneDrive File */}
        <div className="config-section">
          <h4>📁 OneDrive File</h4>
          <div className="form-group">
            <label>Excel Filename</label>
            <input
              type="text"
              placeholder="e.g., REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx"
              value={config.fileName}
              onChange={(e) => setConfig({ ...config, fileName: e.target.value })}
            />
            <small>File can be anywhere in your OneDrive (searches all folders)</small>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={saveConfig}
          disabled={isRefreshing}
        >
          💾 Save Configuration
        </button>
        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={isRefreshing || !config.clientId || !config.githubToken}
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh OneDrive Link'}
        </button>
      </div>

      {status.type && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="info-box">
        <h4>ℹ️ How It Works</h4>
        <ol>
          <li>Click "Refresh OneDrive Link" button</li>
          <li>Sign in with your Microsoft account (popup)</li>
          <li>Script gets a fresh share link from OneDrive</li>
          <li>Automatically updates GitHub secret ONEDRIVE_LINK</li>
          <li>Next hourly sync uses the new link</li>
        </ol>
        <p><strong>No more manual secret updates!</strong></p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

export const OneDriveConnection: React.FC = () => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({
    type: null,
    message: ''
  });
  const [config, setConfig] = useState({
    githubOwner: localStorage.getItem('github_owner') || '',
    githubRepo: localStorage.getItem('github_repo') || '',
    fileName: localStorage.getItem('onedrive_filename') || 'REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx'
  });

  const saveConfig = () => {
    localStorage.setItem('github_owner', config.githubOwner);
    localStorage.setItem('github_repo', config.githubRepo);
    localStorage.setItem('onedrive_filename', config.fileName);
    setStatus({ type: 'success', message: 'Configuration saved!' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  return (
    <div className="onedrive-connection">
      <h3>🔗 OneDrive Link Management</h3>
      
      <div className="info-box" style={{ backgroundColor: '#e7f3ff', borderColor: '#0066cc', marginBottom: '20px' }}>
        <strong>💡 Better Alternative: Tailscale Direct Access</strong>
        <p style={{ marginTop: '8px', marginBottom: '8px' }}>
          <strong>Tired of link expiration?</strong> Use Tailscale to give GitHub Actions direct access to your Excel file!
        </p>
        <p style={{ marginBottom: '8px' }}>
          ✅ Always fresh data • ✅ No expiration • ✅ No manual refresh needed
        </p>
        <a 
          href="https://github.com/asyrafkp/boiler-monitoring-interface/blob/main/TAILSCALE_SETUP.md" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#0066cc', fontWeight: 'bold' }}
        >
          📖 View Tailscale Setup Guide →
        </a>
      </div>
      
      <div className="info-box" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', marginBottom: '20px' }}>
        <strong>⚠️ Personal OneDrive Limitation:</strong>
        <p style={{ marginTop: '8px', marginBottom: '8px' }}>
          Personal Microsoft accounts require <strong>SharePoint Online (SPO) license</strong> for automatic share link creation via API.
          Unfortunately, this means the one-click refresh feature won't work with personal OneDrive accounts.
        </p>
        <p style={{ marginBottom: '0' }}>
          <strong>Manual refresh below</strong> - or consider Tailscale above for zero maintenance!
        </p>
      </div>

      <div className="config-section">
        <h4>📝 Quick Manual Refresh Guide</h4>
        
        <div className="form-group">
          <label>Your Excel File</label>
          <input
            type="text"
            placeholder="e.g., REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx"
            value={config.fileName}
            onChange={(e) => setConfig({ ...config, fileName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>GitHub Repository</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="owner"
              value={config.githubOwner}
              onChange={(e) => setConfig({ ...config, githubOwner: e.target.value })}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="repo"
              value={config.githubRepo}
              onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={saveConfig}
            style={{ marginTop: '10px' }}
          >
            💾 Save Configuration
          </button>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h5 style={{ marginTop: 0, marginBottom: '15px' }}>📋 Step-by-Step Instructions:</h5>
          
          <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>
              <strong>Go to OneDrive:</strong>{' '}
              <a href="https://onedrive.live.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                Open OneDrive →
              </a>
            </li>
            <li>
              <strong>Find your file:</strong> {config.fileName || 'your Excel file'}
            </li>
            <li>
              <strong>Right-click</strong> the file → <strong>Share</strong>
            </li>
            <li>
              Select: <strong>"Anyone with the link can view"</strong>
            </li>
            <li>
              Click <strong>Copy link</strong>
            </li>
            <li>
              <strong>Go to GitHub Secrets:</strong>{' '}
              {config.githubOwner && config.githubRepo ? (
                <a 
                  href={`https://github.com/${config.githubOwner}/${config.githubRepo}/settings/secrets/actions`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0066cc' }}
                >
                  Open GitHub Secrets →
                </a>
              ) : (
                <span style={{ color: '#6c757d' }}>(Configure GitHub repo above first)</span>
              )}
            </li>
            <li>
              Find <code style={{ backgroundColor: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>ONEDRIVE_LINK</code> secret
            </li>
            <li>
              Click <strong>Update</strong> → Paste your OneDrive link → <strong>Update secret</strong>
            </li>
          </ol>

          <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '6px', marginTop: '20px', borderLeft: '4px solid #28a745' }}>
            <strong>✅ Done!</strong> Your hourly sync will now use the fresh link. 
            This link typically lasts <strong>several months</strong> before expiring.
          </div>
          
          <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '6px', marginTop: '15px', borderLeft: '4px solid #0066cc' }}>
            <strong>💡 Pro Tip:</strong> Bookmark the GitHub Secrets page for quick access next time!
          </div>
        </div>
      </div>

      {status.type && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

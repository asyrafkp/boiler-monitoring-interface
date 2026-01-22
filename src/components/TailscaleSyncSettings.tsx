import React, { useState, useEffect } from 'react';
import './TailscaleSyncSettings.css';

interface TailscaleSettings {
  authKey: string;
  deviceName: string;
  shareName: string;
  shareUsername: string;
  sharePassword: string;
  fileName: string;
}

const TailscaleSyncSettings: React.FC = () => {
  const [settings, setSettings] = useState<TailscaleSettings>({
    authKey: '',
    deviceName: '',
    shareName: '',
    shareUsername: '',
    sharePassword: '',
    fileName: ''
  });
  const [githubToken, setGithubToken] = useState('');
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('tailscale_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
    }
    const savedRepo = localStorage.getItem('github_repo');
    if (savedRepo) {
      setRepo(savedRepo);
    }
  }, []);

  const handleChange = (field: keyof TailscaleSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveLocally = () => {
    localStorage.setItem('tailscale_settings', JSON.stringify(settings));
    localStorage.setItem('github_token', githubToken);
    localStorage.setItem('github_repo', repo);
    setMessage({ type: 'success', text: 'Settings saved locally!' });
  };

  const updateGitHubSecrets = async () => {
    if (!githubToken || !repo) {
      setMessage({ type: 'error', text: 'Please provide GitHub Token and Repository name' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Updating GitHub Secrets...' });

    try {
      // Get the repository's public key for encrypting secrets
      const keyResponse = await fetch(`https://api.github.com/repos/${repo}/actions/secrets/public-key`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!keyResponse.ok) {
        throw new Error(`Failed to get public key: ${keyResponse.statusText}`);
      }

      const { key: publicKey, key_id } = await keyResponse.json();

      // Encrypt and upload each secret
      const secrets = [
        { name: 'TAILSCALE_AUTHKEY', value: settings.authKey },
        { name: 'TAILSCALE_DEVICE_NAME', value: settings.deviceName },
        { name: 'SHARE_NAME', value: settings.shareName },
        { name: 'SHARE_USERNAME', value: settings.shareUsername },
        { name: 'SHARE_PASSWORD', value: settings.sharePassword },
        { name: 'FILE_NAME', value: settings.fileName }
      ];

      let successCount = 0;
      for (const secret of secrets) {
        if (!secret.value) continue; // Skip empty values

        // Use libsodium-wrappers for encryption (we'll load it from CDN)
        const encryptedValue = await encryptSecret(secret.value, publicKey);

        const response = await fetch(`https://api.github.com/repos/${repo}/actions/secrets/${secret.name}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            encrypted_value: encryptedValue,
            key_id: key_id
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          console.error(`Failed to update ${secret.name}:`, await response.text());
        }
      }

      saveLocally();
      setMessage({ type: 'success', text: `Successfully updated ${successCount} GitHub Secrets!` });
    } catch (error) {
      console.error('Error updating secrets:', error);
      setMessage({ type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  // Encrypt secret using libsodium
  const encryptSecret = async (secret: string, publicKey: string): Promise<string> => {
    // Load libsodium if not already loaded
    if (!(window as any).sodium) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/libsodium-wrappers@0.7.11/dist/browsers/sodium.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      await (window as any).sodium.ready;
    }

    const sodium = (window as any).sodium;
    const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(secret);
    const encBytes = sodium.crypto_box_seal(binsec, binkey);
    return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
  };

  const testConnection = async () => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Testing connection...' });

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'GitHub connection successful!' });
      } else {
        throw new Error(`Connection failed: ${response.statusText}`);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tailscale-sync-settings">
      <div className="settings-header">
        <h2>🔄 Tailscale Sync Settings</h2>
        <p>Configure Tailscale + SMB connection for automatic data sync</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' && '✅ '}
          {message.type === 'error' && '❌ '}
          {message.type === 'info' && 'ℹ️ '}
          {message.text}
        </div>
      )}

      <div className="settings-section">
        <h3>📦 GitHub Configuration</h3>
        <div className="form-group">
          <label>
            GitHub Personal Access Token
            <span className="help-text">
              Create at: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">
                github.com/settings/tokens/new
              </a> (needs <code>repo</code> scope)
            </span>
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div className="form-group">
          <label>
            Repository Name
            <span className="help-text">Format: username/repo-name</span>
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="asyrafkp/boiler-monitoring-interface"
          />
        </div>

        <button onClick={testConnection} disabled={loading || !githubToken || !repo}>
          🧪 Test Connection
        </button>
      </div>

      <div className="settings-section">
        <h3>🔐 Tailscale Configuration</h3>
        <div className="form-group">
          <label>
            Tailscale Auth Key
            <span className="help-text">
              Generate at: <a href="https://login.tailscale.com/admin/settings/keys" target="_blank" rel="noopener noreferrer">
                login.tailscale.com/admin/settings/keys
              </a> (check Ephemeral + Reusable)
            </span>
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={settings.authKey}
            onChange={(e) => handleChange('authKey', e.target.value)}
            placeholder="tskey-auth-..."
          />
        </div>

        <div className="form-group">
          <label>
            Device Name
            <span className="help-text">Run <code>tailscale status</code> on your PC to get this</span>
          </label>
          <input
            type="text"
            value={settings.deviceName}
            onChange={(e) => handleChange('deviceName', e.target.value)}
            placeholder="DESKTOP-ABC123"
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>📁 SMB Share Configuration</h3>
        <div className="form-group">
          <label>Share Name</label>
          <input
            type="text"
            value={settings.shareName}
            onChange={(e) => handleChange('shareName', e.target.value)}
            placeholder="BoilerData"
          />
        </div>

        <div className="form-group">
          <label>Windows Username</label>
          <input
            type="text"
            value={settings.shareUsername}
            onChange={(e) => handleChange('shareUsername', e.target.value)}
            placeholder="Your Windows username"
          />
        </div>

        <div className="form-group">
          <label>Windows Password</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={settings.sharePassword}
            onChange={(e) => handleChange('sharePassword', e.target.value)}
            placeholder="Your Windows password"
          />
        </div>

        <div className="form-group">
          <label>Excel File Name</label>
          <input
            type="text"
            value={settings.fileName}
            onChange={(e) => handleChange('fileName', e.target.value)}
            placeholder="REPORT DAILY BULAN 2026 - 01 JANUARI.xlsx"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            Show passwords
          </label>
        </div>
      </div>

      <div className="actions">
        <button onClick={saveLocally} className="btn-secondary">
          💾 Save Locally
        </button>
        <button onClick={updateGitHubSecrets} disabled={loading} className="btn-primary">
          {loading ? '⏳ Updating...' : '🚀 Update GitHub Secrets'}
        </button>
      </div>

      <div className="info-box">
        <h4>ℹ️ How it works</h4>
        <ol>
          <li>Fill in all the configuration values above</li>
          <li>Create a GitHub Personal Access Token with <code>repo</code> scope</li>
          <li>Click "Update GitHub Secrets" to save them to your repository</li>
          <li>The workflow will run automatically every hour to sync data</li>
        </ol>
        <p>
          <strong>Security:</strong> Your GitHub token and settings are stored locally in your browser.
          The secrets are encrypted before being sent to GitHub using their public key encryption.
        </p>
      </div>
    </div>
  );
};

export default TailscaleSyncSettings;

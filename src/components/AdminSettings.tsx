import React, { useState, useEffect } from 'react';
import {
  getOneDriveLink,
  updateOneDriveLink,
} from '../services/adminSettingsService';
import './AdminSettings.css';

// Admin settings component for managing OneDrive sync configuration
export const AdminSettings: React.FC = () => {
  console.log('AdminSettings component rendering');
  const [isOpen, setIsOpen] = useState(false);
  const [oneDriveLink, setOneDriveLink] = useState('');
  const [tempLink, setTempLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const link = await getOneDriveLink();
      setOneDriveLink(link);
      setTempLink(link);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Failed to load settings');
      setMessageType('error');
    }
  };

  const handleSaveLink = async () => {
    if (!tempLink.trim()) {
      setMessage('❌ Please enter a valid link');
      setMessageType('error');
      return;
    }

    if (!tempLink.startsWith('http')) {
      setMessage('❌ Link must start with http');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateOneDriveLink(tempLink, 'admin');
      
      if (success) {
        setOneDriveLink(tempLink);
        setMessage('✅ OneDrive link updated successfully');
        setMessageType('success');
        setTimeout(() => {
          setMessage('');
          setMessageType(null);
        }, 3000);
      } else {
        setMessage('❌ Failed to update link');
        setMessageType('error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`❌ ${errorMsg}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempLink(oneDriveLink);
    setMessage('');
    setMessageType(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('✅ Copied to clipboard');
    setMessageType('success');
    setTimeout(() => {
      setMessage('');
      setMessageType(null);
    }, 2000);
  };

  return (
    <div className="admin-settings">
      <button
        className="settings-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        🔧
      </button>

      {isOpen && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h2>⚙️ Admin Settings</h2>
              <button
                className="settings-close-btn"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="settings-section">
              <h3>🔗 OneDrive Excel Link</h3>
              <div className="setting-item">
                <label htmlFor="onedrive-link">
                  Direct Link to Excel File:
                </label>
                <textarea
                  id="onedrive-link"
                  value={tempLink}
                  onChange={(e) => setTempLink(e.target.value)}
                  placeholder="Paste your OneDrive Excel file link here..."
                  rows={3}
                  className="link-input"
                />
                <small className="help-text">
                  📝 Get link: OneDrive → Right-click file → Share → Copy link
                </small>

                {message && (
                  <div className={`setting-message ${messageType}`}>
                    {message}
                  </div>
                )}

                <div className="button-group">
                  <button
                    className="save-btn"
                    onClick={handleSaveLink}
                    disabled={isLoading || tempLink === oneDriveLink}
                  >
                    {isLoading ? '⏳ Saving...' : '💾 Save Link'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>

                <div className="current-link">
                  <strong>Current Link:</strong>
                  <div className="link-display">
                    <code>{oneDriveLink.substring(0, 60)}...</code>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(oneDriveLink)}
                      title="Copy link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>📅 Sync Schedule</h3>
              <div className="sync-info">
                <p>
                  <strong>Frequency:</strong> Every hour (automatic)
                </p>
                <p>
                  <strong>Time Zone:</strong> UTC
                </p>
                <p className="sync-note">
                  📌 GitHub Actions automatically downloads from the link above
                  every hour and stores in GitHub. Your app then syncs from GitHub.
                </p>
              </div>
            </div>

            <div className="settings-section">
              <h3>ℹ️ How It Works</h3>
              <ol className="how-it-works">
                <li>You provide Excel link above</li>
                <li>GitHub Actions runs every hour</li>
                <li>Downloads latest Excel from OneDrive</li>
                <li>Stores in GitHub repository</li>
                <li>Your app syncs from GitHub</li>
                <li>Dashboard shows latest data</li>
              </ol>
            </div>

            <div className="settings-section last">
              <h3>🔄 Manual Sync</h3>
              <p>
                Want to sync right now instead of waiting?
              </p>
              <a href="#" className="manual-sync-note">
                Go to Admin Panel → Click "Sync from GitHub" →
                Data updates instantly
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

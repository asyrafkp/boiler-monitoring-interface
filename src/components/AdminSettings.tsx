import React, { useState } from 'react';
import './AdminSettings.css';

// Admin settings component for managing OneDrive sync configuration
export const AdminSettings: React.FC = () => {
  console.log('AdminSettings component rendering - SIMPLE TEST VERSION');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="admin-settings">
      <button
        className="settings-toggle-btn"
        onClick={() => {
          console.log('Settings button clicked');
          setIsOpen(!isOpen);
        }}
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
              <p>Settings panel temporarily simplified for testing.</p>
              <p style={{color: '#10b981', fontWeight: 'bold'}}>✅ If you see this, the component is working!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

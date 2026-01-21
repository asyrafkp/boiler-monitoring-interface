import React, { useState, useEffect } from 'react';
import './DashboardCustomization.css';

interface MetricPreference {
  steam: boolean;
  water: boolean;
  naturalGas: boolean;
  electric: boolean;
  wasteGas: boolean;
  efficiency: boolean;
}

interface DashboardPreferences {
  metrics: MetricPreference;
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  metrics: {
    steam: true,
    water: true,
    naturalGas: true,
    electric: true,
    wasteGas: false,
    efficiency: true
  },
  theme: 'light',
  compactMode: false,
  autoRefresh: true,
  refreshInterval: 60
};

export const DashboardCustomization: React.FC = () => {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('dashboard_preferences');
      if (stored) {
        const loaded = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...loaded });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('dashboard_preferences', JSON.stringify(preferences));
      setHasChanges(false);
      alert('✅ Preferences saved successfully!');
      // Apply theme immediately
      applyTheme(preferences.theme);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('❌ Failed to save preferences');
    }
  };

  const resetToDefault = () => {
    if (confirm('Reset all preferences to default?')) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasChanges(true);
      localStorage.removeItem('dashboard_preferences');
    }
  };

  const handleMetricToggle = (metric: keyof MetricPreference) => {
    setPreferences(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric]: !prev.metrics[metric]
      }
    }));
    setHasChanges(true);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
    setHasChanges(true);
    applyTheme(theme);
  };

  const handleCompactModeToggle = () => {
    setPreferences(prev => ({
      ...prev,
      compactMode: !prev.compactMode
    }));
    setHasChanges(true);
  };

  const handleAutoRefreshToggle = () => {
    setPreferences(prev => ({
      ...prev,
      autoRefresh: !prev.autoRefresh
    }));
    setHasChanges(true);
  };

  const handleRefreshIntervalChange = (interval: number) => {
    setPreferences(prev => ({
      ...prev,
      refreshInterval: interval
    }));
    setHasChanges(true);
  };

  const applyTheme = (theme: string) => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      html.style.colorScheme = 'light';
    } else {
      html.style.colorScheme = 'light dark';
    }
  };

  const activeMetricsCount = Object.values(preferences.metrics).filter(Boolean).length;

  return (
    <div className="dashboard-customization">
      <div className="custom-header">
        <h3>🎨 Dashboard Customization</h3>
        <p className="custom-subtext">Personalize your dashboard display and behavior</p>
      </div>

      <div className="customization-sections">
        {/* Metric Visibility Section */}
        <div className="custom-section">
          <h4>📊 Metric Visibility</h4>
          <p className="section-description">
            Choose which metrics to display on your dashboard ({activeMetricsCount}/6 visible)
          </p>
          <div className="metrics-grid">
            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.steam}
                  onChange={() => handleMetricToggle('steam')}
                  className="toggle-input"
                />
                <span className="toggle-icon">💨</span>
                <span className="toggle-text">Steam Production</span>
              </label>
            </div>

            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.water}
                  onChange={() => handleMetricToggle('water')}
                  className="toggle-input"
                />
                <span className="toggle-icon">💧</span>
                <span className="toggle-text">Water Usage</span>
              </label>
            </div>

            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.naturalGas}
                  onChange={() => handleMetricToggle('naturalGas')}
                  className="toggle-input"
                />
                <span className="toggle-icon">🔥</span>
                <span className="toggle-text">Natural Gas</span>
              </label>
            </div>

            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.electric}
                  onChange={() => handleMetricToggle('electric')}
                  className="toggle-input"
                />
                <span className="toggle-icon">⚡</span>
                <span className="toggle-text">Electricity</span>
              </label>
            </div>

            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.wasteGas}
                  onChange={() => handleMetricToggle('wasteGas')}
                  className="toggle-input"
                />
                <span className="toggle-icon">💨</span>
                <span className="toggle-text">Waste Gas</span>
              </label>
            </div>

            <div className="metric-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.metrics.efficiency}
                  onChange={() => handleMetricToggle('efficiency')}
                  className="toggle-input"
                />
                <span className="toggle-icon">📈</span>
                <span className="toggle-text">Efficiency</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="custom-section">
          <h4>🎨 Display Settings</h4>
          
          <div className="setting-item">
            <label className="setting-label">Theme</label>
            <div className="theme-options">
              <button
                className={`theme-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                ☀️ Light
              </button>
              <button
                className={`theme-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                🌙 Dark
              </button>
              <button
                className={`theme-btn ${preferences.theme === 'auto' ? 'active' : ''}`}
                onClick={() => handleThemeChange('auto')}
              >
                🔄 Auto
              </button>
            </div>
          </div>

          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preferences.compactMode}
                onChange={handleCompactModeToggle}
                className="toggle-input"
              />
              <span className="toggle-text">🔲 Compact Mode</span>
            </label>
            <p className="setting-description">Reduce spacing and font sizes for more data density</p>
          </div>
        </div>

        {/* Auto-Refresh Section */}
        <div className="custom-section">
          <h4>🔄 Auto-Refresh Settings</h4>

          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preferences.autoRefresh}
                onChange={handleAutoRefreshToggle}
                className="toggle-input"
              />
              <span className="toggle-text">Enable Auto-Refresh</span>
            </label>
            <p className="setting-description">Automatically refresh data at regular intervals</p>
          </div>

          {preferences.autoRefresh && (
            <div className="setting-item">
              <label className="setting-label">Refresh Interval</label>
              <div className="interval-options">
                {[30, 60, 120, 300].map(interval => (
                  <button
                    key={interval}
                    className={`interval-btn ${preferences.refreshInterval === interval ? 'active' : ''}`}
                    onClick={() => handleRefreshIntervalChange(interval)}
                  >
                    {interval === 30 ? '30s' : 
                     interval === 60 ? '1m' :
                     interval === 120 ? '2m' : '5m'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="custom-actions">
        <button 
          onClick={savePreferences}
          disabled={!hasChanges}
          className="save-btn"
        >
          💾 Save Preferences
        </button>
        <button 
          onClick={resetToDefault}
          className="reset-btn"
        >
          🔄 Reset to Default
        </button>
      </div>

      {/* Status Message */}
      {!hasChanges && (
        <div className="status-message">
          ✅ All preferences are up to date
        </div>
      )}
      {hasChanges && (
        <div className="status-message unsaved">
          ⚠️ You have unsaved changes
        </div>
      )}
    </div>
  );
};

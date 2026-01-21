import React, { useState, useEffect } from 'react';
import './DataValidation.css';

interface ValidationIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  boiler: string;
  metric: string;
  value: number | string;
  message: string;
  date?: string;
}

export const DataValidation: React.FC = () => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    performValidation();
  }, []);

  const performValidation = async () => {
    setIsScanning(true);
    const foundIssues: ValidationIssue[] = [];

    try {
      // Check all boiler data files
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`/boiler-monitoring-interface/boiler_${i}_daily.json?v=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.dailyData && Array.isArray(data.dailyData)) {
            data.dailyData.forEach((entry: any, idx: number) => {
              // Skip TOTAL row
              if (entry.date === 'TOTAL') return;

              const boilerName = `Boiler ${i}`;
              
              // Check for negative values (critical)
              if (entry.steam && entry.steam < 0) {
                foundIssues.push({
                  id: `b${i}_steam_neg_${idx}`,
                  severity: 'critical',
                  boiler: boilerName,
                  metric: 'Steam',
                  value: entry.steam,
                  message: `Negative steam value: ${entry.steam} MT`,
                  date: entry.date
                });
              }

              if (entry.naturalGas && entry.naturalGas < 0) {
                foundIssues.push({
                  id: `b${i}_ng_neg_${idx}`,
                  severity: 'critical',
                  boiler: boilerName,
                  metric: 'Natural Gas',
                  value: entry.naturalGas,
                  message: `Negative natural gas value: ${entry.naturalGas} SM³`,
                  date: entry.date
                });
              }

              if (entry.water && entry.water < 0) {
                foundIssues.push({
                  id: `b${i}_water_neg_${idx}`,
                  severity: 'critical',
                  boiler: boilerName,
                  metric: 'Water',
                  value: entry.water,
                  message: `Negative water value: ${entry.water} MT`,
                  date: entry.date
                });
              }

              // Check for zero values in active boilers (warning)
              if (entry.date && entry.steam === 0 && entry.naturalGas > 0) {
                foundIssues.push({
                  id: `b${i}_steam_zero_${idx}`,
                  severity: 'warning',
                  boiler: boilerName,
                  metric: 'Steam',
                  value: 0,
                  message: `No steam output but gas consumption detected (${entry.naturalGas} SM³)`,
                  date: entry.date
                });
              }

              // Check for unusually high values (warning)
              if (entry.steam && entry.steam > 100) {
                foundIssues.push({
                  id: `b${i}_steam_high_${idx}`,
                  severity: 'warning',
                  boiler: boilerName,
                  metric: 'Steam',
                  value: entry.steam,
                  message: `Unusually high steam output: ${entry.steam} MT (exceeds typical capacity)`,
                  date: entry.date
                });
              }

              // Check for very low steam with high gas (efficiency issue)
              if (entry.steam && entry.naturalGas && entry.steam > 0 && entry.naturalGas > 0) {
                const ratio = entry.steam / entry.naturalGas;
                if (ratio < 0.01) {
                  foundIssues.push({
                    id: `b${i}_efficiency_${idx}`,
                    severity: 'warning',
                    boiler: boilerName,
                    metric: 'Efficiency',
                    value: ratio.toFixed(4),
                    message: `Low efficiency: ${ratio.toFixed(4)} MT/SM³ (high gas use for low steam)`,
                    date: entry.date
                  });
                }
              }
            });
          }
        }
      }

      setIssues(foundIssues);
    } catch (error) {
      console.error('Error during validation:', error);
      setIssues([{
        id: 'validation_error',
        severity: 'critical',
        boiler: 'System',
        metric: 'Validation',
        value: 'Error',
        message: 'Failed to validate data files'
      }]);
    } finally {
      setIsScanning(false);
    }
  };

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="data-validation">
      <div className="validation-header">
        <div className="validation-title">
          <h3>📋 Data Validation</h3>
          <p className="validation-status">
            {isScanning ? '🔄 Scanning...' : `Last scan: ${new Date().toLocaleTimeString()}`}
          </p>
        </div>
        <button 
          onClick={performValidation}
          disabled={isScanning}
          className="rescan-btn"
        >
          🔄 Rescan Now
        </button>
      </div>

      <div className="validation-summary">
        <div className={`summary-card critical ${criticalCount > 0 ? 'has-issues' : ''}`}>
          <span className="summary-icon">🔴</span>
          <div>
            <div className="summary-label">Critical Issues</div>
            <div className="summary-value">{criticalCount}</div>
          </div>
        </div>
        <div className={`summary-card warning ${warningCount > 0 ? 'has-issues' : ''}`}>
          <span className="summary-icon">🟡</span>
          <div>
            <div className="summary-label">Warnings</div>
            <div className="summary-value">{warningCount}</div>
          </div>
        </div>
        <div className={`summary-card info`}>
          <span className="summary-icon">ℹ️</span>
          <div>
            <div className="summary-label">Total Issues</div>
            <div className="summary-value">{issues.length}</div>
          </div>
        </div>
      </div>

      <div className="issues-list">
        {issues.length === 0 ? (
          <div className="no-issues">
            <p>✅ All data validation checks passed!</p>
            <p className="no-issues-subtext">No anomalies detected</p>
          </div>
        ) : (
          <div className="issues-container">
            {issues.map((issue) => (
              <div key={issue.id} className={`issue-card severity-${issue.severity}`}>
                <div className="issue-header">
                  <span className="issue-severity">
                    {issue.severity === 'critical' ? '🔴 Critical' : 
                     issue.severity === 'warning' ? '🟡 Warning' : 'ℹ️ Info'}
                  </span>
                  <span className="issue-boiler">{issue.boiler}</span>
                  <span className="issue-metric">{issue.metric}</span>
                </div>
                <div className="issue-body">
                  <p className="issue-message">{issue.message}</p>
                  <div className="issue-details">
                    <span className="issue-value">Value: {issue.value}</span>
                    {issue.date && <span className="issue-date">Date: {issue.date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="validation-legend">
        <div className="legend-item">
          <span className="legend-icon">🔴</span>
          <span>Critical: Negative values, system errors</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🟡</span>
          <span>Warning: Anomalies, efficiency issues, unusual patterns</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">ℹ️</span>
          <span>Info: General notifications</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react'

interface CumulativeDailyDataProps {
  cumulativeData: {
    date: string
    steam: number
    water: number
    naturalGas: number
    electric: number
    wasteGas: number
  } | null
}

const CumulativeDailyData: React.FC<CumulativeDailyDataProps> = ({ cumulativeData }) => {
  if (!cumulativeData) {
    return (
      <div className="cumulative-section">
        <h3>📅 Cumulative Daily Production</h3>
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
          Loading daily cumulative data...
        </p>
      </div>
    )
  }

  return (
    <div className="cumulative-section">
      <h3>📅 Cumulative Daily Production - {cumulativeData.date}</h3>
      <div className="cumulative-grid">
        <div className="cumulative-card">
          <div className="cumulative-icon">💨</div>
          <div className="cumulative-content">
            <span className="cumulative-label">Total Steam Production</span>
            <span className="cumulative-value">{cumulativeData.steam.toFixed(2)}</span>
            <span className="cumulative-unit">MT</span>
          </div>
        </div>

        <div className="cumulative-card">
          <div className="cumulative-icon">💧</div>
          <div className="cumulative-content">
            <span className="cumulative-label">Total Feed Water</span>
            <span className="cumulative-value">{cumulativeData.water.toFixed(2)}</span>
            <span className="cumulative-unit">MT</span>
          </div>
        </div>

        <div className="cumulative-card">
          <div className="cumulative-icon">🔥</div>
          <div className="cumulative-content">
            <span className="cumulative-label">Total Natural Gas</span>
            <span className="cumulative-value">{cumulativeData.naturalGas.toLocaleString()}</span>
            <span className="cumulative-unit">SM³</span>
          </div>
        </div>

        <div className="cumulative-card">
          <div className="cumulative-icon">⚡</div>
          <div className="cumulative-content">
            <span className="cumulative-label">Total Electric</span>
            <span className="cumulative-value">{cumulativeData.electric.toFixed(2)}</span>
            <span className="cumulative-unit">MWh</span>
          </div>
        </div>

        <div className="cumulative-card">
          <div className="cumulative-icon">🌫️</div>
          <div className="cumulative-content">
            <span className="cumulative-label">Total Waste Gas</span>
            <span className="cumulative-value">{cumulativeData.wasteGas.toLocaleString()}</span>
            <span className="cumulative-unit">Nm³</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CumulativeDailyData

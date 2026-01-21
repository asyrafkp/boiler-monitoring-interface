import React from 'react'

interface BoilerData {
  id: number
  name: string
  steam: number
  ng: number
  ratio: number
  output: number
  water: number
  maxCapacity?: number
  status: 'normal' | 'warning' | 'critical' | 'offline'
}

interface BoilerCardProps {
  boiler: BoilerData
  onClick?: () => void
}

const BoilerCard: React.FC<BoilerCardProps> = ({ boiler, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offline':
        return '#6b7280'
      case 'critical':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      case 'normal':
      default:
        return '#10b981'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'offline':
        return '#f3f4f6'
      case 'critical':
        return '#fee2e2'
      case 'warning':
        return '#fef3c7'
      case 'normal':
      default:
        return '#ecfdf5'
    }
  }

  return (
    <div className="boiler-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-header" style={{ borderLeftColor: getStatusColor(boiler.status) }}>
        <h2>{boiler.name}</h2>
        <span 
          className="status-badge" 
          style={{ 
            backgroundColor: getStatusBgColor(boiler.status),
            color: getStatusColor(boiler.status)
          }}
        >
          {boiler.status.toUpperCase()}
        </span>
      </div>

      <div className="card-content">
        <div className="metric-group">
          <div className="metric">
            <div className="metric-label">Steam Production Flow Rate</div>
            <div className="metric-value" style={{ color: getStatusColor(boiler.status) }}>
              {boiler.steam.toFixed(2)}
              <span className="metric-unit">MT/h</span>
            </div>
          </div>

          <div className="metric">
            <div className="metric-label">Natural Gas Flow Rate</div>
            <div className="metric-value">
              {boiler.ng.toFixed(2)}
              <span className="metric-unit">SM³/h</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="metric-group">
          <div className="metric">
            <div className="metric-label">NG/Steam Ratio</div>
            <div className="metric-value">
              {boiler.ratio.toFixed(3)}
              <span className="metric-unit">—</span>
            </div>
          </div>

          <div className="metric">
            <div className="metric-label">Output</div>
            <div className="metric-value">
              {boiler.output.toFixed(1)}
              <span className="metric-unit">%</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="metric-group">
          <div className="metric">
            <div className="metric-label">Feed Water Flow Rate</div>
            <div className="metric-value">
              {boiler.water.toFixed(2)}
              <span className="metric-unit">MT/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoilerCard

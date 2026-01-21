import React from 'react'

interface BoilerData {
  id: number
  name: string
  steam: number
  ng: number
  ratio: number
  output: number
  water: number
  status: 'normal' | 'warning' | 'critical' | 'offline'
  maxCapacity?: number  // Optional max capacity field
}

interface StatusOverviewProps {
  boilers: BoilerData[]
}

const StatusOverview: React.FC<StatusOverviewProps> = ({ boilers }) => {
  const totalSteam = boilers.reduce((sum, b) => sum + b.steam, 0)
  const totalNG = boilers.reduce((sum, b) => sum + b.ng, 0)
  
  // Calculate total system output as percentage of total capacity
  const totalCapacity = boilers.reduce((sum, b) => sum + (b.maxCapacity || 18), 0)
  const totalOutput = totalCapacity > 0 ? (totalSteam / totalCapacity) * 100 : 0
  
  const criticalCount = boilers.filter(b => b.status === 'critical').length
  const warningCount = boilers.filter(b => b.status === 'warning').length

  return (
    <div className="status-overview">
      <div className="overview-card total-steam">
        <div className="overview-icon">🔥</div>
        <div className="overview-content">
          <span className="overview-label">Total Steam Production Rate</span>
          <span className="overview-value">{totalSteam.toFixed(2)}</span>
          <span className="overview-unit">MT/h</span>
        </div>
      </div>

      <div className="overview-card total-ng">
        <div className="overview-icon">⚙️</div>
        <div className="overview-content">
          <span className="overview-label">Total Natural Gas Flow Rate</span>
          <span className="overview-value">{totalNG.toFixed(2)}</span>
          <span className="overview-unit">SM³/h</span>
        </div>
      </div>

      <div className="overview-card avg-output">
        <div className="overview-icon">📊</div>
        <div className="overview-content">
          <span className="overview-label">Average Output</span>
          <span className="overview-value">{totalOutput.toFixed(1)}</span>
          <span className="overview-unit">%</span>
        </div>
      </div>

      <div className="overview-card system-health">
        <div className="overview-icon">❤️</div>
        <div className="overview-content">
          <span className="overview-label">System Health</span>
          <span className="overview-health-status">
            {criticalCount > 0 && <span className="health-critical">{criticalCount} Critical</span>}
            {warningCount > 0 && <span className="health-warning">{warningCount} Warning</span>}
            {criticalCount === 0 && warningCount === 0 && <span className="health-normal">All Normal</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatusOverview

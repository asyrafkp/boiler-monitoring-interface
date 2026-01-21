import React, { useState, useEffect } from 'react'
import './BoilerDetailModal.css'

interface DailyData {
  date: string
  steam: number
  water: number
  waterPerTonneSteam: number
  naturalGas: number
  ngPerTonneSteam: number
  electric: number
  wasteGas: number
}

interface BoilerDetailModalProps {
  boilerId: number
  boilerName: string
  onClose: () => void
}

const BoilerDetailModal: React.FC<BoilerDetailModalProps> = ({ boilerId, boilerName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily')
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoilerData()
  }, [boilerId])

  const fetchBoilerData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/boiler-monitoring-interface/boiler_${boilerId}_daily.json`)
      if (response.ok) {
        const data = await response.json()
        setDailyData(data.dailyData || [])
      }
    } catch (error) {
      console.error('Error fetching boiler data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{boilerName} - Detailed Report</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            📊 Daily Data
          </button>
          <button 
            className={`tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveTab('hourly')}
          >
            ⏱️ Hourly Data
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading data...</div>
          ) : activeTab === 'daily' ? (
            <div className="daily-data-section">
              <h3>Daily Production Summary</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Steam (MT)</th>
                      <th>Water (MT)</th>
                      <th>Water/Tonne</th>
                      <th>Natural Gas (sm³)</th>
                      <th>NG/Tonne</th>
                      <th>Electric (MWh)</th>
                      <th>Waste Gas (Nm³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.length > 0 ? (
                      dailyData.map((row, index) => (
                        <tr key={index}>
                          <td>{row.date}</td>
                          <td>{row.steam?.toFixed(0) || 0}</td>
                          <td>{row.water?.toFixed(0) || 0}</td>
                          <td>{row.waterPerTonneSteam?.toFixed(2) || 0}</td>
                          <td>{row.naturalGas?.toFixed(0) || 0}</td>
                          <td>{row.ngPerTonneSteam?.toFixed(2) || 0}</td>
                          <td>{row.electric?.toFixed(4) || 0}</td>
                          <td>{row.wasteGas?.toFixed(0) || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center' }}>No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {dailyData.length > 0 && (
                <div className="charts-section">
                  <div className="chart-card">
                    <h4>Steam Production Trend (MT) <span className="chart-max">Max: {Math.max(...dailyData.map(d => d.steam)).toFixed(0)} MT</span></h4>
                    <div className="simple-chart">
                      {dailyData.map((row, index) => {
                        const maxValue = Math.max(...dailyData.map(d => d.steam));
                        const percentage = (row.steam / maxValue) * 100;
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <span className="chart-value">{row.steam?.toFixed(0)}</span>
                            <div 
                              className="chart-bar steam-bar"
                              style={{ 
                                height: `${percentage}%`,
                                minHeight: '5px'
                              }}
                              title={`${row.date}: ${row.steam} MT`}
                            />
                            <span className="chart-label">{row.date.split('/')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h4>Water Usage Trend (MT) <span className="chart-max">Max: {Math.max(...dailyData.map(d => d.water)).toFixed(0)} MT</span></h4>
                    <div className="simple-chart">
                      {dailyData.map((row, index) => {
                        const maxValue = Math.max(...dailyData.map(d => d.water));
                        const percentage = (row.water / maxValue) * 100;
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <span className="chart-value">{row.water?.toFixed(0)}</span>
                            <div 
                              className="chart-bar water-bar"
                              style={{ 
                                height: `${percentage}%`,
                                minHeight: '5px'
                              }}
                              title={`${row.date}: ${row.water} MT`}
                            />
                            <span className="chart-label">{row.date.split('/')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h4>Natural Gas Usage Trend (sm³) <span className="chart-max">Max: {Math.max(...dailyData.map(d => d.naturalGas)).toLocaleString()} sm³</span></h4>
                    <div className="simple-chart">
                      {dailyData.map((row, index) => {
                        const maxValue = Math.max(...dailyData.map(d => d.naturalGas));
                        const percentage = (row.naturalGas / maxValue) * 100;
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <span className="chart-value">{(row.naturalGas / 1000).toFixed(1)}k</span>
                            <div 
                              className="chart-bar ng-bar"
                              style={{ 
                                height: `${percentage}%`,
                                minHeight: '5px'
                              }}
                              title={`${row.date}: ${row.naturalGas.toLocaleString()} sm³`}
                            />
                            <span className="chart-label">{row.date.split('/')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h4>NG/Tonne Steam Trend <span className="chart-max">Max: {Math.max(...dailyData.map(d => d.ngPerTonneSteam)).toFixed(2)}</span></h4>
                    <div className="simple-chart">
                      {dailyData.map((row, index) => {
                        const maxValue = Math.max(...dailyData.map(d => d.ngPerTonneSteam));
                        const percentage = (row.ngPerTonneSteam / maxValue) * 100;
                        return (
                          <div key={index} className="chart-bar-wrapper">
                            <span className="chart-value">{row.ngPerTonneSteam?.toFixed(1)}</span>
                            <div 
                              className="chart-bar ngtonne-bar"
                              style={{ 
                                height: `${percentage}%`,
                                minHeight: '5px'
                              }}
                              title={`${row.date}: ${row.ngPerTonneSteam.toFixed(2)}`}
                            />
                            <span className="chart-label">{row.date.split('/')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hourly-data-section">
              <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Hourly data will be available soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoilerDetailModal

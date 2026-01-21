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

interface HourlyData {
  time: string
  steam: number
  water: number
  electricT1: number
  electricT2: number
  electricTotal: number
  ngBurner1: number
  ngBurner2: number
  ngTotal: number
  wgBurner1: number
  wgBurner2: number
  wgTotal: number
  feedPumpTemp: number
  feedPumpPressure: number
  economiserTempIn: number
  economiserTempOut: number
  flueGasTempIn: number
  flueGasTempOut: number
  blowdownTime: number
}

interface HourlyDataByDate {
  [date: string]: HourlyData[]
}

interface BoilerDetailModalProps {
  boilerId: number
  boilerName: string
  onClose: () => void
}

const BoilerDetailModal: React.FC<BoilerDetailModalProps> = ({ boilerId, boilerName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily')
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyDataByDate>({})
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoilerData()
  }, [boilerId, activeTab])

  const fetchBoilerData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'daily') {
        const response = await fetch(`/boiler-monitoring-interface/boiler_${boilerId}_daily.json`)
        if (response.ok) {
          const data = await response.json()
          setDailyData(data.dailyData || [])
        }
      } else {
        const response = await fetch(`/boiler-monitoring-interface/boiler_${boilerId}_hourly.json`)
        if (response.ok) {
          const data = await response.json()
          setHourlyData(data.hourlyData || {})
          // Auto-expand latest date
          const dates = Object.keys(data.hourlyData || {})
          if (dates.length > 0) {
            const latestDate = dates[dates.length - 1]
            setExpandedDates(new Set([latestDate]))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching boiler data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
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
                      <th>Electric ({boilerId === 3 ? 'kWh' : 'MWh'})</th>
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
                          <td>{boilerId === 3 ? (row.electric?.toFixed(2) || 0) : (row.electric?.toFixed(4) || 0)}</td>
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
              <h3>Hourly Production Data</h3>
              {Object.keys(hourlyData).length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No hourly data available for Boiler No. {boilerId}
                </p>
              ) : (
                <div className="date-sections">
                  {Object.keys(hourlyData).sort((a, b) => {
                    // Sort dates in descending order (latest first)
                    const dateA = new Date(a)
                    const dateB = new Date(b)
                    return dateB.getTime() - dateA.getTime()
                  }).map((date, index) => (
                    <div key={date} className="date-section">
                      <button 
                        className={`date-header ${expandedDates.has(date) ? 'expanded' : ''}`}
                        onClick={() => toggleDate(date)}
                      >
                        <span className="date-title">{date} {index === 0 && '(Latest)'}</span>
                        <span className="date-count">({hourlyData[date].length} records)</span>
                        <span className="expand-icon">{expandedDates.has(date) ? '▼' : '►'}</span>
                      </button>
                      
                      {expandedDates.has(date) && (
                        <div className="hourly-table-container">
                          <table className="hourly-table">
                            <thead>
                              <tr>
                                <th>Time</th>
                                <th>Steam (MT)</th>
                                <th>Water (MT)</th>
                                <th>Electric T1 (MWh)</th>
                                <th>Electric T2 (MWh)</th>
                                <th>NG Burner 1 (sm³)</th>
                                <th>NG Burner 2 (sm³)</th>
                                <th>WG Burner 1 (Nm³)</th>
                                <th>WG Burner 2 (Nm³)</th>
                                <th>Feed Pump Temp (°C)</th>
                                <th>Feed Pump Pressure (Barg)</th>
                                <th>Economiser In (°C)</th>
                                <th>Economiser Out (°C)</th>
                                <th>Flue Gas In (°C)</th>
                                <th>Flue Gas Out (°C)</th>
                                <th>Blowdown Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {hourlyData[date].map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.time}</td>
                                  <td>{row.steam?.toFixed(0) || 0}</td>
                                  <td>{row.water?.toFixed(0) || 0}</td>
                                  <td>{row.electricT1?.toFixed(4) || 0}</td>
                                  <td>{row.electricT2?.toFixed(4) || 0}</td>
                                  <td>{row.ngBurner1?.toFixed(0) || 0}</td>
                                  <td>{row.ngBurner2?.toFixed(0) || 0}</td>
                                  <td>{row.wgBurner1?.toFixed(0) || 0}</td>
                                  <td>{row.wgBurner2?.toFixed(0) || 0}</td>
                                  <td>{row.feedPumpTemp > 0 ? row.feedPumpTemp.toFixed(1) : '-'}</td>
                                  <td>{row.feedPumpPressure > 0 ? row.feedPumpPressure.toFixed(0) : '-'}</td>
                                  <td>{row.economiserTempIn > 0 ? row.economiserTempIn.toFixed(1) : '-'}</td>
                                  <td>{row.economiserTempOut > 0 ? row.economiserTempOut.toFixed(1) : '-'}</td>
                                  <td>{row.flueGasTempIn > 0 ? row.flueGasTempIn.toFixed(1) : '-'}</td>
                                  <td>{row.flueGasTempOut > 0 ? row.flueGasTempOut.toFixed(1) : '-'}</td>
                                  <td>{row.blowdownTime > 0 ? row.blowdownTime.toFixed(0) : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoilerDetailModal

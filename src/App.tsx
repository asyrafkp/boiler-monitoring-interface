import React, { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import BoilerCard from './components/BoilerCard'
import StatusOverview from './components/StatusOverview'

interface BoilerData {
  id: number
  name: string
  steam: number
  ng: number
  ratio: number
  output: number
  water: number
  maxCapacity: number
  status: 'normal' | 'warning' | 'critical' | 'offline'
}

const App: React.FC = () => {
  const { user, logout } = useAuth()

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />
  }

  return <Dashboard user={user} logout={logout} />
}

interface DashboardProps {
  user: { username: string; userType: 'admin' | 'user' }
  logout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ user, logout }) => {
  const [boilers, setBoilers] = useState<BoilerData[]>([
    {
      id: 1,
      name: 'Boiler No. 1',
      steam: 0,
      ng: 0,
      ratio: 0,
      output: 0,
      water: 0,
      maxCapacity: 18,
      status: 'normal'
    },
    {
      id: 2,
      name: 'Boiler No. 2',
      steam: 0,
      ng: 0,
      ratio: 0,
      output: 0,
      water: 0,
      maxCapacity: 18,
      status: 'normal'
    },
    {
      id: 3,
      name: 'Boiler No. 3',
      steam: 0,
      ng: 0,
      ratio: 0,
      output: 0,
      water: 0,
      maxCapacity: 16,
      status: 'normal'
    }
  ])

  const [lastUpdate, setLastUpdate] = useState<string>('Loading...')
  const [nextUpdate, setNextUpdate] = useState<string>('--:--')
  const [latestDataTime, setLatestDataTime] = useState<string>('No data yet')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Format date for display
  const formatUpdateTime = () => {
    const now = new Date()
    setLastUpdate(now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }))

    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1)
    nextHour.setMinutes(0)
    nextHour.setSeconds(0)
    setNextUpdate(nextHour.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }))
  }

  // Helper function to determine status based on utilization
  const determineStatus = (steam: number, maxCapacity: number): 'normal' | 'warning' | 'critical' | 'offline' => {
    if (steam === 0) {
      return 'offline'
    }
    
    const utilization = (steam / maxCapacity) * 100
    
    if (utilization < 20) {
      return 'warning'  // Yellow: Below 20%
    } else if (utilization >= 20 && utilization <= 100) {
      return 'normal'   // Green: 20-100%
    } else {
      return 'warning'  // Yellow: Over 100% capacity
    }
  }

  // Fetch data from GitHub Pages JSON file
  const fetchBoilerData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('📊 Fetching boiler data from JSON...')
      
      // Fetch from GitHub Pages hosted JSON file
      const response = await fetch('/boiler-monitoring-interface/boiler_data.json')
      
      if (!response.ok) {
        throw new Error('Failed to fetch data file')
      }

      const data = await response.json()
      
      console.log('✅ Data fetched:', data)

      // Map JSON data to boiler state
      const mappedBoilers: BoilerData[] = data.boilers.map((boiler: any) => ({
        id: boiler.id,
        name: boiler.name,
        steam: boiler.steam,
        ng: boiler.ng,
        ratio: boiler.ratio,
        output: (boiler.steam / boiler.maxCapacity) * 100,
        water: boiler.water,
        maxCapacity: boiler.maxCapacity,
        status: determineStatus(boiler.steam, boiler.maxCapacity)
      }))

      setBoilers(mappedBoilers)
      formatUpdateTime()
      
      // Format latest data timestamp from JSON
      const dataDate = new Date(data.timestamp)
      const formattedDate = dataDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const formattedTime = dataDate.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      setLatestDataTime(`${formattedDate}, ${formattedTime}hrs`)
      
      console.log('✅ Boiler data displayed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch boiler data'
      setError(errorMessage)
      console.error('❌ Data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Setup clock updates
  useEffect(() => {
    formatUpdateTime()
    const clockInterval = setInterval(formatUpdateTime, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Initial data fetch and refresh every 30 seconds
  useEffect(() => {
    fetchBoilerData()

    const refreshInterval = setInterval(fetchBoilerData, 30000) // 30 seconds
    return () => clearInterval(refreshInterval)
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <h1>Boiler Operation Monitoring System</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {user.userType === 'user' && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  📊 View Only Mode
                </div>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                {user.userType === 'admin' ? '👨‍💼' : '👤'} {user.username}
              </div>
              <button
                onClick={logout}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>
            {error && <div className="header-error">⚠️ {error}</div>}
          </div>
          <div className="header-info">
            <span className="update-status">
              Last Update: <strong>{lastUpdate}</strong>
            </span>
            <span className="next-update">
              Next Update: <strong>{nextUpdate}</strong>
            </span>
            <span className="data-source">
              Source: <strong>📊 GitHub (Auto-updated)</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading && <div className="loading-indicator">📡 Loading boiler data...</div>}

        <StatusOverview boilers={boilers} />

        <section className="boilers-grid">
          {boilers.map((boiler) => (
            <BoilerCard key={boiler.id} boiler={boiler} />
          ))}
        </section>
      </main>

      <footer className="app-footer">
        <p>📊 Latest Data Available: <strong>{latestDataTime}</strong></p>
        <p className="footer-secondary">Data auto-synced from OneDrive hourly via GitHub Actions</p>
        <p className="footer-tech">Powered by React + GitHub Pages</p>
      </footer>
    </div>
  )
}

export default App

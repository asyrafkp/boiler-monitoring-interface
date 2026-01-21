import React, { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import BoilerCard from './components/BoilerCard'
import StatusOverview from './components/StatusOverview'
import { AdminPanel } from './components/AdminPanel'
import { AdminSettings } from './components/AdminSettings'
import { ONEDRIVE_CONFIG, getCurrentMonthFolderName } from './config/oneDriveConfig'
import { fetchBoilerDataFromOneDrive } from './services/oneDriveService_v2'
import { graphApiService } from './services/graphApiService'

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
  const currentMonth = getCurrentMonthFolderName()

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

  // Fetch data from OneDrive (using real Graph API)
  const fetchBoilerData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!graphApiService.isAuthenticated()) {
        // Show login button message
        throw new Error('Please authenticate with OneDrive to fetch real data. Click the "Sign in with OneDrive" button.')
      }

      console.log('Fetching real boiler data from OneDrive...')
      
      // Fetch real data from OneDrive
      const realData = await fetchBoilerDataFromOneDrive()

      // Map parsed data to boiler state
      const mappedBoilers: BoilerData[] = [
        {
          id: 1,
          name: 'Boiler No. 1',
          steam: realData.b1.steam,
          ng: realData.b1.ng,
          ratio: realData.b1.ratio,
          output: realData.b1.output,
          water: realData.b1Water,
          maxCapacity: 18,
          status: determineStatus(realData.b1.steam, 18)
        },
        {
          id: 2,
          name: 'Boiler No. 2',
          steam: realData.b2.steam,
          ng: realData.b2.ng,
          ratio: realData.b2.ratio,
          output: realData.b2.output,
          water: realData.b2Water,
          maxCapacity: 18,
          status: determineStatus(realData.b2.steam, 18)
        },
        {
          id: 3,
          name: 'Boiler No. 3',
          steam: realData.b3.steam,
          ng: realData.b3.ng,
          ratio: realData.b3.ratio,
          output: realData.b3.output,
          water: realData.b3Water,
          maxCapacity: 16,
          status: determineStatus(realData.b3.steam, 16)
        }
      ]

      setBoilers(mappedBoilers)
      formatUpdateTime()
      
      // Format latest data timestamp
      const dataDate = new Date()
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
      
      console.log('Real data fetched and displayed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch boiler data'
      setError(errorMessage)
      console.error('Data fetch error:', err)
      
      // Fallback to mock data if not authenticated
      if (errorMessage.includes('authenticate') || errorMessage.includes('Not authenticated')) {
        console.log('Using mock data until authentication...')
        // Keep existing state or use mock data
      }
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

  // Initial data fetch and hourly refresh
  useEffect(() => {
    fetchBoilerData()

    const refreshInterval = setInterval(fetchBoilerData, ONEDRIVE_CONFIG.refreshInterval)
    return () => clearInterval(refreshInterval)
  }, [currentMonth])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <h1>Boiler Operation Monitoring System</h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {user.userType === 'admin' && !graphApiService.isAuthenticated() && (
                <button 
                  onClick={() => window.location.href = graphApiService.getLoginUrl()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0060b0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Sign in with OneDrive
                </button>
              )}
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
              Source: <strong>{graphApiService.isAuthenticated() ? '📊 OneDrive (Live)' : '🔒 Sign in for live data'}</strong>
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading && <div className="loading-indicator">📡 Fetching data from OneDrive...</div>}

        <StatusOverview boilers={boilers} />

        <section className="boilers-grid">
          {boilers.map((boiler) => (
            <BoilerCard key={boiler.id} boiler={boiler} />
          ))}
        </section>
      </main>

      <footer className="app-footer">
        <p>📊 Latest Data Available: <strong>{latestDataTime}</strong></p>
        <p className="footer-secondary">Data updated hourly from OneDrive Excel files | Month: {currentMonth}</p>
        <p className="footer-tech">Powered by React + Microsoft OneDrive Integration</p>
      </footer>

      {user?.userType === 'admin' && (
        <>
          <div style={{position: 'fixed', top: '10px', left: '10px', backgroundColor: 'red', color: 'white', padding: '10px', zIndex: 9999}}>
            ADMIN MODE ACTIVE - TEST
          </div>
          <AdminPanel />
          <AdminSettings />
        </>
      )}
      
      <div style={{position: 'fixed', top: '10px', right: '10px', backgroundColor: '#333', color: '#0f0', padding: '10px', zIndex: 9999, fontFamily: 'monospace', fontSize: '12px', maxWidth: '300px'}}>
        <div>⚠️ DEBUG MODE ACTIVE</div>
        <div>user object: {JSON.stringify(user)}</div>
        <div>userType: {user?.userType}</div>
        <div>condition met: {user?.userType === 'admin' ? 'YES' : 'NO'}</div>
      </div>
    </div>
  )
}

export default App

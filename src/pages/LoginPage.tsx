import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'user'>('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (login(username, password, loginType)) {
      setUsername('')
      setPassword('')
    } else {
      setError('Invalid credentials. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Boiler Operation</h1>
          <p>Monitoring Interface</p>
        </div>

        <div className="login-type-selector">
          <button
            className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('admin')
              setError('')
            }}
          >
            👨‍💼 Admin
          </button>
          <button
            className={`login-type-btn ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('user')
              setError('')
            }}
          >
            👤 User
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin' : 'user'}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin123' : 'user123'}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-credentials">
          <h3>{loginType === 'admin' ? '👨‍💼 Admin Credentials' : '👤 User Credentials'}</h3>
          <p>
            <strong>Username:</strong> {loginType === 'admin' ? 'admin' : 'user'}
          </p>
          <p>
            <strong>Password:</strong> {loginType === 'admin' ? 'admin123' : 'user123'}
          </p>
          {loginType === 'admin' && (
            <p className="admin-note">✨ Admin can access OneDrive integration</p>
          )}
          {loginType === 'user' && (
            <p className="user-note">📊 User can view dashboard only</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage

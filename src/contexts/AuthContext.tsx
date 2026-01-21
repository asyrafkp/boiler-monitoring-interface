import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AuthUser {
  username: string
  userType: 'admin' | 'user'
  isAuthenticated: boolean
}

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string, userType: 'admin' | 'user') => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo credentials
const DEMO_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    userType: 'admin' as const,
  },
  user: {
    username: 'user',
    password: 'user123',
    userType: 'user' as const,
  },
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user')
    console.log('AuthContext useEffect running - savedUser:', savedUser)
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('Parsed user:', parsedUser)
        setUser(parsedUser)
      } catch (err) {
        console.error('Failed to parse stored auth user:', err)
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  const login = (username: string, password: string, userType: 'admin' | 'user'): boolean => {
    const credentials = DEMO_CREDENTIALS[userType]

    if (username === credentials.username && password === credentials.password) {
      const newUser: AuthUser = {
        username: credentials.username,
        userType: credentials.userType,
        isAuthenticated: true,
      }
      setUser(newUser)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

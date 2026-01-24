'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('desi_eatry_auth')
    if (stored) {
      setIsAuthenticated(true)
    }
  }, [])

  const login = (email: string, password: string) => {
    if (email === 'admin@demo.com' && password === 'password123') {
      localStorage.setItem('desi_eatry_auth', 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('desi_eatry_auth')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

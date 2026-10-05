import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const res = await authService.getProfile()
          if (res.data?.success) {
            setUser(res.data.data)
            localStorage.setItem('user', JSON.stringify(res.data.data))
          }
        } catch (err) {
          console.error('Failed to restore session:', err)
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const res = await authService.login({ email, password })
    if (res.data?.success) {
      const { user: userData, tokens } = res.data.data
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    return { success: false, message: res.data?.message || 'Login failed' }
  }

  const register = async (formData) => {
    const res = await authService.register(formData)
    if (res.data?.success) {
      const { user: userData, tokens } = res.data.data
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    return { success: false, message: res.data?.message || 'Registration failed', errors: res.data?.errors }
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        await authService.logout({ refresh })
      }
    } catch (e) {
      // Ignore logout API failures
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfileState,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'CUSTOMER',
        isAdvisor: user?.role === 'FINANCIAL_ADVISOR' || user?.role === 'ADMINISTRATOR',
        isAdmin: user?.role === 'ADMINISTRATOR',
      }}
    >
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

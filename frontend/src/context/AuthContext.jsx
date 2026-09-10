import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../services/api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await getCurrentUser()

      if (response.success) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    checkAuthentication,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
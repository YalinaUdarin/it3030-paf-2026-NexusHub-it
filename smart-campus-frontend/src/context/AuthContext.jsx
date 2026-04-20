import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchUser()
    else setLoading(false)
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await authApi.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = (token) => {
    localStorage.setItem('token', token)
    fetchUser()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = () => user?.roles?.includes('ADMIN')
  const isTechnician = () => user?.roles?.includes('TECHNICIAN')
  const hasRole = (role) => user?.roles?.includes(role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isTechnician, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

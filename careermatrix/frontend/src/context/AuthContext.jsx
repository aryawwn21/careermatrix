import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API = axios.create({ baseURL: '/api' })

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('cm_token')
    if (!token) { setLoading(false); return }
    try {
      const res = await API.get('/auth/me')
      if (res.data.success) setUser(res.data.user)
    } catch {
      localStorage.removeItem('cm_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const signup = async (name, email, password, phone) => {
    const res = await API.post('/auth/signup', { name, email, password, phone })
    if (res.data.success) {
      localStorage.setItem('cm_token', res.data.token)
      setUser(res.data.user)
    }
    return res.data
  }

  const signin = async (email, password) => {
    const res = await API.post('/auth/signin', { email, password })
    if (res.data.success) {
      localStorage.setItem('cm_token', res.data.token)
      setUser(res.data.user)
    }
    return res.data
  }

  const signout = () => {
    localStorage.removeItem('cm_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, signin, signout, API, showToast, toast }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : '·'}&nbsp; {toast.message}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { API }

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'signin')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { signup, signin, showToast } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setErrors({}) }, [mode])

  const validate = () => {
    const e = {}
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[\w.-]+@[\w.-]+\.\w+$/)) e.email = 'Enter a valid email address'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (mode === 'signup' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) { setErrors(v); return }
    setLoading(true)
    setErrors({})
    try {
      let res
      if (mode === 'signup') {
        res = await signup(form.name, form.email, form.password, form.phone)
      } else {
        res = await signin(form.email, form.password)
      }
      if (res.success) {
        showToast(mode === 'signup' ? 'Account created successfully' : 'Welcome back', 'success')
        navigate('/dashboard')
      } else {
        setErrors({ server: res.message })
      }
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          Career<span>Matrix</span>
        </div>
        <div className="auth-tagline">
          <h2>Verified career matching,<br />built for serious candidates.</h2>
          <p>No placement fees. No scam listings. Just intelligent matching between your skills and companies that want them.</p>
        </div>
        <div className="auth-points">
          {['Resume parsed in seconds', 'Real company salary data', 'Direct application tracking', 'Email confirmation on every apply'].map(p => (
            <div key={p} className="auth-point">
              <span className="auth-check">✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => setMode('signin')}
            >Sign In</button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >Create Account</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  type="text"
                  placeholder="Aryan Sharma"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer'
                  }}
                >{showPass ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
              </div>
            )}

            {errors.server && (
              <div className="server-error">{errors.server}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'signin' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 14 }}
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            By continuing you agree that CareerMatrix may contact companies on your behalf. We never charge placement fees.
          </p>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [appsRes, profileRes] = await Promise.all([
          API.get('/recommendations/applications'),
          API.get('/auth/me'),
        ])
        setApps(appsRes.data.applications || [])
        setProfile(profileRes.data.user)
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  const hasProfile = profile?.skills && JSON.parse(typeof profile.skills === 'string' ? profile.skills : '[]').length > 0

  const getHour = () => new Date().getHours()
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 18 ? 'Good afternoon' : 'Good evening'

  const recent = apps.slice(0, 5)

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <p className="dash-greeting">{greeting}</p>
          <h1 className="dash-title">{user?.name?.split(' ')[0] || 'Welcome'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={() => navigate('/onboarding')}>
            Update Profile
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/companies')}>
            View Matches
          </button>
        </div>
      </div>

      {!hasProfile && !loading && (
        <div className="setup-banner">
          <div>
            <h3>Complete your profile to get matched</h3>
            <p>Upload your CV and set your preferences to start discovering companies tailored to your skills.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
            Set Up Profile →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-num">{apps.length}</div>
          <div className="stat-card-label">Applications Submitted</div>
          <div className="stat-card-sub">Total via CareerMatrix</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">
            {profile?.skills
              ? JSON.parse(typeof profile.skills === 'string' ? profile.skills : '[]').length
              : 0}
          </div>
          <div className="stat-card-label">Skills Indexed</div>
          <div className="stat-card-sub">Driving your matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ textTransform: 'capitalize' }}>
            {profile?.preferred_role?.replace('-', ' ') || '—'}
          </div>
          <div className="stat-card-label">Preference</div>
          <div className="stat-card-sub">Current search mode</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ fontSize: 14, letterSpacing: 0 }}>
            {profile?.preferred_location || 'Global'}
          </div>
          <div className="stat-card-label">Location</div>
          <div className="stat-card-sub">Target market</div>
        </div>
      </div>

      {/* Profile Summary */}
      {hasProfile && (
        <div className="dash-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="dash-section-title">Your Skills</h2>
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/onboarding')}>
              Edit
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {JSON.parse(typeof profile.skills === 'string' ? profile.skills : '[]').map(s => (
              <span key={s} className="tag active">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="dash-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="dash-section-title">Recent Applications</h2>
          {apps.length > 0 && (
            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/applications')}>
              View All →
            </button>
          )}
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8 }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <p>No applications yet.</p>
            <p>Explore matched companies and apply directly from CareerMatrix.</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/companies')}>
              Find Companies →
            </button>
          </div>
        ) : (
          <div className="app-list">
            {recent.map(app => (
              <div key={app.id} className="app-row">
                <div>
                  <div className="app-company">{app.company_name}</div>
                  <div className="app-title">{app.job_title || 'Position'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge badge-green">Applied</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <h2 className="dash-section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div className="quick-actions">
          <button className="quick-action" onClick={() => navigate('/onboarding')}>
            <div className="qa-icon">⊞</div>
            <div>
              <div className="qa-title">Update Resume</div>
              <div className="qa-sub">Re-parse or upload new CV</div>
            </div>
          </button>
          <button className="quick-action" onClick={() => navigate('/companies')}>
            <div className="qa-icon">⊙</div>
            <div>
              <div className="qa-title">Browse Companies</div>
              <div className="qa-sub">View all your matches</div>
            </div>
          </button>
          <button className="quick-action" onClick={() => navigate('/applications')}>
            <div className="qa-icon">⊟</div>
            <div>
              <div className="qa-title">Track Applications</div>
              <div className="qa-sub">See all submission statuses</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import './CompaniesPage.css'

const ROLE_LABELS = { 'full-time': 'Full Time', 'part-time': 'Part Time', internship: 'Internship' }

export default function CompaniesPage() {
  const { user, showToast } = useAuth()
  const navigate = useNavigate()

  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [profile, setProfile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState({ remote: 'any', minMatch: 0 })
  const [sortBy, setSortBy] = useState('match')

  // Load saved profile
  useEffect(() => {
    API.get('/auth/me').then(res => {
      const u = res.data.user
      setProfile(u)
      // Auto-search if profile is set
      const skills = typeof u.skills === 'string' ? JSON.parse(u.skills || '[]') : u.skills || []
      if (skills.length > 0) runSearch(u)
    }).catch(() => {})
  }, [])

  const runSearch = async (p = profile) => {
    if (!p) return
    const skills = typeof p.skills === 'string' ? JSON.parse(p.skills || '[]') : p.skills || []
    const interests = typeof p.interests === 'string' ? JSON.parse(p.interests || '[]') : p.interests || []

    if (skills.length === 0) {
      showToast('Add skills in your profile first', 'error')
      navigate('/onboarding')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await API.post('/recommendations/match', {
        skills,
        interests,
        roleType: p.preferred_role || 'full-time',
        duration: p.preferred_duration,
        location: p.preferred_location || 'India',
        salaryMin: p.salary_expectation,
        remotePreference: p.remote_preference || 'any',
      })
      if (res.data.success) {
        setCompanies(res.data.companies || [])
        if (res.data.companies?.length === 0) {
          showToast('No matches found. Try updating your skills or location.', 'info')
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Search failed. Check your API keys.', 'error')
    }
    setLoading(false)
  }

  const filtered = companies
    .filter(c => {
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filter.remote !== 'any' && !c.remotePolicy?.toLowerCase().includes(filter.remote)) return false
      if (c.matchScore < filter.minMatch) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'wlb') return b.workLifeScore - a.workLifeScore
      return 0
    })

  const skills = profile ? (typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : profile.skills || []) : []
  const roleLabel = profile ? ROLE_LABELS[profile.preferred_role] || 'Full Time' : ''

  return (
    <div className="companies-page">
      {/* Header */}
      <div className="companies-header">
        <div>
          <div className="section-label">Matched Companies</div>
          <h1 className="companies-title">Your Career Matches</h1>
          {profile && (
            <p className="companies-sub">
              {roleLabel} · {profile.preferred_location || 'Global'} ·&nbsp;
              {skills.slice(0, 3).join(', ')}{skills.length > 3 ? ` +${skills.length - 3} more` : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/onboarding')}>
            Edit Profile
          </button>
          <button className="btn btn-primary" onClick={() => runSearch()} disabled={loading}>
            {loading ? <><div className="spinner" /> Searching…</> : '↻ Refresh Matches'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="form-input"
          style={{ maxWidth: 260 }}
          placeholder="Filter by company name…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className="form-select" style={{ maxWidth: 180 }} value={filter.remote} onChange={e => setFilter(f => ({ ...f, remote: e.target.value }))}>
          <option value="any">Any Remote Policy</option>
          <option value="remote">Remote-Friendly</option>
          <option value="onsite">On-site</option>
        </select>
        <select className="form-select" style={{ maxWidth: 180 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="match">Sort: Best Match</option>
          <option value="wlb">Sort: Work-Life Balance</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loading && searched && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {filtered.length} compan{filtered.length !== 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <p>Scanning live job listings for your profile…</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>This may take 10–20 seconds</p>
        </div>
      ) : !searched ? (
        <div className="empty-search">
          <h3>Ready to find your matches</h3>
          <p>Your profile is loaded. Click "Refresh Matches" to search live job listings.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => runSearch()}>
            Find My Matches
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-search">
          <h3>No results</h3>
          <p>Try clearing filters or refreshing with a broader skill set.</p>
          <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => { setSearchQuery(''); setFilter({ remote: 'any', minMatch: 0 }) }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="company-grid">
          {filtered.map((company, idx) => (
            <CompanyCard key={`${company.name}-${idx}`} company={company} onView={() => navigate(`/company/${encodeURIComponent(company.name)}`, { state: { company } })} />
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company, onView }) {
  const avgSalary = company.jobs?.find(j => j.salary?.min || j.salary?.max)?.salary
  const openRoles = company.jobs?.length || 0

  const wlbColor = company.workLifeScore >= 4 ? 'var(--green)' : company.workLifeScore >= 3 ? 'var(--gold)' : 'var(--red)'

  return (
    <div className="company-card" onClick={onView}>
      <div className="cc-top">
        <div className="cc-info">
          <h3 className="cc-name">{company.name}</h3>
          <p className="cc-location">
            <span className="loc-dot">◎</span> {company.location || 'Global'}
          </p>
          <p className="cc-size">{company.companySize}</p>
        </div>
        <div className="match-score">
          {company.matchScore}
          <span>match</span>
        </div>
      </div>

      <div className="cc-badges">
        <span className={`badge ${company.remotePolicy?.includes('Remote') ? 'badge-green' : 'badge-muted'}`}>
          {company.remotePolicy || 'On-site'}
        </span>
        {openRoles > 0 && (
          <span className="badge badge-blue">{openRoles} open role{openRoles !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="cc-metrics">
        <div className="cc-metric">
          <div className="cc-metric-label">Avg Salary</div>
          <div className="cc-metric-val">
            {avgSalary?.min ? (
              avgSalary.currency === 'INR'
                ? `₹${(avgSalary.min / 100000).toFixed(1)}L – ₹${(avgSalary.max / 100000).toFixed(1)}L`
                : `$${Math.round(avgSalary.min / 1000)}k – $${Math.round(avgSalary.max / 1000)}k`
            ) : 'Not disclosed'}
          </div>
        </div>
        <div className="cc-metric">
          <div className="cc-metric-label">Work-Life Balance</div>
          <div className="cc-metric-val" style={{ color: wlbColor }}>
            {'★'.repeat(Math.round(company.workLifeScore))}{'☆'.repeat(5 - Math.round(company.workLifeScore))}
            &nbsp;{company.workLifeScore?.toFixed(1)}
          </div>
        </div>
      </div>

      {company.jobs?.[0] && (
        <div className="cc-top-role">
          <span className="cc-role-label">Top Role</span>
          <span className="cc-role-title">{company.jobs[0].title}</span>
        </div>
      )}

      <div className="cc-footer">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(company.benefits || []).slice(0, 3).map(b => (
            <span key={b} className="tag" style={{ fontSize: 11, padding: '2px 8px' }}>{b}</span>
          ))}
        </div>
        <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 16px' }} onClick={e => { e.stopPropagation(); onView() }}>
          View Details →
        </button>
      </div>
    </div>
  )
}

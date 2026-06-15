import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'
import { API } from '../context/AuthContext'
import './ApplicationsPage.css'

const STATUS_COLORS = {
  applied: '#c8a96e',
  pending: '#3b82f6',
  accepted: '#22c55e',
  rejected: '#ef4444',
}

const STATUS_LABELS = {
  applied: 'Submitted',
  pending: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Not Progressed',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/recommendations/applications')
      .then(res => { setApps(res.data.applications || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build chart data
  const byStatus = Object.keys(STATUS_COLORS).map(s => ({
    name: STATUS_LABELS[s],
    value: apps.filter(a => a.status === s).length,
    color: STATUS_COLORS[s],
  })).filter(d => d.value > 0)

  // Applications by week (last 6 weeks)
  const byWeek = (() => {
    const weeks = {}
    apps.forEach(app => {
      const d = new Date(app.applied_at)
      const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`
      weeks[week] = (weeks[week] || 0) + 1
    })
    return Object.entries(weeks).slice(-6).map(([week, count]) => ({ week, count }))
  })()

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  return (
    <div className="applications-page">
      <div className="apps-header">
        <div>
          <div className="section-label">Application History</div>
          <h1 className="apps-title">Your Applications</h1>
          <p className="apps-sub">{apps.length} total application{apps.length !== 1 ? 's' : ''} via CareerMatrix</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/companies')}>
          Find More Companies →
        </button>
      </div>

      {/* Stats Row */}
      <div className="apps-stats">
        {Object.keys(STATUS_COLORS).map(s => (
          <div key={s} className="apps-stat" style={{ borderLeft: `3px solid ${STATUS_COLORS[s]}` }}>
            <div className="apps-stat-num" style={{ color: STATUS_COLORS[s] }}>
              {apps.filter(a => a.status === s).length}
            </div>
            <div className="apps-stat-label">{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {apps.length > 0 && (
        <div className="apps-charts">
          {byWeek.length > 1 && (
            <div className="chart-card">
              <div className="chart-title">Applications Over Time</div>
              <div className="chart-subtitle">Weekly submission count</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byWeek} margin={{ top: 8, right: 16, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                  <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Applications" fill="#c8a96e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {byStatus.length > 1 && (
            <div className="chart-card">
              <div className="chart-title">Status Breakdown</div>
              <div className="chart-subtitle">Distribution by current status</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="apps-filter-row">
        {[
          { key: 'all', label: 'All' },
          { key: 'applied', label: 'Submitted' },
          { key: 'pending', label: 'Under Review' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'rejected', label: 'Not Progressed' },
        ].map(f => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="filter-count">
              {f.key === 'all' ? apps.length : apps.filter(a => a.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="apps-empty">
          {apps.length === 0 ? (
            <>
              <h3>No applications yet</h3>
              <p>When you apply to companies through CareerMatrix, every submission is tracked here.</p>
              <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => navigate('/companies')}>
                Explore Companies →
              </button>
            </>
          ) : (
            <>
              <h3>No {STATUS_LABELS[filter]?.toLowerCase()} applications</h3>
              <button className="btn btn-ghost" onClick={() => setFilter('all')}>Show all</button>
            </>
          )}
        </div>
      ) : (
        <div className="apps-table-wrap">
          <table className="apps-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td>
                    <span className="app-company-name">{app.company_name}</span>
                  </td>
                  <td>
                    <span className="app-position">{app.job_title || 'Position'}</span>
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        color: STATUS_COLORS[app.status],
                        background: STATUS_COLORS[app.status] + '18',
                        borderColor: STATUS_COLORS[app.status] + '44',
                      }}
                    >
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </td>
                  <td>
                    <span className="app-date">
                      {new Date(app.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    {app.apply_url && (
                      <a
                        href={app.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: '5px 12px' }}
                      >
                        View Listing ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Note */}
      {apps.length > 0 && (
        <div className="apps-notice">
          CareerMatrix submits applications on your behalf to the company's official recruitment channel. All listings are verified. If a company requests a placement fee, report it immediately.
        </div>
      )}
    </div>
  )
}

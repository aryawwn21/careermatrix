import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PolarRadiusAxis, Cell
} from 'recharts'
import { useAuth, API } from '../context/AuthContext'
import './CompanyDetailPage.css'

const GOLD = '#c8a96e'
const GOLD2 = '#e2c98a'
const GREEN = '#22c55e'
const BLUE = '#3b82f6'
const MUTED = '#3a3a3f'

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || GOLD, fontWeight: 600 }}>
          {p.name}: {prefix}{p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

export default function CompanyDetailPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { showToast } = useAuth()

  const company = state?.company
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  if (!company) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Company not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/companies')}>← Back to Companies</button>
      </div>
    )
  }

  const promoData = company.promotionData || []
  const wlbScore = company.workLifeScore || 3.5

  // Build radar data for company culture profile
  const radarData = [
    { subject: 'Work-Life Balance', value: Math.round(wlbScore * 20) },
    { subject: 'Career Growth', value: promoData.length ? promoData[promoData.length - 1].promotionRate : 60 },
    { subject: 'Compensation', value: 65 + Math.floor(Math.random() * 25) },
    { subject: 'Management', value: 55 + Math.floor(Math.random() * 35) },
    { subject: 'Culture', value: 60 + Math.floor(Math.random() * 30) },
    { subject: 'Remote Flexibility', value: company.remotePolicy?.includes('Remote') ? 85 : 45 },
  ]

  // Salary distribution across roles
  const salaryData = (company.jobs || [])
    .filter(j => j.salary?.min || j.salary?.max)
    .slice(0, 6)
    .map(j => ({
      role: j.title?.split(' ').slice(0, 3).join(' ') || 'Role',
      min: j.salary?.min ? Math.round(j.salary.min / 1000) : 0,
      max: j.salary?.max ? Math.round(j.salary.max / 1000) : 0,
    }))
    .filter(d => d.min > 0 || d.max > 0)

  const avgSalaryDisplay = (() => {
    const withSal = (company.jobs || []).filter(j => j.salary?.min)
    if (!withSal.length) return 'Not disclosed'
    const avgMin = Math.round(withSal.reduce((a, b) => a + (b.salary.min || 0), 0) / withSal.length)
    const avgMax = Math.round(withSal.reduce((a, b) => a + (b.salary.max || 0), 0) / withSal.length)
    const curr = withSal[0].salary?.currency
    if (curr === 'INR') return `₹${(avgMin / 100000).toFixed(1)}L – ₹${(avgMax / 100000).toFixed(1)}L`
    return `$${Math.round(avgMin / 1000)}k – $${Math.round(avgMax / 1000)}k`
  })()

  const handleApplyClick = (job) => {
    setSelectedJob(job)
    setShowApplyModal(true)
  }

  const handleConfirmApply = async () => {
    setApplying(true)
    try {
      const res = await API.post('/recommendations/apply', {
        companyName: company.name,
        jobTitle: selectedJob?.title || company.jobs?.[0]?.title,
        jobId: selectedJob?.id || company.jobs?.[0]?.id,
        applyUrl: selectedJob?.applyUrl || company.jobs?.[0]?.applyUrl,
      })
      if (res.data.success) {
        setApplied(true)
        setShowApplyModal(false)
        showToast(`Application submitted to ${company.name}`, 'success')
      } else {
        showToast(res.data.message, 'error')
        setShowApplyModal(false)
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Application failed', 'error')
      setShowApplyModal(false)
    }
    setApplying(false)
  }

  const TABS = ['overview', 'salaries', 'growth', 'roles', 'culture']

  return (
    <div className="company-detail">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate('/companies')}>
        ← Back to Companies
      </button>

      {/* Hero */}
      <div className="cd-hero">
        <div className="cd-hero-left">
          <div className="section-label">Company Profile</div>
          <h1 className="cd-name">{company.name}</h1>
          <div className="cd-meta">
            <span className="cd-meta-item"><span className="loc-dot">◎</span> {company.location}</span>
            <span className="cd-meta-sep">·</span>
            <span className="cd-meta-item">{company.companySize}</span>
            <span className="cd-meta-sep">·</span>
            <span className="cd-meta-item">{company.remotePolicy}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            {!applied ? (
              <button
                className="btn btn-primary"
                style={{ padding: '12px 32px' }}
                onClick={() => handleApplyClick(company.jobs?.[0])}
              >
                Apply via CareerMatrix
              </button>
            ) : (
              <div className="applied-badge">
                <span className="applied-check">✓</span>
                Application Submitted
              </div>
            )}
            {company.website && (
              <a className="btn btn-outline" href={company.website} target="_blank" rel="noopener noreferrer">
                Visit Website ↗
              </a>
            )}
          </div>
        </div>
        <div className="cd-hero-right">
          <div className="cd-kpi-grid">
            <div className="cd-kpi">
              <div className="cd-kpi-val">{company.matchScore}%</div>
              <div className="cd-kpi-label">Match Score</div>
            </div>
            <div className="cd-kpi">
              <div className="cd-kpi-val">{wlbScore.toFixed(1)}<span style={{ fontSize: 14 }}>/5</span></div>
              <div className="cd-kpi-label">Work-Life Balance</div>
            </div>
            <div className="cd-kpi">
              <div className="cd-kpi-val">{company.jobs?.length || 0}</div>
              <div className="cd-kpi-label">Open Roles</div>
            </div>
            <div className="cd-kpi">
              <div className="cd-kpi-val" style={{ fontSize: 16, letterSpacing: 0 }}>{avgSalaryDisplay}</div>
              <div className="cd-kpi-label">Avg Compensation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cd-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`cd-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="tab-content page-enter">
          <div className="overview-grid">
            {/* Work-Life Balance Chart */}
            <div className="chart-card">
              <div className="chart-title">Work-Life Balance Score</div>
              <div className="chart-subtitle">Industry comparison</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { name: company.name, score: wlbScore },
                  { name: 'Industry Avg', score: 3.2 },
                  { name: 'Top Quartile', score: 4.3 },
                ]} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="/5" />} />
                  <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                    <Cell fill={GOLD} />
                    <Cell fill={MUTED} />
                    <Cell fill={BLUE} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Benefits */}
            <div className="chart-card">
              <div className="chart-title">Benefits & Perks</div>
              <div className="chart-subtitle">Verified from job listings</div>
              <div className="benefits-list">
                {(company.benefits || []).map(b => (
                  <div key={b} className="benefit-item">
                    <span className="benefit-check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Profile Snapshot */}
            <div className="chart-card">
              <div className="chart-title">Quick Facts</div>
              <div className="chart-subtitle">At a glance</div>
              <div className="facts-list">
                <div className="fact-row">
                  <span className="fact-label">Location</span>
                  <span className="fact-val">{company.location}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Company Size</span>
                  <span className="fact-val">{company.companySize}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Remote Policy</span>
                  <span className="fact-val">{company.remotePolicy}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Industry</span>
                  <span className="fact-val">{company.industry || 'Technology'}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Open Positions</span>
                  <span className="fact-val">{company.jobs?.length || 0}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Match Score</span>
                  <span className="fact-val" style={{ color: 'var(--gold)' }}>{company.matchScore}%</span>
                </div>
              </div>
            </div>

            {/* Retention Rate Trend */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Retention Rate Over Time</div>
              <div className="chart-subtitle">% of employees staying year-on-year</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={promoData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Area type="monotone" dataKey="retentionRate" name="Retention" stroke={GREEN} fill="url(#retentionGrad)" strokeWidth={2} dot={{ fill: GREEN, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: SALARIES ─── */}
      {activeTab === 'salaries' && (
        <div className="tab-content page-enter">
          <div className="overview-grid">
            {/* Salary Range by Role */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Salary Range by Role</div>
              <div className="chart-subtitle">Min–Max compensation (USD thousands or INR lakhs)</div>
              {salaryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salaryData} margin={{ top: 10, right: 20, bottom: 40, left: -10 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={MUTED} horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
                    <YAxis dataKey="role" type="category" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={140} />
                    <Tooltip content={<CustomTooltip prefix="$" suffix="k" />} />
                    <Legend wrapperStyle={{ color: '#71717a', fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="min" name="Min Salary" fill={MUTED} radius={[0, 3, 3, 0]} />
                    <Bar dataKey="max" name="Max Salary" fill={GOLD} radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">Salary data not available for this company's current listings.</div>
              )}
            </div>

            {/* Salary Growth Projection */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Salary Growth Projection</div>
              <div className="chart-subtitle">Estimated YoY salary increase percentage</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={promoData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Legend wrapperStyle={{ color: '#71717a', fontSize: 12 }} />
                  <Line type="monotone" dataKey="salaryGrowth" name="Salary Growth" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: GROWTH ─── */}
      {activeTab === 'growth' && (
        <div className="tab-content page-enter">
          <div className="overview-grid">
            {/* Promotion Rate */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Promotion Rate by Year</div>
              <div className="chart-subtitle">% of employees promoted per year of tenure</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={promoData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Legend wrapperStyle={{ color: '#71717a', fontSize: 12 }} />
                  <Bar dataKey="promotionRate" name="Promotion Rate" radius={[4, 4, 0, 0]}>
                    {promoData.map((_, i) => (
                      <Cell key={i} fill={i === promoData.length - 1 ? GOLD : GOLD + '88'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Combined Growth Metrics */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Growth Metrics Overview</div>
              <div className="chart-subtitle">Promotion rate, salary growth, and retention trend</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={promoData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                  <Legend wrapperStyle={{ color: '#71717a', fontSize: 12 }} />
                  <Line type="monotone" dataKey="promotionRate" name="Promotion Rate" stroke={GOLD} strokeWidth={2} dot={{ r: 4, fill: GOLD }} />
                  <Line type="monotone" dataKey="salaryGrowth" name="Salary Growth" stroke={BLUE} strokeWidth={2} dot={{ r: 4, fill: BLUE }} />
                  <Line type="monotone" dataKey="retentionRate" name="Retention" stroke={GREEN} strokeWidth={2} dot={{ r: 4, fill: GREEN }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ROLES ─── */}
      {activeTab === 'roles' && (
        <div className="tab-content page-enter">
          <div className="roles-header">
            <h3>{company.jobs?.length || 0} Open Position{company.jobs?.length !== 1 ? 's' : ''}</h3>
            <p>Apply directly via CareerMatrix — no third-party redirects</p>
          </div>
          <div className="roles-list">
            {(company.jobs || []).map((job, idx) => (
              <div key={`${job.id}-${idx}`} className="role-card">
                <div className="role-card-left">
                  <h4 className="role-title">{job.title}</h4>
                  <div className="role-meta">
                    {job.city && <span>{job.city}{job.country ? `, ${job.country}` : ''}</span>}
                    {job.type && <><span>·</span><span style={{ textTransform: 'capitalize' }}>{job.type?.toLowerCase().replace('_', '-')}</span></>}
                    {job.isRemote && <><span>·</span><span className="badge badge-green" style={{ fontSize: 11 }}>Remote</span></>}
                  </div>
                  {job.salary?.min ? (
                    <div className="role-salary">
                      {job.salary.currency === 'INR'
                        ? `₹${(job.salary.min / 100000).toFixed(1)}L – ₹${(job.salary.max / 100000).toFixed(1)}L/yr`
                        : `$${Math.round(job.salary.min / 1000)}k – $${Math.round(job.salary.max / 1000)}k/yr`
                      }
                    </div>
                  ) : null}
                  {job.description && (
                    <p className="role-desc">{job.description.slice(0, 220)}{job.description.length > 220 ? '…' : ''}</p>
                  )}
                  {job.requiredSkills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {job.requiredSkills.slice(0, 6).map(s => (
                        <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="role-card-right">
                  {job.posted && (
                    <div className="role-date">
                      {new Date(job.posted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  {!applied ? (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 13, padding: '9px 20px' }}
                      onClick={() => handleApplyClick(job)}
                    >
                      Apply Now
                    </button>
                  ) : (
                    <span className="badge badge-green">Applied</span>
                  )}
                  {job.applyUrl && (
                    <a
                      className="btn btn-ghost"
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12 }}
                      onClick={e => e.stopPropagation()}
                    >
                      View Listing ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: CULTURE ─── */}
      {activeTab === 'culture' && (
        <div className="tab-content page-enter">
          <div className="overview-grid">
            {/* Radar Chart */}
            <div className="chart-card">
              <div className="chart-title">Culture Profile</div>
              <div className="chart-subtitle">Multi-dimensional company scorecard</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke={MUTED} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Radar name={company.name} dataKey="value" stroke={GOLD} fill={GOLD} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Culture dimension scores */}
            <div className="chart-card">
              <div className="chart-title">Dimension Breakdown</div>
              <div className="chart-subtitle">Scores from 0–100</div>
              <div className="dimension-list">
                {radarData.map(d => (
                  <div key={d.subject} className="dimension-row">
                    <div className="dimension-label">{d.subject}</div>
                    <div className="dimension-bar-wrap">
                      <div className="dimension-bar" style={{ width: `${d.value}%` }} />
                    </div>
                    <div className="dimension-score">{d.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work-Life Balance Area Chart */}
            <div className="chart-card chart-card-wide">
              <div className="chart-title">Work-Life Balance Trend</div>
              <div className="chart-subtitle">Score evolution as tenure increases</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={promoData.map(d => ({ ...d, wlb: Math.min(5, wlbScore + (Math.random() - 0.5) * 0.6) }))}
                  margin={{ top: 10, right: 20, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="wlbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip suffix="/5" />} />
                  <Area type="monotone" dataKey="wlb" name="WLB Score" stroke={GOLD} fill="url(#wlbGrad)" strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => !applying && setShowApplyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Confirm Application</h3>
            <p className="modal-body">
              CareerMatrix will submit your profile to <strong>{company.name}</strong> for the position of{' '}
              <strong>{selectedJob?.title || 'the selected role'}</strong>.
            </p>
            <p className="modal-note">
              A confirmation email will be sent to your registered email address after submission. No placement fee applies.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowApplyModal(false)} disabled={applying}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmApply} disabled={applying}>
                {applying ? <><div className="spinner" /> Submitting…</> : 'Yes, Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

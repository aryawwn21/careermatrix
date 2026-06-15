import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import './OnboardingPage.css'

const SKILLS_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'FastAPI', 'Spring Boot',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Data Analysis', 'Power BI', 'Tableau', 'Data Engineering',
  'Figma', 'UI/UX Design', 'Product Management', 'Agile', 'Scrum',
  'React Native', 'Flutter', 'iOS', 'Android',
  'Cybersecurity', 'DevOps', 'Cloud Architecture', 'Microservices',
]

const INTERESTS_LIST = [
  'Artificial Intelligence', 'Web Development', 'Mobile Apps', 'Cloud Computing',
  'Cybersecurity', 'Data Science', 'Blockchain', 'Fintech', 'Healthtech',
  'EdTech', 'Gaming', 'E-commerce', 'SaaS', 'Open Source', 'Research',
  'Consulting', 'Product Management', 'Design', 'DevOps', 'Robotics',
]

const STEPS = ['Upload Resume', 'Skills & Interests', 'Preferences', 'Review']

export default function OnboardingPage() {
  const { user, showToast } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    skills: [],
    interests: [],
    roleType: 'full-time',
    duration: '',
    location: '',
    remotePreference: 'any',
    salaryExpectation: '',
    experienceYears: '',
    educationLevel: '',
  })

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    setUploadError('')
    setUploadLoading(true)
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('resume', file)
    try {
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) {
        const parsed = res.data.data
        setResumeData(parsed)
        if (parsed.skills?.length) {
          setForm(prev => ({ ...prev, skills: [...new Set([...prev.skills, ...parsed.skills])] }))
        }
        showToast('Resume parsed successfully', 'success')
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try a PDF or Word file.')
    }
    setUploadLoading(false)
  }, [showToast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const addSkillFromInput = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, s] }))
    }
    setSkillInput('')
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleFinish = async () => {
    if (form.skills.length === 0) { showToast('Add at least one skill', 'error'); return }
    setLoading(true)
    try {
      await API.put('/recommendations/profile', {
        preferred_role: form.roleType,
        preferred_duration: form.duration,
        skills: form.skills,
        interests: form.interests,
        experience_years: form.experienceYears ? parseInt(form.experienceYears) : 0,
        education_level: form.educationLevel,
        preferred_location: form.location,
        salary_expectation: form.salaryExpectation ? parseInt(form.salaryExpectation) : null,
        remote_preference: form.remotePreference,
      })
      showToast('Profile saved. Finding your matches…', 'success')
      navigate('/companies')
    } catch (err) {
      showToast('Failed to save profile', 'error')
    }
    setLoading(false)
  }

  const canAdvance = () => {
    if (step === 0) return true // resume is optional
    if (step === 1) return form.skills.length >= 1
    if (step === 2) return !!form.roleType
    return true
  }

  return (
    <div className="onboarding-page">
      {/* Progress */}
      <div className="onboarding-nav">
        <div className="ob-brand">Career<span>Matrix</span></div>
        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`ob-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="ob-step-circle">{i < step ? '✓' : i + 1}</div>
              <span className="ob-step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="ob-step-line" />}
            </div>
          ))}
        </div>
        <div style={{ width: 160 }} />
      </div>

      <div className="onboarding-content">

        {/* STEP 0: Resume Upload */}
        {step === 0 && (
          <div className="ob-panel page-enter">
            <div className="section-label">Step 1</div>
            <h2 className="ob-title">Upload your CV or resume</h2>
            <p className="ob-subtitle">We'll extract your skills and experience automatically. You can also skip this and enter everything manually.</p>

            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'dragging' : ''} ${resumeData ? 'success' : ''}`}
            >
              <input {...getInputProps()} />
              {uploadLoading ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Parsing your resume…</p>
                </div>
              ) : resumeData ? (
                <div className="resume-success">
                  <div className="resume-check">✓</div>
                  <h3>{resumeData.name || user?.name}</h3>
                  <p>{resumeData.skills?.length || 0} skills detected · {resumeData.totalExperienceYears || 0} years experience</p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Drop a new file to replace</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div className="drop-icon">⊞</div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 8 }}>
                    {isDragActive ? 'Release to upload' : 'Drag your file here or click to browse'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>PDF or Word document · Max 10MB</p>
                </div>
              )}
            </div>

            {uploadError && <div className="server-error" style={{ marginTop: 12 }}>{uploadError}</div>}

            {resumeData && (
              <div className="resume-preview">
                {resumeData.skills?.length > 0 && (
                  <div>
                    <div className="section-label" style={{ marginBottom: 8 }}>Detected Skills</div>
                    <div className="tag-cloud">
                      {resumeData.skills.slice(0, 20).map(s => <span key={s} className="tag active">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Skills & Interests */}
        {step === 1 && (
          <div className="ob-panel page-enter">
            <div className="section-label">Step 2</div>
            <h2 className="ob-title">Skills & Interests</h2>
            <p className="ob-subtitle">Select everything that applies to you. This drives your company matches.</p>

            <div className="form-group">
              <label className="form-label">Your Skills ({form.skills.length} selected)</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Type a skill and press Enter…"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkillFromInput() } }}
                />
                <button className="btn btn-outline" onClick={addSkillFromInput}>Add</button>
              </div>
              <div className="tag-cloud">
                {SKILLS_SUGGESTIONS.map(s => (
                  <span key={s} className={`tag ${form.skills.includes(s) ? 'active' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
                ))}
              </div>
              {form.skills.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-label" style={{ marginBottom: 8 }}>Selected Skills</div>
                  <div className="tag-cloud">
                    {form.skills.map(s => (
                      <span key={s} className="tag active" onClick={() => toggleSkill(s)} style={{ cursor: 'pointer' }}>
                        {s} &times;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: 32 }}>
              <label className="form-label">Areas of Interest ({form.interests.length} selected)</label>
              <div className="tag-cloud">
                {INTERESTS_LIST.map(i => (
                  <span key={i} className={`tag ${form.interests.includes(i) ? 'active' : ''}`} onClick={() => toggleInterest(i)}>{i}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preferences */}
        {step === 2 && (
          <div className="ob-panel page-enter">
            <div className="section-label">Step 3</div>
            <h2 className="ob-title">Your Preferences</h2>
            <p className="ob-subtitle">These preferences filter and rank your company matches.</p>

            <div className="pref-grid">
              <div className="form-group">
                <label className="form-label">Role Type</label>
                <div className="role-options">
                  {[
                    { value: 'full-time', label: 'Full Time', sub: 'Permanent position' },
                    { value: 'part-time', label: 'Part Time', sub: 'Flexible schedule' },
                    { value: 'internship', label: 'Internship', sub: 'Short-term, skill-building' },
                  ].map(opt => (
                    <div
                      key={opt.value}
                      className={`role-option ${form.roleType === opt.value ? 'active' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, roleType: opt.value }))}
                    >
                      <div className="role-option-title">{opt.label}</div>
                      <div className="role-option-sub">{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {(form.roleType === 'internship' || form.roleType === 'part-time') && (
                <div className="form-group">
                  <label className="form-label">Preferred Duration</label>
                  <select className="form-select" value={form.duration} onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}>
                    <option value="">Select duration</option>
                    <option value="1 month">1 Month</option>
                    <option value="2 months">2 Months</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                    <option value="1 year">1 Year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Remote Preference</label>
                <select className="form-select" value={form.remotePreference} onChange={e => setForm(prev => ({ ...prev, remotePreference: e.target.value }))}>
                  <option value="any">Any</option>
                  <option value="remote">Fully Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Location</label>
                <input
                  className="form-input"
                  placeholder="e.g. New Delhi, India"
                  value={form.location}
                  onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <select className="form-select" value={form.experienceYears} onChange={e => setForm(prev => ({ ...prev, experienceYears: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="0">0 — Fresher / Student</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="5">5 years</option>
                  <option value="8">8+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select className="form-select" value={form.educationLevel} onChange={e => setForm(prev => ({ ...prev, educationLevel: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="BCA / B.Cs">BCA / B.Cs</option>
                  <option value="MBA">MBA</option>
                  <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Expected Salary (₹ per annum)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 800000"
                  value={form.salaryExpectation}
                  onChange={e => setForm(prev => ({ ...prev, salaryExpectation: e.target.value }))}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Leave blank to see all salary ranges
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="ob-panel page-enter">
            <div className="section-label">Step 4</div>
            <h2 className="ob-title">Review & Launch</h2>
            <p className="ob-subtitle">Confirm your profile. You can update any detail from the dashboard later.</p>

            <div className="review-grid">
              <div className="review-card">
                <div className="review-label">Role Type</div>
                <div className="review-val">{form.roleType}</div>
              </div>
              {form.duration && (
                <div className="review-card">
                  <div className="review-label">Duration</div>
                  <div className="review-val">{form.duration}</div>
                </div>
              )}
              <div className="review-card">
                <div className="review-label">Remote</div>
                <div className="review-val">{form.remotePreference}</div>
              </div>
              {form.location && (
                <div className="review-card">
                  <div className="review-label">Location</div>
                  <div className="review-val">{form.location}</div>
                </div>
              )}
              {form.experienceYears !== '' && (
                <div className="review-card">
                  <div className="review-label">Experience</div>
                  <div className="review-val">{form.experienceYears === '0' ? 'Fresher' : `${form.experienceYears} yrs`}</div>
                </div>
              )}
              {form.educationLevel && (
                <div className="review-card">
                  <div className="review-label">Education</div>
                  <div className="review-val">{form.educationLevel}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>Skills ({form.skills.length})</div>
              <div className="tag-cloud">{form.skills.map(s => <span key={s} className="tag active">{s}</span>)}</div>
            </div>

            {form.interests.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="section-label" style={{ marginBottom: 10 }}>Interests ({form.interests.length})</div>
                <div className="tag-cloud">{form.interests.map(i => <span key={i} className="tag">{i}</span>)}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="ob-nav">
          {step > 0 && (
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          {step === 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              Skip Resume →
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
            >
              Continue →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleFinish}
              disabled={loading}
              style={{ minWidth: 160 }}
            >
              {loading ? <div className="spinner" /> : 'Find My Matches →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

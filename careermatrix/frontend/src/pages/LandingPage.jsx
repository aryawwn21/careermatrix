import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const features = [
    { title: 'Salary Intelligence', body: 'View average compensation ranges, minimum and maximum packages, and salary distribution by role level for every company.' },
    { title: 'Work-Life Balance', body: 'Company-level work-life balance scores. Know before you apply what the day-to-day experience is actually like.' },
    { title: 'Promotion Trajectory', body: 'Year-by-year promotion rates, retention data, and salary growth curves visualised as charts, not guesses.' },
    { title: 'Remote Policy', body: 'Clearly labeled remote, hybrid, or on-site policy for every listing. Filter companies by your exact preference.' },
    { title: 'Scam-Free Guarantee', body: 'Every listing is sourced from verified platforms. We do not accept direct employer submissions without vetting.' },
    { title: 'Application Tracking', body: 'A clean dashboard of every application you have submitted, its status, and the date. No spreadsheet juggling.' },
  ]

  const steps = [
    { n: '01', title: 'Upload', body: 'Submit your CV or resume. Our parser extracts skills, experience, and education automatically with no manual entry required.' },
    { n: '02', title: 'Preferences', body: 'Specify whether you want full-time, part-time, or an internship. Tell us your interests, ambitions, and location preference.' },
    { n: '03', title: 'Match', body: 'The engine searches real job listings and ranks companies by how well they align with your profile, skills, and goals.' },
    { n: '04', title: 'Apply', body: 'Review company data including salaries, culture, and growth charts, then apply directly. We send confirmation to your inbox.' },
  ]

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand">Career<span>Matrix</span></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/auth?mode=signin')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => navigate('/auth?mode=signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-grid" />
        <div className="container">
          <div className="hero-content">
            <div className="section-label fade-up">Verified Career Platform</div>
            <h1 className="hero-headline fade-up">
              The only career platform<br />
              <span className="gold-text">you will ever need.</span>
            </h1>
            <p className="hero-sub fade-up">
              Upload your resume. Define your ambitions. CareerMatrix matches you with verified companies based on your actual skills, interests, and career trajectory.
            </p>
            <div className="hero-actions fade-up">
              <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 15 }} onClick={() => navigate('/auth?mode=signup')}>
                Analyse My Profile
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/auth?mode=signin')}>
                Sign In
              </button>
            </div>
            <div className="hero-stats fade-up">
              <div className="stat">
                <span className="stat-num">100%</span>
                <span className="stat-label">Verified Listings</span>
              </div>
              <div className="stat-div" />
              <div className="stat">
                <span className="stat-num">0</span>
                <span className="stat-label">Placement Fees</span>
              </div>
              <div className="stat-div" />
              <div className="stat">
                <span className="stat-num">AI</span>
                <span className="stat-label">Skill Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-label fade-up" style={{ textAlign: 'center' }}>Process</div>
          <h2 className="section-title fade-up" style={{ textAlign: 'center' }}>Four steps to your next role</h2>
          <div className="steps fade-up">
            {steps.map(step => (
              <div className="step-card" key={step.n}>
                <div className="step-num">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-label fade-up" style={{ textAlign: 'center' }}>What you get</div>
          <h2 className="section-title fade-up" style={{ textAlign: 'center' }}>Everything in one place</h2>
          <div className="features fade-up">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 500, marginBottom: 16 }}>
            Your next role is a resume away.
          </h2>
          <p className="fade-up" style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 32px' }}>
            Create a free account, upload your CV, and get matched with verified companies in under two minutes.
          </p>
          <button className="btn btn-primary fade-up" style={{ padding: '14px 40px', fontSize: 15 }} onClick={() => navigate('/auth?mode=signup')}>
            Start for Free
          </button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', background: 'var(--dark)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div className="brand" style={{ fontSize: 16 }}>Career<span>Matrix</span></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {'\u00A9'} {new Date().getFullYear()} CareerMatrix. All job listings are verified.
          </p>
        </div>
      </footer>
    </div>
  )
}

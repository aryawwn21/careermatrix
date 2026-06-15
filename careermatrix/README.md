# CareerMatrix AI

> AI-powered career matching platform. Upload your resume, define your ambitions, and get matched with verified companies — with real salary data, promotion charts, culture scores, and one-click application.

---

## Project Structure

```
careermatrix/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # MySQL connection + auto-schema init
│   ├── controllers/          # Auth, Resume, Recommendations
│   ├── middleware/auth.js    # JWT verification
│   ├── routes/               # Auth, Resume, Recommendation routes
│   ├── services/
│   │   ├── emailService.js   # Resend SMTP (confirmation emails)
│   │   ├── jobService.js     # JSearch RapidAPI integration
│   │   └── resumeService.js  # Affinda resume parser
│   ├── server.js
│   ├── package.json
│   └── .env                  # ← Copy .env.example and fill in keys
│
└── frontend/                 # React 18 + Vite + Recharts
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx       # Public landing
    │   │   ├── AuthPage.jsx          # Sign in / Sign up
    │   │   ├── OnboardingPage.jsx    # Resume upload + preference wizard
    │   │   ├── DashboardPage.jsx     # Overview + quick stats
    │   │   ├── CompaniesPage.jsx     # Matched companies grid
    │   │   ├── CompanyDetailPage.jsx # Full analytics (5 chart tabs)
    │   │   └── ApplicationsPage.jsx  # Application tracker + charts
    │   ├── components/layout/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   └── styles/globals.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router 6, Recharts, Framer Motion, React Dropzone |
| Backend | Node.js, Express 4, MySQL2, JWT, bcryptjs, Multer |
| Resume Parsing | Affinda API (free: 5 resumes/month) |
| Job Search | JSearch via RapidAPI (free: 200 req/month) |
| Email | Resend SMTP via Nodemailer (free: 3000 emails/month) |
| Charts | Recharts — Bar, Line, Area, Radar, Pie |

---

## API Keys Required (All Free Tiers Available)

### 1. JSearch — Job Listings (REQUIRED)
- **Sign up:** https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Click **Subscribe** → select **Basic (Free)** → 200 requests/month free
- Copy your `X-RapidAPI-Key`
- Set `JSEARCH_API_KEY=your_key` in `backend/.env`

### 2. Resend — Email Confirmation (REQUIRED for emails)
- **Sign up:** https://resend.com
- Go to **API Keys** → Create Key → copy it
- Free tier: 3,000 emails/month, no credit card
- Set `RESEND_API_KEY=your_key` in `backend/.env`
- **Important:** In `emailService.js` change the `from` address to a domain you own (or use `onboarding@resend.dev` for testing)

### 3. Affinda — Resume Parsing (OPTIONAL but recommended)
- **Sign up:** https://app.affinda.com
- Go to API Keys → Create token
- Free tier: 5 resumes/month
- Set `AFFINDA_API_KEY=your_key` in `backend/.env`
- **Without this key:** Falls back to basic PDF text extraction (skill keywords still detected)

---

## MySQL Setup

```sql
-- Run in MySQL:
CREATE DATABASE careermatrix;
CREATE USER 'careermatrix'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON careermatrix.* TO 'careermatrix'@'localhost';
FLUSH PRIVILEGES;
```

Tables are auto-created on first server start via `config/db.js`.

---

## Installation & Run

### Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in your keys
npm run dev             # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000
```

Open http://localhost:3000

---

## Environment Variables (`backend/.env`)

```
PORT=5000

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=careermatrix

# JWT (change this to a long random string in production)
JWT_SECRET=careermatrix_super_secret_key_2024

# RapidAPI / JSearch — job listings
JSEARCH_API_KEY=your_rapidapi_key

# Resend — email confirmation
RESEND_API_KEY=your_resend_api_key

# Affinda — resume parsing (optional)
AFFINDA_API_KEY=your_affinda_api_key

NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Features

| Feature | Detail |
|---|---|
| Resume Upload | Drag & drop PDF/Word → auto-parsed skills, experience, education |
| Preference Wizard | Role type (full-time / part-time / internship), duration, location, remote preference, salary expectation |
| AI Matching | Skills + interests → live JSearch API → ranked company profiles |
| Company Detail | 5 tabs: Overview, Salaries, Growth, Roles, Culture |
| Charts | Bar, Line, Area, Radar, Pie — promotion rates, salary ranges, WLB trend, retention, culture radar |
| One-Click Apply | Modal confirmation → DB record → email sent to user |
| Application Tracker | Status tracker with timeline chart and pie breakdown |
| Scam-Free | All listings from JSearch (LinkedIn, Indeed, Glassdoor sources) |
| Auth | JWT sign up / sign in, 7-day token, bcrypt passwords |
| Email | Branded HTML email on signup and every application |

---

## Deployment Notes

- **Frontend:** Deploy to Vercel — `npm run build` → upload `dist/`
- **Backend:** Deploy to Railway, Render, or any Node host
- **Update** `FRONTEND_URL` in `.env` and `vite.config.js` proxy target for production
- **Resend:** Add your domain in Resend dashboard and update the `from` address in `emailService.js`

---

## Pages

| Route | Page |
|---|---|
| `/` | Landing (public) |
| `/auth` | Sign In / Sign Up |
| `/onboarding` | Resume upload + preference wizard |
| `/dashboard` | Stats overview |
| `/companies` | Matched company grid |
| `/company/:name` | Full company analytics |
| `/applications` | Application history + charts |

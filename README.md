# CareerMatrix AI

CareerMatrix AI is a full-stack AI-powered career discovery and recommendation platform designed to help students and professionals find the most suitable companies, internships, and jobs based on their skills, interests, career goals, and resume analysis.

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Secure Password Hashing

### Resume Analysis
- Resume Upload
- PDF Resume Parsing
- Automatic Skill Extraction
- Resume Storage

### Career Profiling
- Interest Selection
- Career Goal Selection
- Job Preference Selection
- Work Preference Selection

### Recommendation Engine
- Company Matching System
- Skill-Based Recommendations
- Interest-Based Recommendations
- Career Goal Matching

### Analytics
- Salary Insights
- Work-Life Balance Metrics
- Promotion Growth Analysis
- Company Ratings

### Dashboard
- Resume Management
- Skills Dashboard
- Career Profile
- Recommendations Dashboard

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Material UI
- Recharts

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer
- PDF Parse

### Database
- MySQL

---

## Project Structure

```
CareerMatrixAI
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── middleware
│   ├── uploads
│   ├── config
│   └── server.js
│
└── README.md
```

---

## Current Modules

- Authentication System
- Resume Upload System
- Resume Parsing Engine
- Skill Extraction Engine
- Interests Management
- Career Goal Management
- Company Recommendation Engine

---

## Future Enhancements

- Real-Time Job APIs
- Auto Apply System
- Email Notifications
- Advanced Resume Matching
- Company Analytics Dashboard
- Admin Panel
- AI Career Assistant
- Interview Preparation Module

---

## Installation

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create `.env`

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=careermatrix

JWT_SECRET=your_secret
```

---

## Author

Aryan Chawla

---

## License

MIT License

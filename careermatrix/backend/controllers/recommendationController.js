const { pool } = require("../config/db");
const { searchJobs, buildCompanyProfiles, scoreCompanyMatch } = require("../services/jobService");

// POST /api/recommendations/match
const getMatches = async (req, res) => {
  const { skills, interests, roleType, duration, location, salaryMin, remotePreference } = req.body;

  if (!skills || skills.length === 0) {
    return res.status(400).json({ success: false, message: "Skills are required to find matches" });
  }

  try {
    // Save preferences to profile
    await pool.query(
      `UPDATE profiles SET 
        preferred_role = ?,
        preferred_duration = ?,
        skills = ?,
        interests = ?,
        preferred_location = ?,
        salary_expectation = ?,
        remote_preference = ?
      WHERE user_id = ?`,
      [
        roleType || "full-time",
        duration || null,
        JSON.stringify(skills),
        JSON.stringify(interests || []),
        location || null,
        salaryMin || null,
        remotePreference || "any",
        req.user.id,
      ]
    );

    // Build search queries from skills + interests
    const primaryQuery = [...skills.slice(0, 3), ...(interests || []).slice(0, 2)].join(" ");
    const searchLocation = location || "India";

    // Search real jobs via JSearch API
    const jobs = await searchJobs({
      query: primaryQuery,
      location: searchLocation,
      employment_type: roleType,
      num_pages: 3,
    });

    if (!jobs || jobs.length === 0) {
      return res.json({
        success: true,
        message: "No live listings found. Try broader search terms.",
        companies: [],
        total: 0,
      });
    }

    // Build company profiles from job results
    const companies = buildCompanyProfiles(jobs, { skills, interests });

    // Score and sort companies
    const scored = companies.map((company) => ({
      ...company,
      matchScore: scoreCompanyMatch(company, { skills, interests }),
    }));

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      companies: scored.slice(0, 20),
      total: scored.length,
      searchQuery: primaryQuery,
    });
  } catch (err) {
    console.error("Match error:", err);
    return res.status(500).json({ success: false, message: "Matching engine error: " + err.message });
  }
};

// POST /api/recommendations/apply
const applyToCompany = async (req, res) => {
  const { companyName, jobTitle, jobId, applyUrl } = req.body;

  if (!companyName) {
    return res.status(400).json({ success: false, message: "Company name is required" });
  }

  try {
    // Get user info for email
    const [users] = await pool.query("SELECT name, email FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    // Check for duplicate application
    const [existing] = await pool.query(
      "SELECT id FROM applications WHERE user_id = ? AND company_name = ? AND job_id = ?",
      [req.user.id, companyName, jobId || ""]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this position",
      });
    }

    // Save application to DB
    await pool.query(
      "INSERT INTO applications (user_id, company_name, job_title, job_id, apply_url, status) VALUES (?, ?, ?, ?, ?, 'applied')",
      [req.user.id, companyName, jobTitle || "", jobId || "", applyUrl || ""]
    );

    // Send confirmation email
    const { sendApplicationEmail } = require("../services/emailService");
    await sendApplicationEmail({
      to: user.email,
      name: user.name,
      companyName,
      jobTitle: jobTitle || "Position",
      applyUrl,
    }).catch((err) => console.warn("Application email failed:", err.message));

    return res.json({
      success: true,
      message: `Application to ${companyName} submitted successfully`,
      appliedAt: new Date().toISOString(),
      emailSentTo: user.email,
    });
  } catch (err) {
    console.error("Apply error:", err);
    return res.status(500).json({ success: false, message: "Failed to submit application" });
  }
};

// GET /api/recommendations/applications
const getApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(
      "SELECT * FROM applications WHERE user_id = ? ORDER BY applied_at DESC",
      [req.user.id]
    );
    return res.json({ success: true, applications: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/recommendations/profile
const updateProfile = async (req, res) => {
  const { preferred_role, preferred_duration, skills, interests, experience_years,
    education_level, preferred_location, salary_expectation, remote_preference } = req.body;

  try {
    await pool.query(
      `UPDATE profiles SET 
        preferred_role = COALESCE(?, preferred_role),
        preferred_duration = COALESCE(?, preferred_duration),
        skills = COALESCE(?, skills),
        interests = COALESCE(?, interests),
        experience_years = COALESCE(?, experience_years),
        education_level = COALESCE(?, education_level),
        preferred_location = COALESCE(?, preferred_location),
        salary_expectation = COALESCE(?, salary_expectation),
        remote_preference = COALESCE(?, remote_preference)
      WHERE user_id = ?`,
      [
        preferred_role, preferred_duration,
        skills ? JSON.stringify(skills) : null,
        interests ? JSON.stringify(interests) : null,
        experience_years, education_level, preferred_location,
        salary_expectation, remote_preference,
        req.user.id,
      ]
    );

    return res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

module.exports = { getMatches, applyToCompany, getApplications, updateProfile };

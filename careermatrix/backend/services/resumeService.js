const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Parse resume using Affinda API
 * Docs: https://docs.affinda.com/
 * Free tier: 5 resumes/month, no card required
 * Sign up: https://app.affinda.com/
 */
const parseResumeWithAffinda = async (filePath) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("wait", "true");

  const response = await axios.post(
    "https://api.affinda.com/v3/resumes",
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.AFFINDA_API_KEY}`,
        ...formData.getHeaders(),
      },
      timeout: 60000,
    }
  );

  const data = response.data;

  // Extract structured info from Affinda response
  const parsed = {
    name: data.data?.name?.raw || "",
    email: data.data?.emails?.[0] || "",
    phone: data.data?.phoneNumbers?.[0] || "",
    location: data.data?.location?.rawInput || "",
    summary: data.data?.summary || "",
    skills: (data.data?.skills || []).map((s) => s.name || s),
    experience: (data.data?.workExperience || []).map((exp) => ({
      title: exp.jobTitle || "",
      company: exp.organization || "",
      duration: exp.dates?.rawText || "",
      description: exp.jobDescription || "",
    })),
    education: (data.data?.education || []).map((edu) => ({
      degree: edu.accreditation?.education || "",
      institution: edu.organization || "",
      year: edu.dates?.completionDate || "",
    })),
    totalExperienceYears: data.data?.totalYearsExperience || 0,
    languages: (data.data?.languages || []).map((l) => l.name || l),
    certifications: (data.data?.certifications || []).map((c) => c.name || c),
  };

  return parsed;
};

/**
 * Fallback: basic PDF text extraction using pdf-parse
 * Used when Affinda key is not set
 */
const parseResumeBasic = async (filePath) => {
  const pdfParse = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;

  // Basic skill keyword extraction
  const skillKeywords = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
    "React", "Vue", "Angular", "Node.js", "Express", "Django", "FastAPI",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
    "Data Analysis", "Power BI", "Tableau", "Excel",
    "Figma", "UI/UX", "Photoshop",
    "Project Management", "Agile", "Scrum", "Jira",
  ];

  const foundSkills = skillKeywords.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  // Extract email from text
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  // Extract phone
  const phoneMatch = text.match(/[\+\d][\d\s\-\(\)]{9,15}/);

  return {
    name: "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].trim() : "",
    location: "",
    summary: text.substring(0, 300),
    skills: foundSkills,
    experience: [],
    education: [],
    totalExperienceYears: 0,
    rawText: text,
  };
};

const parseResume = async (filePath) => {
  if (process.env.AFFINDA_API_KEY && process.env.AFFINDA_API_KEY !== "your_affinda_api_key") {
    try {
      return await parseResumeWithAffinda(filePath);
    } catch (err) {
      console.warn("Affinda parse failed, falling back to basic:", err.message);
    }
  }
  return parseResumeBasic(filePath);
};

module.exports = { parseResume };

const nodemailer = require("nodemailer");

// Uses Resend SMTP (free: 3000 emails/month, no credit card)
// Sign up at resend.com, get API key, use as SMTP password
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

const sendApplicationEmail = async ({ to, name, companyName, jobTitle, applyUrl }) => {
  const mailOptions = {
    from: "CareerMatrix <noreply@careermatrix.app>",
    to,
    subject: `Application Submitted — ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0e0; }
          .header { background: #0a0a0a; padding: 32px 40px; }
          .header h1 { color: #ffffff; font-size: 20px; font-weight: 400; letter-spacing: 0.1em; margin: 0; text-transform: uppercase; }
          .header span { color: #c8a96e; }
          .body { padding: 40px; }
          .body p { color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .detail-block { background: #f9f9f9; border-left: 3px solid #c8a96e; padding: 20px 24px; margin: 24px 0; }
          .detail-block p { margin: 6px 0; font-size: 14px; color: #555; }
          .detail-block strong { color: #111; }
          .status-badge { display: inline-block; background: #0a0a0a; color: #c8a96e; padding: 8px 20px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 16px 0; }
          .footer { background: #f9f9f9; padding: 24px 40px; border-top: 1px solid #e0e0e0; }
          .footer p { color: #999; font-size: 12px; margin: 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Career<span>Matrix</span></h1>
          </div>
          <div class="body">
            <p>Dear ${name},</p>
            <p>Your application has been successfully submitted through CareerMatrix. Here are the details of your submission:</p>
            <div class="detail-block">
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Position:</strong> ${jobTitle || "As per your profile"}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              <p><strong>Status:</strong> <span style="color:#c8a96e">Application Received</span></p>
            </div>
            <div class="status-badge">✓ Successfully Submitted</div>
            <p>The company's recruitment team will review your profile and reach out directly if there is a match. CareerMatrix does not charge placement fees and all listed companies are verified.</p>
            <p>You can track all your applications from your CareerMatrix dashboard.</p>
            <p style="margin-top: 32px;">Best regards,<br><strong>CareerMatrix Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation. CareerMatrix verifies all job listings to ensure legitimacy. If you did not initiate this application, contact support immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async ({ to, name }) => {
  const mailOptions = {
    from: "CareerMatrix <noreply@careermatrix.app>",
    to,
    subject: "Welcome to CareerMatrix",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border: 1px solid #e0e0e0; }
          .header { background: #0a0a0a; padding: 32px 40px; }
          .header h1 { color: #fff; font-size: 20px; font-weight: 400; letter-spacing: 0.1em; margin: 0; text-transform: uppercase; }
          .header span { color: #c8a96e; }
          .body { padding: 40px; }
          .body p { color: #333; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .step { display: flex; align-items: flex-start; margin: 12px 0; }
          .step-num { background: #c8a96e; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; flex-shrink: 0; }
          .footer { background: #f9f9f9; padding: 24px 40px; border-top: 1px solid #e0e0e0; }
          .footer p { color: #999; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Career<span>Matrix</span></h1>
          </div>
          <div class="body">
            <p>Welcome, ${name}.</p>
            <p>Your CareerMatrix account is active. Here's how to get the most from your profile:</p>
            <div class="step"><div class="step-num">1</div><p style="margin:0">Upload your CV or resume for AI-powered skill extraction</p></div>
            <div class="step"><div class="step-num">2</div><p style="margin:0">Complete your preferences — role type, industry, and ambitions</p></div>
            <div class="step"><div class="step-num">3</div><p style="margin:0">Review matched companies with salary data, culture scores, and growth metrics</p></div>
            <div class="step"><div class="step-num">4</div><p style="margin:0">Apply directly through CareerMatrix — we handle the submission</p></div>
            <p style="margin-top: 32px;">All companies listed on CareerMatrix are verified. We do not charge placement fees.</p>
          </div>
          <div class="footer">
            <p>CareerMatrix — Verified Career Opportunities</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendApplicationEmail, sendWelcomeEmail };

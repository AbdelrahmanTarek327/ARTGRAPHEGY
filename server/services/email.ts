import nodemailer from "nodemailer";
import type { InquiryRecord } from "../schema/inquiry.js";

// Helper to construct a clean HTML email template
function createEmailTemplate(inquiry: InquiryRecord): string {
  const { name, email, company, projectType, description, submittedAt } = inquiry;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Inquiry Received</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f7f9fa;
          margin: 0;
          padding: 0;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #e1e8ed;
        }
        .header {
          background-color: #1c1c1c;
          padding: 25px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .content {
          padding: 30px;
        }
        .lead {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 25px;
          color: #555555;
        }
        .table-wrapper {
          margin-bottom: 25px;
          border: 1px solid #eef2f5;
          border-radius: 6px;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: 600;
          width: 35%;
          border-bottom: 1px solid #eef2f5;
          border-right: 1px solid #eef2f5;
        }
        td {
          color: #0f172a;
          border-bottom: 1px solid #eef2f5;
        }
        tr:last-child th, tr:last-child td {
          border-bottom: none;
        }
        .description-box {
          background-color: #f8fafc;
          border-left: 4px solid #1c1c1c;
          padding: 15px;
          font-size: 15px;
          line-height: 1.6;
          color: #334155;
          border-radius: 0 4px 4px 0;
          white-space: pre-wrap;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Customer Inquiry</h1>
        </div>
        <div class="content">
          <p class="lead">Hello,</p>
          <p class="lead">A new project inquiry has been submitted from the Artgraphegy website. Below are the details:</p>
          
          <div class="table-wrapper">
            <table>
              <tr>
                <th>Submitted At (UTC)</th>
                <td>${new Date(submittedAt).toUTCString()}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>${name}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <th>Company</th>
                <td>${company}</td>
              </tr>
              <tr>
                <th>Project Type</th>
                <td>${projectType}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #1e293b;">Project Description</h3>
          <div class="description-box">${description}</div>
        </div>
        <div class="footer">
          This email was generated automatically by the Artgraphegy website.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send inquiry detail email using SMTP credentials.
 */
export async function sendInquiryEmail(inquiry: InquiryRecord): Promise<void> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFICATION_EMAIL || "bodytarek2003@gmail.com";

  if (!user || !pass) {
    console.warn(
      "[email-service] Missing SMTP_USER or SMTP_PASS environment variables. Cannot send email."
    );
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports (587)
    auth: {
      user,
      pass,
    },
  });

  // Prepare email payload
  const mailOptions = {
    from: `"Artgraphegy Website" <${user}>`,
    to,
    subject: `New Project Inquiry: ${inquiry.projectType} - ${inquiry.name}`,
    text: `New Customer Inquiry:
Submitted At: ${inquiry.submittedAt}
Name: ${inquiry.name}
Email: ${inquiry.email}
Company: ${inquiry.company}
Project Type: ${inquiry.projectType}

Description:
${inquiry.description}`,
    html: createEmailTemplate(inquiry),
  };

  // Send email
  console.log(`[email-service] Attempting to send email notification to ${to}...`);
  await transporter.sendMail(mailOptions);
  console.log("[email-service] Email notification sent successfully.");
}

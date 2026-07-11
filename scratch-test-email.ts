import "dotenv/config";
import nodemailer from "nodemailer";
async function testEmail() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFICATION_EMAIL || "bodytarek2003@gmail.com";
  console.log("Using SMTP settings:");
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Pass length: ${pass ? pass.length : 0}`);
  console.log(`To: ${to}`);
  if (!user || !pass) {
    console.error("Missing SMTP_USER or SMTP_PASS environment variables.");
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
  try {
    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("SMTP connection verified successfully!");
    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: `"Artgraphegy Website Test" <${user}>`,
      to,
      subject: "Test Email from Artgraphegy Website Setup",
      text: "This is a test email to check if the SMTP configuration is working properly.",
      html: "<b>This is a test email</b> to check if the SMTP configuration is working properly.",
    });
    console.log("Email sent successfully!");
    console.log("Response:", info.response);
    console.log("MessageId:", info.messageId);
  } catch (error: any) {
    console.error("Error occurred while sending email:");
    console.error(error);
  }
}
testEmail();
